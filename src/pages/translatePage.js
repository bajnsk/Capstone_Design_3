import React from "react";
import { useLocation } from "react-router-dom";

const TranslatePage = () => {
  const location = useLocation();
  const { image, ocrText } = location.state; // 이전 페이지에서 전달된 state 사용

  return (
    <div className="translate-page-container">
      <div className="image-ocr-container">
        <div className="image-container">
          {image && <img src={image} alt="Uploaded" />}
        </div>
        <div className="ocr-result-container">
          <p>{ocrText}</p>
        </div>
      </div>
    </div>
  );
};

export default TranslatePage;
