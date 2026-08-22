from app.models.base import db

class ItineraryActivity(db.Model):
    __tablename__ = 'itinerary_activity'

    id = db.Column(db.Integer, primary_key=True)
    trip_stop_id = db.Column(db.Integer, db.ForeignKey('trip_stop.id', ondelete='CASCADE'), nullable=False)
    activity_id = db.Column(db.Integer, db.ForeignKey('activity.id', ondelete='RESTRICT'), nullable=False)
    activity_date = db.Column(db.String(20), nullable=True)
    start_time = db.Column(db.String(10), nullable=True)
    order_index = db.Column(db.Integer, default=0, nullable=False)
    notes = db.Column(db.Text, default='')

    # Relationships
    activity = db.relationship('Activity', lazy='joined')

    def to_dict(self):
        return {
            'id': self.id,
            'trip_stop_id': self.trip_stop_id,
            'activity_id': self.activity_id,
            'activity_date': self.activity_date,
            'start_time': self.start_time or '09:00',
            'order_index': self.order_index,
            'notes': self.notes or '',
            'activity': self.activity.to_dict() if self.activity else None
        }
