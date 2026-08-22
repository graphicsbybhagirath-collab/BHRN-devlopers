from flask import Blueprint, request, jsonify
from app.models import db, User
from app.utils.auth_helpers import generate_token, token_required
from app.utils.validators import is_valid_email

auth_bp = Blueprint('auth', __name__, url_prefix='/api')

def handle_registration():
    data = request.get_json(silent=True) or {}
    name = str(data.get('name', '')).strip()
    email = str(data.get('email', '')).strip().lower()
    password = str(data.get('password', '')).strip()

    if not name or not email or not password:
        return jsonify({'error': 'Name, email, and password are required'}), 400

    if len(name) < 2:
        return jsonify({'error': 'Name must be at least 2 characters long'}), 400

    if not is_valid_email(email):
        return jsonify({'error': 'Please provide a valid email address'}), 400

    if len(password) < 6:
        return jsonify({'error': 'Password must be at least 6 characters long'}), 400

    existing_user = User.query.filter_by(email=email).first()
    if existing_user:
        return jsonify({'error': 'An account with this email already exists'}), 409

    user = User(name=name, email=email)
    user.set_password(password)
    db.session.add(user)
    db.session.commit()

    token = generate_token(user.id)
    user_data = user.to_dict()
    return jsonify({
        'message': 'Registration successful',
        'token': token,
        'access_token': token,
        'token_type': 'Bearer',
        'user': user_data
    }), 201

@auth_bp.route('/auth/register', methods=['POST'])
@auth_bp.route('/register', methods=['POST'])
def register():
    return handle_registration()

@auth_bp.route('/auth/signup', methods=['POST'])
@auth_bp.route('/signup', methods=['POST'])
def signup():
    return handle_registration()

@auth_bp.route('/auth/login', methods=['POST'])
@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json(silent=True) or {}
    email = str(data.get('email', '')).strip().lower()
    password = str(data.get('password', '')).strip()

    if not email or not password:
        return jsonify({'error': 'Email and password are required'}), 400

    if not is_valid_email(email):
        return jsonify({'error': 'Please enter a valid email address'}), 400

    user = User.query.filter_by(email=email).first()
    if not user or not user.check_password(password):
        return jsonify({'error': 'Invalid email or password'}), 401

    token = generate_token(user.id)
    user_data = user.to_dict()
    return jsonify({
        'message': 'Login successful',
        'token': token,
        'access_token': token,
        'token_type': 'Bearer',
        'user': user_data
    }), 200

@auth_bp.route('/auth/me', methods=['GET'])
@auth_bp.route('/me', methods=['GET'])
@token_required
def get_current_user(current_user):
    user_dict = current_user.to_dict()
    return jsonify({
        **user_dict,
        'user': user_dict
    }), 200

@auth_bp.route('/profile', methods=['PUT', 'DELETE'])
@auth_bp.route('/auth/profile', methods=['PUT', 'DELETE'])
@token_required
def profile_endpoint(current_user):
    if request.method == 'DELETE':
        db.session.delete(current_user)
        db.session.commit()
        return jsonify({'message': 'Account deleted successfully'}), 200

    data = request.get_json(silent=True) or {}
    name = str(data.get('name', '')).strip() if 'name' in data else None
    email = str(data.get('email', '')).strip().lower() if 'email' in data else None
    password = str(data.get('password', '')).strip() if 'password' in data else None

    if name is not None:
        if len(name) < 2:
            return jsonify({'error': 'Name must be at least 2 characters long'}), 400
        current_user.name = name

    if email is not None and email != current_user.email:
        if not is_valid_email(email):
            return jsonify({'error': 'Please provide a valid email address'}), 400
        existing = User.query.filter_by(email=email).first()
        if existing and existing.id != current_user.id:
            return jsonify({'error': 'This email address is already in use by another account'}), 409
        current_user.email = email

    if password is not None and password:
        if len(password) < 6:
            return jsonify({'error': 'Password must be at least 6 characters long'}), 400
        current_user.set_password(password)

    db.session.commit()
    user_dict = current_user.to_dict()
    return jsonify({
        'message': 'Profile updated successfully',
        'user': user_dict,
        **user_dict
    }), 200