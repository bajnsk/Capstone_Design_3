import React from 'react';
import { FaUpload, FaClipboard } from 'react-icons/fa';
import "./App.css"

const TranslatorSite = () => {
  return (
    <div className="translator-container">
      <div className="drag-drop-area" onDrop={handleFileDrop} onDragOver={handleDragOver}>
        <FaUpload size={50} />
        <p>여기에 파일을 드래그하거나 클릭해서 업로드하세요.</p>
        <input type="file" id="file-upload" style={{ display: 'none' }} onChange={handleFileUpload} />
        <button onClick={() => document.getElementById('file-upload').click()}>
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

const handleFileDrop = (e) => {
  e.preventDefault();
  // 여기에서 파일 처리 로직 구현
};

const handleFileUpload = (e) => {
  const file = e.target.files[0];
  // 파일 업로드 로직 구현
};

export default TranslatorSite;
