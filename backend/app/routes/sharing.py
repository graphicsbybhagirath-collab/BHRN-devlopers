import secrets
from flask import Blueprint, request, jsonify
from app.models import db, Trip, SharedTrip, TripStop, ItineraryActivity, Expense
from app.utils.auth_helpers import token_required, optional_token
from app.routes.budget import calculate_trip_days

sharing_bp = Blueprint('sharing', __name__, url_prefix='/api')

@sharing_bp.route('/trips/<int:trip_id>/share', methods=['POST'])
@token_required
def create_share_link(current_user, trip_id):
    trip = db.session.get(Trip, trip_id)
    if not trip:
        return jsonify({'error': 'Trip not found'}), 404

    if trip.user_id != current_user.id:
        return jsonify({'error': 'Unauthorized'}), 403

    existing = SharedTrip.query.filter_by(trip_id=trip_id).first()
    if existing:
        return jsonify({
            **existing.to_dict(),
            'share_url': f"/shared/{existing.share_token}"
        }), 200

    token = secrets.token_urlsafe(16)
    shared = SharedTrip(
        trip_id=trip.id,
        share_token=token,
        is_public=True
    )
    db.session.add(shared)
    db.session.commit()

    return jsonify({
        **shared.to_dict(),
        'share_url': f"/shared/{shared.share_token}"
    }), 201

@sharing_bp.route('/shared/<string:token>', methods=['GET'])
@optional_token
def get_shared_trip(current_user, token):
    shared = SharedTrip.query.filter_by(share_token=token, is_public=True).first()
    if not shared:
        return jsonify({'error': 'Shared trip not found or link has expired'}), 404

    trip = shared.trip
    if not trip:
        return jsonify({'error': 'Trip not found'}), 404

    trip_data = trip.to_dict(include_details=True)
    trip_data['share_token'] = token
    owner_name = trip.owner.name if trip.owner else 'GlobeTrotter Traveler'
    trip_data['owner_name'] = owner_name
    trip_data['is_owner'] = (current_user is not None and trip.user_id == current_user.id)

    # Compute budget snapshot
    total_days = calculate_trip_days(trip)
    activities_sum = 0.0
    for stop in trip.stops:
        for it_act in stop.itinerary_activities:
            if it_act.activity and it_act.activity.estimated_cost:
                activities_sum += float(it_act.activity.estimated_cost)

    recorded_expenses = trip.expenses.all()
    expense_dict = {
        'Transport': 0.0,
        'Accommodation': 0.0,
        'Activities': activities_sum,
        'Meals': 0.0,
        'Miscellaneous': 0.0
    }
    for exp in recorded_expenses:
        cat = exp.category.capitalize()
        if cat in expense_dict:
            expense_dict[cat] += float(exp.amount)
        else:
            expense_dict['Miscellaneous'] += float(exp.amount)

    est_accommodation = 0.0
    est_meals = 0.0
    est_transport = 0.0
    for stop in trip.stops:
        city = stop.city
        c_cost_idx = city.cost_index if city else 3.0
        stop_days = 2
        est_accommodation += (c_cost_idx * 40.0 * stop_days)
        est_meals += (c_cost_idx * 25.0 * stop_days)
        est_transport += (c_cost_idx * 15.0 * stop_days)

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

    category_breakdown = [
        {'category': 'Transport', 'amount': round(final_transport, 2), 'percentage': round(final_transport/total_cost*100, 1) if total_cost > 0 else 0},
        {'category': 'Accommodation', 'amount': round(final_accommodation, 2), 'percentage': round(final_accommodation/total_cost*100, 1) if total_cost > 0 else 0},
        {'category': 'Activities', 'amount': round(final_activities, 2), 'percentage': round(final_activities/total_cost*100, 1) if total_cost > 0 else 0},
        {'category': 'Meals', 'amount': round(final_meals, 2), 'percentage': round(final_meals/total_cost*100, 1) if total_cost > 0 else 0},
        {'category': 'Miscellaneous', 'amount': round(final_misc, 2), 'percentage': round(final_misc/total_cost*100, 1) if total_cost > 0 else 0}
    ]

    budget_summary = {
        'total_estimated_cost': round(total_cost, 2),
        'total_cost': round(total_cost, 2),
        'average_per_day': round(avg_cost_per_day, 2),
        'total_days': total_days,
        'categories': expense_dict,
        'category_breakdown': category_breakdown,
        'daily_breakdown': [],
        'expenses': [exp.to_dict() for exp in recorded_expenses]
    }

    return jsonify({
        **trip_data,
        'trip': trip_data,
        'budget': budget_summary,
        'owner_name': owner_name,
        'share_token': token
    }), 200

@sharing_bp.route('/shared/<string:token>/copy', methods=['POST'])
@token_required
def copy_shared_trip(current_user, token):
    shared = SharedTrip.query.filter_by(share_token=token, is_public=True).first()
    if not shared:
        return jsonify({'error': 'Shared trip not found'}), 404

    orig_trip = shared.trip
    if not orig_trip:
        return jsonify({'error': 'Trip not found'}), 404

    data = request.get_json(silent=True) or {}
    new_name = data.get('name') or f"Copy of {orig_trip.name}"
    new_start_date = data.get('start_date') or orig_trip.start_date
    new_end_date = data.get('end_date') or orig_trip.end_date

    new_trip = Trip(
        user_id=current_user.id,
        name=new_name,
        description=orig_trip.description,
        start_date=new_start_date,
        end_date=new_end_date,
        cover_image=orig_trip.cover_image
    )
    db.session.add(new_trip)
    db.session.flush()

    for stop in orig_trip.stops:
        new_stop = TripStop(
            trip_id=new_trip.id,
            city_id=stop.city_id,
            start_date=stop.start_date,
            end_date=stop.end_date,
            order_index=stop.order_index
        )
        db.session.add(new_stop)
        db.session.flush()

        for it_act in stop.itinerary_activities:
            new_it_act = ItineraryActivity(
                trip_stop_id=new_stop.id,
                activity_id=it_act.activity_id,
                activity_date=it_act.activity_date,
                start_time=it_act.start_time,
                order_index=it_act.order_index,
                notes=it_act.notes
            )
            db.session.add(new_it_act)

    for exp in orig_trip.expenses:
        new_exp = Expense(
            trip_id=new_trip.id,
            category=exp.category,
            amount=exp.amount,
            expense_date=exp.expense_date,
            description=exp.description
        )
        db.session.add(new_exp)

    db.session.commit()
    return jsonify(new_trip.to_dict(include_details=True)), 201
