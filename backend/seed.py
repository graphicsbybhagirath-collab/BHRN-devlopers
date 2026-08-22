import os
from datetime import datetime, timedelta, timezone
from app import create_app
from app.models import db, User, City, Activity, Trip, TripStop, ItineraryActivity, Expense, SharedTrip

app = create_app()

def seed_database():
    with app.app_context():
        print("🌱 Seeding GlobeTrotter database...")

        # Re-create all tables for a clean seed
        db.drop_all()
        db.create_all()

        # 1. Create Demo User
        demo_user = User(
            name="Alex Trotter",
            email="demo@globetrotter.com"
        )
        demo_user.set_password("Demo@123")
        db.session.add(demo_user)

        # Also create a secondary user for testing
        test_user = User(
            name="Sarah Jenkins",
            email="sarah@example.com"
        )
        test_user.set_password("Sarah@123")
        db.session.add(test_user)
        db.session.commit()

        # 2. Seed Cities and Activities
        cities_data = [
            {
                "name": "Paris",
                "country": "France",
                "region": "Europe",
                "cost_index": 4.5,
                "popularity": 4.9,
                "description": "The City of Light, famed for its world-class art, culinary heritage, romantic boulevards, and iconic monuments.",
                "image": "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=80",
                "activities": [
                    {
                        "name": "Eiffel Tower Summit & Champagne",
                        "category": "Sightseeing",
                        "description": "Ascend to the top deck of the iron lady for breathtaking 360-degree panoramic views of Paris.",
                        "image": "https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?auto=format&fit=crop&w=800&q=80",
                        "duration_minutes": 150,
                        "estimated_cost": 45.0,
                        "rating": 4.9
                    },
                    {
                        "name": "Louvre Museum Masterpieces Tour",
                        "category": "Culture & History",
                        "description": "Explore the Mona Lisa, Venus de Milo, and centuries of world artistic treasures in the historic royal palace.",
                        "image": "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=800&q=80",
                        "duration_minutes": 210,
                        "estimated_cost": 25.0,
                        "rating": 4.8
                    },
                    {
                        "name": "Seine River Sunset Cruise",
                        "category": "Sightseeing",
                        "description": "Glaze past illuminated landmarks including Notre-Dame and the Orsay museum with live French audio narration.",
                        "image": "https://images.unsplash.com/photo-1509439581779-6298f75bf6e5?auto=format&fit=crop&w=800&q=80",
                        "duration_minutes": 75,
                        "estimated_cost": 22.0,
                        "rating": 4.7
                    },
                    {
                        "name": "Montmartre Pastry & Bakery Crawl",
                        "category": "Food & Dining",
                        "description": "Taste warm freshly-baked croissants, artisanal macarons, and gourmet cheeses in the historic hilltop village.",
                        "image": "https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=800&q=80",
                        "duration_minutes": 120,
                        "estimated_cost": 55.0,
                        "rating": 4.9
                    }
                ]
            },
            {
                "name": "London",
                "country": "United Kingdom",
                "region": "Europe",
                "cost_index": 4.4,
                "popularity": 4.8,
                "description": "A dynamic metropolis where deep royal history, vibrant theatre, diverse global food, and modern innovation meet.",
                "image": "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=1200&q=80",
                "activities": [
                    {
                        "name": "Tower of London & Crown Jewels",
                        "category": "Culture & History",
                        "description": "Discover centuries of royal intrigue, medieval armory, and the dazzling British Crown Jewels.",
                        "image": "https://images.unsplash.com/photo-1526129318478-62ed807ebdf9?auto=format&fit=crop&w=800&q=80",
                        "duration_minutes": 180,
                        "estimated_cost": 38.0,
                        "rating": 4.8
                    },
                    {
                        "name": "West End Musical Experience",
                        "category": "Entertainment",
                        "description": "Catch an unforgettable theatrical blockbuster in London's world-famous theatre district.",
                        "image": "https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?auto=format&fit=crop&w=800&q=80",
                        "duration_minutes": 160,
                        "estimated_cost": 75.0,
                        "rating": 4.9
                    },
                    {
                        "name": "Borough Market Street Food Safari",
                        "category": "Food & Dining",
                        "description": "Sample artisanal street food, gourmet cheeses, oysters, and British sausage rolls in London's premier market.",
                        "image": "https://images.unsplash.com/photo-1533900298318-6b8da08a523e?auto=format&fit=crop&w=800&q=80",
                        "duration_minutes": 120,
                        "estimated_cost": 35.0,
                        "rating": 4.7
                    },
                    {
                        "name": "London Eye Capsule Flight",
                        "category": "Sightseeing",
                        "description": "Enjoy unmatched skyline views over Big Ben, the Houses of Parliament, and the River Thames.",
                        "image": "https://images.unsplash.com/photo-1529655683826-aba9b3e77383?auto=format&fit=crop&w=800&q=80",
                        "duration_minutes": 45,
                        "estimated_cost": 36.0,
                        "rating": 4.6
                    }
                ]
            },
            {
                "name": "Amsterdam",
                "country": "Netherlands",
                "region": "Europe",
                "cost_index": 4.0,
                "popularity": 4.7,
                "description": "The picturesque Venice of the North, famous for its historic canals, bicycle culture, world-class museums, and gabled facades.",
                "image": "https://images.unsplash.com/photo-1512470876302-972faa2aa9a4?auto=format&fit=crop&w=1200&q=80",
                "activities": [
                    {
                        "name": "Van Gogh Museum Exhibition",
                        "category": "Culture & History",
                        "description": "The world's largest collection of paintings and drawings by Vincent van Gogh, including Sunflowers.",
                        "image": "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80",
                        "duration_minutes": 150,
                        "estimated_cost": 24.0,
                        "rating": 4.9
                    },
                    {
                        "name": "Canal Open-Boat Cruise with Dutch Cheese",
                        "category": "Sightseeing",
                        "description": "Glide along UNESCO canals while tasting local Gouda cheese and refreshing drinks.",
                        "image": "https://images.unsplash.com/photo-1534351590666-13e3e96b5017?auto=format&fit=crop&w=800&q=80",
                        "duration_minutes": 90,
                        "estimated_cost": 28.0,
                        "rating": 4.8
                    },
                    {
                        "name": "Jordaan District Guided Bike Tour",
                        "category": "Adventure & Outdoors",
                        "description": "Pedal through cozy cobblestone alleys, hidden courtyards, and scenic canal bridges like a local.",
                        "image": "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&w=800&q=80",
                        "duration_minutes": 180,
                        "estimated_cost": 32.0,
                        "rating": 4.7
                    },
                    {
                        "name": "Anne Frank House Historical Walk",
                        "category": "Culture & History",
                        "description": "A deeply moving journey into the secret annex and WWII history in the heart of Amsterdam.",
                        "image": "https://images.unsplash.com/photo-1576924933257-6d2531a823b3?auto=format&fit=crop&w=800&q=80",
                        "duration_minutes": 100,
                        "estimated_cost": 18.0,
                        "rating": 4.9
                    }
                ]
            },
            {
                "name": "Rome",
                "country": "Italy",
                "region": "Europe",
                "cost_index": 3.8,
                "popularity": 4.9,
                "description": "The Eternal City, an outdoor open-air museum filled with ancient gladiatorial ruins, baroque fountains, and legendary pasta.",
                "image": "https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=1200&q=80",
                "activities": [
                    {
                        "name": "Colosseum Arena & Roman Forum VIP Tour",
                        "category": "Culture & History",
                        "description": "Walk in the footsteps of Roman gladiators on the reconstructed arena floor and explore emperors' palaces.",
                        "image": "https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=800&q=80",
                        "duration_minutes": 180,
                        "estimated_cost": 42.0,
                        "rating": 4.9
                    },
                    {
                        "name": "Vatican Museums & Sistine Chapel",
                        "category": "Culture & History",
                        "description": "Marvel at Michelangelo's awe-inspiring ceiling frescoes and the stunning St. Peter's Basilica.",
                        "image": "https://images.unsplash.com/photo-1531572753322-ad063cecc140?auto=format&fit=crop&w=800&q=80",
                        "duration_minutes": 210,
                        "estimated_cost": 35.0,
                        "rating": 4.9
                    },
                    {
                        "name": "Trastevere Evening Food & Wine Tour",
                        "category": "Food & Dining",
                        "description": "Indulge in authentic Carbonara, Cacio e Pepe, fried artichokes, and Italian gelato in bohemian alleyways.",
                        "image": "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80",
                        "duration_minutes": 150,
                        "estimated_cost": 65.0,
                        "rating": 4.8
                    },
                    {
                        "name": "Trevi Fountain & Spanish Steps Night Stroll",
                        "category": "Sightseeing",
                        "description": "Toss a coin into the Trevi Fountain and experience Rome's illuminated marble piazzas after dark.",
                        "image": "https://images.unsplash.com/photo-1525874684015-58379d421a52?auto=format&fit=crop&w=800&q=80",
                        "duration_minutes": 90,
                        "estimated_cost": 0.0,
                        "rating": 4.7
                    }
                ]
            },
            {
                "name": "Barcelona",
                "country": "Spain",
                "region": "Europe",
                "cost_index": 3.6,
                "popularity": 4.8,
                "description": "Catalan jewel brimming with Antoni Gaudí's fantastical architecture, lively Mediterranean beaches, and tapas bars.",
                "image": "https://images.unsplash.com/photo-1583422409516-2895a77efded?auto=format&fit=crop&w=1200&q=80",
                "activities": [
                    {
                        "name": "Sagrada Família Fast-Track & Towers",
                        "category": "Sightseeing",
                        "description": "Gaze upon Gaudí's breathtaking masterpiece, featuring rainbow stained-glass forest columns.",
                        "image": "https://images.unsplash.com/photo-1583422409516-2895a77efded?auto=format&fit=crop&w=800&q=80",
                        "duration_minutes": 120,
                        "estimated_cost": 36.0,
                        "rating": 4.9
                    },
                    {
                        "name": "Park Güell Mosaic Wonderland",
                        "category": "Sightseeing",
                        "description": "Explore vibrant mosaic salamanders and panoramic coastline views over Barcelona.",
                        "image": "https://images.unsplash.com/photo-1539037116277-4db20889f2d4?auto=format&fit=crop&w=800&q=80",
                        "duration_minutes": 120,
                        "estimated_cost": 15.0,
                        "rating": 4.7
                    },
                    {
                        "name": "Gothic Quarter Tapas & Sangria Crawl",
                        "category": "Food & Dining",
                        "description": "Savor Iberico ham, Patatas Bravas, and artisan vermouth in medieval squares.",
                        "image": "https://images.unsplash.com/photo-1515443961218-a51367888e4b?auto=format&fit=crop&w=800&q=80",
                        "duration_minutes": 150,
                        "estimated_cost": 48.0,
                        "rating": 4.8
                    },
                    {
                        "name": "Barceloneta Beach Paddleboarding",
                        "category": "Adventure & Outdoors",
                        "description": "Catch Mediterranean morning waves and relax along the sunny palm-fringed promenade.",
                        "image": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80",
                        "duration_minutes": 90,
                        "estimated_cost": 30.0,
                        "rating": 4.6
                    }
                ]
            },
            {
                "name": "Dubai",
                "country": "United Arab Emirates",
                "region": "Middle East",
                "cost_index": 4.6,
                "popularity": 4.8,
                "description": "Futuristic skyline rising from Arabian sands, known for record-breaking architecture, luxury shopping, and desert safaris.",
                "image": "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1200&q=80",
                "activities": [
                    {
                        "name": "Burj Khalifa 148th Floor Sky Lounge",
                        "category": "Sightseeing",
                        "description": "Touch the sky at the world's tallest building with unmatched views across Dubai and the Persian Gulf.",
                        "image": "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=800&q=80",
                        "duration_minutes": 120,
                        "estimated_cost": 95.0,
                        "rating": 4.9
                    },
                    {
                        "name": "Red Dunes Desert Safari & BBQ Camp",
                        "category": "Adventure & Outdoors",
                        "description": "4x4 dune bashing, sandboarding, camel rides, and traditional Arabian dinner under starlit skies.",
                        "image": "https://images.unsplash.com/photo-1451337516015-6b6e9a44a8a3?auto=format&fit=crop&w=800&q=80",
                        "duration_minutes": 360,
                        "estimated_cost": 65.0,
                        "rating": 4.8
                    },
                    {
                        "name": "Dubai Marina Yacht Cruise",
                        "category": "Entertainment",
                        "description": "Cruise past high-rise luxury towers and the Palm Jumeirah on a scenic motor yacht.",
                        "image": "https://images.unsplash.com/photo-1580674684081-7617fbf3d745?auto=format&fit=crop&w=800&q=80",
                        "duration_minutes": 120,
                        "estimated_cost": 50.0,
                        "rating": 4.7
                    },
                    {
                        "name": "Old Dubai Gold & Spice Souk Walking Tour",
                        "category": "Shopping",
                        "description": "Cross Dubai Creek on an authentic Abra wooden boat and haggle for fragrant saffron and jewelry.",
                        "image": "https://images.unsplash.com/photo-1578895101407-742bc5ff8ee0?auto=format&fit=crop&w=800&q=80",
                        "duration_minutes": 150,
                        "estimated_cost": 20.0,
                        "rating": 4.6
                    }
                ]
            },
            {
                "name": "Tokyo",
                "country": "Japan",
                "region": "Asia",
                "cost_index": 4.2,
                "popularity": 4.9,
                "description": "An electrifying fusion of neon ultramodernity, ancient tranquil shrines, world-beating gastronomy, and anime culture.",
                "image": "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1200&q=80",
                "activities": [
                    {
                        "name": "teamLab Planets Immersive Digital Art",
                        "category": "Entertainment",
                        "description": "Walk through water and body-immersive digital flower gardens in Tokyo's sensational art installation.",
                        "image": "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=800&q=80",
                        "duration_minutes": 120,
                        "estimated_cost": 32.0,
                        "rating": 4.9
                    },
                    {
                        "name": "Shinjuku Omoide Yokocho Izakaya Tour",
                        "category": "Food & Dining",
                        "description": "Eat sizzling yakitori skewers and drink Japanese craft beer in lantern-lit alleyways.",
                        "image": "https://images.unsplash.com/photo-1554797589-7241ab374828?auto=format&fit=crop&w=800&q=80",
                        "duration_minutes": 150,
                        "estimated_cost": 60.0,
                        "rating": 4.8
                    },
                    {
                        "name": "Senso-ji Temple & Asakusa Traditional Walk",
                        "category": "Culture & History",
                        "description": "Tokyo's oldest Buddhist temple, entered through the giant red Kaminarimon Thunder Gate.",
                        "image": "https://images.unsplash.com/photo-1536098561742-ca998e48cbcc?auto=format&fit=crop&w=800&q=80",
                        "duration_minutes": 120,
                        "estimated_cost": 0.0,
                        "rating": 4.8
                    },
                    {
                        "name": "Shibuya Crossing & Akihabara Tech Safari",
                        "category": "Sightseeing",
                        "description": "Experience the world's busiest pedestrian scramble crossing and explore multi-story gadget havens.",
                        "image": "https://images.unsplash.com/photo-1542051841857-5f90071e7989?auto=format&fit=crop&w=800&q=80",
                        "duration_minutes": 180,
                        "estimated_cost": 15.0,
                        "rating": 4.7
                    }
                ]
            },
            {
                "name": "Singapore",
                "country": "Singapore",
                "region": "Asia",
                "cost_index": 4.3,
                "popularity": 4.8,
                "description": "The Garden City: a dazzling, immaculate island nation known for biodomes, futuristic supertrees, and legendary hawker feasts.",
                "image": "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=1200&q=80",
                "activities": [
                    {
                        "name": "Gardens by the Bay & Cloud Forest",
                        "category": "Sightseeing",
                        "description": "Marvel at misty indoor waterfalls and the futuristic Supertree Grove light & sound show.",
                        "image": "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=800&q=80",
                        "duration_minutes": 180,
                        "estimated_cost": 35.0,
                        "rating": 4.9
                    },
                    {
                        "name": "Marina Bay Sands SkyPark Observation Deck",
                        "category": "Sightseeing",
                        "description": "Stand 57 stories above ground for breathtaking views over the Singapore Strait and futuristic cityscape.",
                        "image": "https://images.unsplash.com/photo-1565967511849-76a60a516170?auto=format&fit=crop&w=800&q=80",
                        "duration_minutes": 90,
                        "estimated_cost": 26.0,
                        "rating": 4.7
                    },
                    {
                        "name": "Chinatown & Maxwell Hawker Feast",
                        "category": "Food & Dining",
                        "description": "Taste Michelin-awarded Hainanese chicken rice, char kway teow, and laksa noodle soup.",
                        "image": "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80",
                        "duration_minutes": 120,
                        "estimated_cost": 20.0,
                        "rating": 4.9
                    },
                    {
                        "name": "Night Safari Wildlife Tram Adventure",
                        "category": "Adventure & Outdoors",
                        "description": "The world's first nocturnal zoo: observe majestic Asian elephants and leopards active in dusk habitat.",
                        "image": "https://images.unsplash.com/photo-1534188753412-3e26d0d618d6?auto=format&fit=crop&w=800&q=80",
                        "duration_minutes": 180,
                        "estimated_cost": 42.0,
                        "rating": 4.8
                    }
                ]
            },
            {
                "name": "Bangkok",
                "country": "Thailand",
                "region": "Asia",
                "cost_index": 2.5,
                "popularity": 4.8,
                "description": "Thailand's pulsating capital with ornate gold temples, buzzing street food alleys, and lively Chao Phraya river life.",
                "image": "https://images.unsplash.com/photo-1508009603885-50cf7c579365?auto=format&fit=crop&w=1200&q=80",
                "activities": [
                    {
                        "name": "Grand Palace & Wat Phra Kaew Tour",
                        "category": "Culture & History",
                        "description": "Marvel at Thailand's most sacred Emerald Buddha temple and glittering Siamese royal architecture.",
                        "image": "https://images.unsplash.com/photo-1508009603885-50cf7c579365?auto=format&fit=crop&w=800&q=80",
                        "duration_minutes": 150,
                        "estimated_cost": 16.0,
                        "rating": 4.8
                    },
                    {
                        "name": "Damnoen Saduak Floating Market Boat Ride",
                        "category": "Shopping",
                        "description": "Paddle along lively canal waterways lined with long-tail boats selling fresh mango sticky rice and coconut pancakes.",
                        "image": "https://images.unsplash.com/photo-1563492065599-3520f775eeed?auto=format&fit=crop&w=800&q=80",
                        "duration_minutes": 240,
                        "estimated_cost": 28.0,
                        "rating": 4.7
                    },
                    {
                        "name": "Chinatown Yaowarat Midnight Food Walk",
                        "category": "Food & Dining",
                        "description": "Taste Michelin-approved pork noodles, grilled jumbo prawns, and piping hot dumplings in neon alleyways.",
                        "image": "https://images.unsplash.com/photo-1569154941061-e231b4725ef1?auto=format&fit=crop&w=800&q=80",
                        "duration_minutes": 120,
                        "estimated_cost": 18.0,
                        "rating": 4.9
                    },
                    {
                        "name": "Wat Arun (Temple of Dawn) Sunset View",
                        "category": "Sightseeing",
                        "description": "Admire the porcelain-encrusted spires of Wat Arun illuminated beautifully over the river.",
                        "image": "https://images.unsplash.com/photo-1528181304800-259b08848526?auto=format&fit=crop&w=800&q=80",
                        "duration_minutes": 90,
                        "estimated_cost": 5.0,
                        "rating": 4.7
                    }
                ]
            },
            {
                "name": "New York",
                "country": "United States",
                "region": "North America",
                "cost_index": 4.8,
                "popularity": 4.9,
                "description": "The Big Apple: towering glass skyscrapers, Broadway theatre, sprawling Central Park, and unyielding 24/7 urban energy.",
                "image": "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=1200&q=80",
                "activities": [
                    {
                        "name": "Statue of Liberty & Ellis Island Ferry",
                        "category": "Culture & History",
                        "description": "Cruise New York Harbor to stand beside Lady Liberty and uncover rich American immigrant history.",
                        "image": "https://images.unsplash.com/photo-1605130284535-11dd9eedc58a?auto=format&fit=crop&w=800&q=80",
                        "duration_minutes": 210,
                        "estimated_cost": 25.0,
                        "rating": 4.8
                    },
                    {
                        "name": "Summit One Vanderbilt Observation Experience",
                        "category": "Sightseeing",
                        "description": "Walk inside thrilling infinity-mirrored glass skyboxes above Grand Central with views of the Empire State.",
                        "image": "https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&w=800&q=80",
                        "duration_minutes": 120,
                        "estimated_cost": 46.0,
                        "rating": 4.9
                    },
                    {
                        "name": "Central Park Bicycle Loop & Strawberry Fields",
                        "category": "Adventure & Outdoors",
                        "description": "Rent a cruiser bike and glide through Bow Bridge, Bethesda Terrace, and the peaceful Ramble.",
                        "image": "https://images.unsplash.com/photo-1518391846015-55a9cc003b25?auto=format&fit=crop&w=800&q=80",
                        "duration_minutes": 150,
                        "estimated_cost": 20.0,
                        "rating": 4.7
                    },
                    {
                        "name": "Broadway Hit Musical Night",
                        "category": "Entertainment",
                        "description": "Experience the magic of Times Square and premier world theatrical performances.",
                        "image": "https://images.unsplash.com/photo-1514306191717-452ec28c7814?auto=format&fit=crop&w=800&q=80",
                        "duration_minutes": 160,
                        "estimated_cost": 110.0,
                        "rating": 4.9
                    }
                ]
            },
            {
                "name": "Mumbai",
                "country": "India",
                "region": "Asia",
                "cost_index": 2.6,
                "popularity": 4.7,
                "description": "The City of Dreams: India's financial powerhouse, Bollywood capital, Victorian Gothic architecture, and Marine Drive sunsets.",
                "image": "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=1200&q=80",
                "activities": [
                    {
                        "name": "Gateway of India & Elephanta Caves Cruise",
                        "category": "Culture & History",
                        "description": "Sail across Mumbai Harbour to explore rock-cut UNESCO cave temples dating back to the 5th century.",
                        "image": "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=800&q=80",
                        "duration_minutes": 240,
                        "estimated_cost": 15.0,
                        "rating": 4.8
                    },
                    {
                        "name": "Marine Drive 'Queen's Necklace' Evening Walk",
                        "category": "Sightseeing",
                        "description": "Stroll along the Arabian Sea promenade with cool ocean breezes and iconic city lights.",
                        "image": "https://images.unsplash.com/photo-1567157577867-05ccb1388e66?auto=format&fit=crop&w=800&q=80",
                        "duration_minutes": 90,
                        "estimated_cost": 0.0,
                        "rating": 4.8
                    },
                    {
                        "name": "Chowpatty Beach Vada Pav & Pav Bhaji Crawl",
                        "category": "Food & Dining",
                        "description": "Indulge in Mumbai's authentic spicy street food delicacies by the ocean.",
                        "image": "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=800&q=80",
                        "duration_minutes": 120,
                        "estimated_cost": 10.0,
                        "rating": 4.9
                    },
                    {
                        "name": "Bollywood Film Studio Behind-the-Scenes Tour",
                        "category": "Entertainment",
                        "description": "Visit active film sets, choreography soundstages, and special effects studios.",
                        "image": "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=800&q=80",
                        "duration_minutes": 180,
                        "estimated_cost": 35.0,
                        "rating": 4.6
                    }
                ]
            },
            {
                "name": "Delhi",
                "country": "India",
                "region": "Asia",
                "cost_index": 2.4,
                "popularity": 4.7,
                "description": "India's historic capital where majestic Mughal fortresses, spice markets, and grand British colonial avenues intertwine.",
                "image": "https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=1200&q=80",
                "activities": [
                    {
                        "name": "Red Fort & Chandni Chowk Rickshaw Ride",
                        "category": "Culture & History",
                        "description": "Ride through Old Delhi's labyrinthine spice bazaars and tour the massive Mughal red sandstone fortress.",
                        "image": "https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=800&q=80",
                        "duration_minutes": 180,
                        "estimated_cost": 12.0,
                        "rating": 4.8
                    },
                    {
                        "name": "Qutub Minar Complex Heritage Walk",
                        "category": "Culture & History",
                        "description": "Marvel at the world's tallest brick minaret and ancient Sanskrit iron pillar.",
                        "image": "https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=800&q=80",
                        "duration_minutes": 120,
                        "estimated_cost": 8.0,
                        "rating": 4.7
                    },
                    {
                        "name": "Paranthe Wali Gali Gourmet Food Trail",
                        "category": "Food & Dining",
                        "description": "Feast on deep-fried stuffed flatbreads, lassi, and jalebi sweets preserved across generations.",
                        "image": "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=800&q=80",
                        "duration_minutes": 120,
                        "estimated_cost": 9.0,
                        "rating": 4.8
                    },
                    {
                        "name": "Humayun's Tomb & Sunder Nursery Stroll",
                        "category": "Sightseeing",
                        "description": "Wander through Persian-style charbagh garden tombs that inspired the Taj Mahal.",
                        "image": "https://images.unsplash.com/photo-1597040663342-45b6af3d91a5?auto=format&fit=crop&w=800&q=80",
                        "duration_minutes": 120,
                        "estimated_cost": 10.0,
                        "rating": 4.8
                    }
                ]
            },
            {
                "name": "Goa",
                "country": "India",
                "region": "Asia",
                "cost_index": 2.2,
                "popularity": 4.8,
                "description": "Tropical paradise of golden sun-drenched beaches, Portuguese colonial churches, spice plantations, and vibrant beach shacks.",
                "image": "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1200&q=80",
                "activities": [
                    {
                        "name": "Scuba Diving & Watersports at Grand Island",
                        "category": "Adventure & Outdoors",
                        "description": "Dive into Arabian sea reefs, jet-ski, and spot playful dolphins along the coast.",
                        "image": "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80",
                        "duration_minutes": 240,
                        "estimated_cost": 40.0,
                        "rating": 4.8
                    },
                    {
                        "name": "Fontainhas Latin Quarter Heritage Walk",
                        "category": "Sightseeing",
                        "description": "Explore Panaji's colorful Portuguese villas, tiled balconies, and indie art cafes.",
                        "image": "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=800&q=80",
                        "duration_minutes": 120,
                        "estimated_cost": 8.0,
                        "rating": 4.7
                    },
                    {
                        "name": "Anjuna Sunset Beach Shack Seafood Dinner",
                        "category": "Food & Dining",
                        "description": "Relish butter garlic crab, Goan fish curry, and live acoustic music by the waves.",
                        "image": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80",
                        "duration_minutes": 150,
                        "estimated_cost": 22.0,
                        "rating": 4.9
                    },
                    {
                        "name": "Dudhsagar Waterfalls Jungle Safari",
                        "category": "Adventure & Outdoors",
                        "description": "Jeep ride through Bhagwan Mahavir sanctuary to the roaring 4-tiered white waterfall.",
                        "image": "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80",
                        "duration_minutes": 300,
                        "estimated_cost": 30.0,
                        "rating": 4.8
                    }
                ]
            },
            {
                "name": "Jaipur",
                "country": "India",
                "region": "Asia",
                "cost_index": 2.3,
                "popularity": 4.8,
                "description": "The Pink City of Rajasthan, famous for royal palaces, hill fortresses, block-print textiles, and regal hospitality.",
                "image": "https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=1200&q=80",
                "activities": [
                    {
                        "name": "Amer Fort & Sheesh Mahal Palace Tour",
                        "category": "Culture & History",
                        "description": "Explore the majestic hilltop fort with its dazzling mirror palace overlooking Maota Lake.",
                        "image": "https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=800&q=80",
                        "duration_minutes": 180,
                        "estimated_cost": 15.0,
                        "rating": 4.9
                    },
                    {
                        "name": "Hawa Mahal (Palace of Winds) Photo Session",
                        "category": "Sightseeing",
                        "description": "Admire the 953 honeycomb pink sandstone windows designed for royal Rajput women.",
                        "image": "https://images.unsplash.com/photo-1603262110263-fb010d6e85da?auto=format&fit=crop&w=800&q=80",
                        "duration_minutes": 90,
                        "estimated_cost": 6.0,
                        "rating": 4.8
                    },
                    {
                        "name": "Hot Air Balloon Flight over Forts & Hills",
                        "category": "Adventure & Outdoors",
                        "description": "Float peacefully at sunrise over the Aravalli hills and ancient Rajasthani palaces.",
                        "image": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80",
                        "duration_minutes": 120,
                        "estimated_cost": 120.0,
                        "rating": 4.9
                    },
                    {
                        "name": "Chokhi Dhani Cultural Village & Thali",
                        "category": "Entertainment",
                        "description": "Experience Rajasthani folk dances, fire shows, puppet acts, and an elaborate royal vegetarian feast.",
                        "image": "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80",
                        "duration_minutes": 210,
                        "estimated_cost": 20.0,
                        "rating": 4.8
                    }
                ]
            },
            {
                "name": "Ahmedabad",
                "country": "India",
                "region": "Asia",
                "cost_index": 2.0,
                "popularity": 4.6,
                "description": "India's first UNESCO World Heritage City, celebrated for its intricate stepwells, Sabarmati Ashram, and vibrant night food markets.",
                "image": "https://images.unsplash.com/photo-1598890777032-bde170bc18c7?auto=format&fit=crop&w=1200&q=80",
                "activities": [
                    {
                        "name": "Adalaj Stepwell Architectural Marvel",
                        "category": "Culture & History",
                        "description": "Descend five stories of breathtaking 15th-century Indo-Islamic carved stone craftsmanship.",
                        "image": "https://images.unsplash.com/photo-1598890777032-bde170bc18c7?auto=format&fit=crop&w=800&q=80",
                        "duration_minutes": 120,
                        "estimated_cost": 4.0,
                        "rating": 4.8
                    },
                    {
                        "name": "Sabarmati Gandhi Ashram & Peace Museum",
                        "category": "Culture & History",
                        "description": "Visit the peaceful riverside headquarters where Mahatma Gandhi led India's non-violent freedom movement.",
                        "image": "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80",
                        "duration_minutes": 90,
                        "estimated_cost": 0.0,
                        "rating": 4.9
                    },
                    {
                        "name": "Manek Chowk Midnight Street Food Safari",
                        "category": "Food & Dining",
                        "description": "Bustling jewelry market by day that transforms into an epic open-air food hub at night: Ghari, Gwalior Dosa & Kulfi.",
                        "image": "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80",
                        "duration_minutes": 120,
                        "estimated_cost": 8.0,
                        "rating": 4.8
                    },
                    {
                        "name": "Sabarmati Riverfront Promenade & Speedboat",
                        "category": "Sightseeing",
                        "description": "Enjoy evening breezes, botanical flower parks, and sunset speedboating along the developed river corridor.",
                        "image": "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=800&q=80",
                        "duration_minutes": 90,
                        "estimated_cost": 6.0,
                        "rating": 4.6
                    }
                ]
            }
        ]

        city_instances = {}
        for c_data in cities_data:
            acts = c_data.pop("activities")
            city = City(**c_data)
            db.session.add(city)
            db.session.flush()
            city_instances[city.name] = city

            for a_data in acts:
                act = Activity(city_id=city.id, **a_data)
                db.session.add(act)

        db.session.commit()
        print(f"✅ Created {len(cities_data)} world cities and {Activity.query.count()} activities.")

        # 3. Create Sample Trips for Demo User
        today = datetime.now(timezone.utc).date()

        # Trip 1: European Grand Adventure (Paris -> Amsterdam -> Rome)
        paris = city_instances["Paris"]
        amsterdam = city_instances["Amsterdam"]
        rome = city_instances["Rome"]

        t1_start = (today + timedelta(days=15)).isoformat()
        t1_end = (today + timedelta(days=24)).isoformat()

        trip1 = Trip(
            user_id=demo_user.id,
            name="Classic European Highlights 2026",
            description="A curated journey across Paris, Amsterdam, and Rome focusing on iconic sights, world-class art, and local gastronomy.",
            start_date=t1_start,
            end_date=t1_end,
            cover_image=paris.image
        )
        db.session.add(trip1)
        db.session.flush()

        # Stop 1: Paris (3 days)
        p_start = (today + timedelta(days=15)).isoformat()
        p_end = (today + timedelta(days=17)).isoformat()
        stop1 = TripStop(trip_id=trip1.id, city_id=paris.id, start_date=p_start, end_date=p_end, order_index=0)
        db.session.add(stop1)
        db.session.flush()

        paris_acts = Activity.query.filter_by(city_id=paris.id).all()
        if len(paris_acts) >= 3:
            db.session.add(ItineraryActivity(
                trip_stop_id=stop1.id,
                activity_id=paris_acts[0].id,
                activity_date=p_start,
                start_time="09:30",
                order_index=0,
                notes="Book elevator time slot early and head straight to top tier."
            ))
            db.session.add(ItineraryActivity(
                trip_stop_id=stop1.id,
                activity_id=paris_acts[1].id,
                activity_date=p_start,
                start_time="14:30",
                order_index=1,
                notes="Denon wing entrance for Mona Lisa."
            ))
            db.session.add(ItineraryActivity(
                trip_stop_id=stop1.id,
                activity_id=paris_acts[2].id,
                activity_date=(today + timedelta(days=16)).isoformat(),
                start_time="18:30",
                order_index=2,
                notes="Sunset cruise with wine."
            ))

        # Stop 2: Amsterdam (3 days)
        a_start = (today + timedelta(days=18)).isoformat()
        a_end = (today + timedelta(days=20)).isoformat()
        stop2 = TripStop(trip_id=trip1.id, city_id=amsterdam.id, start_date=a_start, end_date=a_end, order_index=1)
        db.session.add(stop2)
        db.session.flush()

        ams_acts = Activity.query.filter_by(city_id=amsterdam.id).all()
        if len(ams_acts) >= 2:
            db.session.add(ItineraryActivity(
                trip_stop_id=stop2.id,
                activity_id=ams_acts[0].id,
                activity_date=a_start,
                start_time="10:00",
                order_index=0,
                notes="Museumplein."
            ))
            db.session.add(ItineraryActivity(
                trip_stop_id=stop2.id,
                activity_id=ams_acts[1].id,
                activity_date=(today + timedelta(days=19)).isoformat(),
                start_time="16:00",
                order_index=1,
                notes="Canal boat tour."
            ))

        # Stop 3: Rome (4 days)
        r_start = (today + timedelta(days=21)).isoformat()
        r_end = (today + timedelta(days=24)).isoformat()
        stop3 = TripStop(trip_id=trip1.id, city_id=rome.id, start_date=r_start, end_date=r_end, order_index=2)
        db.session.add(stop3)
        db.session.flush()

        rome_acts = Activity.query.filter_by(city_id=rome.id).all()
        if len(rome_acts) >= 3:
            db.session.add(ItineraryActivity(
                trip_stop_id=stop3.id,
                activity_id=rome_acts[0].id,
                activity_date=r_start,
                start_time="09:00",
                order_index=0,
                notes="Colosseum morning access."
            ))
            db.session.add(ItineraryActivity(
                trip_stop_id=stop3.id,
                activity_id=rome_acts[2].id,
                activity_date=(today + timedelta(days=22)).isoformat(),
                start_time="19:00",
                order_index=1,
                notes="Trastevere pasta feast."
            ))

        # Add initial expenses for Trip 1
        db.session.add(Expense(trip_id=trip1.id, category="Transport", amount=320.0, expense_date=p_start, description="Eurostar Paris-Amsterdam & Flight to Rome"))
        db.session.add(Expense(trip_id=trip1.id, category="Accommodation", amount=650.0, expense_date=p_start, description="Boutique Hotels deposit"))

        # Create public share token for Trip 1
        share1 = SharedTrip(
            trip_id=trip1.id,
            share_token="euro-tour-2026-demo",
            is_public=True
        )
        db.session.add(share1)

        # Trip 2: Golden Triangle & Tropical Goa Escape
        delhi = city_instances["Delhi"]
        jaipur = city_instances["Jaipur"]
        goa = city_instances["Goa"]

        t2_start = (today + timedelta(days=40)).isoformat()
        t2_end = (today + timedelta(days=48)).isoformat()

        trip2 = Trip(
            user_id=demo_user.id,
            name="Rajasthan Forts & Goa Sunsets",
            description="A journey exploring royal Rajput palaces in Jaipur, heritage in Delhi, and winding down with beaches in Goa.",
            start_date=t2_start,
            end_date=t2_end,
            cover_image=jaipur.image
        )
        db.session.add(trip2)
        db.session.flush()

        s_delhi = TripStop(trip_id=trip2.id, city_id=delhi.id, start_date=t2_start, end_date=(today + timedelta(days=42)).isoformat(), order_index=0)
        s_jaipur = TripStop(trip_id=trip2.id, city_id=jaipur.id, start_date=(today + timedelta(days=43)).isoformat(), end_date=(today + timedelta(days=45)).isoformat(), order_index=1)
        s_goa = TripStop(trip_id=trip2.id, city_id=goa.id, start_date=(today + timedelta(days=46)).isoformat(), end_date=t2_end, order_index=2)
        db.session.add_all([s_delhi, s_jaipur, s_goa])
        db.session.flush()

        jaipur_acts = Activity.query.filter_by(city_id=jaipur.id).all()
        if jaipur_acts:
            db.session.add(ItineraryActivity(
                trip_stop_id=s_jaipur.id,
                activity_id=jaipur_acts[0].id,
                activity_date=s_jaipur.start_date,
                start_time="09:00",
                order_index=0,
                notes="Amer Fort morning views."
            ))

        goa_acts = Activity.query.filter_by(city_id=goa.id).all()
        if goa_acts:
            db.session.add(ItineraryActivity(
                trip_stop_id=s_goa.id,
                activity_id=goa_acts[0].id,
                activity_date=s_goa.start_date,
                start_time="10:00",
                order_index=0,
                notes="Grand Island scuba adventure."
            ))

        # Create public share token for Trip 2
        share2 = SharedTrip(
            trip_id=trip2.id,
            share_token="india-escape-2026-demo",
            is_public=True
        )
        db.session.add(share2)

        db.session.commit()
        print("✅ Demo user created: demo@globetrotter.com / Demo@123")
        print("✅ Seeded sample multi-city trips, day-wise itineraries, and share tokens.")
        print("🌟 Database seeding complete!")

if __name__ == '__main__':
    seed_database()
