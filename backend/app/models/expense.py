from app.extensions import db

EXPENSE_CATEGORIES = ("transport", "stay", "meals", "activity", "other")


class Expense(db.Model):
    __tablename__ = "expenses"

    id = db.Column(db.Integer, primary_key=True)
    trip_id = db.Column(db.Integer, db.ForeignKey("trips.id"), nullable=False, index=True)
    stop_id = db.Column(db.Integer, db.ForeignKey("stops.id"))  # optional link to a city
    category = db.Column(db.String(20), default="other", nullable=False, index=True)
    description = db.Column(db.String(255))
    amount = db.Column(db.Float, default=0.0, nullable=False)
    date = db.Column(db.Date)

    trip = db.relationship("Trip", back_populates="expenses")
    stop = db.relationship("Stop", back_populates="expenses")

    def __repr__(self):
        return f"<Expense {self.category} {self.amount}>"
