# app.py
from flask import Flask, request
from flask_cors import CORS
from werkzeug.utils import secure_filename
import os
from flask import jsonify
import easyocr


app = Flask(__name__)
CORS(app, resources={r"/upload": {"origins": "http://localhost:3000"}})
# 파일을 저장할 경로 설정
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}

# app.py 파일의 상위 디렉토리 경로를 얻습니다.
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# 상위 디렉토리에 위치한 'Upload' 폴더를 가리키도록 합니다.
UPLOAD_FOLDER = os.path.join(BASE_DIR, 'Upload')
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER


# 허용할 파일 형식 확인
def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# 이미지에서 텍스트를 추출하는 함수
def ocr_core(filename):
    reader = easyocr.Reader(['ko', 'en'])
    results = reader.readtext(filename)
    # 각 결과를 직렬화 가능한 타입으로 변환합니다.
    ocr_results = [
        {
            'text': result[1],
            'confidence': float(result[2]),
            'box': [[int(point[0]), int(point[1])] for point in result[0]]
        }
        for result in results
    ]
    return ocr_results

@app.route('/upload', methods=['POST'])
def file_upload():
    # request에서 'file' 키로 파일을 받음
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        # 파일 저장
        file.save(filepath)

        # OCR 적용
        ocr_result = ocr_core(filepath)
        
        # 결과 반환
        return jsonify({'message': 'File successfully uploaded', 'ocr_result': ocr_result})
    else:
        return jsonify({'error': 'Invalid file type'}), 400



if __name__ == '__main__':
    app.run(debug=True)