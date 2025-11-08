import React from 'react';
import UploadCloudIcon from '../../assets/upload-cloud.svg';
import uploadIcon from '../../assets/upload.svg';

/**
 * Reusable File Upload Component
 * 
 * @param {string} fieldName - Unique identifier for the file input
 * @param {string} title - Main heading for the upload area
 * @param {string} description - Description text below the title
 * @param {string} placeholder - Placeholder text in the upload area
 * @param {function} onFileSelect - Callback function when file is selected
 * @param {object} selectedFile - Currently selected file object (with fileName or name property)
 * @param {string} accept - Accepted file types (default: ".pdf,.jpg,.jpeg,.png")
 * @param {string} className - Additional CSS classes for the container
 * @param {boolean} multiple - Allow selecting multiple files (default false)
 */
const FileUploadArea = ({ 
  fieldName, 
  title, 
  description, 
  placeholder = "to Upload PDF/JPEG",
  onFileSelect,
  selectedFile = null,
  accept = ".pdf,.jpg,.jpeg,.png",
  className = "",
  multiple = false
}) => {
  const handleClick = () => {
    const input = document.getElementById(`${fieldName}-file`);
    if (input) {
      input.click();
    }
  };

  const handleFileChange = (e) => {
    if (onFileSelect) {
      onFileSelect(e, fieldName);
    }
  };

  return (
    <div className={`mb-6 ${className}`}>
      {title && (
        <h3 className="text-base font-medium text-primary-500 mb-1">{title}</h3>
      )}
      {description && (
        <p className="text-xs text-primary-200 font-medium mb-3">{description}</p>
      )}
      <div 
        className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary-500 transition-colors cursor-pointer"
        onClick={handleClick}
      >
        <div className="flex flex-col items-center">
          <div className="rounded-full p-2 sm:p-4 bg-primary-200">
            <img src={UploadCloudIcon} alt="Upload" className="w-8 h-8 " />
          </div>
          <p className="text-sm font-medium text-primary-500 mb-1 mt-2">Click Here</p>
          <p className="text-xs text-primary-200 font-medium">{placeholder}</p>
          <button
            type="button"
            className="mt-3 inline-flex items-center gap-2 bg-primary-500 text-white text-xs sm:text-sm font-medium px-4 py-2 rounded-lg! cursor-pointer"
          >
            Upload Here
            <img src={uploadIcon} alt="upload" className="w-4 h-4" />
          </button>
        </div>
        <input
          id={`${fieldName}-file`}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleFileChange}
          className="hidden"
        />
        {selectedFile && (
          <p className="text-xs text-green-600 mt-2">
            ✓ {selectedFile.fileName || selectedFile.name}
          </p>
        )}
      </div>
    </div>
  );
};

export default FileUploadArea;