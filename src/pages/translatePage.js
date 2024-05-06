import React from "react";
import { useLocation } from "react-router-dom";
import "./translatePage.css";

const TranslatePage = () => {
  const location = useLocation();
  const { image, ocrText, translatedText } = location.state || {}; // location.state가 undefined인 경우를 대비하여 기본값으로 빈 객체를 할당

  //이미지 스타일 정리
  const imageStyle = {
    width: "100%",
    height: "auto",
    borderRadius: "10px",
    marginBottom: "20px",
  };
  // 텍스트 박스 스타일 정의
  const textBoxStyle = {
    position: "absolute",
    border: "2px solid #FF0000",
    borderRadius: "5px",
    padding: "5px",
    color: "#FF0000",
  };

  // 번역된 텍스트를 이미지 위에 표시하는 함수
  const renderTranslatedText = () => {
    // translatedText가 정의되어 있는지 확인하고 렌더링
    if (translatedText) {
      return translatedText.map((text, index) => (
        <div
          key={index}
          style={{
            ...textBoxStyle,
            top: `${text.top}px`,
            left: `${text.left}px`,
          }}
        >
          {text.text}
        </div>
      ));
    } else {
      // translatedText가 정의되어 있지 않은 경우, 오류 대신 다른 UI를 렌더링
      return <p>No translated text available</p>;
    }
  };

  return (
    <div className="translate-page-container">
      <div className="content-container">
        <div className="image-section">
          <h2>원본 이미지</h2>
          <div className="image-display">
            <img src={image} alt="Uploaded" style={imageStyle} />
            {renderTranslatedText()}
          </div>
        </div>
        <div className="text-section">
          <div className="ocr-text">
            <h2>원본 텍스트</h2>
            <p>{ocrText}</p>
          </div>
          <div className="translated-text">
            <h2>번역 텍스트</h2>
            <p>{ocrText} </p> {/* 추출된 OCR 텍스트를 임시로 사용 */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TranslatePage;