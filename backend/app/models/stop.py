from app.models.base import db

class TripStop(db.Model):
    __tablename__ = 'trip_stop'

    id = db.Column(db.Integer, primary_key=True)
    trip_id = db.Column(db.Integer, db.ForeignKey('trip.id', ondelete='CASCADE'), nullable=False)
    city_id = db.Column(db.Integer, db.ForeignKey('city.id', ondelete='RESTRICT'), nullable=False)
    start_date = db.Column(db.String(20), nullable=True)
    end_date = db.Column(db.String(20), nullable=True)
    order_index = db.Column(db.Integer, default=0, nullable=False)

    # Relationships
    itinerary_activities = db.relationship(
        'ItineraryActivity',
        backref='trip_stop',
        cascade='all, delete-orphan',
        order_by='ItineraryActivity.order_index',
        lazy='joined'
    )

    def to_dict(self, include_activities=True):
        data = {
            'id': self.id,
            'trip_id': self.trip_id,
            'city_id': self.city_id,
            'start_date': self.start_date,
            'end_date': self.end_date,
            'order_index': self.order_index,
            'city': self.city.to_dict() if self.city else None
        }
        if include_activities:
            data['activities'] = [ia.to_dict() for ia in self.itinerary_activities]
        return data
