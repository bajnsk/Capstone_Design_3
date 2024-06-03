import React, { useRef, useEffect } from "react";
import { FaClipboard } from "react-icons/fa";

const ClipboardHandler = ({ handleFileUpload }) => {
  const pasteAreaRef = useRef(null);

  const handlePaste = (event) => {
    const clipboardItems = event.clipboardData.items;
    for (let i = 0; i < clipboardItems.length; i++) {
      const item = clipboardItems[i];
      if (item.type.startsWith("image")) {
        const blob = item.getAsFile();
        handleFileUpload(blob);
      }
    }
  };

  useEffect(() => {
    const pasteArea = pasteAreaRef.current;
    if (pasteArea) {
      pasteArea.addEventListener("paste", handlePaste);
    }

    return () => {
      if (pasteArea) {
        pasteArea.removeEventListener("paste", handlePaste);
      }
    };
  }, [handlePaste]);

  return (
    <div ref={pasteAreaRef} className="clipboard-handler">
      <button>
        <FaClipboard size={20} />
        클립보드에서 붙여넣기
      </button>
      <p>클립보드에서 이미지를 붙여넣으려면 ctrl+V를 누르세요.</p>
    </div>
  );
};

export default ClipboardHandler;