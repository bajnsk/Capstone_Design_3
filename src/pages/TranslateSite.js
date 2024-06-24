import React from "react";
import { FaUpload} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "../App.css";
import ClipboardHandler from "./ClipboardHandler";

const TranslatorSite = () => {
  const navigate = useNavigate();

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleFileDrop = (e) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleFileUpload = async (file) => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      if (file.type === "application/pdf") {
        let pdfResponse = await fetch("http://localhost:5000/pdf_translate", {
            method: "POST",
            body: formData,
        });
    
        if (!pdfResponse.ok) {
            throw new Error("PDF processing failed");
        }
    
        let pdfData = await pdfResponse.json();
        if (pdfData.error) {
            throw new Error(pdfData.error);
        }
    
        navigate("/pdf", {
            state: {
                fileURL: URL.createObjectURL(file),
                originalTexts: pdfData.original_texts,
                translatedTexts: pdfData.translated_texts,
            },
        });
    } else if (file.type.startsWith("image/")) {
      const base64Image = await getBase64(file);

      let uploadResponse = await fetch("http://localhost:5000/upload", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ image: base64Image }),
      });

        if (!uploadResponse.ok) {
            throw new Error("Upload failed");
        }

        let uploadData = await uploadResponse.json();
        if (uploadData.error) {
            throw new Error(uploadData.error);
        }

        let translateResponse = await fetch("http://localhost:5000/image_translate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ image: base64Image }),
        });

        if (!translateResponse.ok) {
            throw new Error("Translation request failed");
        }

        const translateData = await translateResponse.json();
        if (translateData.error) {
            throw new Error(translateData.error);
        }

        // 이미지 다운로드
        // const imageUrl = `http://localhost:5000/static/${translateData.translated_image}`;
        // const filename = translateData.translated_image;
        // downloadImage(imageUrl, filename);

        navigate("/translate", {
          state: {
              image: URL.createObjectURL(file),
              translatedImage: translateData.translated_image,  // 수정된 부분: 서버에서 반환된 이미지의 경로를 사용
              ocrText: uploadData.ocr_result.map((result) => result.text).join("\n"),
              translatedText: translateData.translated_text.join(" "),
          },
        });
      } else {
        alert("Unsupported file type. Please upload a PDF or an image file.");
      }
    } catch (error) {
      console.error("Error during file upload or translation:", error);
      alert(error.message);
    }
  };

  const getBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve(reader.result);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // const downloadImage = async (imageUrl, filename) => {
  //   const response = await fetch(imageUrl);
  //   const blob = await response.blob();
  //   const url = window.URL.createObjectURL(blob);
  //   const a = document.createElement('a');
  //   a.style.display = 'none';
  //   a.href = url;
  //   a.download = filename;
  //   document.body.appendChild(a);
  //   a.click();
  //   window.URL.revokeObjectURL(url);
  // };

  return (
    <div className="translator-container">
      <div
        className="drag-drop-area"
        onDrop={handleFileDrop}
        onDragOver={handleDragOver}
      >
        <FaUpload size={50} />
        <p>여기에 파일을 드래그하거나 클릭해서 업로드하세요.</p>
        <input
          type="file"
          id="file-upload"
          style={{ display: "none" }}
          onChange={(e) => handleFileUpload(e.target.files[0])}
        />
        <button onClick={() => document.getElementById("file-upload").click()}>
          파일 업로드
        </button>
      </div>
      <ClipboardHandler handleFileUpload={handleFileUpload}/>
      </div>
  );
};

export default TranslatorSite;
