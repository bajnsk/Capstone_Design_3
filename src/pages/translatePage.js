import React from "react";
import { useLocation } from "react-router-dom";
import "./translatePage.css";

const TranslatePage = () => {
  const location = useLocation();
  const { image, ocrText } = location.state; // 이전 페이지에서 전달된 state 사용

  return (
    <div className="translate-page-container">
      <div className="content-container">
        <div className="image-section">
          <h2>원본 이미지</h2>
          <div className="image-display">
            <img src={image} alt="Uploaded" />
          </div>
        </div>
        <div className="text-section">
          <div className="ocr-text">
            <h2>원본 텍스트</h2>
            <p>{ocrText}</p>
          </div>
          <div className="translated-text">
            <h2>번역 텍스트</h2>
            <p>
              {ocrText} {/* 추출된 OCR 텍스트를 임시로 사용 */}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TranslatePage;
