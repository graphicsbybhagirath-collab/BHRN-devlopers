from app.models.base import db

class Activity(db.Model):
    __tablename__ = 'activity'

    id = db.Column(db.Integer, primary_key=True)
    city_id = db.Column(db.Integer, db.ForeignKey('city.id', ondelete='CASCADE'), nullable=False)
    name = db.Column(db.String(200), nullable=False)
    category = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=False)
    image = db.Column(db.String(500), nullable=False)
    duration_minutes = db.Column(db.Integer, default=120)
    estimated_cost = db.Column(db.Float, default=0.0)
    rating = db.Column(db.Float, default=4.5)

    def to_dict(self):
        return {
            'id': self.id,
            'city_id': self.city_id,
            'city_name': self.city.name if self.city else None,
            'name': self.name,
            'category': self.category,
            'description': self.description,
            'image': self.image,
            'duration_minutes': self.duration_minutes,
            'estimated_cost': self.estimated_cost,
            'rating': self.rating
        }
