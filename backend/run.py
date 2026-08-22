import os
from backend.run import create_app

app = create_app()

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5001))
    print(f"🌍 GlobeTrotter Backend Server running on http://localhost:{port}")
    app.run(host='0.0.0.0', port=port, debug=True)
