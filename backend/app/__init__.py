import os
from flask import Flask, jsonify
from flask_cors import CORS
from app.config import Config
from app.models import db
from app.routes import (
    auth_bp,
    trips_bp,
    stops_bp,
    cities_bp,
    activities_bp,
    itinerary_bp,
    budget_bp,
    sharing_bp,
    admin_bp
)

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    # Ensure instance directory exists
    instance_path = os.path.join(os.path.abspath(os.path.dirname(__file__)), '..', 'instance')
    os.makedirs(instance_path, exist_ok=True)

    # Enable CORS for all routes (supporting frontend development)
    CORS(app, resources={r"/api/*": {"origins": "*"}})

    # Initialize extensions
    db.init_app(app)

    # Register Blueprints
    app.register_blueprint(auth_bp)
    app.register_blueprint(trips_bp)
    app.register_blueprint(stops_bp)
    app.register_blueprint(cities_bp)
    app.register_blueprint(activities_bp)
    app.register_blueprint(itinerary_bp)
    app.register_blueprint(budget_bp)
    app.register_blueprint(sharing_bp)
    app.register_blueprint(admin_bp)

    @app.route('/api/health', methods=['GET'])
    def health_check():
        return jsonify({
            'status': 'healthy',
            'message': 'GlobeTrotter API is running'
        }), 200

    with app.app_context():
        db.create_all()

    return app
