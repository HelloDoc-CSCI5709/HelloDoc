/// <reference types="google.maps" />

interface Coordinates {
  lat: number;
  lng: number;
}

interface GeocodingResult {
  address: string;
  coordinates: Coordinates;
  placeId?: string;
  formattedAddress: string;
}

export class GeocodingUtils {
  static async geocodeAddress(address: string): Promise<GeocodingResult | null> {
    return new Promise((resolve) => {
      if (!window.google || !window.google.maps) {
        console.error('Google Maps not loaded');
        resolve(null);
        return;
      }

      const geocoder = new window.google.maps.Geocoder();

      geocoder.geocode({ address }, (results, status) => {
        if (status === 'OK' && results && results[0]) {
          const result = results[0];
          resolve({
            address,
            coordinates: {
              lat: result.geometry.location.lat(),
              lng: result.geometry.location.lng()
            },
            placeId: result.place_id,
            formattedAddress: result.formatted_address
          });
        } else {
          console.error('Geocoding failed:', status);
          resolve(null);
        }
      });
    });
  }

  static async reverseGeocode(coordinates: Coordinates): Promise<string | null> {
    return new Promise((resolve) => {
      if (!window.google || !window.google.maps) {
        console.error('Google Maps not loaded');
        resolve(null);
        return;
      }

      const geocoder = new window.google.maps.Geocoder();
      const latLng = new window.google.maps.LatLng(coordinates.lat, coordinates.lng);

      geocoder.geocode({ location: latLng }, (results, status) => {
        if (status === 'OK' && results && results[0]) {
          resolve(results[0].formatted_address);
        } else {
          console.error('Reverse geocoding failed:', status);
          resolve(null);
        }
      });
    });
  }

  static async calculateDistance(point1: Coordinates, point2: Coordinates): Promise<number> {
    if (!window.google || !window.google.maps) {
      // Haversine fallback
      const R = 6371;
      const dLat = this.toRadians(point2.lat - point1.lat);
      const dLng = this.toRadians(point2.lng - point1.lng);
      const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(this.toRadians(point1.lat)) * Math.cos(this.toRadians(point2.lat)) *
        Math.sin(dLng / 2) ** 2;
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c;
    }

    const service = new window.google.maps.DistanceMatrixService();
    return new Promise((resolve) => {
      service.getDistanceMatrix({
        origins: [new window.google.maps.LatLng(point1.lat, point1.lng)],
        destinations: [new window.google.maps.LatLng(point2.lat, point2.lng)],
        travelMode: window.google.maps.TravelMode.DRIVING,
        unitSystem: window.google.maps.UnitSystem.METRIC,
        avoidHighways: false,
        avoidTolls: false,
      }, (response, status) => {
        if (status === 'OK' && response.rows[0]?.elements[0]?.distance?.value != null) {
          const distance = response.rows[0].elements[0].distance.value / 1000;
          resolve(distance);
        } else {
          console.error('Distance calculation failed:', status);
          resolve(0);
        }
      });
    });
  }

  private static toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }
}
