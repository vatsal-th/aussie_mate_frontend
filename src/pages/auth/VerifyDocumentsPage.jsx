import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { UserRound } from 'lucide-react';
import PlusIcon from '../../assets/plus2.svg';
import CloseIcon from '../../assets/close.svg';
import { userAPI } from '../../services/api';
import { FloatingLabelInput, Button, FileUploadArea } from '../../components';
import { createVerifyDocumentsSchema } from '../../utils/validationSchemas';

const VerifyDocumentsPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    profilePicture: null,
    bio: '',
    abnNumber: '',
    policeCheck: null,
    visaWorkRights: null,
    trainingCertificates: null
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [userRole, setUserRole] = useState('');
  const [documentStatus, setDocumentStatus] = useState(null);

  // Create validation schema based on user role
  const validationSchema = useMemo(() => createVerifyDocumentsSchema(userRole), [userRole]);

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
        const responseData = response.data || {};
        const documents = responseData.documents || {};
        const userData = responseData.user || {};

        setDocumentStatus(responseData);

        setFormData(prev => {
          const updatedForm = {
            ...prev,
            abnNumber: documents.abnNumber || '',
            bio: typeof userData.bio === 'string' ? userData.bio : (prev.bio || '')
          };

          const profilePhotoUrl =
            userData?.profilePhoto?.url ||
            userData?.profilePhoto?.secureUrl ||
            userData?.profilePhotoUrl ||
            userData?.profilePictureUrl ||
            userData?.profilePicture ||
            (typeof userData?.profilePhoto === 'string' ? userData.profilePhoto : null);

          if (profilePhotoUrl) {
            updatedForm.profilePicture = {
              preview: profilePhotoUrl,
              fileName: userData?.profilePhoto?.fileName || 'current-profile-photo',
              fileType: userData?.profilePhoto?.fileType || 'image/*',
              fileSize: userData?.profilePhoto?.fileSize || null,
              originalFile: null,
              isExisting: true
            };
          }

          return updatedForm;
        });
      }
    } catch (error) {
      console.error('Error fetching document status:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Special handling for ABN Number - only allow digits and limit to 11 characters
    if (name === 'abnNumber') {
      const digitsOnly = value.replace(/[^\d]/g, '');
      if (digitsOnly.length <= 11) {
        setFormData({
          ...formData,
          [name]: digitsOnly
        });
      }
      return;
    }

    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Handle profile picture upload
  const handleProfilePictureUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        setError('Profile picture size must be less than 5MB');
        return;
      }

      // Validate file type (only images)
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
      if (!allowedTypes.includes(file.type)) {
        setError('Only JPEG, JPG, and PNG images are allowed for profile picture');
        return;
      }

      try {
        const base64 = await convertToBase64(file);
        setFormData(prev => {
          if (prev.profilePicture?.preview && !prev.profilePicture?.isExisting) {
            URL.revokeObjectURL(prev.profilePicture.preview);
          }

          return {
            ...prev,
            profilePicture: {
              file: base64,
              originalFile: file,
              fileName: file.name,
              fileType: file.type,
              fileSize: file.size,
              preview: URL.createObjectURL(file),
              isExisting: false
            }
          };
        });
        setError('');
      } catch (error) {
        setError('Failed to process profile picture. Please try again.');
      }
    }
  };

  // Handle profile picture removal
  const handleRemoveProfilePicture = () => {
    if (formData.profilePicture?.preview && !formData.profilePicture?.isExisting) {
      URL.revokeObjectURL(formData.profilePicture.preview);
    }
    setFormData(prev => ({
      ...prev,
      profilePicture: null
    }));
  };

  // Calculate word count for bio
  const getBioWordCount = () => {
    if (!formData.bio) return 0;
    return formData.bio.trim().split(/\s+/).filter(word => word.length > 0).length;
  };

  const bioWordCount = getBioWordCount();
  const minBioWords = 50;

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
            file: base64,
            originalFile: file,
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
      // Validate using Yup schema
      await validationSchema.validate(formData, { abortEarly: false });

      // Create FormData for file upload (backend expects multipart/form-data)
      const formDataToSend = new FormData();
      formDataToSend.append('abnNumber', formData.abnNumber);

      // Add bio to FormData
      if (formData.bio) {
        formDataToSend.append('bio', formData.bio);
      }

      const documentFields = ['policeCheck', 'visaWorkRights', 'trainingCertificates'];
      const hasNewDocument = documentFields.some(
        field => formData[field]?.originalFile
      );

      if (!hasNewDocument) {
        setError('Please upload at least one document before submitting.');
        setIsLoading(false);
        return;
      }

      // Add files to FormData (use original file objects)
      if (formData.policeCheck?.originalFile) {
        formDataToSend.append('policeCheck', formData.policeCheck.originalFile);
      }

      if (formData.visaWorkRights?.originalFile) {
        formDataToSend.append('visaWorkRights', formData.visaWorkRights.originalFile);
      }

      if (formData.trainingCertificates?.originalFile) {
        formDataToSend.append('trainingCertificates', formData.trainingCertificates.originalFile);
      }

      // Submit documents via API
      const response = await userAPI.uploadDocuments(formDataToSend);

      if (response.success) {
        if (userRole === 'NDIS Assistant') {
          navigate('/cleaner/compliance-quiz');
        } else {
          navigate('/set-availability');
        }
      } else {
        setError(response.message || 'Failed to submit documents. Please try again.');
      }
    } catch (error) {
      // Handle validation errors
      if (error.inner) {
        const firstError = error.inner[0];
        setError(firstError.message);
        setIsLoading(false);
        return;
      }

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


  return (
    <>
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
            {/* Profile Picture Upload */}
            <div className="mb-6">
              <div className="flex justify-center">
                <div className="relative">
                  <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden border-2 border-gray-300">
                    {formData.profilePicture?.preview ? (
                      <img
                        src={formData.profilePicture.preview}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <UserRound className="w-16 h-16 text-gray-400" strokeWidth={2} />
                    )}
                  </div>
                  {/* Add/Change Button */}
                  <button
                    type="button"
                    onClick={() => document.getElementById('profile-picture-input').click()}
                    className="absolute bottom-0 right-0 w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center border-4 border-white shadow-lg hover:锋 bg-primary-600 transition-colors cursor-pointer z-10"
                  >
                    <img src={PlusIcon} alt="Add" className="w-5 h-5" />
                  </button>
                  {/* Remove Button - Show only when image is uploaded */}
                  {formData.profilePicture?.preview && (
                    <button
                      type="button"
                      onClick={handleRemoveProfilePicture}
                      className="absolute top-0 right-0 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center border-2 border-white shadow-lg hover:bg-red-600 transition-colors cursor-pointer z-10"
                    >
                      <img src={CloseIcon} alt="Remove" className="w-4 h-4" />
                    </button>
                  )}
                  <input
                    id="profile-picture-input"
                    type="file"
                    accept="image/jpeg,image/jpg,image/png"
                    onChange={handleProfilePictureUpload}
                    className="hidden"
                  />
                </div>
              </div>
            </div>

            {/* Bio Section */}
            <div className="mb-6">
              <h3 className="text-base font-semibold text-primary-500 mb-3">Bio</h3>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                placeholder="Tell us about your profession..."
                rows={6}
                className="w-full px-4 py-3 border border-gray-300 rounded-2xl! focus:outline-none text-primary-500 placeholder:text-primary-200 resize-none"
              />
              <div className="flex justify-between items-center mt-2">
                <p className={`text-xs font-medium ${bioWordCount < minBioWords ? 'text-primary-500' : 'text-primary-200'}`}>
                  Minimum {minBioWords} words
                </p>
                <p className={`text-xs font-medium ${bioWordCount < minBioWords ? 'text-primary-500' : 'text-primary-500'}`}>
                  {bioWordCount} {bioWordCount === 1 ? 'word' : 'words'}
                </p>
              </div>
            </div>

            {/* ABN Number */}
            <div className="mb-6">
              <FloatingLabelInput
                id="abnNumber"
                name="abnNumber"
                label="ABN Number (11-digit)"
                type="text"
                value={formData.abnNumber}
                onChange={handleInputChange}
                placeholder=""
                maxLength={11}
                required
              />
              <p className="text-sm text-primary-200 font-medium mt-1">
                Your ABN is used for tax and compliance. Auto verification is instant.
              </p>
            </div>

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
                onFileSelect={handleFileUpload}
                selectedFile={formData.policeCheck}
                className="mb-0!"
              />
            </div>
            <p className="text-sm text-primary-200 font-medium">
            Apply for a Police Clearance Certificate here if you don’t already have one.
              <Link to="https://www.afp.gov.au/our-services/national-police-checks" target="_blank" className="text-[#1F6FEB] hover:text-[#1F6FEB] font-medium underline cursor-pointer block">https://www.afp.gov.au/our-services/national-police-checks</Link>
            </p>


            {/* Visa/Work Rights */}
            <FileUploadArea
              fieldName="photoId"
              title="Photo ID"
              description="To verify your identity. Accepted: Passport /  Driver's License / Visa / Others."
              placeholder="to Upload Documents"
              onFileSelect={handleFileUpload}
              selectedFile={formData.photoId}
            />

            {/* Training Certificates (Optional) */}
            <FileUploadArea
              fieldName="trainingCertificates"
              title="Training Certificates (Optional)"
              description="NDIS/Other certifications if applicable."
              placeholder="to Upload Documents"
              onFileSelect={handleFileUpload}
              selectedFile={formData.trainingCertificates}
            />

            {/* Submit Button */}
            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={isLoading}
                loading={isLoading}
                size="md"
                className="px-2 sm:px-4"
              >
                {userRole === 'NDIS Assistant'
                  ? 'Submit Documents & Start Quiz'
                  : 'Submit Documents & Set Availability'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default VerifyDocumentsPage;
