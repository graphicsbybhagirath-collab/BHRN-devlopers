from flask import Blueprint, request, jsonify
from app.models import db, TripStop, Activity, ItineraryActivity
from app.utils.auth_helpers import token_required
from app.utils.validators import is_valid_time

itinerary_bp = Blueprint('itinerary', __name__, url_prefix='/api')

def handle_add_activity(current_user, stop_id):
    stop = db.session.get(TripStop, stop_id)
    if not stop:
        return jsonify({'error': 'Trip stop not found'}), 404

    if stop.trip.user_id != current_user.id:
        return jsonify({'error': 'Unauthorized access'}), 403

    data = request.get_json(silent=True) or {}
    activity_id_raw = data.get('activity_id')
    activity_date = data.get('activity_date') or stop.start_date
    start_time_raw = str(data.get('start_time', '10:00')).strip()
    notes = str(data.get('notes', '')).strip()

    if not activity_id_raw:
        return jsonify({'error': 'activity_id is required'}), 400

    try:
        activity_id = int(activity_id_raw)
    except (ValueError, TypeError):
        return jsonify({'error': 'Invalid activity selected'}), 400

    activity = db.session.get(Activity, activity_id)
    if not activity:
        return jsonify({'error': 'Activity was not found'}), 404

    start_time = start_time_raw if is_valid_time(start_time_raw) else '10:00'

    existing_items = ItineraryActivity.query.filter_by(trip_stop_id=stop_id).all()
    order_index = len(existing_items)

    itinerary_item = ItineraryActivity(
        trip_stop_id=stop_id,
        activity_id=activity.id,
        activity_date=activity_date,
        start_time=start_time,
        notes=notes,
        order_index=order_index
    )
    db.session.add(itinerary_item)
    db.session.commit()

    return jsonify(itinerary_item.to_dict()), 201

@itinerary_bp.route('/stops/<int:stop_id>/activities', methods=['POST'])
@token_required
def add_activity_to_stop(current_user, stop_id):
    return handle_add_activity(current_user, stop_id)

@itinerary_bp.route('/trip-stops/<int:stop_id>/activities', methods=['POST'])
@token_required
def add_activity_to_trip_stop(current_user, stop_id):
    return handle_add_activity(current_user, stop_id)

@itinerary_bp.route('/itinerary-activities/<int:item_id>', methods=['PUT'])
@token_required
def update_itinerary_activity(current_user, item_id):
    item = db.session.get(ItineraryActivity, item_id)
    if not item:
        return jsonify({'error': 'Itinerary activity not found'}), 404

    if item.trip_stop.trip.user_id != current_user.id:
        return jsonify({'error': 'Unauthorized access'}), 403

    data = request.get_json(silent=True) or {}
    if 'activity_date' in data:
        item.activity_date = data['activity_date']
    if 'start_time' in data:
        t_raw = str(data['start_time']).strip()
        item.start_time = t_raw if is_valid_time(t_raw) else item.start_time
    if 'notes' in data:
        item.notes = str(data['notes']).strip()
    if 'order_index' in data:
        try:
            item.order_index = max(0, int(data['order_index']))
        except (ValueError, TypeError):
            pass

    db.session.commit()
    return jsonify(item.to_dict()), 200

@itinerary_bp.route('/itinerary-activities/<int:item_id>', methods=['DELETE'])
@token_required
def delete_itinerary_activity(current_user, item_id):
    item = db.session.get(ItineraryActivity, item_id)
    if not item:
        return jsonify({'error': 'Itinerary activity not found'}), 404

    stop = item.trip_stop
    if stop.trip.user_id != current_user.id:
        return jsonify({'error': 'Unauthorized access'}), 403

    stop_id = stop.id
    db.session.delete(item)
    db.session.flush()

    remaining = ItineraryActivity.query.filter_by(trip_stop_id=stop_id).order_by(ItineraryActivity.order_index.asc()).all()
    for idx, act in enumerate(remaining):
        act.order_index = idx

    db.session.commit()
    return jsonify({'message': 'Activity removed from itinerary'}), 200

@itinerary_bp.route('/stops/<int:stop_id>/activities/reorder', methods=['PUT'])
@itinerary_bp.route('/trip-stops/<int:stop_id>/activities/reorder', methods=['PUT'])
@token_required
def reorder_stop_activities(current_user, stop_id):
    stop = db.session.get(TripStop, stop_id)
    if not stop:
        return jsonify({'error': 'Trip stop not found'}), 404

    if stop.trip.user_id != current_user.id:
        return jsonify({'error': 'Unauthorized access'}), 403

    data = request.get_json(silent=True) or {}
    activity_ids = data.get('activity_ids', [])

    if activity_ids and isinstance(activity_ids, list):
        for idx, act_id in enumerate(activity_ids):
            try:
                item = ItineraryActivity.query.filter_by(id=int(act_id), trip_stop_id=stop_id).first()
                if item:
                    item.order_index = idx
            except (ValueError, TypeError):
                continue

    db.session.commit()
    items = ItineraryActivity.query.filter_by(trip_stop_id=stop_id).order_by(ItineraryActivity.order_index.asc()).all()
    return jsonify([it.to_dict() for it in items]), 200
