import React from "react";
import { FaClipboard } from "react-icons/fa";

const ClipboardHandler = ({ handleFileUpload }) => {
  const handleButtonClick = async () => {
    try {
      const clipboardItems = await navigator.clipboard.read();
      for (const item of clipboardItems) {
        if (item.types.includes("image/png")) {
          const blob = await item.getType("image/png");
          const file = new File([blob], "clipboard-image.png", { type: "image/png" });
          handleFileUpload(file);
        } else if (item.types.includes("image/jpeg")) {
          const blob = await item.getType("image/jpeg");
          const file = new File([blob], "clipboard-image.jpeg", { type: "image/jpeg" });
          handleFileUpload(file);
        } else {
          alert("Unsupported image type. Please use PNG or JPEG images.");
        }
      }
    } catch (error) {
      console.error("Failed to read clipboard contents: ", error);
    }
  };

  return (
    <div className="clipboard-handler">
      <button onClick={handleButtonClick}>
        <FaClipboard size={20} />
        클립보드에서 붙여넣기
      </button>
    </div>
  );
};

export default ClipboardHandler;
