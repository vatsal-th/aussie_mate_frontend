import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import Button from '../../components/Button';
import CleaningIcon from '../../assets/cleaning2.svg';
import PetSittingIcon from '../../assets/petSitting2.svg';
import HousekeepingIcon from '../../assets/housekeeping2.svg';
import NDISAssistanceIcon from '../../assets/NDISAssistance2.svg';
import RetailAuditIcon from '../../assets/retailAudit2.svg';
import HandymanIcon from '../../assets/handyman2.svg';
import InfoIcon from '../../assets/info.svg';
import { userAPI } from '../../services/api';

const SelectServicesPage = () => {
  const navigate = useNavigate();
  const [selectedServices, setSelectedServices] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Icon mapping for services
  const serviceIcons = {
    'cleaning': CleaningIcon,
    'pet-sitting': PetSittingIcon,
    'housekeeping': HousekeepingIcon,
    'ndis-assistance': NDISAssistanceIcon,
    'retail-audit': RetailAuditIcon,
    'handyman': HandymanIcon
  };

  // Hardcoded services array
  const services = [
    {
      id: 'cleaning',
      name: 'Cleaning'
    },
    {
      id: 'pet-sitting',
      name: 'Pet Sitting'
    },
    {
      id: 'housekeeping',
      name: 'Housekeeping'
    },
    {
      id: 'ndis-assistance',
      name: 'NDIS Assistance'
    },
    {
      id: 'retail-audit',
      name: 'Retail Audit'
    },
    {
      id: 'handyman',
      name: 'Handyman'
    }
  ];

  const toggleService = (serviceId) => {
    setSelectedServices(prev => 
      prev.includes(serviceId) 
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  const handleNext = async () => {
    if (selectedServices.length === 0) {
      setError('Please select at least one service.');
      return;
    }

    setIsLoading(true);
    setError('');
    
    try {
      // Prepare services data for API - backend expects array of service names
      const servicesData = selectedServices;

      // Save selected services via API
      const response = await userAPI.saveUserServices(servicesData);
      
      if (response.success) {
        // Navigate to cleaner dashboard
        navigate('/cleaner-dashboard');
      } else {
        setError(response.message || 'Failed to save services. Please try again.');
      }
    } catch (error) {
      console.error('Error saving services:', error);
      setError('Failed to save services. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-xl mx-auto px-4 py-6 sm:px-6 lg:px-8 bg-white rounded-2xl shadow-custom mt-6">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-xl sm:text-3xl font-semibold text-primary-500 mb-2">
            Select Services You Provide
          </h1>
          <p className="text-primary-200 font-medium text-sm sm:text-base" >
            You can always add or remove services later.
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Services Grid */}
        <div className="grid grid-cols-2 gap-4 mb-8 ">
          {services.map((service) => (
              <button
                key={service.id}
                onClick={() => toggleService(service.id)}
                className={`relative p-6 rounded-2xl! border-2 transition-all duration-200 cursor-pointer ${
                  selectedServices.includes(service.id)
                    ? 'border-[#1F6FEB] bg-primary-50 shadow-md'
                    : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                }`}
              >
                {/* Service Icon */}
                <div className="flex justify-center mb-3">
                  <img 
                    src={serviceIcons[service.id]} 
                    alt={service.name}
                    className="w-12 h-12"
                  />
                </div>
                
                {/* Service Name */}
                <h3 className={`text-center font-semibold text-sm sm:text-lg ${
                  selectedServices.includes(service.id)
                    ? 'text-primary-500'
                    : 'text-gray-900'
                }`}>
                  {service.name}
                </h3>


                {/* Selection Indicator */}
                {selectedServices.includes(service.id) && (
                  <div className="absolute top-2 right-2 w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </button>
            ))}
        </div>
 
        {/* Next Button */}
        <div className="flex justify-end">
        <Button
          onClick={handleNext}
          disabled={selectedServices.length === 0 || isLoading}
          loading={isLoading}
          fullWidth
          size="lg"
        >
            Next
          </Button>
        </div>

        {/* Info Section */}
        <div className="flex items-center justify-center mt-6 gap-1">
          <img src={InfoIcon} alt="Info" className="w-4 h-4" />
          <p className="text-xs sm:text-sm text-primary-200 font-medium text-center">
            Selecting multiple services increases your chances of getting jobs.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SelectServicesPage;
