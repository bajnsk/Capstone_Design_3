# app.py
from flask import Flask, request
from flask_cors import CORS
from werkzeug.utils import secure_filename
import os
from flask import jsonify
import easyocr
from translater import Model


app = Flask(__name__)
# CORS 설정
CORS(app, resources={r"/upload": {"origins": "http://localhost:3000"}})
# 확장자 정의
ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "gif"}

# 이미지 업로드 경로 설정
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

UPLOAD_FOLDER = os.path.join(BASE_DIR, "Upload")
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER

# import translating model (NLLB-200)
model = Model()

##############################
# Usage
#
# korean_text = model.gen(
#     '[ENGLISH TEXT]'
# )
#
##############################


# 허용할 파일 형식 확인
def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


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


if __name__ == "__main__":
    app.run(debug=True)
