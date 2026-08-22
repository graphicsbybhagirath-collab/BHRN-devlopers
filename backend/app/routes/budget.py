from datetime import timedelta
from flask import Blueprint, request, jsonify
from app.models import db, Trip, Expense
from app.utils.auth_helpers import token_required
from app.utils.validators import parse_date, parse_positive_float

budget_bp = Blueprint('budget', __name__, url_prefix='/api')

def calculate_trip_days(trip):
    s_date = parse_date(trip.start_date)
    e_date = parse_date(trip.end_date)
    if s_date and e_date:
        days = (e_date - s_date).days + 1
        return max(days, 1)

    total_stop_days = 0
    for stop in trip.stops:
        st = parse_date(stop.start_date)
        et = parse_date(stop.end_date)
        if st and et:
            total_stop_days += max((et - st).days + 1, 1)
        else:
            total_stop_days += 2
    return max(total_stop_days, 1) if total_stop_days > 0 else 1

@budget_bp.route('/trips/<int:trip_id>/budget', methods=['GET'])
@token_required
def get_trip_budget(current_user, trip_id):
    trip = db.session.get(Trip, trip_id)
    if not trip:
        return jsonify({'error': 'Trip not found'}), 404

    if trip.user_id != current_user.id:
        return jsonify({'error': 'Unauthorized access'}), 403

    target_budget_raw = request.args.get('target_budget')
    target_budget = parse_positive_float(target_budget_raw)

    total_days = calculate_trip_days(trip)

    # 1. Activities cost directly from scheduled ItineraryActivities
    activities_sum = 0.0
    daily_activity_map = {}  # date_str -> { amount, count, city_name }

    for stop in trip.stops:
        city_name = stop.city.name if stop.city else 'In Transit'
        for it_act in stop.itinerary_activities:
            cost = float(it_act.activity.estimated_cost or 0.0) if it_act.activity else 0.0
            activities_sum += cost
            act_date = it_act.activity_date or stop.start_date or trip.start_date
            if act_date:
                if act_date not in daily_activity_map:
                    daily_activity_map[act_date] = {'amount': 0.0, 'count': 0, 'city_name': city_name}
                daily_activity_map[act_date]['amount'] += cost
                daily_activity_map[act_date]['count'] += 1

    # 2. Recorded manual expenses
    recorded_expenses = trip.expenses.all()
    expense_dict = {
        'Transport': 0.0,
        'Accommodation': 0.0,
        'Activities': activities_sum,
        'Meals': 0.0,
        'Miscellaneous': 0.0
    }

    daily_expense_map = {}  # date_str -> amount
    for exp in recorded_expenses:
        cat = exp.category.capitalize()
        if cat in expense_dict:
            expense_dict[cat] += float(exp.amount)
        else:
            expense_dict['Miscellaneous'] += float(exp.amount)

        exp_date = exp.expense_date or trip.start_date
        if exp_date:
            daily_expense_map[exp_date] = daily_expense_map.get(exp_date, 0.0) + float(exp.amount)

    # 3. Base estimations based on city cost index
    est_accommodation = 0.0
    est_meals = 0.0
    est_transport = 0.0
    city_breakdowns = []

    for stop in trip.stops:
        city = stop.city
        if not city:
            continue
        c_cost_idx = city.cost_index or 3.0
        st = parse_date(stop.start_date)
        et = parse_date(stop.end_date)
        stop_days = max((et - st).days + 1, 1) if (st and et) else 2

        hotel_rate = c_cost_idx * 40.0
        meal_rate = c_cost_idx * 25.0
        transit_rate = c_cost_idx * 15.0

        stop_hotel = hotel_rate * stop_days
        stop_meals = meal_rate * stop_days
        stop_transit = transit_rate * stop_days

        stop_acts_sum = sum(
            float(ia.activity.estimated_cost or 0.0)
            for ia in stop.itinerary_activities
            if ia.activity
        )

        est_accommodation += stop_hotel
        est_meals += stop_meals
        est_transport += stop_transit

        city_breakdowns.append({
            'city_id': city.id,
            'city_name': city.name,
            'country': city.country,
            'cost_index': city.cost_index,
            'days': stop_days,
            'accommodation_estimate': round(stop_hotel, 2),
            'meals_estimate': round(stop_meals, 2),
            'transport_estimate': round(stop_transit, 2),
            'activities_cost': round(stop_acts_sum, 2),
            'total_estimate': round(stop_hotel + stop_meals + stop_transit + stop_acts_sum, 2)
        })

    has_custom_accommodation = any(e.category.lower() == 'accommodation' for e in recorded_expenses)
    has_custom_meals = any(e.category.lower() == 'meals' for e in recorded_expenses)
    has_custom_transport = any(e.category.lower() == 'transport' for e in recorded_expenses)

    final_accommodation = expense_dict['Accommodation'] + (0.0 if has_custom_accommodation else est_accommodation)
    final_meals = expense_dict['Meals'] + (0.0 if has_custom_meals else est_meals)
    final_transport = expense_dict['Transport'] + (0.0 if has_custom_transport else est_transport)
    final_activities = expense_dict['Activities']
    final_misc = expense_dict['Miscellaneous']

    total_cost = final_accommodation + final_meals + final_transport + final_activities + final_misc
    avg_cost_per_day = total_cost / total_days if total_days > 0 else 0

    category_breakdown = []
    category_pairs = [
        ('Transport', final_transport),
        ('Accommodation', final_accommodation),
        ('Activities', final_activities),
        ('Meals', final_meals),
        ('Miscellaneous', final_misc)
    ]
    for cat_name, cat_amount in category_pairs:
        pct = round((cat_amount / total_cost * 100), 1) if total_cost > 0 else 0
        category_breakdown.append({
            'category': cat_name,
            'amount': round(cat_amount, 2),
            'percentage': pct
        })

    # Generate daily breakdown
    s_date = parse_date(trip.start_date)
    e_date = parse_date(trip.end_date)
    daily_breakdown = []
    if s_date and e_date:
        cur = s_date
        while cur <= e_date:
            d_str = cur.isoformat()
            act_info = daily_activity_map.get(d_str, {'amount': 0.0, 'count': 0, 'city_name': 'Travel Day'})
            exp_amt = daily_expense_map.get(d_str, 0.0)
            day_total = act_info['amount'] + exp_amt + (avg_cost_per_day * 0.4)
            daily_breakdown.append({
                'date': d_str,
                'amount': round(day_total, 2),
                'city_name': act_info['city_name'],
                'activity_count': act_info['count']
            })
            cur += timedelta(days=1)
    else:
        for d_str, info in daily_activity_map.items():
            daily_breakdown.append({
                'date': d_str,
                'amount': round(info['amount'], 2),
                'city_name': info['city_name'],
                'activity_count': info['count']
            })

    is_over_budget = False
    budget_difference = 0.0
    if target_budget and target_budget > 0:
        is_over_budget = total_cost > target_budget
        budget_difference = abs(total_cost - target_budget)

    return jsonify({
        'trip_id': trip.id,
        'trip_name': trip.name,
        'total_days': total_days,
        'total_cost': round(total_cost, 2),
        'total_estimated_cost': round(total_cost, 2),
        'avg_cost_per_day': round(avg_cost_per_day, 2),
        'average_per_day': round(avg_cost_per_day, 2),
        'categories': {
            'Transport': round(final_transport, 2),
            'Accommodation': round(final_accommodation, 2),
            'Activities': round(final_activities, 2),
            'Meals': round(final_meals, 2),
            'Miscellaneous': round(final_misc, 2)
        },
        'category_breakdown': category_breakdown,
        'daily_breakdown': daily_breakdown,
        'city_breakdowns': city_breakdowns,
        'expenses': [exp.to_dict() for exp in recorded_expenses],
        'recorded_expenses': [exp.to_dict() for exp in recorded_expenses],
        'activities_sum': round(activities_sum, 2),
        'target_budget': target_budget,
        'is_over_budget': is_over_budget,
        'budget_difference': round(budget_difference, 2),
        'budget_status': 'over_budget' if is_over_budget else 'within_budget'
    }), 200

@budget_bp.route('/trips/<int:trip_id>/expenses', methods=['POST'])
@token_required
def add_expense(current_user, trip_id):
    trip = db.session.get(Trip, trip_id)
    if not trip:
        return jsonify({'error': 'Trip not found'}), 404

    if trip.user_id != current_user.id:
        return jsonify({'error': 'Unauthorized access'}), 403

    data = request.get_json(silent=True) or {}
    category = str(data.get('category', 'Miscellaneous')).strip().capitalize()
    amount_raw = data.get('amount')
    expense_date = data.get('expense_date')
    description = str(data.get('description', '')).strip()

    amount = parse_positive_float(amount_raw)
    if amount is None:
        return jsonify({'error': 'Please enter a valid expense amount greater than zero'}), 400

    valid_categories = ['Transport', 'Accommodation', 'Activities', 'Meals', 'Miscellaneous']
    if category not in valid_categories:
        category = 'Miscellaneous'

    expense = Expense(
        trip_id=trip.id,
        category=category,
        amount=amount,
        expense_date=expense_date or trip.start_date,
        description=description
    )
    db.session.add(expense)
    db.session.commit()

    return jsonify(expense.to_dict()), 201

@budget_bp.route('/expenses/<int:expense_id>', methods=['PUT'])
@token_required
def update_expense(current_user, expense_id):
    expense = db.session.get(Expense, expense_id)
    if not expense:
        return jsonify({'error': 'Expense not found'}), 404

    if expense.trip.user_id != current_user.id:
        return jsonify({'error': 'Unauthorized access'}), 403

    data = request.get_json(silent=True) or {}
    if 'category' in data:
        cat = str(data['category']).strip().capitalize()
        valid_categories = ['Transport', 'Accommodation', 'Activities', 'Meals', 'Miscellaneous']
        if cat in valid_categories:
            expense.category = cat

    if 'amount' in data:
        amt = parse_positive_float(data['amount'])
        if amt is None:
            return jsonify({'error': 'Please enter a valid expense amount greater than zero'}), 400
        expense.amount = amt

    if 'expense_date' in data:
        expense.expense_date = data['expense_date']

    if 'description' in data:
        expense.description = str(data['description']).strip()

    db.session.commit()
    return jsonify(expense.to_dict()), 200

@budget_bp.route('/expenses/<int:expense_id>', methods=['DELETE'])
@token_required
def delete_expense(current_user, expense_id):
    expense = db.session.get(Expense, expense_id)
    if not expense:
        return jsonify({'error': 'Expense not found'}), 404

    if expense.trip.user_id != current_user.id:
        return jsonify({'error': 'Unauthorized access'}), 403

    db.session.delete(expense)
    db.session.commit()
    return jsonify({'message': 'Expense deleted successfully'}), 200
