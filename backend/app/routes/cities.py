from flask import Blueprint, request, jsonify
from app.models import db, City

cities_bp = Blueprint('cities', __name__, url_prefix='/api/cities')

@cities_bp.route('', methods=['GET'])
def get_cities():
    search = str(request.args.get('search', '')).strip()
    region = str(request.args.get('region', '')).strip()
    sort_by = str(request.args.get('sort_by', 'popularity')).strip()

    min_cost = request.args.get('min_cost', type=float)
    max_cost = request.args.get('max_cost', type=float)

    query = City.query

    if search:
        search_term = f"%{search}%"
        query = query.filter(
            (City.name.ilike(search_term)) |
            (City.country.ilike(search_term)) |
            (City.region.ilike(search_term))
        )

    if region and region.lower() != 'all':
        query = query.filter(City.region.ilike(region))

    if min_cost is not None and min_cost > 0:
        query = query.filter(City.cost_index >= min_cost)

    if max_cost is not None and max_cost > 0:
        query = query.filter(City.cost_index <= max_cost)

    if sort_by == 'name':
        query = query.order_by(City.name.asc())
    elif sort_by == 'cost_asc':
        query = query.order_by(City.cost_index.asc())
    elif sort_by == 'cost_desc':
        query = query.order_by(City.cost_index.desc())
    else:
        query = query.order_by(City.popularity.desc())

    cities = query.all()
    return jsonify([city.to_dict() for city in cities]), 200

@cities_bp.route('/<int:city_id>', methods=['GET'])
def get_city(city_id):
    city = db.session.get(City, city_id)
    if not city:
        return jsonify({'error': 'City not found'}), 404

    return jsonify(city.to_dict(include_activities=True)), 200
