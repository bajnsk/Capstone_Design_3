import React from "react";
import { FaUpload, FaClipboard } from "react-icons/fa";
import "./App.css";

const TranslatorSite = () => {
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
          onChange={handleFileUpload}
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

const handleDragOver = (e) => {
  e.preventDefault(); // 기본 이벤트 방지
};

const handleFileDrop = async (e) => {
  e.preventDefault();
  const files = e.dataTransfer.files;
  if (files.length > 0) {
    const file = files[0];
    await handleFileUpload(file); // handleFileUpload을 파일을 직접 전달하여 재사용
  }
};

const handleFileUpload = async (e) => {
  const file = e.target.files[0];
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
  } catch (error) {
    console.error("Error during file upload:", error);
  }
};

export default TranslatorSite;
