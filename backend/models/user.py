from datetime import datetime, timezone

from flask_login import UserMixin
from werkzeug.security import check_password_hash, generate_password_hash

from app.extensions import db, login_manager

# Many-to-many: users <-> cities they bookmark ("saved destinations" on the profile).
saved_destinations = db.Table(
    "saved_destinations",
    db.Column("user_id", db.Integer, db.ForeignKey("users.id"), primary_key=True),
    db.Column("city_id", db.Integer, db.ForeignKey("cities.id"), primary_key=True),
    db.Column("created_at", db.DateTime, default=lambda: datetime.now(timezone.utc)),
)


class User(UserMixin, db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(255), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    photo_url = db.Column(db.String(500))
    language = db.Column(db.String(10), default="en", nullable=False)
    is_admin = db.Column(db.Boolean, default=False, nullable=False)
    created_at = db.Column(
        db.DateTime, default=lambda: datetime.now(timezone.utc), nullable=False
    )

    trips = db.relationship(
        "Trip", back_populates="user", cascade="all, delete-orphan"
    )
    saved_cities = db.relationship(
        "City", secondary=saved_destinations, backref="saved_by"
    )

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def __repr__(self):
        return f"<User {self.email}>"


@login_manager.user_loader
def load_user(user_id):
    return db.session.get(User, int(user_id))
