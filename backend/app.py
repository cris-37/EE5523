from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import os
import json
from datetime import datetime

UPLOAD_FOLDER = 'uploads'
METADATA_FILE = 'metadata.json'

app = Flask(__name__)
CORS(app)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Ensure the uploads directory exists
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Load metadata if it exists
if os.path.exists(METADATA_FILE):
    with open(METADATA_FILE, 'r') as f:
        FILE_METADATA = json.load(f)
else:
    FILE_METADATA = {}

@app.route("/")
def home():
    return jsonify({"message": "Welcome to the Flask backend!"})

@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files or 'position' not in request.form:
        return jsonify({'error': 'File and position are required'}), 400
    file = request.files['file']
    position = request.form['position']

    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    if file:
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], file.filename)
        file.save(filepath)

        # Save metadata
        FILE_METADATA[file.filename] = {
            'position': position,
            'upload_date': datetime.now().strftime('%m/%d/%Y')
        }

        # Write metadata to file
        with open(METADATA_FILE, 'w') as f:
            json.dump(FILE_METADATA, f)

        return jsonify({'message': 'File uploaded successfully', 'filename': file.filename}), 200

@app.route('/files', methods=['GET'])
def get_files():
    # Prepare the file list with metadata
    files = [
        {'name': name, 'metadata': metadata}
        for name, metadata in FILE_METADATA.items()
    ]
    return jsonify(files)

@app.route('/file-stats/<filename>', methods=['GET'])
def file_stats(filename):
    if filename in FILE_METADATA:
        return jsonify(FILE_METADATA[filename])
    return jsonify({'error': 'File not found'}), 404

@app.route('/download/<filename>', methods=['GET'])
def download_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0')