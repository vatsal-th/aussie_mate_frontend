import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { userAPI, jobsAPI, matePointsAPI } from '../services/api';
import EditIcon from '../assets/edit.svg';
import HelpIcon from '../assets/help.svg';
import InvoiceIcon from '../assets/invoice.svg';
import JobIcon from '../assets/job2.svg';
import LogoutIcon from '../assets/logout.svg';
import MailIcon from '../assets/mail.svg';
import NotificationIcon from '../assets/notification2.svg';
import PhoneIcon from '../assets/phone.svg';
import StarIcon from '../assets/star.svg';
import WalletIcon from '../assets/wallet.svg';
import RightIcon from '../assets/right.svg';
import ArrowLeftIcon from '../assets/arrow-left.svg';
import Header from '../components/Header';
import ProfileBG from '../assets/CardBG7.png';
import ProfileIcon from '../assets/profileEdit.svg';
import ProfileCalendarIcon from '../assets/profileAvailability.svg';
import VerifyDocumentsIcon from '../assets/invoice.svg';
import EarningsIcon from '../assets/profileDollar.svg';


const ProfilePage = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [userProfile, setUserProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [jobStats, setJobStats] = useState({ completed: 0, reviews: 0 });
    const [matePoints, setMatePoints] = useState(0);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        if (user) {
          const response = await userAPI.getProfile();
          if (response.success) {
            // Ensure profilePhoto is available in the response
            if (response.data?.user && !response.data.user.profilePhoto) {
              const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
              if (storedUser.profilePhoto) {
                response.data.user.profilePhoto = storedUser.profilePhoto;
              }
            }
            setUserProfile(response.data);
          }
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };

    const fetchJobStats = async () => {
      try {
        if (user) {
          // Try different API endpoints to get jobs
          let jobsResponse;
          let jobs = [];
          
          try {
            // First try getCustomerJobs
            jobsResponse = await jobsAPI.getCustomerJobs(user.id || user._id);
            if (jobsResponse.success) {
              jobs = jobsResponse.data.jobs || jobsResponse.data || [];
            }
          } catch (e) {
            // getCustomerJobs failed, will try getAllJobs
          }
          
          // If no jobs from getCustomerJobs, try getAllJobs with completed filter
          if (jobs.length === 0) {
            try {
              jobsResponse = await jobsAPI.getAllJobs({ status: 'completed' });
              if (jobsResponse.success) {
                jobs = jobsResponse.data.jobs || jobsResponse.data || [];
              }
            } catch (e) {
              // getAllJobs with completed filter failed, trying all jobs
              jobsResponse = await jobsAPI.getAllJobs();
              if (jobsResponse.success) {
                jobs = jobsResponse.data.jobs || jobsResponse.data || [];
              }
            }
          }
          
          // Check different possible status values
          const completedJobs = jobs.filter(job => 
            job.status === 'completed' || 
            job.status === 'Completed' || 
            job.status === 'COMPLETED' ||
            job.jobStatus === 'completed' ||
            job.jobStatus === 'Completed'
          ).length;
          
          setJobStats(prev => ({ ...prev, completed: completedJobs }));
        }
      } catch (error) {
        console.error('Error fetching job stats:', error);
        // Set a fallback value
        setJobStats(prev => ({ ...prev, completed: 0 }));
      }
    };

    const fetchMatePoints = async () => {
      try {
        const pointsResponse = await matePointsAPI.getPoints();
        if (pointsResponse.success) {
          setMatePoints(pointsResponse.data.points || 0);
        }
      } catch (error) {
        console.error('Error fetching mate points:', error);
      }
    };

    fetchProfile();
    fetchJobStats();
    fetchMatePoints();

    // Listen for user updates
    const handleUserUpdate = () => {
      // Update user from localStorage
      const updatedUser = JSON.parse(localStorage.getItem('user') || 'null');
      if (updatedUser) {
        setUserProfile(updatedUser);
        // Force re-render by updating state
        setLoading(false);
      }
      fetchProfile();
    };

    window.addEventListener('userUpdated', handleUserUpdate);

    return () => {
      window.removeEventListener('userUpdated', handleUserUpdate);
    };
  }, [user]);

  // Listen for user context changes
  useEffect(() => {
    if (user) {
      // Check if profilePhoto is missing and add it from localStorage if available
      if (!user.profilePhoto && localStorage.getItem('user')) {
        const storedUser = JSON.parse(localStorage.getItem('user'));
        if (storedUser.profilePhoto) {
          const updatedUser = { ...user, profilePhoto: storedUser.profilePhoto };
          setUserProfile(updatedUser);
          return;
        }
      }
      
      setUserProfile(user);
    }
  }, [user]);

    const handleLogout = () => {
        setShowLogoutModal(true);
    };

    const confirmLogout = async () => {
        logout();
        await new Promise(resolve => setTimeout(resolve, 100));
        navigate('/');
    };

    const cancelLogout = () => {
        setShowLogoutModal(false);
    };

    const handleEditProfile = () => {
        navigate('/edit-profile');
    };

    const handleNavigation = (path) => {
        navigate(path);
    };

    const profileMenuItems = [
        { icon: ProfileIcon, label: 'Edit Profile', path: '/edit-profile' },
        
        // Customer-only menu items
        ...(user?.role === 'Customer' ? [{ icon: JobIcon, label: 'My Jobs', path: '/my-jobs' }] : []),
        ...(user?.role === 'Customer' ? [{ icon: WalletIcon, label: 'Wallet & Payments', path: '/wallet' }] : []),
        ...(user?.role === 'Customer' ? [{ icon: StarIcon, label: 'MatePoints & Rewards', path: '/rewards' }] : []),
        ...(user?.role === 'Customer' ? [{ icon: InvoiceIcon, label: 'Invoices & History', path: '/invoices' }] : []),
        
        // Cleaner-only menu items
        ...(user?.role !== 'Customer' ? [{ icon: VerifyDocumentsIcon, label: 'Verification & Documents', path: '/verification' }] : []),
        ...(user?.role !== 'Customer' ? [{ icon: EarningsIcon, label: 'Payments & Payouts', path: '/payments' }] : []),
        ...(user?.role !== 'Customer' ? [{ icon: ProfileCalendarIcon, label: 'Availability & Geo-fencing', path: '/availability' }] : []),
        
        // Common menu items for all users
        { icon: NotificationIcon, label: 'Notifications Settings', path: '/notifications-settings' },
        { icon: HelpIcon, label: 'Help & Support', path: '/help' },
    ];

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <Header />

            {/* My Profile Header */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center h-16">
                        <button
                            onClick={() => navigate(-1)}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                        >
                            <img src={ArrowLeftIcon} alt="Back" className="w-6 h-6" />
                        </button>
                        <h1 className="text-xl ml-4 font-semibold text-gray-900">My Profile</h1>
                    </div>
                </div>

            <div className="max-w-7xl mx-auto py-4 sm:py-6 lg:py-8 pt-0! px-4 sm:px-6 lg:px-8">
                {/* Profile and Statistics Container */}
                <div className=" grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6" >
                    {/* Profile Information Card */}
                    <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6 lg:p-8 relative overflow-hidden flex-1 w-full justify-center items-center">
                        {/* Background Image */}
                        <div
                            className="absolute top-0 right-0 w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 lg:w-56 lg:h-56 bg-cover bg-center bg-no-repeat z-0"
                            style={{ backgroundImage: `url(${ProfileBG})` }}
                        ></div>

                        <div className="relative z-10 flex flex-row items-center space-x-4 sm:space-x-6 lg:space-x-8">
                            {/* Profile Picture */}
                            <div className="relative">
                                <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 lg:w-28 lg:h-28 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                                    {(() => {
                                        const profileImage = user?.profilePhoto?.url || 
                                                           user?.profilePhoto?.secureUrl || 
                                                           user?.profilePicture || 
                                                           userProfile?.user?.profilePhoto?.url ||
                                                           userProfile?.user?.profilePhoto?.secureUrl ||
                                                           userProfile?.profilePicture || 
                                                           userProfile?.profilePhoto?.url || 
                                                           userProfile?.profilePhoto?.secureUrl;
                                        
                                        if (profileImage) {
                                            return (
                                                <img
                                                    src={profileImage}
                                                    alt="Profile"
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => {
                                                        e.target.style.display = 'none';
                                                    }}
                                                />
                                            );
                                        } else {
                                            return (
                                                <div className="w-full h-full bg-primary-500 flex items-center justify-center">
                                                    <span className="text-white text-lg sm:text-xl md:text-2xl lg:text-3xl font-semibold">
                                                        {(user?.firstName || user?.name || 'U').charAt(0).toUpperCase()}
                                                    </span>
                                                </div>
                                            );
                                        }
                                    })()}
                                </div>
                                <button
                                    onClick={handleEditProfile}
                                    className="absolute bottom-1 -right-1 w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 bg-white rounded-full shadow-md flex items-center justify-center hover:bg-gray-50 transition-colors shodw-custom cursor-pointer"
                                >
                                    <img src={EditIcon} alt="Edit" className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-6 md:h-6" />
                                </button>
                            </div>

                            {/* User Details */}
                            <div className="flex-1 min-w-0">
                                <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-primary-500 mb-2 sm:mb-3 capitalize">
                                    {userProfile?.firstName || user?.firstName || user?.name || 'User Name'}
                                </h2>

                                <div className="space-y-2 sm:space-y-3">
                                    <div className="flex items-center space-x-2 sm:space-x-3">
                                        <img src={MailIcon} alt="Email" className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-gray-500 flex-shrink-0" />
                                        <span className="text-xs sm:text-sm md:text-base text-primary-200 truncate font-medium">
                                            {userProfile?.email || user?.email || 'user@example.com'}
                                        </span>
                                    </div>

                                    <div className="flex items-center space-x-2 sm:space-x-3">
                                        <img src={PhoneIcon} alt="Phone" className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-gray-500 flex-shrink-0" />
                                        <span className="text-xs sm:text-sm md:text-base text-primary-200 font-medium">
                                            {userProfile?.phone || user?.phone || user?.phoneNumber }
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Statistics Card - Only for Customers */}
                    {user?.role === 'Customer' && (
                        <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6 lg:p-8 flex-1">
                            <div className="grid grid-cols-3 gap-3 sm:gap-4 md:gap-6">
                                <div className="text-center border-r border-gray-200 ">
                                    <div className="flex justify-center mb-1 sm:mb-2 ">
                                        <img src={StarIcon} alt="Reviews" className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10" style={{ filter: 'brightness(0) saturate(100%) invert(27%) sepia(96%) saturate(1456%) hue-rotate(210deg) brightness(95%) contrast(101%)' }} />
                                    </div>
                                    <div className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-primary-500 mb-1">{jobStats.reviews}</div>
                                    <div className="text-[10px] sm:text-xs md:text-sm text-primary-200 font-medium">Reviews</div>
                                </div>

                                <div className="text-center border-r border-gray-200">
                                    <div className="flex justify-center mb-1 sm:mb-2">
                                        <img src={JobIcon} alt="Jobs" className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10" style={{ filter: 'brightness(0) saturate(100%) invert(27%) sepia(96%) saturate(1456%) hue-rotate(210deg) brightness(95%) contrast(101%)' }} />
                                    </div>
                                    <div className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-primary-500 mb-1">{jobStats.completed}</div>
                                    <div className="text-[10px] sm:text-xs md:text-sm text-primary-200 font-medium">Jobs Completed</div>
                                </div>

                                <div className="text-center">
                                    <div className="flex justify-center mb-1 sm:mb-2">
                                        <img src={WalletIcon} alt="MatePoints" className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10" style={{ filter: 'brightness(0) saturate(100%) invert(27%) sepia(96%) saturate(1456%) hue-rotate(210deg) brightness(95%) contrast(101%)' }} />
                                    </div>
                                    <div className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-primary-500 mb-1">{matePoints}</div>
                                    <div className="text-[10px] sm:text-xs md:text-sm text-primary-200 font-medium">MatePoints</div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>



                {/* Navigation Menu */}
                <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                    {profileMenuItems.map((item, index) => (
                        <button
                            key={index}
                            onClick={() => handleNavigation(item.path)}
                            className="w-full flex items-center justify-between p-3 sm:p-4 md:p-6 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0 cursor-pointer"
                        >
                             <div className="flex items-center space-x-3 sm:space-x-4">                            
                         <img src={item.icon} alt={item.label} className=" flex-shrink-0 text-primary-500" />
                                <span className="text-xs sm:text-sm md:text-base font-medium text-primary-500">
                                    {item.label}
                                </span>
                            </div>
                            <img src={RightIcon} alt="Arrow" className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 flex-shrink-0" />
                        </button>
                    ))}

                    {/* Logout Button */}
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-between p-3 sm:p-4 md:p-6 hover:bg-red-50 transition-colors text-red-600 cursor-pointer"
                    >
                        <div className="flex items-center space-x-3 sm:space-x-4">
                            <img src={LogoutIcon} alt="Logout" className=" flex-shrink-0 text-red-600" />
                            <span className="text-xs sm:text-sm md:text-base font-medium">
                                Logout
                            </span>
                        </div>
                        <img src={RightIcon} alt="Arrow" className="w-4 h-4 sm:w-5 sm:h-5 text-red-400 flex-shrink-0" />
                    </button>
                </div>
            </div>

            {/* Logout Confirmation Modal */}
            {showLogoutModal && (
                <div className="fixed inset-0 flex items-center justify-center z-50 p-4" 
                style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
                >
                    <div className="bg-white rounded-2xl p-6 w-full max-w-sm mx-auto shadow-custom border border-gray-200">
                        <h2 className="text-xl font-semibold text-primary-500 mb-4 text-center">
                            Logout?
                        </h2>
                        <p className="text-primary-200 font-medium text-center mb-6">
                            Are you sure you want to log out of your account?
                        </p>
                        <div className="flex space-x-3">
                            <button
                                onClick={cancelLogout}
                                className="flex-1 bg-[#E5E7EB] hover:bg-gray-300 text-gray-800 font-medium py-3 px-4 rounded-xl transition-colors cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmLogout}
                                className="flex-1 bg-primary-500 hover:bg-primary-600 text-white font-medium py-3 px-4 rounded-xl transition-colors cursor-pointer"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProfilePage;
