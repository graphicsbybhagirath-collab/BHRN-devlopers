from app.routes.auth import auth_bp
from app.routes.trips import trips_bp
from app.routes.stops import stops_bp
from app.routes.cities import cities_bp
from app.routes.activities import activities_bp
from app.routes.itinerary import itinerary_bp
from app.routes.budget import budget_bp
from app.routes.sharing import sharing_bp
from app.routes.admin import admin_bp

__all__ = [
    'auth_bp',
    'trips_bp',
    'stops_bp',
    'cities_bp',
    'activities_bp',
    'itinerary_bp',
    'budget_bp',
    'sharing_bp',
    'admin_bp'
]
