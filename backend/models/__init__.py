"""ORM models. Import order does not matter — SQLAlchemy resolves string-based
relationships lazily. Everything is re-exported here for convenient imports
(``from app.models import Trip, City, ...``).
"""
from app.models.user import User, load_user, saved_destinations
from app.models.city import City
from app.models.activity import Activity
from app.models.trip import Trip
from app.models.stop import Stop
from app.models.trip_activity import TripActivity
from app.models.expense import EXPENSE_CATEGORIES, Expense

__all__ = [
    "User",
    "load_user",
    "saved_destinations",
    "City",
    "Activity",
    "Trip",
    "Stop",
    "TripActivity",
    "Expense",
    "EXPENSE_CATEGORIES",
]
