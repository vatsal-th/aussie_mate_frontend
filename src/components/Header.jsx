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
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo and Location */}
        <div className="flex items-center space-x-3">
          <img src={logo} alt="Aussie Mate" className="h-14 w-auto" />
          <div className="flex items-center space-x-2">
            <img src={MapPinIcon} alt="Location" className="w-4 h-4" />
            <div>
              <div className="text-sm font-medium text-gray-900">123 Example Street</div>
              <div className="text-xs text-gray-500">Sydney NSW 200, Australia</div>
            </div>
          </div>
        </div>

        {/* Right Side Icons */}
        <div className="flex items-center space-x-4">
          {/* Notification Icon */}
          <button className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <img src={NotificationIcon} alt="Notifications" className="w-10 h-10" />
          </button>

          {/* Profile Icon */}
          <Link 
            to="/profile" 
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <img src={ProfileIcon} alt="Profile" className="w-6 h-6" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Header;
