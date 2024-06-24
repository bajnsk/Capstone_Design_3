import base64
from flask import Flask, request, jsonify, send_from_directory, after_this_request
from flask_cors import CORS
from werkzeug.utils import secure_filename
import os
import easyocr
from translater import Model
from image_proc import ImageProcessor
from PIL import Image, ImageDraw
import io
import numpy as np
import pdfplumber
import ssl

ssl._create_default_https_context = ssl._create_unverified_context

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "gif", "pdf"}

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
UPLOAD_FOLDER = os.path.join(BASE_DIR, "Upload")
SAVE_FOLDER = os.path.join(BASE_DIR, "static")
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER
app.config["SAVE_FOLDER"] = SAVE_FOLDER

model = Model(model_name="facebook/nllb-200-distilled-600M")
image_processor = ImageProcessor()

def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS

def extract_texts_from_pdf(pdf_path):
    page_texts = []
    with pdfplumber.open(pdf_path) as pdf:
        for page in pdf.pages:
            text = page.extract_text() or ""
            page_texts.append(text)
    return page_texts

def ocr_core(image):
    reader = easyocr.Reader(["ko", "en"])
    results = reader.readtext(image)
    ocr_results = [
        {
            "text": result[1],
            "confidence": float(result[2]),
            "box": [[int(point[0]), int(point[1])] for point in result[0]],
        }
        for result in results
    ]
    return ocr_results

@app.route("/upload", methods=["POST"])
def file_upload():
    data = request.get_json()
    if not data or 'image' not in data:
        return jsonify({"error": "No image data"}), 400

    image_data = data['image'].split(",")[1]  # Base64 데이터 부분만 추출
    image = Image.open(io.BytesIO(base64.b64decode(image_data)))

    # PIL 이미지를 numpy array로 변환
    image_np = np.array(image)

    ocr_result = ocr_core(image_np)

    return jsonify(
        {"message": "File successfully uploaded", "ocr_result": ocr_result}
    )

@app.route("/pdf_translate", methods=["POST"])
def pdf_translate():
    if "file" not in request.files:
        return jsonify({"error": "No file part"}), 400

    file = request.files["file"]
    if file.filename == "":
        return jsonify({"error": "No selected file"}), 400

    if file and file.filename.lower().endswith(".pdf"):
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config["UPLOAD_FOLDER"], filename)
        file.save(filepath)

        page_texts = extract_texts_from_pdf(filepath)

        page_translations = []
        for text in page_texts:
            sentences = image_processor.sentence_split(text)
            translations = [model.gen(sentence) for sentence in sentences]
            page_translations.append(" ".join(translations))

        return jsonify(
            {"original_texts": page_texts, "translated_texts": page_translations}
        )
    else:
        return jsonify({"error": "Invalid file type"}), 400

@app.route("/image_translate", methods=["POST"])
def image_translate():
    data = request.get_json()
    if not data or 'image' not in data:
        return jsonify({"error": "No image data"}), 400

    image_data = data['image'].split(",")[1]  # Base64 데이터 부분만 추출
    image = Image.open(io.BytesIO(base64.b64decode(image_data)))

    # PIL 이미지를 numpy array로 변환
    image_np = np.array(image)

    ocr_text = image_processor.run_ocr(image_np)
    combined_text = image_processor.combine_text(ocr_text)
    sentences = image_processor.sentence_split(combined_text)
    translations = [model.gen(sentence) for sentence in sentences]

    out_img = ImageDraw.Draw(image)
    for arrays, text, prob in ocr_text:
        translated_text = model.gen(text)
        image_processor.paste_text(out_img, arrays, translated_text)

    save_file_name = f"translated_image.png"
    save_filepath = os.path.join(app.config["SAVE_FOLDER"], save_file_name)
    image.save(save_filepath)

    return jsonify({
        "original_text": combined_text,
        "translated_text": translations,
        "translated_image": save_file_name
    })

@app.route('/static/<path:filename>')
def serve_static(filename):
    @after_this_request
    def add_cors_headers(response):
        response.headers.add("Access-Control-Allow-Origin", "*")
        response.headers.add("Access-Control-Allow-Headers", "Content-Type,Authorization")
        response.headers.add("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,OPTIONS")
        return response

    return send_from_directory(app.config["SAVE_FOLDER"], filename)


if __name__ == "__main__":
    app.run(debug=True, port=5000)
