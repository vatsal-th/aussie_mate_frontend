import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import Button from '../../components/Button';
import ArrowLeftIcon from '../../assets/arrow-left.svg';
import UploadCloudIcon from '../../assets/upload-cloud.svg';
import UploadIcon from '../../assets/upload.svg';
import { jobPhotosAPI, jobsAPI } from '../../services/api';
import { handleAPIError } from '../../services/api';

const CompleteJobPage = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
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

  useEffect(() => {
    const fetchJobDetails = async () => {
      try {
        setLoading(true);
        setJob({
          id: jobId,
          title: 'Bond Cleaning - 2 Bed Apartment',
          serviceType: 'Bond Clean',
          estimatedPrice: 220,
          paymentMethod: 'Cash',
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), 
        });
      } catch (error) {
        console.error('Error fetching job:', error);
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
      alert('Please select at least one photo');
      return;
    }
    
    try {
      setUploadingBefore(true);
      
      const response = await jobPhotosAPI.uploadBeforePhotos(jobId, selectedFiles);
      
      if (response.success) {
        setUploadedPhotos(response.data.beforePhotos || []);
        setBeforePhotosUploaded(true);
        setSelectedFiles([]);
        alert('Before photos uploaded successfully!');
      }
    } catch (error) {
      console.error('Error uploading before photos:', error);
      alert(handleAPIError(error));
    } finally {
      setUploadingBefore(false);
    }
  };

  const handleCompleteJob = async () => {
    if (!beforePhotosUploaded || !afterPhotosUploaded) {
      alert('Please upload both before and after photos to complete the job');
      return;
    }

    try {
      setCompletingJob(true);
      
      // Update job status to completed
      const response = await jobPhotosAPI.updateJobStatus(jobId, 'completed');
      
      if (response.success) {
        // Store completion data for customer notification
        const completedJobData = {
          jobId: jobId,
          cleanerName: "John", // This should come from user context
          jobTitle: job?.title || "Cleaning Service",
          completedAt: new Date().toISOString()
        };
        
        // Store in localStorage for customer dashboard to pick up
        localStorage.setItem('recentlyCompletedJob', JSON.stringify(completedJobData));
        
        alert('Job completed successfully!');
        navigate('/cleaner-dashboard');
      }
    } catch (error) {
      console.error('Error completing job:', error);
      alert(handleAPIError(error));
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
      alert('Please select at least one photo');
      return;
    }
    
    try {
      setUploadingAfter(true);
      
      const response = await jobPhotosAPI.uploadAfterPhotos(jobId, selectedAfterFiles);
      
      if (response.success) {
        setAfterPhotos(response.data.afterPhotos || []);
        setAfterPhotosUploaded(true);
        setSelectedAfterFiles([]);
        alert('After photos uploaded successfully!');
      }
    } catch (error) {
      console.error('Error uploading after photos:', error);
      alert(handleAPIError(error));
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
            <p className="text-red-500">Job not found</p>
            <Button
              onClick={() => navigate(-1)}
              variant="primary"
              className="mt-4"
            >
              Go Back
            </Button>
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
              {job.title}
            </h1>
          </div>
        </div>

        <div className="px-4 space-y-4">
          {/* Job Overview */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-primary-500  mb-1">
              {job.serviceType} — {job.title.split(' - ')[1] || 'Apartment'}
            </h2>
            <p className="text-sm text-primary-200 font-medium">{getTimeAgo(job.createdAt)}</p>
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

          {/* Payment Summary Section */}
          <div className="bg-white rounded-2xl px-6 py-3 shadow-sm">
            <h3 className="text-lg font-semibold text-primary-500 mb-4">Payment Summary</h3>
            
            <div className="space-y-1">
              <div className="flex items-center">
                <span className="text-sm text-primary-200 font-medium mr-1">Quoted Price:</span>
                <span className="text-lg font-semibold text-[#1F6FEB]">${job.estimatedPrice}</span>
              </div>
              
              <div className="flex items-center">
                <span className="text-sm text-primary-200 font-medium mr-1">Payment Method:</span>
                <span className="text-sm font-semibold text-[#1F6FEB]">{job.paymentMethod}</span>
              </div>
              
              <p className="text-sm text-primary-200 font-medium leading-relaxed">
                Customer paid $44 (10%) online to platform. $176 (80%) will be paid cash after job.
              </p>
              
              <div className="flex">
                <span className="text-xs font-semibold px-3 py-1 rounded-full bg-[#E4FBED] text-[#1EB154] border border-[#DBF9E7]">
                  Paid
                </span>
              </div>
            </div>
          </div>

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
                  className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium cursor-pointer transition-colors ${
                    uploadingBefore 
                      ? 'bg-gray-400 text-white cursor-not-allowed' 
                      : 'bg-primary-500 text-white hover:bg-blue-700'
                  }`}
                >
                  {uploadingBefore ? 'Uploading...' : 'Upload Here'}
                  <img src={UploadIcon} alt="Upload" className="w-5 h-5" />
                </label>
              </div>

              {/* Uploaded Photos */}
              {uploadedPhotos.length > 0 && (
                <div className="mt-6 space-y-4">
                  {uploadedPhotos.map((photo) => (
                    <div key={photo.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                      <img
                        src={photo.url}
                        alt={photo.name}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{photo.name}</p>
                        <p className="text-xs text-gray-500">
                          {(photo.file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                      <button
                        onClick={() => handleSubmitPhoto(photo.id)}
                        className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-200 transition-colors"
                      >
                        Submit Photo
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Upload After Photo Section - Show after before photos uploaded */}
          {beforePhotosUploaded && (
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-primary-500 mb-4">Upload After Photo</h3>
              
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
                  className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium cursor-pointer transition-colors ${
                    uploadingAfter 
                      ? 'bg-gray-400 text-white cursor-not-allowed' 
                      : 'bg-primary-500 text-white hover:bg-blue-700'
                  }`}
                >
                  {uploadingAfter ? 'Uploading...' : 'Upload Here'}
                  <img src={UploadIcon} alt="Upload" className="w-5 h-5" />
                </label>
              </div>

              {/* Uploaded After Photos */}
              {afterPhotos.length > 0 && (
                <div className="mt-6 space-y-4">
                  {afterPhotos.map((photo) => (
                    <div key={photo.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                      <img
                        src={photo.url}
                        alt={photo.name}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{photo.name}</p>
                        <p className="text-xs text-gray-500">
                          {(photo.file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                      <button
                        onClick={() => handleSubmitAfterPhoto(photo.id)}
                        className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-200 transition-colors"
                      >
                        Submit Photo
                      </button>
                    </div>
                  ))}
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
