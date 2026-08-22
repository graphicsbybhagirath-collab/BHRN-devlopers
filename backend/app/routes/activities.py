from flask import Blueprint, request, jsonify
from app.models import db, Activity, City

activities_bp = Blueprint('activities', __name__, url_prefix='/api')

@activities_bp.route('/activities', methods=['GET'])
def get_all_activities():
    category = str(request.args.get('category', '')).strip()
    search = str(request.args.get('search', '')).strip()
    city_id = request.args.get('city_id', type=int)
    max_cost = request.args.get('max_cost', type=float)
    max_duration = request.args.get('max_duration', type=int)

    query = Activity.query

    if city_id:
        query = query.filter_by(city_id=city_id)

    if category and category.lower() != 'all':
        query = query.filter(Activity.category.ilike(category))

    if search:
        search_term = f"%{search}%"
        query = query.filter(Activity.name.ilike(search_term) | Activity.description.ilike(search_term))

    if max_cost is not None and max_cost > 0:
        query = query.filter(Activity.estimated_cost <= max_cost)

    if max_duration is not None and max_duration > 0:
        query = query.filter(Activity.duration_minutes <= max_duration)

    activities = query.order_by(Activity.rating.desc()).all()
    return jsonify([activity.to_dict() for activity in activities]), 200

@activities_bp.route('/cities/<int:city_id>/activities', methods=['GET'])
def get_city_activities(city_id):
    city = db.session.get(City, city_id)
    if not city:
        return jsonify({'error': 'City not found'}), 404

    category = str(request.args.get('category', '')).strip()
    search = str(request.args.get('search', '')).strip()
    max_cost = request.args.get('max_cost', type=float)
    max_duration = request.args.get('max_duration', type=int)

    query = Activity.query.filter_by(city_id=city_id)

    if category and category.lower() != 'all':
        query = query.filter(Activity.category.ilike(category))

    if search:
        search_term = f"%{search}%"
        query = query.filter(Activity.name.ilike(search_term) | Activity.description.ilike(search_term))

    if max_cost is not None and max_cost > 0:
        query = query.filter(Activity.estimated_cost <= max_cost)

    if max_duration is not None and max_duration > 0:
        query = query.filter(Activity.duration_minutes <= max_duration)

    activities = query.order_by(Activity.rating.desc()).all()
    return jsonify([activity.to_dict() for activity in activities]), 200

@activities_bp.route('/activities/<int:activity_id>', methods=['GET'])
def get_activity(activity_id):
    activity = db.session.get(Activity, activity_id)
    if not activity:
        return jsonify({'error': 'Activity not found'}), 404

    return jsonify(activity.to_dict()), 200
