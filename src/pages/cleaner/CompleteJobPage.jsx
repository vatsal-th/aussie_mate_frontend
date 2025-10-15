import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import Button from '../../components/Button';
import ArrowLeftIcon from '../../assets/arrow-left.svg';
import UploadCloudIcon from '../../assets/upload-cloud.svg';
import UploadIcon from '../../assets/upload.svg';
import { jobPhotosAPI, jobsAPI } from '../../services/api';
import { handleAPIError } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const CompleteJobPage = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds
  const [needExtraTime, setNeedExtraTime] = useState(false);
  const [uploadedPhotos, setUploadedPhotos] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [afterPhotos, setAfterPhotos] = useState([]);
  const [selectedAfterFiles, setSelectedAfterFiles] = useState([]);
  const [timerCompleted, setTimerCompleted] = useState(false);
  const [beforePhotosUploaded, setBeforePhotosUploaded] = useState(false);
  const [afterPhotosUploaded, setAfterPhotosUploaded] = useState(false);
  const [uploadingBefore, setUploadingBefore] = useState(false);
  const [uploadingAfter, setUploadingAfter] = useState(false);
  const [completingJob, setCompletingJob] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [uploadError, setUploadError] = useState(null);

  useEffect(() => {
    const fetchJobDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch job details from API
        const jobResponse = await jobsAPI.getJobById(jobId);
        const jobData = jobResponse.data || jobResponse;
        
        // If job is NOT started yet, redirect back to in-progress page
        if (jobData.status !== 'in-progress' && jobData.status !== 'started') {
          navigate(`/cleaner/in-progress-job/${jobId}`, { replace: true });
          return;
        }
        
        // Fetch existing photos
        const photosResponse = await jobPhotosAPI.getJobPhotos(jobId);
        const photosData = photosResponse.data || photosResponse;
        
        setJob(jobData);
        
        // Set existing photos
        if (photosData.beforePhotos && photosData.beforePhotos.length > 0) {
          setUploadedPhotos(photosData.beforePhotos);
          setBeforePhotosUploaded(true);
        }
        
        if (photosData.afterPhotos && photosData.afterPhotos.length > 0) {
          setAfterPhotos(photosData.afterPhotos);
          setAfterPhotosUploaded(true);
        }
        
      } catch (error) {
        console.error('Error fetching job details:', error);
        setError(handleAPIError(error));
      } finally {
        setLoading(false);
      }
    };

    if (jobId) {
      fetchJobDetails();
    }
  }, [jobId]);

  useEffect(() => {
    // Check if timer was already completed (from localStorage)
    const savedTimerCompleted = localStorage.getItem(`timerCompleted_${jobId}`);
    if (savedTimerCompleted === 'true') {
      setTimerCompleted(true);
      setTimeLeft(0);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setTimerCompleted(true);
          // Save to localStorage so timer won't show again
          localStorage.setItem(`timerCompleted_${jobId}`, 'true');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [jobId]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimeAgo = (dateString) => {
    if (!dateString) return 'Recently posted';
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));

    if (diffInHours < 1) return 'Posted just now';
    if (diffInHours === 1) return 'Posted 1h ago';
    return `Posted ${diffInHours}hrs ago`;
  };

  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files);
    setSelectedFiles(files);
  };

  const handleAfterFileSelect = (event) => {
    const files = Array.from(event.target.files);
    setSelectedAfterFiles(files);
  };

  const handleUploadPhotos = () => {
    if (selectedFiles.length > 0) {
      // TODO: Upload files to server
      const newPhotos = selectedFiles.map((file, index) => ({
        id: Date.now() + index,
        file,
        url: URL.createObjectURL(file),
        name: file.name,
      }));
      setUploadedPhotos(prev => [...prev, ...newPhotos]);
      setSelectedFiles([]);
    }
  };

  const handleSubmitPhoto = async () => {
    if (selectedFiles.length === 0) {
      setUploadError('Please select at least one photo');
      setTimeout(() => setUploadError(null), 3000);
      return;
    }
    
    try {
      setUploadingBefore(true);
      setUploadError(null);
      
      const response = await jobPhotosAPI.uploadBeforePhotos(jobId, selectedFiles);
      
      if (response.success) {
        setUploadedPhotos(response.data.beforePhotos || []);
        setBeforePhotosUploaded(true);
        setSelectedFiles([]);
        setSuccessMessage('Before photos uploaded successfully!');
        setTimeout(() => setSuccessMessage(null), 3000);
      }
    } catch (error) {
      console.error('Error uploading before photos:', error);
      setUploadError(handleAPIError(error));
      setTimeout(() => setUploadError(null), 5000);
    } finally {
      setUploadingBefore(false);
    }
  };

  const handleCompleteJob = async () => {
    if (!beforePhotosUploaded || !afterPhotosUploaded) {
      setUploadError('Please upload both before and after photos to complete the job');
      setTimeout(() => setUploadError(null), 3000);
      return;
    }

    try {
      setCompletingJob(true);
      setUploadError(null);
      
      // Update job status to completed
      const response = await jobPhotosAPI.updateJobStatus(jobId, 'completed');
      
      if (response.success) {
        // Store completion data for customer notification
        const completedJobData = {
          jobId: jobId,
          cleanerName: user?.name || user?.firstName || "Cleaner", // Use dynamic user data
          jobTitle: job?.title || job?.serviceType || "Cleaning Service",
          completedAt: new Date().toISOString()
        };
        
        // Store in localStorage for customer dashboard to pick up
        localStorage.setItem('recentlyCompletedJob', JSON.stringify(completedJobData));
        
        setSuccessMessage('Job completed successfully! Redirecting...');
        setTimeout(() => {
          navigate('/cleaner-dashboard');
        }, 1500);
      }
    } catch (error) {
      console.error('Error completing job:', error);
      setUploadError(handleAPIError(error));
      setTimeout(() => setUploadError(null), 5000);
    } finally {
      setCompletingJob(false);
    }
  };

  const handleUploadAfterPhotos = () => {
    if (selectedAfterFiles.length > 0) {
      const newPhotos = selectedAfterFiles.map((file, index) => ({
        id: Date.now() + index,
        file,
        url: URL.createObjectURL(file),
        name: file.name,
      }));
      setAfterPhotos(prev => [...prev, ...newPhotos]);
      setSelectedAfterFiles([]);
    }
  };

  const handleSubmitAfterPhoto = async () => {
    if (selectedAfterFiles.length === 0) {
      setUploadError('Please select at least one photo');
      setTimeout(() => setUploadError(null), 3000);
      return;
    }
    
    try {
      setUploadingAfter(true);
      setUploadError(null);
      
      const response = await jobPhotosAPI.uploadAfterPhotos(jobId, selectedAfterFiles);
      
      if (response.success) {
        setAfterPhotos(response.data.afterPhotos || []);
        setAfterPhotosUploaded(true);
        setSelectedAfterFiles([]);
        setSuccessMessage('After photos uploaded successfully!');
        setTimeout(() => setSuccessMessage(null), 3000);
      }
    } catch (error) {
      console.error('Error uploading after photos:', error);
      setUploadError(handleAPIError(error));
      setTimeout(() => setUploadError(null), 5000);
    } finally {
      setUploadingAfter(false);
    }
  };


  if (loading) {
    return (
      <div className="bg-gray-50 min-h-screen">
        <Header />
        <div className="max-w-sm mx-auto sm:max-w-2xl lg:max-w-4xl xl:max-w-6xl p-4">
          <div className="bg-white rounded-2xl p-6 animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-6"></div>
            <div className="space-y-4">
              <div className="h-20 bg-gray-200 rounded"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
              <div className="h-24 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="bg-gray-50 min-h-screen">
        <Header />
        <div className="max-w-sm mx-auto sm:max-w-2xl lg:max-w-4xl xl:max-w-6xl p-4">
          <div className="bg-white rounded-2xl p-6 text-center">
            {error ? (
              <div>
                <p className="text-red-500 mb-4">{error}</p>
                <Button
                  onClick={() => window.location.reload()}
                  variant="primary"
                  className="mr-2"
                >
                  Retry
                </Button>
                <Button
                  onClick={() => navigate(-1)}
                  variant="secondary"
                >
                  Go Back
                </Button>
              </div>
            ) : (
              <p className="text-red-500">Job not found</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  const progressPercentage = ((300 - timeLeft) / 300) * 100;

  return (
    <div className="bg-gray-50 min-h-screen">
      <Header />

      <div className="max-w-sm mx-auto sm:max-w-2xl lg:max-w-4xl xl:max-w-6xl">
        {/* Top Navigation */}
        <div className="flex items-center justify-between py-4 px-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <img src={ArrowLeftIcon} alt="Back" className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-semibold text-primary-500 truncate">
              {job?.title || job?.serviceType || 'Job Details'}
            </h1>
          </div>
        </div>

        <div className="px-4 space-y-4">
          {/* Success Message */}
          {successMessage && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3 animate-fade-in">
              <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-green-700 font-medium">{successMessage}</p>
            </div>
          )}

          {/* Error Message */}
          {uploadError && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3 animate-fade-in">
              <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0">
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <p className="text-red-700 font-medium">{uploadError}</p>
            </div>
          )}

          {/* Job Overview */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-primary-500  mb-1">
              {job?.serviceType || 'Cleaning Service'} — {job?.title?.split(' - ')[1] || job?.location?.address || 'Location'}
            </h2>
          </div>

          {/* Review Property Section - Hide after 5 minutes */}
          {!timerCompleted && (
            <div className="bg-[linear-gradient(126.14deg,_#E9EEFC_-59.36%,_#FFFFFF_73.02%)] rounded-2xl p-6 shadow-sm border border-[#D5DEFA]">
              <div className="mb-4">
              <h3 className="text-lg font-semibold text-primary-500">
                Have you review property?
              </h3>
              <p className="text-sm text-primary-200 font-medium mb-2">
                If yes, are you thinking that it will take extra hours
              </p>
              </div>
              
              <div className="flex items-center mb-4">
                <span className="text-sm font-medium text-primary-500 mr-2">Need extra time?</span>
                <button
                  onClick={() => setNeedExtraTime(!needExtraTime)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer  ${
                    needExtraTime ? 'bg-[#1F6FEB]' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      needExtraTime ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {timeLeft > 0 && (
                <div className="space-y-1">
                  <p className="text-sm text-primary-200 font-medium">
                    You have 5 mins to take your decision
                  </p>
                  <div className="relative">
                    <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                      <div 
                        className="h-4 rounded-full transition-all duration-1000 ease-out relative"
                        style={{ 
                          width: `${progressPercentage}%`,
                          background: 'linear-gradient(45deg, #1EB154 25%, #05C34B 25%, #05C34B 50%, #1EB154 50%, #1EB154 75%, #05C34B 75%, #05C34B)',
                          backgroundSize: '20px 20px',
                          animation: 'progress-stripes 1s linear infinite'
                        }}
                      ></div>
                    </div>
                    <div className="absolute right-0 top-0 -mt-6"> 
                      <span className="text-sm font-semibold text-[#1EB154]">
                        {formatTime(timeLeft)}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Upload Before Photo Section - Hide after upload */}
          {!beforePhotosUploaded && (
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-primary-500 mb-2">Upload Before Photo</h3>
              
              {/* Upload Area */}
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-5 text-center bg-gray-50 mx-auto">
                <div className='rounded-full p-3 bg-primary-200 w-fit mx-auto mb-3'>
                  <img src={UploadCloudIcon} alt="Upload" className="w-8 h-8" />
                </div>
                <p className="text-primary-500 mb-4 font-medium">Select photos/videos to upload</p>
                
                <input
                  type="file"
                  multiple
                  accept="image/*,video/*"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="file-upload"
                />
                
                <label
                  htmlFor="file-upload"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium cursor-pointer transition-colors bg-primary-500 text-white hover:bg-blue-700"
                >
                  Select Files
                  <img src={UploadIcon} alt="Upload" className="w-5 h-5" />
                </label>
              </div>

              {/* Selected Files Preview & Upload */}
              {selectedFiles.length > 0 && (
                <div className="mt-6">
                  <div className="space-y-2 mb-4">
                    {selectedFiles.map((file, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                          <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{file.name}</p>
                          <p className="text-xs text-gray-500">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <button
                    onClick={handleSubmitPhoto}
                    disabled={uploadingBefore}
                    className={`w-full py-3 px-6 rounded-xl font-semibold transition-colors ${
                      uploadingBefore
                        ? 'bg-gray-400 text-white cursor-not-allowed'
                        : 'bg-[#1F6FEB] text-white hover:bg-blue-700'
                    }`}
                  >
                    {uploadingBefore ? 'Uploading...' : `Upload ${selectedFiles.length} Photo${selectedFiles.length > 1 ? 's' : ''}`}
                  </button>
                </div>
              )}

              {/* Successfully Uploaded Photos */}
              {beforePhotosUploaded && uploadedPhotos.length > 0 && (
                <div className="mt-6">
                  <p className="text-sm font-semibold text-green-600 mb-3">✓ Before photos uploaded successfully</p>
                  <div className="grid grid-cols-3 gap-2">
                    {uploadedPhotos.map((photo, index) => (
                      <img
                        key={index}
                        src={photo.url || photo}
                        alt={`Before ${index + 1}`}
                        className="w-full h-20 object-cover rounded-lg"
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Upload After Photo Section - Show after before photos uploaded */}
          {beforePhotosUploaded && !afterPhotosUploaded && (
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-primary-500 mb-2">Upload After Photo</h3>
              
              {/* Upload Area */}
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-5 text-center bg-gray-50 mx-auto">
                <div className='rounded-full p-3 bg-primary-200 w-fit mx-auto mb-3'>
                  <img src={UploadCloudIcon} alt="Upload" className="w-8 h-8" />
                </div>
                <p className="text-primary-500 mb-4 font-medium">Select photos/videos to upload</p>
                
                <input
                  type="file"
                  multiple
                  accept="image/*,video/*"
                  onChange={handleAfterFileSelect}
                  className="hidden"
                  id="after-file-upload"
                />
                
                <label
                  htmlFor="after-file-upload"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium cursor-pointer transition-colors bg-primary-500 text-white hover:bg-blue-700"
                >
                  Select Files
                  <img src={UploadIcon} alt="Upload" className="w-5 h-5" />
                </label>
              </div>

              {/* Selected Files Preview & Upload */}
              {selectedAfterFiles.length > 0 && (
                <div className="mt-6">
                  <div className="space-y-2 mb-4">
                    {selectedAfterFiles.map((file, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                          <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{file.name}</p>
                          <p className="text-xs text-gray-500">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <button
                    onClick={handleSubmitAfterPhoto}
                    disabled={uploadingAfter}
                    className={`w-full py-3 px-6 rounded-xl font-semibold transition-colors ${
                      uploadingAfter
                        ? 'bg-gray-400 text-white cursor-not-allowed'
                        : 'bg-[#1F6FEB] text-white hover:bg-blue-700'
                    }`}
                  >
                    {uploadingAfter ? 'Uploading...' : `Upload ${selectedAfterFiles.length} Photo${selectedAfterFiles.length > 1 ? 's' : ''}`}
                  </button>
                </div>
              )}

              {/* Successfully Uploaded Photos */}
              {afterPhotosUploaded && afterPhotos.length > 0 && (
                <div className="mt-6">
                  <p className="text-sm font-semibold text-green-600 mb-3">✓ After photos uploaded successfully</p>
                  <div className="grid grid-cols-3 gap-2">
                    {afterPhotos.map((photo, index) => (
                      <img
                        key={index}
                        src={photo.url || photo}
                        alt={`After ${index + 1}`}
                        className="w-full h-20 object-cover rounded-lg"
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Bottom Action Button */}
          <div className="flex justify-end pb-6">
            <Button
              onClick={handleCompleteJob}
              variant="secondary"
              className={`px-8 py-4 rounded-xl font-semibold text-lg transition-colors ${
                beforePhotosUploaded && afterPhotosUploaded && !completingJob
                  ? 'bg-gray-200 text-gray-900 hover:bg-gray-300 cursor-pointer'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
              disabled={!beforePhotosUploaded || !afterPhotosUploaded || completingJob}
            >
              {completingJob 
                ? 'Completing Job...'
                : beforePhotosUploaded && afterPhotosUploaded
                ? 'Complete Job'
                : 'Upload Photos to Complete Job'
              }
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompleteJobPage;
