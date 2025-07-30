import React, { useState, useRef } from 'react';
import { toast } from 'react-toastify';
import { FileValidator } from '../../../utils/fileValidator';

interface CredentialUploadProps {
  onFileSelected: (file: File) => void;
  onUploadComplete: () => void;
  disabled?: boolean;
  isUploading?: boolean;
}

const CredentialUpload: React.FC<CredentialUploadProps> = ({
  onFileSelected,
  disabled = false,
  isUploading = false
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File) => {
    const validation = FileValidator.validateCredentialFile(file);
    
    if (!validation.isValid) {
      toast.error(validation.error);
      return;
    }

    setSelectedFile(file);
    onFileSelected(file);
    toast.success(`File "${file.name}" selected successfully`);
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(false);
    
    const files = event.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleClearFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4">
      {/* Drag & Drop Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          border-2 border-dashed rounded-lg p-6 transition-colors
          ${isDragOver 
            ? 'border-blue-400 bg-blue-50' 
            : 'border-gray-300 bg-gray-50'
          }
          ${disabled || isUploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
      >
        <div className="text-center">
          <div className="mx-auto h-12 w-12 text-gray-400 mb-4">
            📄
          </div>
          
          <div className="mb-4">
            <label
              htmlFor="credential-upload"
              className={`
                cursor-pointer bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors
                ${disabled || isUploading ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              {isUploading ? 'Uploading...' : 'Choose PDF File'}
            </label>
            <input
              id="credential-upload"
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              onChange={handleInputChange}
              disabled={disabled || isUploading}
              className="hidden"
            />
          </div>
          
          <p className="text-sm text-gray-600">
            Or drag and drop your medical credential PDF here
          </p>
          <p className="text-xs text-gray-500 mt-2">
            Maximum file size: 10MB • PDF format only
          </p>
        </div>
      </div>

      {/* Selected File Info */}
      {selectedFile && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-blue-800">Selected File</h3>
            <button
              onClick={handleClearFile}
              disabled={isUploading}
              className="text-blue-600 hover:text-blue-800 text-sm disabled:opacity-50"
            >
              Remove
            </button>
          </div>
          
          <div className="text-sm text-blue-700 space-y-1">
            <p><strong>Name:</strong> {selectedFile.name}</p>
            <p><strong>Size:</strong> {FileValidator.formatFileSize(selectedFile.size)}</p>
            <p><strong>Type:</strong> PDF Document</p>
          </div>
        </div>
      )}

      {/* Upload Progress */}
      {isUploading && (
        <div className="flex items-center justify-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Uploading credential...</span>
        </div>
      )}
    </div>
  );
};

export default CredentialUpload;
