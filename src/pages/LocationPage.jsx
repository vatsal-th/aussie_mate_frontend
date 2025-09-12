import React, { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';
import { userAPI } from '../services/api';
import currentLocationIcon from "../assets/current location.svg";

// Map container style
const mapContainerStyle = {
  width: '100%',
  height: '100%',
  borderRadius: '12px'
};

// Default center
const defaultCenter = {
  lat: -33.839,
  lng: 151.207
};

// Google Maps libraries - static array to prevent reloading
const libraries = ['places'];

const LocationPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [map, setMap] = useState(null);
  const [showManualInput, setShowManualInput] = useState(false);
  const [manualAddress, setManualAddress] = useState("");
  const navigate = useNavigate();

  // Google Maps API key
  const apiKey = import.meta.env.VITE_GOOGLE_MAP_API_KEY ;

  // Check if user is logged in when page loads
  useEffect(() => {
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;
    
    if (!user) {
      navigate("/login");
    }
  }, [navigate]);

  // Load Google Maps
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: apiKey,
    libraries: libraries
  });

  // Map options
  const mapOptions = {
    disableDefaultUI: false,
    clickableIcons: true,
    scrollwheel: true,
    zoomControl: true,
    streetViewControl: false,
    mapTypeControl: false,
    fullscreenControl: false
  };

  // Map callbacks
  const onLoad = useCallback((map) => {
    setMap(map);
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  // Search function
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Map is already shown, just update location
      setSelectedLocation({
        fullAddress: "1 Denison Street, North Sydney NSW 2060, Australia",
        lat: -33.839,
        lng: 151.207,
        coordinates: "-33.839, 151.207",
      });
    }
  };

  // Get current location with Google Maps API
  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by this browser.");
      return;
    }

    setIsLoading(true);
    setError("");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;

          const response = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}`
          );
          const data = await response.json();
          
          if (data.status === "OK") {
            const fullAddress = data.results[0].formatted_address;

            const location = {
              fullAddress: fullAddress,
              lat: latitude,
              lng: longitude,
              coordinates: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
            };

            setSelectedLocation(location);
          } else {
            console.error("Geocoding error:", data.status, data.error_message);
            
            let errorMessage = "Unable to get address details. ";
            switch (data.status) {
              case "REQUEST_DENIED":
                errorMessage += "Geocoding API is not enabled. Please enable it in Google Cloud Console.";
                break;
              case "OVER_QUERY_LIMIT":
                errorMessage += "API quota exceeded. Please try again later.";
                break;
              case "ZERO_RESULTS":
                errorMessage += "No results found for this location.";
                break;
              default:
                errorMessage += "Please try again.";
                break;
            }
            setError(errorMessage);
          }
        } catch (err) {
          console.error("Reverse geocoding failed:", err);
          
          // Fallback: Use coordinates only if geocoding fails
          const location = {
            fullAddress: `Current Location (${latitude.toFixed(6)}, ${longitude.toFixed(6)})`,
            lat: latitude,
            lng: longitude,
            coordinates: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
          };

          setSelectedLocation(location);
          setError("Address lookup failed, but location coordinates are available.");
        } finally {
          setIsLoading(false);
        }
      },
      (err) => {
        console.error("Location error:", err);
        setIsLoading(false);
        setError("Unable to access your location. Please allow GPS.");
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  // Handle manual address input
  const handleManualAddressSubmit = (e) => {
    e.preventDefault();
    if (manualAddress.trim()) {
      setSelectedLocation({
        fullAddress: manualAddress.trim(),
        lat: -33.839, // Default coordinates (can be improved with geocoding)
        lng: 151.207,
        coordinates: "-33.839, 151.207",
      });
      setShowManualInput(false);
      setManualAddress("");
    }
  };

  // Handle change location click
  const handleChangeLocation = () => {
    setShowManualInput(true);
    setManualAddress(selectedLocation?.fullAddress || "");
  };

  // Cancel manual input
  const handleCancelManual = () => {
    setShowManualInput(false);
    setManualAddress("");
  };

  // Confirm location   
  const handleConfirmLocation = async () => {
    // Store selected location in backend
    if (selectedLocation) {
      // Extract city from full address
      const fullAddress = selectedLocation.fullAddress || '';
      const addressParts = fullAddress.split(',');
      const city = addressParts.length > 1 ? addressParts[addressParts.length - 2]?.trim() : selectedLocation.city || 'Location';
      
      const locationData = {
        address: selectedLocation.address || selectedLocation.fullAddress,
        city: city,
        fullAddress: selectedLocation.fullAddress,
        coordinates: selectedLocation.coordinates
      };
      
      try {
        // Update location in backend
        await userAPI.updateLocation(locationData);
        
        // Also store in localStorage for immediate UI update
        localStorage.setItem('userLocation', JSON.stringify(locationData));
        
        // Dispatch custom event to update Header
        window.dispatchEvent(new CustomEvent('locationUpdated'));
      } catch (error) {
        console.error('Error updating location in backend:', error);
        // Still store in localStorage as fallback
        localStorage.setItem('userLocation', JSON.stringify(locationData));
        window.dispatchEvent(new CustomEvent('locationUpdated'));
      }
    }
    
    // Get user info from localStorage to determine user type
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;
    
    // If no user is logged in, redirect to login
    if (!user) {
      
      navigate("/login");
      return;
    }
    
    // Check both userType and role fields
    const userType = user?.userType || user?.role;
    
    
    // Check if user is a customer (any customer role)
    if (userType === 'Customer' || userType === 'customer') {
      
      navigate("/customer-dashboard");
    } 
    // Check if user is any type of cleaner/service provider
    else if (userType === 'Student Cleaner' || userType === 'Professional Cleaner' || 
             userType === 'NDIS Assistant' || userType === 'Retail Auditor' || 
             userType === 'Pet Sitter' || userType === 'Housekeeper' ||
             userType === 'Cleaner' || userType === 'cleaner') {
      navigate("/cleaner-dashboard");
    } else {
      
      navigate("/dashboard");
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="px-4 py-6">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Pick your location
            </h2>
            <p className="text-gray-600">
              Add your location so we can match you with the closest cleaners.
            </p>
          </div>

          {/* Search and Location Controls */}
          <div className="mb-4 space-y-3">
            <form onSubmit={handleSearch} className="space-y-3">
              {/* Search Input */}
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for area, street name..."
                className="w-full pl-4 pr-4 py-4 border border-gray-300 rounded-xl focus:ring-1 focus:ring-primary-500 outline-none text-base"
              />

              {/* Get Current Location */}
              <button
                type="button"
                onClick={handleGetCurrentLocation}
                disabled={isLoading}
                className="w-full flex items-center justify-center space-x-3 py-3 px-4 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-500"></div>
                ) : (
                  <img
                    src={currentLocationIcon}
                    alt="Current location"
                    className="w-8 h-8"
                  />
                )}
                <span className="font-medium text-gray-900">
                  {isLoading ? "Getting location..." : "Get current location"}
                </span>
              </button>
            </form>

            {error && (
              <div className="text-red-600 text-sm text-center bg-red-50 border border-red-200 rounded-lg p-3">
                {error}
              </div>
            )}
          </div>

          {/* Google Map */}
          <div className="rounded-xl overflow-hidden mb-4 border h-72">
            {isLoaded ? (
              <GoogleMap
                mapContainerStyle={mapContainerStyle}
                center={
                  selectedLocation
                    ? { lat: selectedLocation.lat, lng: selectedLocation.lng }
                    : defaultCenter
                }
                zoom={15}
                onLoad={onLoad}
                onUnmount={onUnmount}
                options={mapOptions}
              >
                {selectedLocation && (
                  <Marker
                    position={{ lat: selectedLocation.lat, lng: selectedLocation.lng }}
                    title={selectedLocation.fullAddress}
                  />
                )}
              </GoogleMap>
            ) : (
              <div className="flex items-center justify-center h-full bg-gray-100">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto mb-2"></div>
                  <p className="text-gray-600">Loading map...</p>
                </div>
              </div>
            )}
          </div>

          {/* Manual Address Input Form */}
          {showManualInput && (
            <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4 shadow-sm">
              <h3 className="font-semibold text-primary-500 mb-3">Enter Address Manually</h3>
              <form onSubmit={handleManualAddressSubmit} className="space-y-3">
                <textarea
                  value={manualAddress}
                  onChange={(e) => setManualAddress(e.target.value)}
                  placeholder="Enter your full address..."
                  className="w-full p-3 border border-gray-300 rounded-lg! focus:ring-1 focus:ring-primary-500 outline-none resize-none"
                  rows={3}
                />
                <div className="flex space-x-2">
                  <button
                    type="submit"
                    className="flex-1 bg-primary-500 text-white py-2 px-4 rounded-lg hover:bg-primary-600 transition-colors"
                  >
                    Save Address
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelManual}
                    className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Selected Location Card */}
          {selectedLocation && !showManualInput && (
            <div className="bg-white border border-gray-200 rounded-xl p-4 mb-4 shadow-sm">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="font-semibold text-gray-900 mb-2">
                    {selectedLocation.fullAddress}
                  </div>
                  <div className="text-xs text-gray-400">
                    Coordinates: {selectedLocation.coordinates}
                  </div>
                </div>
                <button
                  onClick={handleChangeLocation}
                  className="text-primary-500 font-medium text-sm hover:text-primary-600 ml-2"
                >
                  Change
                </button>
              </div>
            </div>
          )}

          {/* Confirm Button */}
          <button
            onClick={handleConfirmLocation}
            className="w-full bg-primary-500 hover:bg-primary-600 text-white font-bold py-3 rounded-xl transition-colors"
          >
            Confirm Location
          </button>
        </div>
      </div>
    </div>
  );
};

export default LocationPage;
