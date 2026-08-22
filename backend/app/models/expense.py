from app.models.base import db

class Expense(db.Model):
    __tablename__ = 'expense'

    id = db.Column(db.Integer, primary_key=True)
    trip_id = db.Column(db.Integer, db.ForeignKey('trip.id', ondelete='CASCADE'), nullable=False)
    category = db.Column(db.String(50), nullable=False)
    amount = db.Column(db.Float, nullable=False, default=0.0)
    expense_date = db.Column(db.String(20), nullable=True)
    description = db.Column(db.String(255), default='')

    def to_dict(self):
        return {
            'id': self.id,
            'trip_id': self.trip_id,
            'category': self.category,
            'amount': self.amount,
            'expense_date': self.expense_date,
            'description': self.description or ''
        }
