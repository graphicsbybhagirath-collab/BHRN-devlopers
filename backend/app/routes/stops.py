from flask import Blueprint, request, jsonify
from app.models import db, Trip, TripStop, City
from app.utils.auth_helpers import token_required
from app.utils.validators import is_valid_date_range

stops_bp = Blueprint('stops', __name__, url_prefix='/api')

@stops_bp.route('/trips/<int:trip_id>/stops', methods=['POST'])
@token_required
def add_stop(current_user, trip_id):
    trip = db.session.get(Trip, trip_id)
    if not trip:
        return jsonify({'error': 'Trip not found'}), 404

    if trip.user_id != current_user.id:
        return jsonify({'error': 'Unauthorized access'}), 403

    data = request.get_json(silent=True) or {}
    city_id_raw = data.get('city_id')
    start_date = data.get('start_date')
    end_date = data.get('end_date')

    if not city_id_raw:
        return jsonify({'error': 'City is required'}), 400

    try:
        city_id = int(city_id_raw)
    except (ValueError, TypeError):
        return jsonify({'error': 'Invalid city selected'}), 400

    city = db.session.get(City, city_id)
    if not city:
        return jsonify({'error': 'Selected destination city was not found'}), 404

    if start_date and end_date:
        if not is_valid_date_range(start_date, end_date):
            return jsonify({'error': 'Stop end date must be on or after start date'}), 400

    existing_stops = TripStop.query.filter_by(trip_id=trip_id).order_by(TripStop.order_index.asc()).all()
    order_index = len(existing_stops)

    stop = TripStop(
        trip_id=trip.id,
        city_id=city.id,
        start_date=start_date or trip.start_date,
        end_date=end_date or trip.end_date,
        order_index=order_index
    )
    db.session.add(stop)

    if not trip.cover_image or 'unsplash' in trip.cover_image:
        if city.image:
            trip.cover_image = city.image

    db.session.commit()
    return jsonify(stop.to_dict(include_activities=True)), 201

@stops_bp.route('/stops/<int:stop_id>', methods=['PUT'])
@token_required
def update_stop(current_user, stop_id):
    stop = db.session.get(TripStop, stop_id)
    if not stop:
        return jsonify({'error': 'Trip stop not found'}), 404

    if stop.trip.user_id != current_user.id:
        return jsonify({'error': 'Unauthorized access'}), 403

    data = request.get_json(silent=True) or {}
    new_start = data.get('start_date', stop.start_date)
    new_end = data.get('end_date', stop.end_date)
    if new_start and new_end:
        if not is_valid_date_range(new_start, new_end):
            return jsonify({'error': 'Stop end date must be on or after start date'}), 400

    if 'start_date' in data:
        stop.start_date = data['start_date']
    if 'end_date' in data:
        stop.end_date = data['end_date']
    if 'order_index' in data:
        try:
            stop.order_index = max(0, int(data['order_index']))
        except (ValueError, TypeError):
            pass

    db.session.commit()
    return jsonify(stop.to_dict(include_activities=True)), 200

@stops_bp.route('/stops/<int:stop_id>', methods=['DELETE'])
@token_required
def delete_stop(current_user, stop_id):
    stop = db.session.get(TripStop, stop_id)
    if not stop:
        return jsonify({'error': 'Trip stop not found'}), 404

    trip = stop.trip
    if trip.user_id != current_user.id:
        return jsonify({'error': 'Unauthorized access'}), 403

    trip_id = trip.id
    db.session.delete(stop)
    db.session.flush()

    remaining_stops = TripStop.query.filter_by(trip_id=trip_id).order_by(TripStop.order_index.asc()).all()
    for idx, s in enumerate(remaining_stops):
        s.order_index = idx

    db.session.commit()
    return jsonify({'message': 'Stop deleted successfully'}), 200

@stops_bp.route('/trips/<int:trip_id>/stops/reorder', methods=['PUT'])
@token_required
def reorder_stops(current_user, trip_id):
    trip = db.session.get(Trip, trip_id)
    if not trip:
        return jsonify({'error': 'Trip not found'}), 404

    if trip.user_id != current_user.id:
        return jsonify({'error': 'Unauthorized access'}), 403

    data = request.get_json(silent=True) or {}
    stops_order = data.get('stops', [])
    stop_ids = data.get('stop_ids', [])

    if stop_ids and isinstance(stop_ids, list):
        for idx, s_id in enumerate(stop_ids):
            try:
                st = TripStop.query.filter_by(id=int(s_id), trip_id=trip_id).first()
                if st:
                    st.order_index = idx
            except (ValueError, TypeError):
                continue
    elif stops_order and isinstance(stops_order, list):
        for item in stops_order:
            try:
                s_id = item.get('id')
                o_idx = item.get('order_index')
                if s_id is not None and o_idx is not None:
                    st = TripStop.query.filter_by(id=int(s_id), trip_id=trip_id).first()
                    if st:
                        st.order_index = max(0, int(o_idx))
            except (ValueError, TypeError):
                continue

    db.session.commit()
    all_stops = TripStop.query.filter_by(trip_id=trip_id).order_by(TripStop.order_index.asc()).all()
    return jsonify([s.to_dict(include_activities=True) for s in all_stops]), 200
