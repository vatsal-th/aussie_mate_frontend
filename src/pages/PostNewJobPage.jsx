import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import CardBG2 from '../assets/CardBG2.png';
import CardBG3 from '../assets/CardBG3.png';
import CardBG4 from '../assets/CardBG4.png';
import CleaningImage from '../assets/Cleaning.png';
import HandymanImage from '../assets/Handyman.png';
import HousekeepingImage from '../assets/Housekeeping.png';
import PetSittingImage from '../assets/Pet Sitting.png';
import NDISSupportImage from '../assets/NDIS Support.png';
import RetailAuditorImage from '../assets/Retail Auditor.png';
import ArrowLeftIcon from '../assets/arrow-left.svg';

const PostNewJobPage = () => {
  const navigate = useNavigate();

  const handleServiceClick = (serviceId) => {
    navigate(`/job-details/${serviceId}`);
  };

  const serviceCategories = [
    {
      id: 'cleaning',
      name: 'Cleaning',
      image: CleaningImage,
      description: 'Professional cleaning services'
    },
    {
      id: 'housekeeping',
      name: 'Housekeeping',
      image: HousekeepingImage,
      description: 'Complete housekeeping solutions'
    },
    {
      id: 'ndis',
      name: 'NDIS Support',
      image: NDISSupportImage,
      description: 'NDIS support services'
    },
    {
      id: 'retail',
      name: 'Retail Auditor',
      image: RetailAuditorImage,
      description: 'Retail auditing services'
    },
    {
      id: 'petsitting',
      name: 'Pet Sitting',
      image: PetSittingImage,
      description: 'Pet care and sitting'
    },
    {
      id: 'handyman',
      name: 'Handyman',
      image: HandymanImage,
      description: 'Repair and maintenance'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Header Section */}
        <div className="flex items-center mb-6">
          <Link to="/customer-dashboard" className="mr-4">
            <img src={ArrowLeftIcon} alt="Back" className="w-6 h-6" />
          </Link>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Post New Job</h1>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-custom">
          {/* Title and Description */}
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
              What do you need help with today?
            </h2>
            <p className="text-gray-600 text-base sm:text-lg">
              Pick a service to get started with hassle-free cleaning today.
            </p>
          </div>

          {/* Service Categories Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
            {serviceCategories.map((service) => (
              <div
                key={service.id}
                onClick={() => handleServiceClick(service.id)}
                className="relative bg-white border border-gray-200 rounded-3xl p-3 sm:p-6 text-center hover:shadow-custom-5 transition-shadow cursor-pointer overflow-hidden shadow-custom"
              >
                {/* Top-left background image */}
                <div className="absolute top-0 left-0 w-20 h-24 overflow-hidden rounded-tl-2xl">
                  <img src={CardBG3} alt="Card Background" className="w-full h-full object-cover" />
                </div>
                
                {/* Top-right background image */}
                <div className="absolute top-0 right-0 w-20 h-24 overflow-hidden rounded-tr-2xl">
                  <img src={CardBG2} alt="Card Background" className="w-full h-full object-cover" />
                </div>
                
                {/* Bottom-left background image */}
                <div className="absolute bottom-0 left-0 w-20 h-24 overflow-hidden rounded-bl-2xl">
                  <img src={CardBG4} alt="Card Background" className="w-full h-full object-cover" />
                </div>
                
                {/* Service Image */}
                <div className="relative z-10 mb-2 flex justify-center">
                  <img 
                    src={service.image} 
                    alt={service.name}
                    className="w-12 h-12 sm:w-20 sm:h-20 object-contain"
                  />
                </div>
                
                {/* Service Name */}
                <div className="relative z-10 text-xs sm:text-lg font-medium text-gray-900">{service.name}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostNewJobPage;
