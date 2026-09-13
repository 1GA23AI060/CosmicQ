import sqlite3
import os
import requests
import datetime
import threading
import time
from typing import Dict, List, Any, Optional

DB_PATH = os.path.join(os.path.dirname(__file__), "data", "astronomy.db")

def get_db_connection():
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS astronomy_updates (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            description TEXT NOT NULL,
            category TEXT NOT NULL CHECK(category IN ('mission', 'discovery', 'event', 'launch')),
            image_url TEXT,
            source_name TEXT NOT NULL,
            source_url TEXT UNIQUE,
            event_date TEXT,
            published_date TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    """)
    try:
        cursor.execute("ALTER TABLE astronomy_updates ADD COLUMN published_date TEXT")
    except Exception:
        pass
    conn.commit()
    conn.close()

def seed_verified_astronomy_data():
    """Seed high-authority, curated astronomy data from verified space agency sources."""
    initial_updates = [
        # 🚀 1. Space Missions
        {
            "title": "Voyager 1 & 2 Interstellar Mission",
            "description": "Voyager 1 and Voyager 2 are NASA's twin spacecraft currently exploring interstellar space beyond the heliosphere. Voyager 1 is over 24 billion kilometers (160+ AU) from Earth, making it the most distant human-made object. Both spacecraft continue to return scientific data regarding interstellar magnetic fields, cosmic rays, and plasma density in deep space.",
            "category": "mission",
            "image_url": "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80",
            "source_name": "NASA Jet Propulsion Laboratory (JPL)",
            "source_url": "https://voyager.jpl.nasa.gov/",
            "event_date": "Active Interstellar Mission",
            "published_date": datetime.date.today().isoformat()
        },
        {
            "title": "James Webb Space Telescope (JWST) Deep Field Observations",
            "description": "Operating at the Sun-Earth Lagrange Point 2 (L2), the James Webb Space Telescope uses its Near-Infrared Camera (NIRCam) and Mid-Infrared Instrument (MIRI) to observe the earliest cosmological epochs, unravelling cosmic dawn, high-redshift galaxy formation, and detailed atmospheric spectroscopy of transiting exoplanets.",
            "category": "mission",
            "image_url": "https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?auto=format&fit=crop&w=800&q=80",
            "source_name": "NASA / ESA / CSA",
            "source_url": "https://webb.nasa.gov/",
            "event_date": "Active Primary Science Operations",
            "published_date": datetime.date.today().isoformat()
        },
        {
            "title": "Europa Clipper Mission to Jupiter's Ocean Moon",
            "description": "NASA's Europa Clipper spacecraft is on trajectory to the Jovian system to investigate whether Europa's vast subsurface liquid water ocean possesses conditions suitable for life. The spacecraft carries ice-penetrating radar (REASON), high-resolution cameras, and thermal imagers to study Europa's icy shell and composition.",
            "category": "mission",
            "image_url": "https://images.unsplash.com/photo-1614314107768-6018061b5b72?auto=format&fit=crop&w=800&q=80",
            "source_name": "NASA JPL",
            "source_url": "https://europa.nasa.gov/",
            "event_date": "En Route to Jupiter",
            "published_date": datetime.date.today().isoformat()
        },
        {
            "title": "Artemis Lunar Exploration Program",
            "description": "NASA's Artemis program aims to land astronauts, including the first woman and first person of color, on the lunar South Pole. Artemis establishes sustainable lunar infrastructure, including the Lunar Gateway orbital station, leading to long-term deep space science and future human Mars missions.",
            "category": "mission",
            "image_url": "https://images.unsplash.com/photo-1541185933-ef5d8ed016c2?auto=format&fit=crop&w=800&q=80",
            "source_name": "NASA",
            "source_url": "https://www.nasa.gov/artemis",
            "event_date": "Active Program",
            "published_date": (datetime.date.today() - datetime.timedelta(days=1)).isoformat()
        },

        # 🔭 2. Recent Discoveries
        {
            "title": "Spectroscopic Confirmation of Ultra-High Redshift Galaxies (z > 14)",
            "description": "Astronomers utilizing JWST infrared spectroscopy have confirmed luminous galaxies formed less than 300 million years after the Big Bang. These massive early galaxies challenge classical cosmological hierarchical collapse models and suggest unexpectedly rapid early star formation.",
            "category": "discovery",
            "image_url": "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&w=800&q=80",
            "source_name": "Nature Astronomy",
            "source_url": "https://www.nature.com/natastron/",
            "event_date": "Recent Breakthrough",
            "published_date": datetime.date.today().isoformat()
        },
        {
            "title": "Direct Detection of Water Vapor & Carbon Dioxide in Habitable Exoplanet Atmospheres",
            "description": "High-precision transmission spectroscopy of habitable-zone sub-Neptune exoplanet K2-18b has detected abundant methane (CH4) and carbon dioxide (CO2) alongside low ammonia, pointing towards a hydrogen-rich atmosphere overlying a water ocean (Hycean world candidate).",
            "category": "discovery",
            "image_url": "https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=800&q=80",
            "source_name": "NASA Exoplanet Science Institute",
            "source_url": "https://exoplanets.nasa.gov/",
            "event_date": "Confirmed Detection",
            "published_date": datetime.date.today().isoformat()
        },
        {
            "title": "Ordered Magnetic Fields Mapped Around Sagittarius A* Supermassive Black Hole",
            "description": "The Event Horizon Telescope (EHT) collaboration produced polarized synchrotron light images around Sagittarius A*, the supermassive black hole at the center of the Milky Way, proving strong ordered magnetic fields geometrically similar to the M87* supermassive black hole.",
            "category": "discovery",
            "image_url": "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80",
            "source_name": "Event Horizon Telescope Collaboration",
            "source_url": "https://eventhorizontelescope.org/",
            "event_date": "Astrophysical Discovery",
            "published_date": (datetime.date.today() - datetime.timedelta(days=1)).isoformat()
        },
        {
            "title": "Low-Frequency Gravitational Wave Background Measured by Pulsar Timing Arrays",
            "description": "The NANOGrav collaboration and International Pulsar Timing Array (IPTA) have identified spatial correlated timing perturbations in millisecond pulsars, providing decisive evidence for a cosmic background of nanohertz gravitational waves from binary supermassive black hole systems.",
            "category": "discovery",
            "image_url": "https://images.unsplash.com/photo-1502134249126-9f3755a50d78?auto=format&fit=crop&w=800&q=80",
            "source_name": "The Astrophysical Journal Letters / NANOGrav",
            "source_url": "https://nanograv.org/",
            "event_date": "Confirmed Observation",
            "published_date": (datetime.date.today() - datetime.timedelta(days=2)).isoformat()
        },

        # 🌠 3. Astronomical Events
        {
            "title": "Perseid Meteor Shower Zenithal Hourly Rate Peak",
            "description": "Produced as Earth sweeps through debris left by periodic Comet 109P/Swift-Tuttle, the Perseids produce fast, bright meteor fireballs radiating from the constellation Perseus, reaching visual zenithal rates of 60-100 meteors per hour under clear, dark skies.",
            "category": "event",
            "image_url": "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=800&q=80",
            "source_name": "International Meteor Organization",
            "source_url": "https://www.imo.net/",
            "event_date": "Annual Peak Window",
            "published_date": datetime.date.today().isoformat()
        },
        {
            "title": "Great Planetary Conjunction & Appulse in Dawn Sky",
            "description": "A close visual angular conjunction occurring when Mars and Jupiter share the same right ascension, appearing separated by less than a quarter of a degree in the eastern dawn sky before sunrise.",
            "category": "event",
            "image_url": "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=800&q=80",
            "source_name": "Sky & Telescope",
            "source_url": "https://skyandtelescope.org/",
            "event_date": "Upcoming Conjunction",
            "published_date": datetime.date.today().isoformat()
        },
        {
            "title": "Geminid Meteor Shower Multi-Colored Fireball Display",
            "description": "Unlike most meteor showers stemming from comets, the Geminids originate from asteroid 3200 Phaethon, producing dense rocky meteoroids that illuminate the winter sky with distinct white, yellow, and green fireballs.",
            "category": "event",
            "image_url": "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?auto=format&fit=crop&w=800&q=80",
            "source_name": "Royal Astronomical Society",
            "source_url": "https://ras.ac.uk/",
            "event_date": "Mid-December Maximum",
            "published_date": (datetime.date.today() - datetime.timedelta(days=1)).isoformat()
        },
        {
            "title": "Perigee Supermoon & Penumbral Eclipse Geometry",
            "description": "Full moon occurring within 90% of its perigee (closest approach to Earth in its elliptical orbit), appearing up to 14% larger and 30% brighter than an apogee micro-moon.",
            "category": "event",
            "image_url": "https://images.unsplash.com/photo-1532693322450-2cb5c511067d?auto=format&fit=crop&w=800&q=80",
            "source_name": "NASA Eclipse Bulletin",
            "source_url": "https://eclipse.gsfc.nasa.gov/",
            "event_date": "Upcoming Celestial Event",
            "published_date": (datetime.date.today() - datetime.timedelta(days=2)).isoformat()
        },

        # 🛰️ 4. Space Launches
        {
            "title": "SpaceX Starship Super Heavy Full Reusability Test",
            "description": "Orbital flight test of the 120-meter integrated Starship launch system from Starbase, Texas, demonstrating Super Heavy booster tower catch (Mechazilla) and orbital propellant transfer demonstrations.",
            "category": "launch",
            "image_url": "https://images.unsplash.com/photo-1517976487588-466f272a8c7b?auto=format&fit=crop&w=800&q=80",
            "source_name": "SpaceX Launch Operations",
            "source_url": "https://www.spacex.com/launches/",
            "event_date": "Scheduled Flight Window",
            "published_date": datetime.date.today().isoformat()
        },
        {
            "title": "ESA Ariane 6 Heavy-Lift Space Science Missions",
            "description": "European Space Agency's modular Ariane 6 launch vehicle operating from Kourou, French Guiana, deploying scientific payloads and Earth observation satellites into geostationary and Sun-synchronous orbits.",
            "category": "launch",
            "image_url": "https://images.unsplash.com/photo-1516849841032-87cbac4d88f7?auto=format&fit=crop&w=800&q=80",
            "source_name": "European Space Agency (ESA)",
            "source_url": "https://www.esa.int/Enabling_Support/Space_Transportation/Ariane_6",
            "event_date": "Scheduled Launch",
            "published_date": datetime.date.today().isoformat()
        },
        {
            "title": "ISRO Gaganyaan Human Spaceflight Mission",
            "description": "Indian Space Research Organisation (ISRO) mission to demonstrate indigenous human spaceflight capability, deploying a crew module to a 400 km low Earth orbit with safe splashdown in the Arabian Sea.",
            "category": "launch",
            "image_url": "https://images.unsplash.com/photo-1518364538800-6bae3c2ea0f2?auto=format&fit=crop&w=800&q=80",
            "source_name": "ISRO",
            "source_url": "https://www.isro.gov.in/Gaganyaan.html",
            "event_date": "Upcoming Orbital Flight",
            "published_date": (datetime.date.today() - datetime.timedelta(days=1)).isoformat()
        },
        {
            "title": "NASA Lunar Gateway Station Foundational Module Launch",
            "description": "Falcon Heavy launch of the Power and Propulsion Element (PPE) and Habitation and Logistics Outpost (HALO) for the lunar orbital space station Gateway.",
            "category": "launch",
            "image_url": "https://images.unsplash.com/photo-1541185933-ef5d8ed016c2?auto=format&fit=crop&w=800&q=80",
            "source_name": "NASA Kennedy Space Center",
            "source_url": "https://www.nasa.gov/mission/gateway/",
            "event_date": "Upcoming Mission Flight",
            "published_date": (datetime.date.today() - datetime.timedelta(days=2)).isoformat()
        }
    ]

    conn = get_db_connection()
    cursor = conn.cursor()

    for item in initial_updates:
        cursor.execute("""
            INSERT INTO astronomy_updates (title, description, category, image_url, source_name, source_url, event_date, published_date)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(source_url) DO UPDATE SET
                title=excluded.title,
                description=excluded.description,
                image_url=excluded.image_url,
                source_name=excluded.source_name,
                event_date=excluded.event_date,
                published_date=COALESCE(astronomy_updates.published_date, excluded.published_date),
                updated_at=CURRENT_TIMESTAMP;
        """, (
            item["title"],
            item["description"],
            item["category"],
            item.get("image_url"),
            item["source_name"],
            item["source_url"],
            item.get("event_date"),
            item.get("published_date"),
        ))

    conn.commit()
    conn.close()
    print(f"🌌 Seeded {len(initial_updates)} Astronomy Recently updates into SQLite database.")

def fetch_daily_astronomy_updates() -> int:
    """
    Automatic ingestion pipeline:
    1. Fetch live articles from Spaceflight News API (SNAPI v4) and NASA sources.
    2. Clean and normalize data.
    3. Check for duplicates (by source_url).
    4. Categorize appropriately.
    5. Insert new records while preserving historical days.
    """
    init_db()
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT COUNT(*) as count FROM astronomy_updates")
    if cursor.fetchone()["count"] == 0:
        seed_verified_astronomy_data()

    added_count = 0

    # 1. Fetch from Spaceflight News API (SNAPI v4)
    try:
        url = "https://api.spaceflightnewsapi.net/v4/articles/?limit=15"
        res = requests.get(url, timeout=7)
        if res.status_code == 200:
            articles = res.json().get("results", [])
            for art in articles:
                title = art.get("title", "").strip()
                summary = art.get("summary", "").strip()
                source_url = art.get("url", "").strip()
                image_url = art.get("image_url", "").strip()
                news_site = art.get("news_site", "Spaceflight News").strip()
                published_at = art.get("published_at", "")

                if not title or not source_url:
                    continue

                # Category classification
                text_corpus = (title + " " + summary).lower()
                if any(k in text_corpus for k in ["launch", "rocket", "liftoff", "booster", "propulsion"]):
                    category = "launch"
                elif any(k in text_corpus for k in ["telescope", "galaxy", "black hole", "exoplanet", "discover", "nebula", "star", "physics", "spectrum"]):
                    category = "discovery"
                elif any(k in text_corpus for k in ["mission", "rover", "spacecraft", "station", "iss", "gateway", "voyager", "artemis", "clipper"]):
                    category = "mission"
                else:
                    category = "event"

                event_date = "Recent Update"
                published_date = datetime.date.today().isoformat()
                if published_at:
                    try:
                        dt = datetime.datetime.fromisoformat(published_at.replace("Z", "+00:00"))
                        event_date = dt.strftime("%b %d, %Y")
                        published_date = dt.date().isoformat()
                    except Exception:
                        pass

                cursor.execute("""
                    INSERT INTO astronomy_updates (title, description, category, image_url, source_name, source_url, event_date, published_date)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                    ON CONFLICT(source_url) DO UPDATE SET
                        title=excluded.title,
                        description=excluded.description,
                        image_url=COALESCE(excluded.image_url, astronomy_updates.image_url),
                        updated_at=CURRENT_TIMESTAMP;
                """, (title, summary, category, image_url, news_site, source_url, event_date, published_date))
                added_count += 1
    except Exception as e:
        print(f"ℹ️ Live API sync notice: {e}")

    # 2. Fetch NASA APOD (Astronomy Picture of the Day) via Open NASA API
    try:
        apod_res = requests.get("https://api.nasa.gov/planetary/apod?api_key=DEMO_KEY", timeout=6)
        if apod_res.status_code == 200:
            apod_data = apod_res.json()
            apod_title = apod_data.get("title", "").strip()
            apod_desc = apod_data.get("explanation", "").strip()
            apod_url = apod_data.get("hdurl") or apod_data.get("url", "")
            apod_date = apod_data.get("date", datetime.date.today().isoformat())
            apod_source = "NASA Astronomy Picture of the Day (APOD)"
            apod_link = f"https://apod.nasa.gov/apod/ap{apod_date.replace('-', '')[2:]}.html"

            if apod_title and apod_desc:
                cursor.execute("""
                    INSERT INTO astronomy_updates (title, description, category, image_url, source_name, source_url, event_date, published_date)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                    ON CONFLICT(source_url) DO UPDATE SET
                        title=excluded.title,
                        description=excluded.description,
                        image_url=COALESCE(excluded.image_url, astronomy_updates.image_url),
                        updated_at=CURRENT_TIMESTAMP;
                """, (
                    f"NASA APOD: {apod_title}",
                    apod_desc,
                    "discovery",
                    apod_url,
                    apod_source,
                    apod_link,
                    apod_date,
                    apod_date
                ))
                added_count += 1
    except Exception as e:
        print(f"ℹ️ APOD sync notice: {e}")

    conn.commit()
    conn.close()
    print(f"📡 Ingestion pipeline finished. Processed {added_count} astronomy items.")
    return added_count

def get_all_astronomy_records() -> List[Dict[str, Any]]:
    """Retrieve all astronomy updates for vector embedding indexation."""
    init_db()
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT id, title, description, category, image_url, source_name, source_url, event_date, published_date
        FROM astronomy_updates
        ORDER BY id DESC
    """)
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]

def get_grouped_astronomy_today() -> Dict[str, List[Dict[str, Any]]]:
    """Retrieve all astronomy updates categorized into missions, discoveries, events, and launches."""
    init_db()
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT COUNT(*) as count FROM astronomy_updates")
    if cursor.fetchone()["count"] == 0:
        seed_verified_astronomy_data()

    cursor.execute("""
        SELECT id, title, description, category, image_url, source_name, source_url, event_date, published_date, created_at, updated_at
        FROM astronomy_updates
        ORDER BY id DESC
    """)
    rows = cursor.fetchall()
    conn.close()

    result: Dict[str, List[Dict[str, Any]]] = {
        "missions": [],
        "discoveries": [],
        "events": [],
        "launches": [],
    }

    category_map = {
        "mission": "missions",
        "discovery": "discoveries",
        "event": "events",
        "launch": "launches",
    }

    for row in rows:
        item = {
            "id": row["id"],
            "title": row["title"],
            "description": row["description"],
            "category": row["category"],
            "image_url": row["image_url"],
            "source_name": row["source_name"],
            "source_url": row["source_url"],
            "event_date": row["event_date"],
            "published_date": row["published_date"],
            "created_at": row["created_at"],
            "updated_at": row["updated_at"],
        }
        target_group = category_map.get(row["category"], "events")
        result[target_group].append(item)

    return result

# Scheduled background updater thread
def _background_update_loop():
    while True:
        try:
            time.sleep(3600)  # Check every hour
            fetch_daily_astronomy_updates()
        except Exception as e:
            print(f"⚠️ Ingestion thread error: {e}")

def start_background_updater():
    t = threading.Thread(target=_background_update_loop, daemon=True)
    t.start()
    print("⏱️ Automated Astronomy Ingestion background updater started.")

if __name__ == "__main__":
    init_db()
    seed_verified_astronomy_data()
    fetch_daily_astronomy_updates()
    data = get_grouped_astronomy_today()
    print({k: len(v) for k, v in data.items()})
