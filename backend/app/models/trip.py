from app.models.base import db, utc_now

class Trip(db.Model):
    __tablename__ = 'trip'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id', ondelete='CASCADE'), nullable=False)
    name = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, default='')
    start_date = db.Column(db.String(20), nullable=True)
    end_date = db.Column(db.String(20), nullable=True)
    cover_image = db.Column(db.String(500), nullable=True)
    created_at = db.Column(db.DateTime, default=utc_now)

    # Relationships
    stops = db.relationship('TripStop', backref='trip', cascade='all, delete-orphan', order_by='TripStop.order_index', lazy='joined')
    expenses = db.relationship('Expense', backref='trip', cascade='all, delete-orphan', lazy='dynamic')
    shared_links = db.relationship('SharedTrip', backref='trip', cascade='all, delete-orphan', lazy='dynamic')

    def to_dict(self, include_details=False):
        data = {
            'id': self.id,
            'user_id': self.user_id,
            'name': self.name,
            'description': self.description or '',
            'start_date': self.start_date,
            'end_date': self.end_date,
            'cover_image': self.cover_image or '',
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'stop_count': len(self.stops) if self.stops else 0,
        }

        if include_details:
            data['stops'] = [stop.to_dict(include_activities=True) for stop in self.stops]
            data['expenses'] = [exp.to_dict() for exp in self.expenses.all()]
            cities_set = []
            for s in self.stops:
                if s.city and s.city.name not in [c['name'] for c in cities_set]:
                    cities_set.append(s.city.to_dict())
            data['cities'] = cities_set
        else:
            data['cities_summary'] = [s.city.name for s in self.stops if s.city]

        return data
