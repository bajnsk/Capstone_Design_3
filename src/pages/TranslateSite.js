import React from "react";
import { FaUpload, FaClipboard } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "../App.css";

const TranslatorSite = () => {
  const navigate = useNavigate();

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleFileDrop = (e) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleFileUpload = async (file) => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      // 이미지 업로드
      let uploadResponse = await fetch("http://localhost:5000/upload", {
          method: "POST",
          body: formData,
      });

      if (!uploadResponse.ok) {
          throw new Error("Upload failed");
      }

      let uploadData = await uploadResponse.json();
      if (uploadData.error) {
          throw new Error(uploadData.error);
      }

      // OCR 결과를 이용한 번역 요청
      let translateResponse = await fetch("http://localhost:5000/image_translate", {
          method: "POST",
          body: formData,
      });

      if (!translateResponse.ok) {
          throw new Error("Translation request failed");
      }

      const translateData = await translateResponse.json();
      if (translateData.error) {
          throw new Error(translateData.error);
      }

      // 파일 업로드 후 TranslatePage로 이동
      navigate("/translate", {
          state: {
              image: URL.createObjectURL(file),
              ocrText: uploadData.ocr_result.map((result) => result.text).join("\n"),
              translatedText: translateData.translated_text.join(" "),
          },
      });
    } catch (error) {
      console.error("Error during file upload or translation:", error);
      alert(error.message);  // 사용자에게 오류 메시지를 표시
    }
};

  return (
    <div className="translator-container">
      <div
        className="drag-drop-area"
        onDrop={handleFileDrop}
        onDragOver={handleDragOver}
      >
        <FaUpload size={50} />
        <p>여기에 파일을 드래그하거나 클릭해서 업로드하세요.</p>
        <input
          type="file"
          id="file-upload"
          style={{ display: "none" }}
          onChange={(e) => handleFileUpload(e.target.files[0])}
        />
        <button onClick={() => document.getElementById("file-upload").click()}>
          파일 업로드
        </button>
      </div>
      <div className="actions">
        <button>
          <FaClipboard size={20} />
          클립보드에서 붙여넣기
        </button>
      </div>
    </div>
  );
};

export default TranslatorSite;
