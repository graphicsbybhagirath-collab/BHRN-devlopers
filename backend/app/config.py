import os

BASE_DIR = os.path.abspath(os.path.dirname(__file__))

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY', 'globetrotter-super-secret-jwt-key-2026')
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'globetrotter-jwt-auth-secret-key-2026')
    SQLALCHEMY_DATABASE_URI = os.environ.get(
        'DATABASE_URL',
        f"sqlite:///{os.path.join(BASE_DIR, '..', 'instance', 'globetrotter.db')}"
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JWT_ACCESS_TOKEN_EXPIRES_DAYS = 30
