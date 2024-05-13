import React from "react";
import { useLocation } from "react-router-dom";
import "./pdfPage.css";

const PDFPage = () => {
  const location = useLocation();
  const { fileURL, originalText, translatedText } = location.state; // 이전 페이지에서 전달된 state 사용

  return (
    <div className="translate-page-container">
      <div className="content-container">
        <div className="pdf-section">
          <h2>PDF 파일</h2>
          <div className="pdf-display">
            {/* PDF 파일을 iframe을 사용하여 렌더링 */}
            <iframe src={fileURL} title="PDF" width="100%" height="500px"></iframe>
          </div>
        </div>
        <div className="text-section">
          <div className="translated-text">
            <h2>번역 텍스트</h2>
            <p>{translatedText}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PDFPage;
