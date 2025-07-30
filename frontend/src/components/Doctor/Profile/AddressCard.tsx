import React from 'react';
import MapPreview from './MapPreview';

interface AddressData {
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

interface AddressCardProps {
  address: AddressData;
  onEdit: () => void;
  onDelete?: () => void;
  showActions?: boolean;
}

const AddressCard: React.FC<AddressCardProps> = ({
  address,
  onEdit,
  onDelete,
  showActions = true
}) => {
  const formatAddress = () => {
    return `${address.street}, ${address.city}, ${address.state} ${address.zipCode}, ${address.country}`;
  };

  const handleDirectionsClick = () => {
    if (address.coordinates) {
      const url = `https://www.google.com/maps/dir/?api=1&destination=${address.coordinates.lat},${address.coordinates.lng}`;
      window.open(url, '_blank');
    } else {
      const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(formatAddress())}`;
      window.open(url, '_blank');
    }
  };

  const handleMapClick = () => {
    if (address.coordinates) {
      const url = `https://www.google.com/maps/search/?api=1&query=${address.coordinates.lat},${address.coordinates.lng}`;
      window.open(url, '_blank');
    }
  };

  return (
    <div className="border border-gray-200 rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow">
      {/* Map Preview */}
      {address.coordinates && (
        <div className="cursor-pointer" onClick={handleMapClick}>
          <MapPreview
            coordinates={address.coordinates}
            address={address.fullAddress}
            height="200px"
            zoom={16}
          />
        </div>
      )}

      {/* Address Information */}
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-3">
              <span className="text-2xl">📍</span>
              <h3 className="font-semibold text-gray-900">Practice Address</h3>
            </div>

            <div className="space-y-2 text-sm text-gray-600">
              <p><strong>Street:</strong> {address.street}</p>
              <p><strong>City:</strong> {address.city}</p>
              <p><strong>State/Province:</strong> {address.state}</p>
              <p><strong>Postal Code:</strong> {address.zipCode}</p>
              <p><strong>Country:</strong> {address.country}</p>
              
              {address.fullAddress && (
                <div className="pt-2 border-t border-gray-200">
                  <p><strong>Full Address:</strong></p>
                  <p className="text-gray-800">{address.fullAddress}</p>
                </div>
              )}

              {address.coordinates && (
                <div className="pt-2">
                  <p><strong>Coordinates:</strong> {address.coordinates.lat.toFixed(6)}, {address.coordinates.lng.toFixed(6)}</p>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          {showActions && (
            <div className="flex flex-col space-y-2 ml-4">
              <button
                onClick={onEdit}
                className="text-blue-600 hover:text-blue-800 text-sm flex items-center space-x-1"
              >
                <span>✏️</span>
                <span>Edit</span>
              </button>
              
              {onDelete && (
                <button
                  onClick={onDelete}
                  className="text-red-600 hover:text-red-800 text-sm flex items-center space-x-1"
                >
                  <span>🗑️</span>
                  <span>Delete</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex space-x-4">
            <button
              onClick={handleDirectionsClick}
              className="flex-1 bg-blue-50 text-blue-700 py-2 px-4 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors"
            >
              Get Directions
            </button>
            <button
              onClick={handleMapClick}
              className="flex-1 bg-gray-50 text-gray-700 py-2 px-4 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors"
            >
              View on Map
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddressCard;
