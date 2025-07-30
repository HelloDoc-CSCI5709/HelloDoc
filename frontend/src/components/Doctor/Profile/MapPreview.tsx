import React, { useEffect, useRef } from 'react';

interface MapPreviewProps {
  coordinates?: {
    lat: number;
    lng: number;
  };
  address?: string;
  height?: string;
  zoom?: number;
  onMapClick?: (coordinates: { lat: number; lng: number }) => void;
  interactive?: boolean;
}

const MapPreview: React.FC<MapPreviewProps> = ({
  coordinates,
  address,
  height = '300px',
  zoom = 15,
  onMapClick,
  interactive = false
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);

  useEffect(() => {
    if (!mapRef.current || !window.google || !window.google.maps) {
      return;
    }

    // Default to a center location if no coordinates provided
    const defaultCenter = coordinates || { lat: 40.7128, lng: -74.0060 }; // New York

    // Initialize map
    mapInstanceRef.current = new window.google.maps.Map(mapRef.current, {
      zoom,
      center: defaultCenter,
      disableDefaultUI: !interactive,
      gestureHandling: interactive ? 'auto' : 'none',
      zoomControl: interactive,
      scrollwheel: interactive,
      disableDoubleClickZoom: !interactive,
    });

    // Add marker if coordinates are provided
    if (coordinates) {
      markerRef.current = new window.google.maps.Marker({
        position: coordinates,
        map: mapInstanceRef.current,
        title: address || 'Practice Location',
        animation: window.google.maps.Animation.DROP,
      });

      // Add info window
      if (address) {
        const infoWindow = new window.google.maps.InfoWindow({
          content: `<div style="padding: 5px;"><strong>Practice Location</strong><br/>${address}</div>`,
        });

        markerRef.current.addListener('click', () => {
          infoWindow.open(mapInstanceRef.current, markerRef.current);
        });
      }
    }

    // Add click listener for interactive maps
    if (interactive && onMapClick) {
      mapInstanceRef.current.addListener('click', (event: any) => {
        const lat = event.latLng.lat();
        const lng = event.latLng.lng();
        onMapClick({ lat, lng });
        
        // Move marker to clicked location
        if (markerRef.current) {
          markerRef.current.setPosition({ lat, lng });
        } else {
          markerRef.current = new window.google.maps.Marker({
            position: { lat, lng },
            map: mapInstanceRef.current,
            animation: window.google.maps.Animation.DROP,
          });
        }
      });
    }

    // Cleanup function
    return () => {
      if (markerRef.current) {
        markerRef.current.setMap(null);
      }
    };
  }, [coordinates, address, zoom, interactive, onMapClick]);

  // Update map when coordinates change
  useEffect(() => {
    if (mapInstanceRef.current && coordinates) {
      mapInstanceRef.current.setCenter(coordinates);
      
      if (markerRef.current) {
        markerRef.current.setPosition(coordinates);
      } else {
        markerRef.current = new window.google.maps.Marker({
          position: coordinates,
          map: mapInstanceRef.current,
          title: address || 'Practice Location',
          animation: window.google.maps.Animation.DROP,
        });
      }
    }
  }, [coordinates, address]);

  if (!window.google || !window.google.maps) {
    return (
      <div 
        className="flex items-center justify-center bg-gray-100 border border-gray-300 rounded-lg"
        style={{ height }}
      >
        <div className="text-center text-gray-500">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600 mx-auto mb-2"></div>
          <p>Loading map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg overflow-hidden border border-gray-300">
      <div
        ref={mapRef}
        style={{ height, width: '100%' }}
        className="bg-gray-100"
      />
    </div>
  );
};

export default MapPreview;
