import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import CleaningIcon from '../assets/cleaning2.svg';
import PetSittingIcon from '../assets/petSitting2.svg';
import HousekeepingIcon from '../assets/housekeeping2.svg';
import NDISAssistanceIcon from '../assets/NDISAssistance2.svg';
import RetailAuditIcon from '../assets/retailAudit2.svg';
import HandymanIcon from '../assets/handyman2.svg';
import InfoIcon from '../assets/info.svg';

const SelectServicesPage = () => {
  const navigate = useNavigate();
  const [selectedServices, setSelectedServices] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const services = [
    {
      id: 'cleaning',
      name: 'Cleaning',
      icon: CleaningIcon,
      description: 'House cleaning and maintenance'
    },
    {
      id: 'pet-sitting',
      name: 'Pet Sitting',
      icon: PetSittingIcon,
      description: 'Pet care and walking services'
    },
    {
      id: 'housekeeping',
      name: 'Housekeeping',
      icon: HousekeepingIcon,
      description: 'General housekeeping tasks'
    },
    {
      id: 'ndis-assistance',
      name: 'NDIS Assistance',
      icon: NDISAssistanceIcon,
      description: 'Disability support services'
    },
    {
      id: 'retail-audit',
      name: 'Retail Audit',
      icon: RetailAuditIcon,
      description: 'Retail store auditing services'
    },
    {
      id: 'handyman',
      name: 'Handyman',
      icon: HandymanIcon,
      description: 'Repair and maintenance work'
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
      return;
    }

    setIsLoading(true);
    try {
      // Here you would save the selected services
      console.log('Selected services:', selectedServices);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Navigate to next page (e.g., availability or dashboard)
      navigate('/set-availability');
    } catch (error) {
      console.error('Error saving services:', error);
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

        {/* Services Grid */}
        <div className="grid grid-cols-2 gap-4 mb-8 ">
          {services.map((service) => (
            <button
              key={service.id}
              onClick={() => toggleService(service.id)}
              className={`relative p-6 rounded-2xl! border-2 transition-all duration-200 ${
                selectedServices.includes(service.id)
                  ? 'border-[#1F6FEB] bg-primary-50 shadow-md'
                  : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
              }`}
            >
              {/* Service Icon */}
              <div className="flex justify-center mb-3">
                <img 
                  src={service.icon} 
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
        <button
          onClick={handleNext}
          disabled={selectedServices.length === 0 || isLoading}
          className={` w-full py-4 px-4 sm:px-3 lg:px-3 rounded-xl font-semibold text-white transition-colors duration-200 ${
            selectedServices.length === 0 || isLoading
              ? 'bg-gray-300 cursor-not-allowed'
              : 'bg-primary-500 hover:bg-primary-600'
          }`}
        >
            {isLoading ? 'Saving...' : 'Next'}
          </button>
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
