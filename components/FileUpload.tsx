"use client"

import type React from "react"
import { useCallback } from "react"
import { useDropzone } from "react-dropzone"

interface FileUploadProps {
  onUpload: (files: FileList) => void
  isProcessing: boolean
}

const FileUpload: React.FC<FileUploadProps> = ({ onUpload, isProcessing }) => {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      onUpload(acceptedFiles as unknown as FileList)
    },
    [onUpload],
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    disabled: isProcessing,
  })

  return (
    <div
      {...getRootProps()}
      className={`w-full max-w-xl h-64 border-2 border-dashed rounded-lg flex items-center justify-center cursor-pointer transition-colors ${
        isDragActive ? "border-blue-500 bg-blue-50" : "border-gray-300"
      } ${isProcessing ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      <input {...getInputProps()} />
      {isProcessing ? (
        <p className="text-center text-gray-500">Processing...</p>
      ) : isDragActive ? (
        <p className="text-center text-blue-500">Drop the PDF files here...</p>
      ) : (
        <p className="text-center text-gray-500">Drag and drop PDF files here, or click to select files</p>
      )}
    </div>
  )
}

export default FileUpload

