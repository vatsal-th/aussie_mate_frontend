  import React, { useEffect } from 'react';
  import { useNavigate } from 'react-router-dom';
  import CompleteIcon from '../assets/complete.svg';
  import CloseIcon from '../assets/close.svg';
  import Button from './Button';

  const JobCompleteModal = ({ isOpen, onClose, cleanerName = "John", jobTitle = "Cleaning Service", jobId = "AM10400" }) => {
    const navigate = useNavigate();

    // Disable scroll when modal is open
    useEffect(() => {
      if (isOpen) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = 'unset';
      }

      // Cleanup function to restore scroll when component unmounts
      return () => {
        document.body.style.overflow = 'unset';
      };
    }, [isOpen]);

    const handleJobComplete = () => {
      onClose();
      navigate(`/job-completed/${jobId}`);
    };

    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 flex items-center justify-center z-50 p-2 sm:p-4" 
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
      >
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl max-w-sm sm:max-w-md w-full mx-2 sm:mx-4 relative">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 sm:top-4 sm:right-4 text-gray-500 hover:text-gray-700 transition-colors cursor-pointer"
          >
            <img src={CloseIcon} alt="Close" className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          {/* Modal Content */}
          <div className="p-4 sm:p-6 lg:p-8 text-center">
            {/* Checkmark Icon */}
            <div className="mb-4 sm:mb-6 flex justify-center">
              <div className="flex items-center justify-center">
                <img src={CompleteIcon} alt="Complete" className="w-20 h-20 sm:w-24 sm:h-24 lg:w-34 lg:h-34" />
              </div>
            </div>

            {/* Title */}
            <h2 className="text-xl sm:text-2xl font-bold text-primary-500 mb-3 sm:mb-4">
              Job Complete?
            </h2>

            {/* Description */}
            <p className="text-sm sm:text-base text-primary-200 font-medium mb-4 sm:mb-6 leading-relaxed px-2">
              Your cleaner {cleanerName} has marked the job as completed. Please confirm.
            </p>

            {/* Action Button */}
            <div className="flex justify-center px-2">
              <Button
                onClick={handleJobComplete}
                variant="primary"
                size="lg"
                className="w-full sm:w-auto text-sm sm:text-base"
              >
                Job Complete
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  export default JobCompleteModal;
