from app.extensions import db


class Stop(db.Model):
    __tablename__ = "stops"

    id = db.Column(db.Integer, primary_key=True)
    trip_id = db.Column(db.Integer, db.ForeignKey("trips.id"), nullable=False, index=True)
    city_id = db.Column(db.Integer, db.ForeignKey("cities.id"), nullable=False)
    start_date = db.Column(db.Date)
    end_date = db.Column(db.Date)
    order_index = db.Column(db.Integer, default=0, nullable=False)  # reorder cities

    trip = db.relationship("Trip", back_populates="stops")
    city = db.relationship("City", back_populates="stops")
    trip_activities = db.relationship(
        "TripActivity",
        back_populates="stop",
        cascade="all, delete-orphan",
        order_by="TripActivity.order_index",
    )
    expenses = db.relationship("Expense", back_populates="stop")

    def __repr__(self):
        return f"<Stop trip={self.trip_id} city={self.city_id}>"
