from flask import Blueprint, request, jsonify
from app.models import db, Trip, TripStop, City
from app.utils.auth_helpers import token_required
from app.utils.validators import is_valid_date_range, parse_date

trips_bp = Blueprint('trips', __name__, url_prefix='/api/trips')

@trips_bp.route('', methods=['GET'])
@token_required
def get_user_trips(current_user):
    trips = Trip.query.filter_by(user_id=current_user.id).order_by(Trip.created_at.desc()).all()
    result = []
    for trip in trips:
        trip_dict = trip.to_dict(include_details=False)
        total_activities = sum(len(stop.itinerary_activities) for stop in trip.stops)
        trip_dict['total_activities'] = total_activities
        result.append(trip_dict)
    return jsonify(result), 200

@trips_bp.route('', methods=['POST'])
@token_required
def create_trip(current_user):
    data = request.get_json(silent=True) or {}
    name = str(data.get('name', '')).strip()
    description = str(data.get('description', '')).strip()
    start_date = data.get('start_date')
    end_date = data.get('end_date')
    cover_image = str(data.get('cover_image', '')).strip()
    initial_city_id = data.get('initial_city_id')

    if not name:
        return jsonify({'error': 'Trip name is required'}), 400

    if start_date and end_date:
        if not is_valid_date_range(start_date, end_date):
            return jsonify({'error': 'End date must be on or after start date'}), 400

    if not cover_image:
        if initial_city_id:
            try:
                city = db.session.get(City, int(initial_city_id))
                if city:
                    cover_image = city.image
            except (ValueError, TypeError):
                pass
        if not cover_image:
            cover_image = 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80'

    trip = Trip(
        user_id=current_user.id,
        name=name,
        description=description,
        start_date=start_date,
        end_date=end_date,
        cover_image=cover_image
    )
    db.session.add(trip)
    db.session.flush()

    if initial_city_id:
        try:
            city = db.session.get(City, int(initial_city_id))
            if city:
                stop = TripStop(
                    trip_id=trip.id,
                    city_id=city.id,
                    start_date=start_date,
                    end_date=end_date,
                    order_index=0
                )
                db.session.add(stop)
        except (ValueError, TypeError):
            pass

    db.session.commit()
    return jsonify(trip.to_dict(include_details=True)), 201

@trips_bp.route('/<int:trip_id>', methods=['GET'])
@token_required
def get_trip_detail(current_user, trip_id):
    trip = db.session.get(Trip, trip_id)
    if not trip:
        return jsonify({'error': 'Trip not found'}), 404

    if trip.user_id != current_user.id:
        return jsonify({'error': 'Unauthorized access to this trip'}), 403

    return jsonify(trip.to_dict(include_details=True)), 200

@trips_bp.route('/<int:trip_id>', methods=['PUT'])
@token_required
def update_trip(current_user, trip_id):
    trip = db.session.get(Trip, trip_id)
    if not trip:
        return jsonify({'error': 'Trip not found'}), 404

    if trip.user_id != current_user.id:
        return jsonify({'error': 'Unauthorized access to this trip'}), 403

    data = request.get_json(silent=True) or {}
    if 'name' in data:
        name = str(data['name']).strip()
        if not name:
            return jsonify({'error': 'Trip name cannot be empty'}), 400
        trip.name = name

    if 'description' in data:
        trip.description = str(data['description']).strip()

    new_start = data.get('start_date', trip.start_date)
    new_end = data.get('end_date', trip.end_date)
    if new_start and new_end:
        if not is_valid_date_range(new_start, new_end):
            return jsonify({'error': 'End date must be on or after start date'}), 400

    if 'start_date' in data:
        trip.start_date = data['start_date']

    if 'end_date' in data:
        trip.end_date = data['end_date']

    if 'cover_image' in data and data['cover_image']:
        trip.cover_image = str(data['cover_image']).strip()

    db.session.commit()
    return jsonify(trip.to_dict(include_details=True)), 200

@trips_bp.route('/<int:trip_id>', methods=['DELETE'])
@token_required
def delete_trip(current_user, trip_id):
    trip = db.session.get(Trip, trip_id)
    if not trip:
        return jsonify({'error': 'Trip not found'}), 404

    if trip.user_id != current_user.id:
        return jsonify({'error': 'Unauthorized access to this trip'}), 403

    db.session.delete(trip)
    db.session.commit()
    return jsonify({'message': 'Trip deleted successfully'}), 200
