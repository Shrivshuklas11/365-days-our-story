from flask import (
    Flask,
    render_template,
    send_from_directory,
    jsonify,
    abort
)

from pathlib import Path


# =========================================================
# 365 DAYS — OUR STORY
# FLASK BACKEND
# =========================================================

app = Flask(__name__)


# =========================================================
# PROJECT PATHS
# =========================================================

BASE_DIR = Path(__file__).resolve().parent

MEDIA_DIR = BASE_DIR / "media"
AUDIO_DIR = BASE_DIR / "static" / "audio"


# =========================================================
# SUPPORTED FILE TYPES
# =========================================================

PHOTO_EXTENSIONS = {
    ".jpg",
    ".jpeg",
    ".png",
    ".webp"
}


AUDIO_EXTENSIONS = {
    ".mp3",
    ".wav",
    ".ogg",
    ".m4a"
}


# =========================================================
# MONTH HELPERS
# =========================================================

def normalize_month(month_number):
    """
    Converts:
        1   -> 01
        01  -> 01
        12  -> 12

    Returns None for invalid months.
    """

    try:
        month = int(month_number)
    except (TypeError, ValueError):
        return None

    if month < 1 or month > 12:
        return None

    return f"{month:02d}"


def month_folder(month_number):
    """
    Returns the physical folder for a month.
    """

    month = normalize_month(month_number)

    if month is None:
        return None

    return MEDIA_DIR / f"month-{month}"


# =========================================================
# PHOTO DISCOVERY
# =========================================================

def get_month_photos(month_number):
    """
    Reads photos directly from:

        media/month-01/
        media/month-02/
        ...
        media/month-12/

    The folders are never modified.
    """

    folder = month_folder(month_number)

    if folder is None or not folder.exists():
        return []

    photos = []

    for file_path in folder.iterdir():

        if not file_path.is_file():
            continue

        if file_path.suffix.lower() not in PHOTO_EXTENSIONS:
            continue

        photos.append(file_path.name)

    # Natural-ish alphabetical ordering.
    # Your existing filenames remain untouched.
    photos.sort(key=lambda name: name.lower())

    return photos


# =========================================================
# ALL MONTH PHOTO DATA
# =========================================================

def get_all_photos():
    """
    Returns:

    {
        "01": [...],
        "02": [...],
        ...
        "12": [...]
    }
    """

    photos_by_month = {}

    for month in range(1, 13):

        month_number = f"{month:02d}"

        photos_by_month[month_number] = (
            get_month_photos(month_number)
        )

    return photos_by_month


# =========================================================
# AUDIO DISCOVERY
# =========================================================

def get_month_audio(month_number):
    """
    Finds the audio file for a month.

    Preferred naming:

        static/audio/month-01.mp3
        static/audio/month-02.mp3
        ...
        static/audio/month-12.mp3

    If MP3 is not present, supported alternatives
    are checked automatically.
    """

    month = normalize_month(month_number)

    if month is None:
        return None

    if not AUDIO_DIR.exists():
        return None

    preferred_names = [
        f"month-{month}.mp3",
        f"month-{month}.wav",
        f"month-{month}.ogg",
        f"month-{month}.m4a",
    ]

    for filename in preferred_names:

        audio_file = AUDIO_DIR / filename

        if audio_file.is_file():
            return filename

    return None


# =========================================================
# HOME
# =========================================================

@app.route("/")
def home():

    photos_by_month = get_all_photos()

    return render_template(
        "index.html",
        photos_by_month=photos_by_month
    )


# =========================================================
# PHOTO API
# =========================================================

@app.route("/api/photos/<month_number>")
def api_photos(month_number):

    month = normalize_month(month_number)

    if month is None:
        return jsonify({
            "success": False,
            "month": None,
            "photos": []
        }), 400

    photos = get_month_photos(month)

    return jsonify({
        "success": True,
        "month": month,
        "photos": photos,
        "count": len(photos)
    })


# =========================================================
# ALL PHOTOS API
# =========================================================

@app.route("/api/photos")
def api_all_photos():

    photos_by_month = get_all_photos()

    return jsonify({
        "success": True,
        "months": photos_by_month
    })


# =========================================================
# AUDIO API
# =========================================================

@app.route("/api/audio/<month_number>")
def api_audio(month_number):

    month = normalize_month(month_number)

    if month is None:
        return jsonify({
            "success": False,
            "month": None,
            "audio": None
        }), 400

    audio = get_month_audio(month)

    return jsonify({
        "success": True,
        "month": month,
        "audio": audio
    })


# =========================================================
# MEDIA FILE SERVER
# =========================================================

@app.route("/media/<path:filename>")
def media(filename):

    if not MEDIA_DIR.exists():
        abort(404)

    return send_from_directory(
        MEDIA_DIR,
        filename
    )


# =========================================================
# AUDIO FILE SERVER
# =========================================================

@app.route("/audio/<path:filename>")
def audio(filename):

    if not AUDIO_DIR.exists():
        abort(404)

    return send_from_directory(
        AUDIO_DIR,
        filename
    )


# =========================================================
# BASIC HEALTH CHECK
# =========================================================

@app.route("/api/health")
def health():

    return jsonify({
        "success": True,
        "project": "365 Days — Our Story",
        "months": 12,
        "media_folder_exists": MEDIA_DIR.exists(),
        "audio_folder_exists": AUDIO_DIR.exists()
    })


# =========================================================
# ERROR HANDLERS
# =========================================================

@app.errorhandler(404)
def page_not_found(error):

    return jsonify({
        "success": False,
        "error": "Not found"
    }), 404


# =========================================================
# RUN
# =========================================================

if __name__ == "__main__":

    print()
    print("=" * 60)
    print("365 DAYS — OUR STORY")
    print("=" * 60)
    print(f"Project : {BASE_DIR}")
    print(f"Media   : {MEDIA_DIR}")
    print(f"Audio   : {AUDIO_DIR}")
    print("=" * 60)
    print()

    app.run(
        host="127.0.0.1",
        port=5000,
        debug=True
    )