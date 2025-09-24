  import React, { useState, useEffect } from 'react';
  import { useNavigate, useLocation } from 'react-router-dom';
  import UploadCloudIcon from '../assets/upload-cloud.svg';
  import { userAPI } from '../services/api';

  const VerifyDocumentsPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [formData, setFormData] = useState({
      abnNumber: '',
      tfnNumber: '',
      policeCheck: null,
      visaWorkRights: null,
      trainingCertificates: null
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [userRole, setUserRole] = useState('');
    const [documentStatus, setDocumentStatus] = useState(null);

    // Get user role from localStorage
    useEffect(() => {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        setUserRole(user.role || user.userType || '');
      }
    }, []);

    // Fetch document status on component mount
    useEffect(() => {
      fetchDocumentStatus();
    }, []);

    const fetchDocumentStatus = async () => {
      try {
        const response = await userAPI.getDocumentStatus();
        if (response.success) {
          setDocumentStatus(response.data);
          // Pre-fill form with existing data
          if (response.data.documents) {
            setFormData(prev => ({
              ...prev,
              abnNumber: response.data.documents.abnNumber || '',
              tfnNumber: response.data.documents.tfnNumber || ''
            }));
          }
        }
      } catch (error) {
        console.error('Error fetching document status:', error);
      }
    };

    const handleInputChange = (e) => {
      const { name, value } = e.target;
      setFormData({
        ...formData,
        [name]: value
      });
    };

  const handleFileUpload = async (e, fieldName) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB');
        return;
      }

      // Validate file type
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
      if (!allowedTypes.includes(file.type)) {
        setError('Only PDF, JPEG, JPG, and PNG files are allowed');
        return;
      }

      try {
        // Store the original file object and convert to base64 for preview
        const base64 = await convertToBase64(file);
        
        setFormData({
          ...formData,
          [fieldName]: {
            file: base64, // Keep base64 for preview
            originalFile: file, // Store original file for upload
            fileName: file.name,
            fileType: file.type,
            fileSize: file.size
          }
        });
        setError('');
      } catch (error) {
        setError('Failed to process file. Please try again.');
      }
    }
  };

  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result.split(',')[1]);
      reader.onerror = error => reject(error);
    });
  };


    const handleSubmit = async (e) => {
      e.preventDefault();
      setError('');
      setIsLoading(true);

      try {
        // Validate required fields
        if (!formData.abnNumber.trim()) {
          setError('ABN Number is required.');
          setIsLoading(false);
          return;
        }

        // Check if at least one document is uploaded
        const hasDocuments = formData.policeCheck || formData.visaWorkRights || formData.trainingCertificates;
        if (!hasDocuments) {
          setError('Please upload at least one document.');
          setIsLoading(false);
          return;
        }

        // Create FormData for file upload (backend expects multipart/form-data)
        const formDataToSend = new FormData();
        formDataToSend.append('abnNumber', formData.abnNumber);
        if (formData.tfnNumber) {
          formDataToSend.append('tfnNumber', formData.tfnNumber);
        }

        // Add files to FormData (use original file objects)
        if (formData.policeCheck) {
          formDataToSend.append('policeCheck', formData.policeCheck.originalFile);
        }
        
        if (formData.visaWorkRights) {
          formDataToSend.append('visaWorkRights', formData.visaWorkRights.originalFile);
        }
        
        if (formData.trainingCertificates) {
          formDataToSend.append('trainingCertificates', formData.trainingCertificates.originalFile);
        }
        
        // Submit documents via API
        const response = await userAPI.uploadDocuments(formDataToSend);
        
        if (response.success) {
          // Navigate to availability page
          navigate('/set-availability');
        } else {
          setError(response.message || 'Failed to submit documents. Please try again.');
        }
      } catch (error) {
        // Handle specific error types
        if (error.message === 'Failed to fetch') {
          setError('Network error: Unable to connect to server. Please check your internet connection and try again.');
        } else if (error.message.includes('Server returned HTML instead of JSON') || error.message.includes('<!DOCTYPE') || error.name === 'SyntaxError') {
          setError('Backend Error (500): The server encountered an internal error while processing your upload. This is a backend issue - please contact support or check server logs.');
        } else if (error.message.includes('413') || error.message.includes('Request Entity Too Large')) {
          setError('File too large: The server rejected the upload. Please reduce file sizes and try again.');
        } else if (error.message.includes('CORS')) {
          setError('CORS error: The server is not configured to accept requests from this domain. Please contact support.');
        } else {
          setError(`Upload failed: ${error.message}. Please try again.`);
        }
      } finally {
        setIsLoading(false);
      }
    };

    const FileUploadArea = ({ fieldName, title, description, placeholder }) => (
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-primary-500 mb-1">{title}</h3>
        <p className="text-xs text-primary-200 font-medium mb-3">{description}</p>
        <div 
          className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary-500 transition-colors cursor-pointer"
          onClick={() => document.getElementById(`${fieldName}-file`).click()}
        >
          <div className="flex flex-col items-center">
              <div className='rounded-full p-2 sm:p-4 bg-primary-200'>
                  <img src={UploadCloudIcon} alt="Upload" className="w-8 h-8 sm:w-10 sm:h-10" />
              </div>
            <p className="text-sm font-medium text-primary-500 mb-1 mt-2">Click Here</p>
            <p className="text-xs text-primary-200 font-medium">{placeholder}</p>
          </div>
          <input
            id={`${fieldName}-file`}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={(e) => handleFileUpload(e, fieldName)}
            className="hidden"
          />
          {formData[fieldName] && (
            <p className="text-xs text-green-600 mt-2">
              ✓ {formData[fieldName].fileName || formData[fieldName].name}
            </p>
          )}
        </div>
      </div>
    );

    return (
      <div className="min-h-screen bg-gray-50">
        
        <div className="max-w-3xl mx-auto px-4 py-6">
          <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-custom mt-5">
            {/* Header */}
            <div className=" mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold text-primary-500 mb-2">
                Verify Your Documents
              </h1>
              <p className="text-sm sm:text-base text-primary-200 font-medium">
                Upload required documents to start receiving jobs. Admin will review within 24-48 hours.
              </p>
            </div>

            {error && (
              <div className="mb-6 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* ABN Number */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-primary-500 mb-2">
                  ABN Number
                </label>
                <input
                  type="text"
                  name="abnNumber"
                  value={formData.abnNumber}
                  onChange={handleInputChange}
                  placeholder="Enter your 11-digit ABN"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none transition-all duration-200 font-medium "
                  required
                />
                <p className="text-sm text-primary-200 font-medium mt-1">
                  Your ABN is used for tax and compliance. Auto verification is instant.
                </p>
              </div>

              {/* TFN Number - Only for Professional Cleaner */}
              {userRole === 'Student Cleaner' && (
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-primary-500 mb-2">
                    TFN (Tax File Number)
                  </label>
                  <input
                    type="text"
                    name="tfnNumber"
                    value={formData.tfnNumber}
                    onChange={handleInputChange}
                    placeholder="Enter number"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none transition-all duration-200 font-medium"
                    required
                  />
                  <p className="text-sm text-primary-200 font-medium mt-1">
                    Required to limit your working hours as per AU rules.
                  </p>
                </div>
              )}

              {/* Identity & Work Rights - Police Check */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-primary-500 mb-1">Identity & Work Rights</h3>
                <h4 className="text-sm font-medium text-primary-500 mb-1">Police Check</h4>
                <p className="text-xs text-primary-200 font-medium mb-3">Recent background check, mandatory for all cleaners.</p>
                <FileUploadArea
                  fieldName="policeCheck"
                  title=""
                  description=""
                  placeholder="to Upload PDF/JPEG"
                />
              </div>

              {/* Visa/Work Rights */}
              <FileUploadArea
                fieldName="visaWorkRights"
                title="Visa/Work Rights"
                description="Required if you're on a student or work visa."
                placeholder="to Upload Documents"
              />

              {/* Training Certificates (Optional) */}
              <FileUploadArea
                fieldName="trainingCertificates"
                title="Training Certificates (Optional)"
                description="NDIS/Other certifications if applicable."
                placeholder="to Upload Documents"
              />

              {/* Submit Button */}
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="bg-primary-500 hover:bg-primary-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium py-2 px-2 sm:px-4 sm:py-3 rounded-xl transition-colors duration-200 text-sm sm:text-base cursor-pointer"
                >
                  {isLoading ? 'Submitting Documents...' : 'Submit Documents & Set Availability'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  };

  export default VerifyDocumentsPage;
