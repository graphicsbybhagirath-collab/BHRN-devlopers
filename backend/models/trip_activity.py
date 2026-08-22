from app.extensions import db


class TripActivity(db.Model):
    __tablename__ = "trip_activities"

    id = db.Column(db.Integer, primary_key=True)
    stop_id = db.Column(db.Integer, db.ForeignKey("stops.id"), nullable=False, index=True)
    activity_id = db.Column(db.Integer, db.ForeignKey("activities.id"), nullable=False)
    scheduled_date = db.Column(db.Date)
    scheduled_time = db.Column(db.Time)
    order_index = db.Column(db.Integer, default=0, nullable=False)  # drag-to-reorder within a day
    cost_override = db.Column(db.Float)  # falls back to Activity.cost when None
    notes = db.Column(db.Text)

    stop = db.relationship("Stop", back_populates="trip_activities")
    activity = db.relationship("Activity", back_populates="trip_activities")

    @property
    def effective_cost(self):
        if self.cost_override is not None:
            return self.cost_override
        return self.activity.cost if self.activity else 0.0

    def __repr__(self):
        return f"<TripActivity stop={self.stop_id} activity={self.activity_id}>"
