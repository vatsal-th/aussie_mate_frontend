import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import Button from '../../components/Button';
import MapWithPolyline from '../../components/MapWithPolyline';
import ArrowLeftIcon from '../../assets/arrow-left.svg';
import CalendarIcon from '../../assets/Calendar.svg';
import MapPinIcon from '../../assets/map-pin 1.png';
import MapPinIcon1 from '../../assets/location.svg';
import PhoneIcon from '../../assets/phone.svg';
import PhoneIcon1 from '../../assets/phone2.svg';
import ChatIcon from '../../assets/message2.svg';
import { jobsAPI, userAPI } from '../../services/api';
import { paymentService } from '../../services/paymentService';
import { socketService } from '../../services/socketService';


const InProgressJobDetailsPage = () => {
    const { jobId } = useParams();
    const navigate = useNavigate();
    const [job, setJob] = useState(null);
    const [paymentStatus, setPaymentStatus] = useState(null);
    const [loading, setLoading] = useState(true);
    const [customer, setCustomer] = useState(null);
    const [error, setError] = useState('');
    const [showMap, setShowMap] = useState(false);
    const [routeInfo, setRouteInfo] = useState(null);
    const [isNearCustomer, setIsNearCustomer] = useState(false);
    const [cleanerLocation, setCleanerLocation] = useState(null);
    const [customerLocation, setCustomerLocation] = useState(null);
    const [isTrackingLocation, setIsTrackingLocation] = useState(false);
    const [locationError, setLocationError] = useState(null);
    const cleanerLocationRef = useRef(null);

    useEffect(() => {
        const fetchJobDetails = async () => {
            try {
                setLoading(true);

                // Fetch job details and payment history in parallel
                const [jobResponse, paymentResponse] = await Promise.all([
                    jobsAPI.getJobById(jobId),
                    paymentService.getPaymentHistory().catch(() => null)
                ]);

                if (jobResponse.success && jobResponse.data) {
                    // If job is already started (in-progress), redirect to complete job page
                    if (jobResponse.data.status === 'in_progress' || 
                        jobResponse.data.status === 'in-progress' || 
                        jobResponse.data.status === 'started') {
                        navigate(`/cleaner/complete-job/${jobId}`, { replace: true });
                        return;
                    }

                    setJob(jobResponse.data);

                    // Set customer location from job data
                    const coords = jobResponse.data.location?.coordinates;
                    if (coords) {
                        let lat, lng;
                        if (typeof coords === 'string') {
                            const coordsArr = coords.split(',').map(coord => parseFloat(coord.trim()));
                            lat = coordsArr[1];
                            lng = coordsArr[0];
                        } else if (coords.lat && coords.lng) {
                            lat = coords.lat;
                            lng = coords.lng;
                        } else if (Array.isArray(coords)) {
                            lat = coords[1];
                            lng = coords[0];
                        }

                        if (lat && lng && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
                            setCustomerLocation({ lat, lng });
                        } else if (lat && lng && (lat > 90 || lat < -90)) {
                            setCustomerLocation({ lat: lng, lng: lat });
                        }
                    }

                    // Use the customerId from job data
                    const customerId = jobResponse.data.customerId ||
                        jobResponse.data.userId ||
                        jobResponse.data.createdBy ||
                        jobResponse.data.customer?._id ||
                        jobResponse.data.customerRef ||
                        jobResponse.data.owner ||
                        jobResponse.data.postedBy;

                    if (customerId) {
                        try {
                            const customerResponse = await userAPI.getUserById(customerId);
                            if (customerResponse.success) {
                                setCustomer(customerResponse.data.user);
                            }
                        } catch (customerError) {
                            console.error('Error fetching customer:', customerError);
                        }
                    }
                } else {
                    setError('Job not found');
                }

                if (paymentResponse) {
                    setPaymentStatus(paymentResponse);
                }
            } catch (err) {
                setError('Failed to load job details');
                console.error('Error fetching job:', err);
            } finally {
                setLoading(false);
            }
        };

        if (jobId) {
            fetchJobDetails();
        }
    }, [jobId]);

    const handleGetDirections = () => {
        setShowMap(!showMap);
    };

    // Haversine formula to calculate distance between two coordinates in meters
    const getDistance = (lat1, lon1, lat2, lon2) => {
        const R = 6371e3;
        const φ1 = lat1 * Math.PI / 180;
        const φ2 = lat2 * Math.PI / 180;
        const Δφ = (lat2 - lat1) * Math.PI / 180;
        const Δλ = (lon2 - lon1) * Math.PI / 180;

        const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return R * c; // Distance in meters
    };

 useEffect(() => {
        if (cleanerLocation && customerLocation) {
            const distance = getDistance(
                cleanerLocation.lat,
                cleanerLocation.lng,
                customerLocation.lat,
                customerLocation.lng
            );

            const near = distance <= 100;
            setIsNearCustomer(near);
        }
    }, [cleanerLocation, customerLocation]);

    // Auto-redirect if job is already in progress
    useEffect(() => {
        if (job?.status === 'in_progress' || job?.status === 'in-progress' || job?.status === 'started') {
            navigate(`/cleaner/complete-job/${jobId}`, { replace: true });
        }
    }, [job?.status, jobId, navigate]);

    // Socket connection and location tracking
    useEffect(() => {
        if (!jobId || !job) return;

        // Connect to socket
        const token = localStorage.getItem('authToken');
        if (token && !socketService.isConnected) {
            socketService.connect(token);
        }

        // Wait for socket connection before joining room
        const connectionTimeout = setTimeout(() => {
            if (socketService.isConnected) {
                socketService.joinJobRoom(jobId);
            }
        }, 1000);

        // Start location tracking
        let watchId;
        let locationInterval;

        const startLocationTracking = () => {
            if (!navigator.geolocation) {
                setLocationError('Geolocation is not supported by your browser');
                console.error('❌ Geolocation not supported');
                return;
            }

            setIsTrackingLocation(true);

            // Real GPS tracking
            watchId = navigator.geolocation.watchPosition(
                (position) => {
                    const newLocation = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    };
                    setCleanerLocation(newLocation);
                    cleanerLocationRef.current = newLocation;
                },
                (error) => {
                    console.error('❌ Geolocation error:', error);
                    setLocationError(error.message);
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 0
                }
            );

            // Send location updates every 10 seconds
            locationInterval = setInterval(() => {
                const currentLocation = cleanerLocationRef.current;
                if (currentLocation && socketService.isConnected) {
                    socketService.updateCleanerLocation(
                        currentLocation.lat,
                        currentLocation.lng,
                        jobId
                    );
                }
            }, 10000); // Every 10 seconds
        };

        // Start tracking after a short delay to ensure everything is loaded
        const trackingTimeout = setTimeout(startLocationTracking, 1500);

        // Cleanup
        return () => {
            clearTimeout(connectionTimeout);
            clearTimeout(trackingTimeout);

            if (watchId) {
                navigator.geolocation.clearWatch(watchId);
            }

            if (locationInterval) {
                clearInterval(locationInterval);
            }

            if (socketService.isConnected && jobId) {
                socketService.leaveJobRoom(jobId);
            }

            setIsTrackingLocation(false);
        };
    }, [jobId, job]);


    const getCoordinates = (coordinates) => {
        if (!coordinates) return null;

        let lat, lng;

        // Handle different coordinate formats
        if (typeof coordinates === 'string') {
            // If it's a string like "21.236941, 72.862925"
            const coords = coordinates.split(',').map(coord => parseFloat(coord.trim()));
            lat = coords[1];
            lng = coords[0];
        } else if (coordinates.lat && coordinates.lng) {
            // If it's an object like { lat: 21.236941, lng: 72.862925 }
            lat = coordinates.lat;
            lng = coordinates.lng;
        } else if (Array.isArray(coordinates)) {
            // If it's an array like [21.236941, 72.862925]
            lat = coordinates[1];
            lng = coordinates[0];
        }

        // Validate coordinates (lat should be between -90 and 90, lng between -180 and 180)
        if (lat && lng && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
            return { lat, lng };
        }

        // If coordinates seem swapped (lat > 90 or lat < -90), try swapping them
        if (lat && lng && (lat > 90 || lat < -90)) {
            return { lat: lng, lng: lat };
        }

        return null;
    };

    const handleChatWithCustomer = () => {
        navigate(`/chat/${jobId}`);
    };

    const handleCallCustomer = () => {
        // Try multiple possible phone number locations
        const phoneNumber = customer?.phone ||
            customer?.phoneNumber ||
            customer?.mobile ||
            job?.customer?.phone ||
            job?.customer?.phoneNumber ||
            job?.customer?.mobile;

        if (phoneNumber) {
            window.location.href = `tel:${phoneNumber}`;
        } else {
            console.error('Customer phone number not available');
            alert('Customer phone number not available');
        }
    };

    const handleOnTheWay = () => {
        // Handle "On the way" action
    };

    const handleStartJob = async () => {
        try {
            // Check if job is already in progress
            if (job?.status === 'in_progress' || job?.status === 'in-progress' || job?.status === 'started') {
                // Already in progress, just navigate
                navigate(`/cleaner/complete-job/${jobId}`, { replace: true });
                return;
            }

            // Update job status to 'in_progress'
            await jobsAPI.updateJobStatus(jobId, 'in_progress');

            // Navigate to complete job page
            navigate(`/cleaner/complete-job/${jobId}`, { replace: true });
        } catch (error) {
            console.error('❌ Error updating job status:', error);
            
            // Check if it's a validation error about already being in progress
            if (error.message?.includes('already') || 
                error.message?.includes('in progress') ||
                error.response?.code === 'INVALID_STATUS_TRANSITION') {
                // Job is already in progress, just navigate
                navigate(`/cleaner/complete-job/${jobId}`, { replace: true });
            } else {
                // Still navigate even on error to not block the user
                navigate(`/cleaner/complete-job/${jobId}`, { replace: true });
            }
        }
    };

    if (loading) {
        return (
            <div className="bg-gray-50">
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

    if (error || !job) {
        return (
            <div className="bg-gray-50">
                <Header />
                <div className="max-w-sm mx-auto sm:max-w-2xl lg:max-w-4xl xl:max-w-6xl p-4">
                    <div className="bg-white rounded-2xl p-6 text-center">
                        <p className="text-red-500">{error || 'Job not found'}</p>
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

    // Find accepted quote for this cleaner
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    const currentUserId = currentUser.id || currentUser._id;
    const acceptedQuote = job.quotes?.find(quote =>
        (quote.cleanerId === currentUserId || quote.cleanerId?._id === currentUserId) &&
        quote.status === 'accepted'
    );

    const formatDate = (dateString) => {
        if (!dateString) return 'Date not specified';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-AU', {
            day: 'numeric',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getTimeAgo = (dateString) => {
        if (!dateString) return 'Recently posted';
        const date = new Date(dateString);
        const now = new Date();
        const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));

        if (diffInHours < 1) return 'Posted just now';
        if (diffInHours === 1) return 'Posted 1h ago';
        if (diffInHours < 24) return `Posted ${diffInHours}h ago`;

        const diffInDays = Math.floor(diffInHours / 24);
        return `Posted ${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    };

    // Helper functions for payment display
    const getPaymentMethod = () => {
        // Find payment for this job from payment history (try different field names)
        const jobPayment = paymentStatus?.data?.payments?.find(payment =>
            payment.jobId === jobId ||
            payment.jobId === job?.jobId ||
            payment.jobId === job?._id ||
            payment._id === jobId
        );

        if (jobPayment?.paymentMethod === 'online') {
            return 'Online';
        }
        return 'Cash';
    };

    const getPaymentSummary = () => {
        const totalAmount = acceptedQuote?.price || job?.estimatedPrice || 0;

        // Find payment for this job from payment history (try different field names)
        const jobPayment = paymentStatus?.data?.payments?.find(payment =>
            payment.jobId === jobId ||
            payment.jobId === job?.jobId ||
            payment.jobId === job?._id ||
            payment._id === jobId
        );

        if (jobPayment?.paymentMethod === 'online') {
            // For online payments, show the breakdown
            const paidAmount = jobPayment?.amount || totalAmount;
            const cleanerAmount = jobPayment?.cleanerAmount;

            return `Customer paid $${paidAmount} online to platform. You will receive $${cleanerAmount}.`;
        } else {
            // For cash payments, show the breakdown
            const onlineAmount = Math.round(totalAmount * 0.1); // 10%
            const cashAmount = totalAmount - onlineAmount; // 90%
            return `Customer paid $${onlineAmount} (10%) online to platform. $${cashAmount} (90%) will be paid cash after job.`;
        }
    };

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
                            {job.title || `${job.serviceType}`}
                        </h1>
                    </div>
                </div>

                <div className="px-4">
                    {/* Job Details Card */}
                    <div className="bg-white rounded-2xl p-6 mb-4 shadow-sm">
                        <h2 className="text-xl font-bold text-primary-500 mb-2">
                            {job.title || `${job.serviceType}`}
                        </h2>
                        <p className="text-sm text-gray-500 mb-2">{getTimeAgo(job.createdAt)}</p>

                        {/* Scheduled Time */}
                        <div className="flex items-center mb-1">
                            <img src={CalendarIcon} alt="Calendar" className="w-4 h-4 mr-3" />
                            <span className="text-sm text-primary-200 font-medium">
                                {job.scheduledDate ? formatDate(job.scheduledDate) : 'Date not specified'}
                            </span>
                        </div>

                        {/* Location */}
                        <div className="flex items-center">
                            <img src={MapPinIcon} alt="Location" className="w-4 h-4 mr-3" />
                            <span className="text-sm text-primary-200 font-medium">
                                {job.location?.address || job.location?.fullAddress || 'Location not specified'}
                            </span>
                        </div>
                    </div>

                    {/* Location Tracking Status */}
                    {isTrackingLocation && (
                        <div className="bg-green-50 border border-green-200 rounded-2xl p-4 mb-4 shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                                <div className="flex-1">
                                    <p className="text-sm font-semibold text-green-800">Live Location Tracking</p>
                                    <p className="text-xs text-green-600">Your location is being shared with the customer in real-time</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Location Error */}
                    {locationError && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 mb-4 shadow-sm">
                            <div className="flex items-center gap-3">
                                <svg className="w-5 h-5 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                                <div className="flex-1">
                                    <p className="text-sm font-semibold text-yellow-800">Location Access Issue</p>
                                    <p className="text-xs text-yellow-600">{locationError}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Map Section */}
                    {showMap && (
                        <div className="bg-white rounded-2xl p-4 mb-4 shadow-sm">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-lg font-semibold text-primary-500">Route to Customer</h3>
                                <button
                                    onClick={() => setShowMap(false)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            {(() => {
                                const originalCoords = job?.location?.coordinates;
                                const fixedCoords = getCoordinates(originalCoords);

                                if (!fixedCoords) {
                                    return (
                                        <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                                            <p className="text-gray-500">Customer location not available</p>
                                        </div>
                                    );
                                }

                                return (
                                    <MapWithPolyline
                                        customerLocation={fixedCoords}
                                        cleanerLocation={cleanerLocation}
                                        onRouteInfo={(info) => setRouteInfo(info)}
                                    />

                                );
                            })()}
                        </div>
                    )}

                    {/* Your Customer Section */}
                    <div className="mb-4">
                        <h3 className="text-lg font-semibold text-primary-500 mb-3">Your customer</h3>
                        <div className="bg-white rounded-2xl p-4 shadow-sm">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center">
                                    <div className="w-12 h-12 rounded-full mr-3 overflow-hidden">
                                        {customer?.profilePhoto?.url ? (
                                            <img
                                                src={customer.profilePhoto.url}
                                                alt="Customer"
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                                <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                                </svg>
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-primary-500">{customer?.firstName && customer?.lastName ? `${customer.firstName} ${customer.lastName}` : customer?.name || job.customer?.name || 'Customer'}</h4>
                                        <div className="flex items-center text-sm text-gray-500">
                                            <img src={PhoneIcon} alt="Phone" className="w-3 h-3 mr-1" />
                                            {customer?.phone || customer?.phoneNumber || customer?.mobile || job.customer?.phone || job.customer?.phoneNumber || job.customer?.mobile || 'Phone not available'}
                                        </div>
                                    </div>
                                </div>
                                <span className="text-xs font-semibold px-2 py-1 rounded-full bg-[#D1FAE5] border border-[#D1FAE5] text-[#059669]">
                                    Booked
                                </span>
                            </div>

                            {/* Distance indicator */}
                            {routeInfo && (
                                <div className="mb-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <div className="text-xs text-gray-500">Distance to Customer</div>
                                            <div className="text-sm font-semibold text-gray-900">{routeInfo.distance}</div>
                                        </div>
                                        <div>
                                            <div className="text-xs text-gray-500">Estimated Time</div>
                                            <div className="text-sm font-semibold text-gray-900">{routeInfo.duration}</div>
                                        </div>
                                        {isNearCustomer && (
                                            <div className="bg-green-100 text-green-700 text-xs font-semibold px-3 py-1 rounded-full">
                                                ✓ Near Customer
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            <div className="flex items-center justify-between">
                                <button
                                    onClick={handleGetDirections}
                                    className="flex items-center text-[#1F6FEB] text-sm font-medium cursor-pointer"
                                >
                                    <img src={MapPinIcon1} alt="Directions" className="w-4 h-4 mr-1" />
                                    {showMap ? 'Hide Map' : 'Show Route'}
                                </button>

                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={handleChatWithCustomer}
                                        className="w-8 h-8 shadow-custom rounded-lg! flex items-center justify-center transition-colors cursor-pointer border border-[#9CC0F6]"
                                    >
                                        <img src={ChatIcon} alt="Chat" className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={handleCallCustomer}
                                        className="w-8 h-8 shadow-custom rounded-lg! flex items-center justify-center  transition-colors cursor-pointer border border-[#9CC0F6]"
                                    >
                                        <img src={PhoneIcon1} alt="Call" className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Your Quote Section */}
                    {acceptedQuote && (
                        <div className="mb-4">
                            <h3 className="text-lg font-semibold text-primary-500 mb-3">Your Quote</h3>
                            <div className="bg-white rounded-2xl p-4 shadow-sm">
                                <div className="mb-2">
                                    <span className="text-sm text-gray-600">Amount: </span>
                                    <span className="text-lg font-semibold text-[#1F6FEB]">${acceptedQuote.price}</span>
                                </div>
                                {acceptedQuote.description && (
                                    <p className="text-sm text-gray-600">{acceptedQuote.description}</p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Payment Summary Section */}
                    <div className="mb-4">
                        <h3 className="text-lg font-semibold text-primary-500 mb-3">Payment Summary</h3>
                        <div className="bg-white rounded-2xl p-4 shadow-sm">
                            <div className="mb-2">
                                <span className="text-sm text-primary-200 font-medium">Quoted Price: </span>
                                <span className="text-lg font-semibold text-[#1F6FEB]">${acceptedQuote?.price || job.estimatedPrice || '0'}</span>
                            </div>

                            <div className="mb-2">
                                <span className="text-sm text-primary-200 font-medium">Payment Method: </span>
                                <span className="text-sm font-medium">{getPaymentMethod()}</span>
                            </div>

                            <div className="mb-3">
                                <p className="text-sm text-primary-200 font-medium">
                                    {getPaymentSummary()}
                                </p>
                            </div>

                            <span className="text-xs font-semibold px-2 py-1 rounded-full bg-[#FFF1D9] border border-[#FFEBCA] text-[#F59E0B] font-medium">
                                Pending Release
                            </span>
                        </div>
                        {/* Bottom Action Button */}
                        <div className=" p-4 flex justify-end">
                            {isNearCustomer ? (
                                <Button onClick={handleStartJob} variant="primary">
                                    Start Job
                                </Button>
                            ) : (
                                <Button onClick={handleOnTheWay} variant="primary">
                                    I'm On The Way
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InProgressJobDetailsPage;
