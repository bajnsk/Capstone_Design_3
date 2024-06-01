# app.py
from flask import Flask, request
from flask_cors import CORS
from werkzeug.utils import secure_filename
import os
from flask import jsonify
import easyocr
from translater import Model
from image_proc import ImageProcessor
from flask import send_from_directory
from PIL import Image, ImageFont, ImageDraw
import pdfplumber
import ssl
ssl._create_default_https_context = ssl._create_unverified_context

app = Flask(__name__)
# CORS 설정
CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}})

# 확장자 정의
ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "gif", "pdf"}

# 이미지 업로드 경로 설정
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

UPLOAD_FOLDER = os.path.join(BASE_DIR, "Upload")
SAVE_FOLDER = os.path.join(BASE_DIR, "Save")
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER
app.config["SAVE_FOLDER"] = SAVE_FOLDER

# import translating model (NLLB-200)
model = Model(model_name="facebook/nllb-200-distilled-600M")
image_processor = ImageProcessor()


# 허용할 파일 형식 확인
def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


# PDF에서 텍스트를 추출하는 함수
def extract_texts_from_pdf(pdf_path):
    page_texts = []
    with pdfplumber.open(pdf_path) as pdf:
        for page in pdf.pages:
            text = page.extract_text() or ""
            page_texts.append(text)
    return page_texts


# 이미지에서 텍스트를 추출
def ocr_core(filename):
    reader = easyocr.Reader(["ko", "en"])
    results = reader.readtext(filename)
    # 타입 변경
    ocr_results = [
        {
            "text": result[1],
            "confidence": float(result[2]),
            "box": [[int(point[0]), int(point[1])] for point in result[0]],
        }
        for result in results
    ]
    return ocr_results


def asd():
    pass


@app.route("/upload", methods=["POST"])
def file_upload():
    if "file" not in request.files:
        return jsonify({"error": "No file part"}), 400

    file = request.files["file"]
    if file.filename == "":
        return jsonify({"error": "No selected file"}), 400

    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config["UPLOAD_FOLDER"], filename)
        file.save(filepath)

        # OCR 적용
        ocr_result = ocr_core(filepath)

        # 결과 반환
        return jsonify(
            {"message": "File successfully uploaded", "ocr_result": ocr_result}
        )
    else:
        return jsonify({"error": "Invalid file type"}), 400


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

        # PDF에서 페이지별 텍스트 추출
        page_texts = extract_texts_from_pdf(filepath)

        # 페이지별 텍스트 번역
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
    if "file" not in request.files:
        return jsonify({"error": "No file part"}), 400
    file = request.files["file"]

    if file.filename == "":
        return jsonify({"error": "No selected file"}), 400

    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config["UPLOAD_FOLDER"], filename)
        file.save(filepath)

        ocr_text = image_processor.run_ocr(filepath)
        combined_text = image_processor.combine_text(ocr_text)
        sentences = image_processor.sentence_split(combined_text)
        translations = [model.gen(sentence) for sentence in sentences]

        return jsonify(
            {"original_text": combined_text, "translated_text": translations}
        )
    else:
        return jsonify({"error": "Invalid file type"}), 400


# @app.route("/아직 못정함 뭘로하지")
def get_tran_image():
    # 나중에 API 형식에 맞춰서 리펙토링 해주십쇼
    image_path = '../Upload/test2.png'
    img = Image.open(image_path)
    out_img = ImageDraw.Draw(img)
    ocr_text = image_processor.run_ocr(image_path)

    for arrays, text, prob in ocr_text:
        translated_text = model.gen(text)
        image_processor.paste_text(out_img, arrays, translated_text)

    img.show()
    save_file_name = 'test2.png'
    img.save(os.path.join(app.config["SAVE_FOLDER"], save_file_name))


if __name__ == "__main__":
    app.run(debug=True, port=5000)
