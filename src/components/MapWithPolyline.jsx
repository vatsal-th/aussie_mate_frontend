import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import {
  GoogleMap,
  useJsApiLoader,
  Marker,
  DirectionsRenderer,
} from "@react-google-maps/api";
import Marker1Icon from "../assets/marker1.svg";
import Marker2Icon from "../assets/marker2.svg";

// Define libraries outside component to prevent re-creation
const GOOGLE_MAPS_LIBRARIES = ["places"];
const containerStyle = { width: "100%", height: "100%", borderRadius: "1rem" };

const MapWithRealtimeTracking = ({ customerLocation, cleanerLocation: externalCleanerLocation, onRouteInfo }) => {
  const [cleanerLocation, setCleanerLocation] = useState(null);
  const [directions, setDirections] = useState(null);
  const [routeInfo, setRouteInfo] = useState(null);
  const mapRef = useRef(null);
  const directionsFetchedRef = useRef(false);
  const initialCleanerLocationRef = useRef(null);

  const apiKey = import.meta.env.VITE_GOOGLE_MAP_API_KEY;

  // Memoize loader options to prevent re-initialization
  const loaderOptions = useMemo(() => ({
    googleMapsApiKey: apiKey,
    libraries: GOOGLE_MAPS_LIBRARIES,
  }), [apiKey]);

  const { isLoaded } = useJsApiLoader(loaderOptions);

  // Use external cleaner location if provided, otherwise track internally
  useEffect(() => {
    if (externalCleanerLocation) {
      setCleanerLocation(externalCleanerLocation);
      initialCleanerLocationRef.current = externalCleanerLocation; // Store external location
      return;
    }

    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }

    // Get initial location first
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const newLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setCleanerLocation(newLocation);
        initialCleanerLocationRef.current = newLocation; // Store initial location
      },
      (error) => console.error("Error getting initial location:", error),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );

    // Then watch for updates with less frequent updates
    const watcher = navigator.geolocation.watchPosition(
      (position) => {
        const newLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setCleanerLocation(newLocation);
      },
      (error) => console.error("Error watching location:", error),
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 15000, distanceFilter: 50 }
    );

    return () => navigator.geolocation.clearWatch(watcher);
  }, [externalCleanerLocation]);

  // Imperative DirectionsService - fetch directions once when customer location is available
  useEffect(() => {
    if (!isLoaded) {
      return;
    }

    if (!customerLocation) {
      return;
    }

    if (directionsFetchedRef.current) {
      return;
    }

    // Wait for initial cleaner location to be available
    if (!initialCleanerLocationRef.current) {
      return;
    }

    console.log('Fetching directions imperatively (ONCE)...', {
      origin: initialCleanerLocationRef.current,
      destination: customerLocation
    });
    
    const directionsService = new window.google.maps.DirectionsService();
    
    directionsService.route(
      {
        origin: initialCleanerLocationRef.current, // Use stable initial location
        destination: customerLocation,
        travelMode: window.google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === "OK" && result) {
          console.log('✅ Directions fetched successfully');
          setDirections(result);
          directionsFetchedRef.current = true; // Mark as fetched to prevent re-fetching
          
          // Extract route information
          const route = result.routes[0];
          const leg = route.legs[0];
          
          const routeData = {
            distance: leg.distance.text,
            duration: leg.duration.text,
            distanceValue: leg.distance.value, // in meters
            durationValue: leg.duration.value, // in seconds
          };
          
          console.log('✅ Route data:', routeData);
          setRouteInfo(routeData);
          
          // Pass route info to parent component
          if (onRouteInfo) {
            onRouteInfo(routeData);
          }
        } else {
          console.error("❌ Directions request failed:", status, result);
        }
      }
    );
  }, [isLoaded, customerLocation]); // Remove cleanerLocation dependency

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
