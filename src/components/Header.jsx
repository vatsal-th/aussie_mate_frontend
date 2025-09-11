import React from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/logo.png';
import ProfileIcon from '../assets/Profile.svg';
import NotificationIcon from '../assets/notification.svg';
import MapPinIcon from '../assets/map-pin 1.png';

const Header = () => {
  return (
    <div className="bg-white border-b border-gray-200">
      {/* Main Header */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2 sm:py-3 flex items-center justify-between">
        {/* Logo and Location */}
        <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
          <img src={logo} alt="Aussie Mate" className="h-10 sm:h-12 md:h-14 w-auto flex-shrink-0" />
          <div className="flex items-center space-x-1 sm:space-x-2 min-w-0">
            <img src={MapPinIcon} alt="Location" className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
            <div className="min-w-0">
              <div className="text-xs sm:text-sm font-medium text-primary-500 truncate">123 Example Street</div>
              <div className="text-xs text-primary-200 truncate hidden sm:block">Sydney NSW 200, Australia</div>
            </div>
          </div>
        </div>

        {/* Right Side Icons */}
        <div className="flex items-center space-x-2 sm:space-x-4 flex-shrink-0">
          {/* Notification Icon */}
          <button className="relative p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <img src={NotificationIcon} alt="Notifications" className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10" />
          </button>

          {/* Profile Icon */}
          <Link 
            to="/profile" 
            className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <img src={ProfileIcon} alt="Profile" className="w-5 h-5 sm:w-6 sm:h-6" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Header;
