import React from "react";
import { Upload } from "lucide-react";

const FileUpload = ({
  label,
  file,
  onFileChange,
  accept = "application/pdf",
  required = false,
}) => {
  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      if (
        accept === "application/pdf" &&
        selectedFile.type !== "application/pdf"
      ) {
        alert("Please upload a PDF file only");
        return;
      }
      onFileChange(selectedFile);
    }
  };

  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-black">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        <input
          type="file"
          accept={accept}
          onChange={handleFileChange}
          className="hidden"
          id="file-upload"
        />
        <label
          htmlFor="file-upload"
          className="flex w-full cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-gray-400 bg-white/20 p-6 backdrop-blur-sm transition-colors hover:border-gray-500"
        >
          <div className="text-center">
            <Upload className="mx-auto mb-2 h-8 w-8 text-gray-600" />
            <p className="text-sm text-gray-700">
              {file ? file.name : "Click to upload PDF document"}
            </p>
          </div>
        </label>
      </div>
    </div>
  );
};

export default FileUpload;
