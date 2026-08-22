from app.models.base import db

class City(db.Model):
    __tablename__ = 'city'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False, index=True)
    country = db.Column(db.String(100), nullable=False, index=True)
    region = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=False)
    image = db.Column(db.String(500), nullable=False)
    cost_index = db.Column(db.Float, default=3.0)
    popularity = db.Column(db.Float, default=4.5)

    # Relationships
    activities = db.relationship('Activity', backref='city', cascade='all, delete-orphan', lazy='dynamic')
    trip_stops = db.relationship('TripStop', backref='city', lazy='dynamic')

    def to_dict(self, include_activities=False):
        data = {
            'id': self.id,
            'name': self.name,
            'country': self.country,
            'region': self.region,
            'description': self.description,
            'image': self.image,
            'cost_index': self.cost_index,
            'popularity': self.popularity,
            'activity_count': self.activities.count() if hasattr(self.activities, 'count') else 0
        }
        if include_activities:
            data['activities'] = [a.to_dict() for a in self.activities.all()]
        return data
