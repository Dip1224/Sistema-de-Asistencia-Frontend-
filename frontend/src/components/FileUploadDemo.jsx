"use client";

import { useState } from "react";
import { FileUpload } from "./ui/file-upload.jsx";

function FileUploadDemo({ onChange }) {
  const [files, setFiles] = useState([]);

  const handleFileUpload = incoming => {
    const list = Array.isArray(incoming) ? incoming : Array.from(incoming || []);
    setFiles(list);
    if (typeof onChange === "function") {
      onChange(list);
    }
  };

  return (
    <div className="file-upload-demo">
      <FileUpload onChange={handleFileUpload} />
    </div>
  );
}

export default FileUploadDemo;
