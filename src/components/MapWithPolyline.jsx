import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  GoogleMap,
  useJsApiLoader,
  Marker,
  DirectionsService,
  DirectionsRenderer,
} from "@react-google-maps/api";
import Marker1Icon from "../assets/marker1.svg";
import Marker2Icon from "../assets/marker2.svg";

const libraries = ["places"];
const containerStyle = { width: "100%", height: "100%", borderRadius: "1rem" };

const MapWithRealtimeTracking = ({ customerLocation, onRouteInfo }) => {
  const [cleanerLocation, setCleanerLocation] = useState(null);
  const [directions, setDirections] = useState(null);
  const [routeInfo, setRouteInfo] = useState(null);
  const mapRef = useRef(null);

  const apiKey = import.meta.env.VITE_GOOGLE_MAP_API_KEY;

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: apiKey,
    libraries,
  });

  // Track cleaner in real-time
  useEffect(() => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }

    const watcher = navigator.geolocation.watchPosition(
      (position) => {
        setCleanerLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      (error) => console.error("Error getting location:", error),
      { enableHighAccuracy: true, maximumAge: 0, timeout: 5000 }
    );

    return () => navigator.geolocation.clearWatch(watcher);
  }, []);

  // Reset directions when cleaner location changes to recalculate route
  useEffect(() => {
    if (cleanerLocation) {
      setDirections(null);
    }
  }, [cleanerLocation]);

  // Callback for DirectionsService
  const onDirectionsCallback = useCallback((result, status) => {
    if (status === "OK" && result) {
      setDirections(result);
      
      // Extract route information
      const route = result.routes[0];
      const leg = route.legs[0];
      
      const routeData = {
        distance: leg.distance.text,
        duration: leg.duration.text,
        distanceValue: leg.distance.value, // in meters
        durationValue: leg.duration.value, // in seconds
      };
      
      setRouteInfo(routeData);
      
      // Pass route info to parent component
      if (onRouteInfo) {
        onRouteInfo(routeData);
      }
    } else {
      console.warn("Directions request failed:", status);
    }
  }, [onRouteInfo]);

  const onMapLoad = useCallback((map) => {
    mapRef.current = map;
  }, []);

  if (!isLoaded) return <div>Loading Google Maps...</div>;
  if (!customerLocation) return <div>Customer location not available</div>;
  if (!cleanerLocation) return <div>Fetching your location...</div>;

  return (
    <div className="w-full h-96 rounded-2xl relative">
      {/* Route Information Overlay */}
      {routeInfo && (
        <div className="absolute top-4 left-4 z-10 bg-white rounded-lg shadow-lg p-3 border border-gray-200">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-2">
                <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <div className="text-xs text-gray-500">Distance</div>
                <div className="text-sm font-semibold text-gray-900">{routeInfo.distance}</div>
              </div>
            </div>
            <div className="flex items-center">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-2">
                <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <div className="text-xs text-gray-500">Duration</div>
                <div className="text-sm font-semibold text-gray-900">{routeInfo.duration}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cleaner Location Info */}
      <div className="absolute bottom-4 right-4 z-10 bg-white rounded-lg shadow-lg p-3 border border-gray-200 max-w-xs">
        <div className="flex items-center">
          <div className="w-3 h-3 bg-blue-500 rounded-full mr-2 animate-pulse"></div>
          <div>
            <div className="text-xs text-gray-500">Cleaner Location</div>
            <div className="text-sm font-medium text-gray-900">Live tracking active</div>
          </div>
        </div>
      </div>

      <GoogleMap
        mapContainerStyle={containerStyle}
        center={cleanerLocation}
        zoom={15}
        onLoad={onMapLoad}
        options={{
          zoomControl: true,
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: true,
          gestureHandling: "greedy",
        }}
      >
        {/* Cleaner Marker */}
        <Marker
          position={cleanerLocation}
          title="You (Cleaner)"
          icon={{
            url: Marker1Icon,
            scaledSize: new window.google.maps.Size(48, 48),
          }}
        />

        {/* Customer Marker */}
        <Marker
          position={customerLocation}
          title="Customer"
          icon={{
            url: Marker2Icon,
            scaledSize: new window.google.maps.Size(58, 58),
          }}
        />

        {/* Directions Service */}
        {!directions && (
          <DirectionsService
            options={{
              origin: cleanerLocation,
              destination: customerLocation,
              travelMode: window.google.maps.TravelMode.DRIVING,
            }}
            callback={onDirectionsCallback}
          />
        )}

        {/* Directions Renderer */}
        {directions && (
          <DirectionsRenderer
            options={{
              directions,
              suppressMarkers: true,
              polylineOptions: {
                strokeColor: "#1F6FEB",
                strokeWeight: 5,
                strokeOpacity: 0.8,
              },
            }}
          />
        )}
      </GoogleMap>
    </div>
  );
};

export default MapWithRealtimeTracking;
