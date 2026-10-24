import React, { useState } from 'react';
import { Upload, X, Check } from 'lucide-react';

interface LogoUploadProps {
  onLogoChange: (logoUrl: string) => void;
  currentLogo?: string;
}

const LogoUpload: React.FC<LogoUploadProps> = ({ onLogoChange, currentLogo }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const handleFileUpload = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }

    setIsUploading(true);
    
    // Create a URL for the uploaded file
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      onLogoChange(result);
      setIsUploading(false);
      setUploadSuccess(true);
      setTimeout(() => setUploadSuccess(false), 2000);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div
        className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-all duration-300 ${
          isDragging
            ? 'border-green-500 bg-green-50'
            : 'border-gray-300 hover:border-green-400 hover:bg-gray-50'
        }`}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onDragEnter={() => setIsDragging(true)}
        onDragLeave={() => setIsDragging(false)}
      >
        {currentLogo ? (
          <div className="space-y-4">
            <img
              src={currentLogo}
              alt="Current logo"
              className="max-h-20 mx-auto object-contain"
            />
            <p className="text-sm text-gray-600">Current logo</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
              {isUploading ? (
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
              ) : uploadSuccess ? (
                <Check className="h-6 w-6 text-green-600" />
              ) : (
                <Upload className="h-6 w-6 text-gray-400" />
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">
                Drop your logo here, or{' '}
                <label className="text-green-600 hover:text-green-700 cursor-pointer">
                  browse
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileInput}
                  />
                </label>
              </p>
              <p className="text-xs text-gray-500 mt-1">
                PNG, JPG, SVG up to 2MB
              </p>
            </div>
          </div>
        )}
        
        {currentLogo && (
          <button
            onClick={() => onLogoChange('')}
            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors duration-200"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
      
      {currentLogo && (
        <div className="mt-4 text-center">
          <label className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 cursor-pointer transition-colors duration-200">
            <Upload className="h-4 w-4 mr-2" />
            Change Logo
            <input
              type="file"
              className="hidden"
              accept="image/*"
              onChange={handleFileInput}
            />
          </label>
        </div>
      )}
    </div>
  );
};

export default LogoUpload;