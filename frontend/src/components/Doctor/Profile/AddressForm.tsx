/* global google */
import React, { useState, useRef, useEffect } from 'react';
import { toast } from 'react-toastify';
import { GeocodingUtils } from '../../../utils/geocodingUtils';

interface AddressFormData {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  fullAddress: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

interface AddressFormProps {
  initialData?: AddressFormData;
  onSubmit: (data: AddressFormData) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

const AddressForm: React.FC<AddressFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isSubmitting = false
}) => {
  const [formData, setFormData] = useState<AddressFormData>({
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'United States',
    fullAddress: '',
    ...initialData
  });

  const [isGeocoding, setIsGeocoding] = useState(false);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (window.google && window.google.maps && inputRef.current && !autocompleteRef.current) {
      autocompleteRef.current = new window.google.maps.places.Autocomplete(inputRef.current, {
        types: ['address'],
        componentRestrictions: { country: ['us', 'ca'] }
      });

      autocompleteRef.current.addListener('place_changed', handlePlaceSelect);
    }
  }, []);

  const handlePlaceSelect = () => {
    const place = autocompleteRef.current?.getPlace();
    if (!place || !place.geometry) {
      toast.error('No details available for this address');
      return;
    }

    const addressComponents = place.address_components || [];
    let street = '';
    let city = '';
    let state = '';
    let zipCode = '';
    let country = '';

    addressComponents.forEach((component: google.maps.GeocoderAddressComponent) => {
      const types = component.types;

      if (types.includes('street_number') || types.includes('route')) {
        street += component.long_name + ' ';
      } else if (types.includes('locality')) {
        city = component.long_name;
      } else if (types.includes('administrative_area_level_1')) {
        state = component.short_name;
      } else if (types.includes('postal_code')) {
        zipCode = component.long_name;
      } else if (types.includes('country')) {
        country = component.long_name;
      }
    });

    setFormData({
      street: street.trim(),
      city,
      state,
      zipCode,
      country,
      fullAddress: place.formatted_address || '',
      coordinates: {
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng()
      }
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleGeocodeAddress = async () => {
    const addressString = `${formData.street}, ${formData.city}, ${formData.state} ${formData.zipCode}, ${formData.country}`;

    if (!addressString.trim()) {
      toast.error('Please enter a complete address');
      return;
    }

    setIsGeocoding(true);
    try {
      const result = await GeocodingUtils.geocodeAddress(addressString);
      if (result) {
        setFormData(prev => ({
          ...prev,
          fullAddress: result.formattedAddress,
          coordinates: result.coordinates
        }));
        toast.success('Address verified and coordinates found');
      } else {
        toast.error('Could not find coordinates for this address. Please check the address.');
      }
    } catch (error) {
      console.error('Geocoding error:', error);
      toast.error('Failed to verify address. Please try again.');
    } finally {
      setIsGeocoding(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.street || !formData.city || !formData.state) {
      toast.error('Please fill in all required address fields');
      return;
    }

    if (!formData.coordinates) {
      toast.error('Please verify the address to get coordinates');
      return;
    }

    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Search Address <span className="text-red-500">*</span>
        </label>
        <input
          ref={inputRef}
          type="text"
          placeholder="Start typing your practice address..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <p className="text-sm text-gray-500">Start typing and select from the dropdown for best results</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Street Address <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="street"
            value={formData.street}
            onChange={handleInputChange}
            placeholder="123 Main Street"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            City <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="city"
            value={formData.city}
            onChange={handleInputChange}
            placeholder="New York"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            State/Province <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="state"
            value={formData.state}
            onChange={handleInputChange}
            placeholder="NY"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            ZIP/Postal Code
          </label>
          <input
            type="text"
            name="zipCode"
            value={formData.zipCode}
            onChange={handleInputChange}
            placeholder="10001"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Country
          </label>
          <select
            name="country"
            value={formData.country}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="United States">United States</option>
            <option value="Canada">Canada</option>
          </select>
        </div>
      </div>

      <div className="flex justify-center">
        <button
          type="button"
          onClick={handleGeocodeAddress}
          disabled={isGeocoding}
          className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center space-x-2"
        >
          {isGeocoding && (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          )}
          <span>{isGeocoding ? 'Verifying...' : 'Verify Address'}</span>
        </button>
      </div>

      {formData.fullAddress && formData.coordinates && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h4 className="font-medium text-green-800 mb-2">✅ Address Verified</h4>
          <p className="text-sm text-green-700 mb-2">
            <strong>Formatted Address:</strong> {formData.fullAddress}
          </p>
          <p className="text-sm text-green-700">
            <strong>Coordinates:</strong> {formData.coordinates.lat.toFixed(6)}, {formData.coordinates.lng.toFixed(6)}
          </p>
        </div>
      )}

      <div className="flex justify-end space-x-4 pt-6 border-t">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting || !formData.coordinates}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
        >
          {isSubmitting && (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          )}
          <span>{isSubmitting ? 'Saving...' : 'Save Address'}</span>
        </button>
      </div>
    </form>
  );
};

export default AddressForm;
