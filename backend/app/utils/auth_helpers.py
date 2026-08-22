import datetime
from functools import wraps
import jwt
from flask import request, jsonify, current_app, g
from app.models import db, User

def generate_token(user_id):
    now = datetime.datetime.now(datetime.timezone.utc)
    payload = {
        'exp': now + datetime.timedelta(days=current_app.config.get('JWT_ACCESS_TOKEN_EXPIRES_DAYS', 30)),
        'iat': now,
        'sub': user_id
    }
    return jwt.encode(
        payload,
        current_app.config.get('JWT_SECRET_KEY'),
        algorithm='HS256'
    )

def decode_token(token):
    try:
        payload = jwt.decode(
            token,
            current_app.config.get('JWT_SECRET_KEY'),
            algorithms=['HS256']
        )
        return payload['sub']
    except (jwt.ExpiredSignatureError, jwt.InvalidTokenError):
        return None

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        auth_header = request.headers.get('Authorization')

        if auth_header:
            parts = auth_header.split(' ')
            if len(parts) == 2 and parts[0].lower() == 'bearer':
                token = parts[1]
            elif len(parts) == 1:
                token = parts[0]

        if not token:
            return jsonify({'error': 'Authentication token is missing'}), 401

        user_id = decode_token(token)
        if not user_id:
            return jsonify({'error': 'Token is invalid or has expired'}), 401

        current_user = db.session.get(User, user_id)
        if not current_user:
            return jsonify({'error': 'User not found'}), 401

        g.current_user = current_user
        return f(current_user, *args, **kwargs)

    return decorated

def optional_token(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        current_user = None
        auth_header = request.headers.get('Authorization')

        if auth_header:
            parts = auth_header.split(' ')
            if len(parts) == 2 and parts[0].lower() == 'bearer':
                token = parts[1]
                user_id = decode_token(token)
                if user_id:
                    current_user = db.session.get(User, user_id)

        g.current_user = current_user
        return f(current_user, *args, **kwargs)

    return decorated