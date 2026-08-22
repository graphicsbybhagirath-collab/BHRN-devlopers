from app.extensions import db


class Activity(db.Model):
    __tablename__ = "activities"

    id = db.Column(db.Integer, primary_key=True)
    city_id = db.Column(db.Integer, db.ForeignKey("cities.id"), nullable=False, index=True)
    name = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    category = db.Column(db.String(50), index=True)  # sightseeing, food, adventure, ...
    cost = db.Column(db.Float, default=0.0, nullable=False)
    duration_minutes = db.Column(db.Integer, default=60, nullable=False)
    image_url = db.Column(db.String(500))

    city = db.relationship("City", back_populates="activities")
    trip_activities = db.relationship("TripActivity", back_populates="activity")

    def __repr__(self):
        return f"<Activity {self.name}>"
