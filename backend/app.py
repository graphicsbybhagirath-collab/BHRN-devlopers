
from app.models import City, Trip

bp = Blueprint("main", __name__)


@bp.route("/")
def index():
    popular_cities = City.query.order_by(City.popularity.desc()).limit(6).all()
    return render_template("index.html", popular_cities=popular_cities)


