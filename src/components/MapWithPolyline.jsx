import React, { useEffect, useRef } from "react";
import { GoogleMap, useJsApiLoader, Marker, DirectionsService, DirectionsRenderer } from '@react-google-maps/api';
import Marker1Icon from '../assets/marker1.svg';
import Marker2Icon from '../assets/marker2.svg';
import CurrentLocationIcon from '../assets/currentLocation.svg';

const libraries = ['places'];

const MapWithPolyline = ({ cleanerLocation, customerLocation }) => {
  const mapRef = useRef(null);
  
  // Google Maps API key
  const apiKey = import.meta.env.VITE_GOOGLE_MAP_API_KEY;

  // Load Google Maps
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: apiKey,
    libraries: libraries
  });

  const [directions, setDirections] = React.useState(null);

  const onDirectionsLoad = React.useCallback((directionsResult) => {
    setDirections(directionsResult);
  }, []);

  const directionsCallback = React.useCallback((result, status) => {
    if (status === 'OK') {
      onDirectionsLoad(result);
    }
  }, [onDirectionsLoad]);

  if (!isLoaded) {
    return (
      <div className="w-full h-64 sm:h-80 lg:h-96 rounded-2xl bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
          <p className="text-gray-600">Loading Google Maps...</p>
        </div>
      </div>
    );
  }

  // Debug: Check if customerLocation is valid
  if (!customerLocation) {
    return (
      <div className="w-full h-64 sm:h-80 lg:h-96 rounded-2xl bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Customer location not available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-64 sm:h-80 lg:h-96 rounded-2xl" style={{ minHeight: "300px" }}>
      <GoogleMap
        mapContainerStyle={{ width: '100%', height: '100%', borderRadius: '1rem' }}
        center={cleanerLocation}
        zoom={13}
        options={{
          styles: [
            {
              featureType: "all",
              elementType: "labels.text.fill",
              stylers: [{ color: "#1F6FEB" }]
            }
          ]
        }}
      >
        {/* Cleaner Location Marker */}
        <Marker
          position={cleanerLocation}
          title="Your Location"
          icon={{
            url: Marker1Icon,
            scaledSize: new window.google.maps.Size(48, 48),
            anchor: new window.google.maps.Point(24, 24)
          }}
        />

        {/* Customer Location Marker */}
        <Marker
          position={customerLocation}
          title="Job Location"
          icon={{
            url: Marker2Icon,
            scaledSize: new window.google.maps.Size(62, 62),
            anchor: new window.google.maps.Point(31, 31)
          }}
        />
        
        {/* Debug info */}
        <div className="absolute top-2 left-2 bg-white p-2 rounded shadow text-xs">
          <p>Cleaner: {cleanerLocation ? 'OK' : 'Missing'}</p>
          <p>Customer: {customerLocation ? 'OK' : 'Missing'}</p>
          <p>Customer coords: {customerLocation ? `${customerLocation.lat.toFixed(4)}, ${customerLocation.lng.toFixed(4)}` : 'N/A'}</p>
        </div>

        {/* Directions Service */}
        {cleanerLocation && customerLocation && (
          <DirectionsService
            options={{
              destination: customerLocation,
              origin: cleanerLocation,
              travelMode: window.google.maps.TravelMode.DRIVING,
            }}
            callback={directionsCallback}
          />
        )}

        {/* Directions Renderer */}
        {directions && (
          <DirectionsRenderer
            options={{
              directions,
              suppressMarkers: true, // We're using custom markers
              polylineOptions: {
                strokeColor: "#1F6FEB",
                strokeWeight: 5,
                strokeOpacity: 0.8
              }
            }}
          />
        )}

        {/* Fallback: Show markers even if directions fail */}
        {!directions && (
          <div className="absolute bottom-4 left-4 bg-white p-2 rounded shadow text-xs">
            <p className="text-gray-600">Route not available</p>
            <p className="text-gray-500">Markers show locations</p>
          </div>
        )}
      </GoogleMap>
    </div>
  );
};

export default MapWithPolyline;
