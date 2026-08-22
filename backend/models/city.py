from app.extensions import db


class City(db.Model):
    __tablename__ = "cities"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    country = db.Column(db.String(120), nullable=False)
    region = db.Column(db.String(120))
    cost_index = db.Column(db.Float, default=0.0, nullable=False)  # relative daily cost
    popularity = db.Column(db.Integer, default=0, nullable=False)  # drives "popular cities"
    latitude = db.Column(db.Float)
    longitude = db.Column(db.Float)
    image_url = db.Column(db.String(500))

    activities = db.relationship(
        "Activity", back_populates="city", cascade="all, delete-orphan"
    )
    stops = db.relationship("Stop", back_populates="city")

    __table_args__ = (
        db.UniqueConstraint("name", "country", name="uq_city_name_country"),
    )

    def __repr__(self):
        return f"<City {self.name}, {self.country}>"
