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
      const response = await fetch("http://localhost:5000/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();
      console.log("File uploaded successfully:", data);

      // 파일 업로드 후 TranslatePage로 이동
      navigate("/translate", {
        state: {
          image: URL.createObjectURL(file),
          ocrText: data.ocr_result.map((result) => result.text).join("\n"),
        },
      });
    } catch (error) {
      console.error("Error during file upload:", error);
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
