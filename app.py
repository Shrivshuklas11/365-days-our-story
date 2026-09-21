from flask import Flask, render_template, send_from_directory, jsonify
import os

app = Flask(__name__)

PHOTO_EXTENSIONS = (".jpg", ".jpeg", ".png", ".webp")
AUDIO_EXTENSIONS = (".mp3", ".wav", ".ogg", ".m4a")


def get_month_photos(month_number):
    month_path = os.path.join(
        app.root_path,
        "media",
        f"month-{month_number}"
    )

    photos = []

    if os.path.exists(month_path):
        for file in os.listdir(month_path):
            if file.lower().endswith(PHOTO_EXTENSIONS):
                photos.append(file)

    photos.sort()
    return photos


@app.route("/")
def home():
    photos_by_month = {}

    for month in range(1, 13):
        month_number = f"{month:02d}"
        photos_by_month[month_number] = get_month_photos(month_number)

    return render_template(
        "index.html",
        photos_by_month=photos_by_month
    )


@app.route("/api/photos/<month_number>")
def api_photos(month_number):
    if not month_number.isdigit():
        return jsonify({"photos": []}), 400

    month = int(month_number)

    if month < 1 or month > 12:
        return jsonify({"photos": []}), 404

    month_number = f"{month:02d}"

    return jsonify({
        "month": month_number,
        "photos": get_month_photos(month_number)
    })


@app.route("/media/<path:filename>")
def media(filename):
    return send_from_directory(
        os.path.join(app.root_path, "media"),
        filename
    )


@app.route("/audio/<path:filename>")
def audio(filename):
    return send_from_directory(
        os.path.join(app.root_path, "static", "audio"),
        filename
    )


@app.route("/api/audio/<month_number>")
def api_audio(month_number):
    if not month_number.isdigit():
        return jsonify({"audio": None}), 400

    month = int(month_number)

    if month < 1 or month > 12:
        return jsonify({"audio": None}), 404

    filename = f"month-{month:02d}.mp3"
    audio_path = os.path.join(
        app.root_path,
        "static",
        "audio",
        filename
    )

    return jsonify({
        "month": f"{month:02d}",
        "audio": filename if os.path.exists(audio_path) else None
    })


@app.route("/api/audio-playlist/<month_number>")
def api_audio_playlist(month_number):
    if not month_number.isdigit():
        return jsonify({"files": []}), 400

    month = int(month_number)
    if month < 1 or month > 12:
        return jsonify({"files": []}), 404

    mm = f"{month:02d}"
    audio_dir = os.path.join(app.root_path, "static", "audio")
    files = []

    if os.path.exists(audio_dir):
        import re
        pattern = re.compile(
            rf"^month-{mm}(?:[-_]([0-9]+))?\.(mp3|wav|ogg|m4a)$",
            re.IGNORECASE
        )
        for filename in os.listdir(audio_dir):
            match = pattern.match(filename)
            if match:
                order = int(match.group(1) or 0)
                files.append((order, filename))

    files.sort(key=lambda item: (item[0], item[1].lower()))

    return jsonify({
        "month": mm,
        "files": [f"/audio/{filename}" for _, filename in files]
    })


if __name__ == "__main__":
    app.run(debug=True)
