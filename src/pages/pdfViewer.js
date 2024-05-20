import React, { useEffect, useRef, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import 'pdfjs-dist/build/pdf.worker.entry';
import './pdfViewer.css';

const PDFViewer = ({ fileURL, onPageChange }) => {
  const canvasRef = useRef(null);
  const renderTaskRef = useRef(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [numPages, setNumPages] = useState(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    const container = canvas.parentElement;

    const loadingTask = pdfjsLib.getDocument(fileURL);

    loadingTask.promise.then(pdf => {
      setNumPages(pdf.numPages);

      const renderPage = (pageNum) => {
        pdf.getPage(pageNum).then(page => {
          const container = canvas.parentElement;
          const scale = container.clientWidth / page.getViewport({ scale: 1 }).width;
          const viewport = page.getViewport({ scale: scale });
      
          canvas.width = container.clientWidth; // 컨테이너의 너비에 맞게 캔버스 너비 설정
          canvas.height = viewport.height; // 계산된 뷰포트의 높이로 캔버스 높이 설정
      
          if (renderTaskRef.current) {
            renderTaskRef.current.cancel();
          }
      
          const renderContext = {
            canvasContext: context,
            viewport: viewport // 수정된 뷰포트 사용
          };
      
          const renderTask = page.render(renderContext);
          renderTaskRef.current = renderTask;
      
          renderTask.promise.then(() => {
            renderTaskRef.current = null;
          }).catch((error) => {
            if (error.name !== 'RenderingCancelledException') {
              console.error(error);
            }
          });
          onPageChange(pageNum);
        });
      };

      renderPage(pageNumber);

      return () => {
        if (renderTaskRef.current) {
          renderTaskRef.current.cancel();
        }
      };
    }, reason => {
      console.error(reason);
    });

  }, [fileURL, pageNumber]);

  const handlePreviousPage = () => {
    if (pageNumber > 1) {
      setPageNumber(pageNumber - 1);
    }
  };

  const handleNextPage = () => {
    if (pageNumber < numPages) {
      setPageNumber(pageNumber + 1);
    }
  };

  return (
    <div className="pdf-viewer-container">
      <canvas ref={canvasRef} className="pdf-canvas"></canvas>
      <div className="pdf-navigation">
        <button onClick={handlePreviousPage} disabled={pageNumber <= 1}>이전 페이지</button>
        <span>{pageNumber} / {numPages}</span>
        <button onClick={handleNextPage} disabled={pageNumber >= numPages}>다음 페이지</button>
      </div>
    </div>
  );
};

export default PDFViewer;
