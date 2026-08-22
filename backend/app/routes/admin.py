from flask import Blueprint, jsonify
from app.models import db, User, Trip, City, Activity, TripStop, ItineraryActivity, Expense
from sqlalchemy import func

admin_bp = Blueprint('admin', __name__, url_prefix='/api/admin')

@admin_bp.route('/analytics', methods=['GET'])
def get_analytics():
    total_users = User.query.count()
    total_trips = Trip.query.count()
    total_cities = City.query.count()
    total_activities = Activity.query.count()
    total_stops = TripStop.query.count()
    total_scheduled_activities = ItineraryActivity.query.count()

    # Calculate top visited cities
    top_cities_query = (
        db.session.query(City.name, City.country, City.image, func.count(TripStop.id).label('visit_count'))
        .join(TripStop, TripStop.city_id == City.id)
        .group_by(City.id)
        .order_by(func.count(TripStop.id).desc())
        .limit(6)
        .all()
    )

    top_cities = [
        {
            'name': name,
            'country': country,
            'image': image,
            'visit_count': visit_count
        }
        for name, country, image, visit_count in top_cities_query
    ]

    # Calculate popular activity categories
    category_counts_query = (
        db.session.query(Activity.category, func.count(ItineraryActivity.id).label('scheduled_count'))
        .join(ItineraryActivity, ItineraryActivity.activity_id == Activity.id)
        .group_by(Activity.category)
        .order_by(func.count(ItineraryActivity.id).desc())
        .all()
    )

    popular_categories = [
        {
            'category': cat,
            'count': count
        }
        for cat, count in category_counts_query
    ]

    # Recent trips summary
    recent_trips = (
        Trip.query.order_by(Trip.created_at.desc())
        .limit(5)
        .all()
    )
    recent_trips_data = [
        {
            'id': t.id,
            'name': t.name,
            'user_name': t.owner.name if t.owner else 'Unknown',
            'start_date': t.start_date,
            'end_date': t.end_date,
            'stops_count': len(t.stops),
            'created_at': t.created_at.isoformat() if t.created_at else None
        }
        for t in recent_trips
    ]

    # User growth simulation / list
    users = User.query.order_by(User.created_at.desc()).limit(10).all()
    users_data = [
        {
            'id': u.id,
            'name': u.name,
            'email': u.email,
            'trip_count': u.trips.count(),
            'created_at': u.created_at.isoformat() if u.created_at else None
        }
        for u in users
    ]

    return jsonify({
        'overview': {
            'total_users': total_users,
            'total_trips': total_trips,
            'total_cities': total_cities,
            'total_activities': total_activities,
            'total_stops': total_stops,
            'total_scheduled_activities': total_scheduled_activities
        },
        'top_cities': top_cities,
        'popular_categories': popular_categories,
        'recent_trips': recent_trips_data,
        'recent_users': users_data
    }), 200
