import React from "react";
import { useState } from "react";
import { useLocation } from "react-router-dom";
import "./pdfPage.css";
import PDFViewer from "./pdfViewer";

const PDFPage = () => {
  const location = useLocation();
  const { fileURL, originalText, translatedTexts } = location.state; // 이전 페이지에서 전달된 state 사용
  const [currentPage, setCurrentPage] = useState(1);

  return (
    <div className="translate-page-container">
      <div className="content-container">
        <div className="pdf-section">
          <h2>PDF 파일</h2>
          <div className="pdf-display">
          <PDFViewer fileURL={fileURL} onPageChange={setCurrentPage} />
             </div>
        </div>
       <div className="text-section">
          <div className="translated-text">
            <h2>번역 텍스트</h2>
            <p>{translatedTexts[currentPage - 1]}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PDFPage;
