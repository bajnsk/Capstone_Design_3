import React from "react";
import { useLocation } from "react-router-dom";
import "./translatePage.css";

const TranslatePage = () => {
  const location = useLocation();
  const { translatedImage, ocrText, translatedText } = location.state;

  return (
    <div className="translate-page-container">
      <div className="content-container">
        <div className="image-section">
          <h2>번역된 이미지</h2>
          <div className="image-display">
            <img src={`http://localhost:5000/static/${translatedImage}`} alt="Translated" />
          </div>
        </div>
        <div className="text-section">
          <div className="ocr-text">
            <h2>원본 텍스트</h2>
            <p>{ocrText}</p>
          </div>
          <div className="translated-text">
            <h2>번역 텍스트</h2>
            <p>{translatedText}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TranslatePage;
