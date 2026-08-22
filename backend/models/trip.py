from datetime import datetime, timezone

from app.extensions import db


class Trip(db.Model):
    __tablename__ = "trips"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False, index=True)
    name = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    start_date = db.Column(db.Date)
    end_date = db.Column(db.Date)
    cover_photo_url = db.Column(db.String(500))
    is_public = db.Column(db.Boolean, default=False, nullable=False)
    public_slug = db.Column(db.String(64), unique=True, index=True)  # public share URL
    created_at = db.Column(
        db.DateTime, default=lambda: datetime.now(timezone.utc), nullable=False
    )
    updated_at = db.Column(
        db.DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    user = db.relationship("User", back_populates="trips")
    stops = db.relationship(
        "Stop",
        back_populates="trip",
        cascade="all, delete-orphan",
        order_by="Stop.order_index",
    )
    expenses = db.relationship(
        "Expense", back_populates="trip", cascade="all, delete-orphan"
    )

    @property
    def duration_days(self):
        """Inclusive number of days, or 0 if dates are not set."""
        if self.start_date and self.end_date:
            return (self.end_date - self.start_date).days + 1
        return 0

    def __repr__(self):
        return f"<Trip {self.name}>"
