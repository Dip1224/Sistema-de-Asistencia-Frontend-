"use client";

import { useRef, useState } from "react";
import { motion } from "motion/react";
import { IconUpload } from "@tabler/icons-react";
import { useDropzone } from "react-dropzone";
import { cn } from "../../lib/utils.js";

const mainVariant = {
  initial: { opacity: 1, scale: 1 },
  animate: { opacity: 1, scale: 1 }
};

const secondaryVariant = {
  initial: { opacity: 0 },
  animate: { opacity: 1 }
};

export function FileUpload({ onChange }) {
  const [files, setFiles] = useState([]);
  const fileInputRef = useRef(null);

  const handleFileChange = newFiles => {
    setFiles(prev => [...prev, ...newFiles]);
    if (onChange) {
      onChange(newFiles);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const { getRootProps, isDragActive } = useDropzone({
    multiple: false,
    noClick: true,
    onDrop: handleFileChange,
    onDropRejected: error => {
      console.error(error);
    }
  });

  return (
    <div className="w-full" {...getRootProps()}>
      <motion.div onClick={handleClick} variants={mainVariant} className="upload-card group/file block rounded-lg cursor-pointer w-full relative overflow-hidden">
        <input
          ref={fileInputRef}
          id="file-upload-handle"
          type="file"
          onChange={e => handleFileChange(Array.from(e.target.files || []))}
          className="hidden"
        />
        <div className="upload-card__bg" />
        <div className="upload-card__content">
          <p className="upload-title">Subir archivo</p>
          <p className="upload-subtitle">Arrastra o suelta la imagen aquí o haz clic para elegirla</p>
          <div className="upload-icon">
            <IconUpload className="h-5 w-5 text-neutral-700 dark:text-neutral-300" />
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export function GridPattern() {
  const columns = 41;
  const rows = 11;
  return (
    <div className="flex bg-gray-100 dark:bg-neutral-900 shrink-0 flex-wrap justify-center items-center gap-x-px gap-y-px scale-105">
      {Array.from({ length: rows }).map((_, row) =>
        Array.from({ length: columns }).map((_, col) => {
          const index = row * columns + col;
          return (
            <div
              key={`${col}-${row}`}
              className={`w-10 h-10 flex shrink-0 rounded-[2px] ${
                index % 2 === 0
                  ? "bg-gray-50 dark:bg-neutral-950"
                  : "bg-gray-50 dark:bg-neutral-950 shadow-[0px_0px_1px_3px_rgba(255,255,255,1)_inset] dark:shadow-[0px_0px_1px_3px_rgba(0,0,0,1)_inset]"
              }`}
            />
          );
        })
      )}
    </div>
  );
}
