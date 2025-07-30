/* global google */
import React, { useEffect, useRef } from 'react';

/// <reference types="google.maps" />

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
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);

  useEffect(() => {
    if (!mapRef.current || !window.google || !window.google.maps) return;

    const defaultCenter = coordinates || { lat: 40.7128, lng: -74.0060 }; // Fallback: NYC

    mapInstanceRef.current = new window.google.maps.Map(mapRef.current, {
      zoom,
      center: defaultCenter,
      disableDefaultUI: !interactive,
      gestureHandling: interactive ? 'auto' : 'none',
      zoomControl: interactive,
      scrollwheel: interactive,
      disableDoubleClickZoom: !interactive,
    });

    if (coordinates) {
      markerRef.current = new window.google.maps.Marker({
        position: coordinates,
        map: mapInstanceRef.current,
        title: address || 'Practice Location',
        animation: window.google.maps.Animation.DROP,
      });

      if (address) {
        const infoWindow = new window.google.maps.InfoWindow({
          content: `<div style="padding: 5px;"><strong>Practice Location</strong><br/>${address}</div>`,
        });

        markerRef.current.addListener('click', () => {
          infoWindow.open(mapInstanceRef.current!, markerRef.current!);
        });
      }
    }

    if (interactive && onMapClick) {
      mapInstanceRef.current.addListener('click', (event: google.maps.MapMouseEvent) => {
        if (event.latLng) {
          const lat = event.latLng.lat();
          const lng = event.latLng.lng();
          onMapClick({ lat, lng });

          if (markerRef.current) {
            markerRef.current.setPosition({ lat, lng });
          } else {
            markerRef.current = new window.google.maps.Marker({
              position: { lat, lng },
              map: mapInstanceRef.current!,
              animation: window.google.maps.Animation.DROP,
            });
          }
        }
      });
    }

    return () => {
      if (markerRef.current) {
        markerRef.current.setMap(null);
      }
    };
  }, [coordinates, address, zoom, interactive, onMapClick]);

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
