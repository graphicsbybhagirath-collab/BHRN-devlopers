from app.models.base import db, utc_now

class SharedTrip(db.Model):
    __tablename__ = 'shared_trip'

    id = db.Column(db.Integer, primary_key=True)
    trip_id = db.Column(db.Integer, db.ForeignKey('trip.id', ondelete='CASCADE'), nullable=False)
    share_token = db.Column(db.String(64), unique=True, nullable=False, index=True)
    is_public = db.Column(db.Boolean, default=True, nullable=False)
    created_at = db.Column(db.DateTime, default=utc_now)

    def to_dict(self):
        return {
            'id': self.id,
            'trip_id': self.trip_id,
            'share_token': self.share_token,
            'is_public': self.is_public,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
