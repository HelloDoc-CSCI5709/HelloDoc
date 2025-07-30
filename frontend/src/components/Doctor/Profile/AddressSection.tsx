import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import AddressForm from './AddressForm';
import AddressCard from './AddressCard';
import MapPreview from './MapPreview';
import { useGoogleMaps } from '../../../hooks/useGoogleMaps';
import { useAppDispatch, useAppSelector } from '../../../redux/hooks';
import { updateDoctorAddress, getDoctorProfile } from '../../../redux/actions/doctorActions';

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

interface AddressSectionProps {
  doctorId?: string;
}

const AddressSection: React.FC<AddressSectionProps> = ({ doctorId }) => {
  const dispatch = useAppDispatch();
  const { profile, loading, error, success } = useAppSelector(state => state.doctor);
  
  const [currentAddress, setCurrentAddress] = useState<AddressData | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize Google Maps
  const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
  const { isLoaded, loadError } = useGoogleMaps(googleMapsApiKey);

  // Helper function to get doctor ID
  const getDoctorIdFromToken = () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) return null;
      
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.doctorId || payload.userId || payload.id;
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  };

  const getCurrentDoctorId = () => {
    const sources = [
      getDoctorIdFromToken(),
      doctorId,
      profile?.doctor?._id,
      profile?.doctor?.doctorId,
      profile?.user?._id,
    ];
    
    for (const source of sources) {
      if (source) return source;
    }
    
    console.error('No doctor ID found');
    return null;
  };

  const currentDoctorId = getCurrentDoctorId();

  // Load doctor profile on mount if not already loaded
  useEffect(() => {
    if (!profile && currentDoctorId) {
      dispatch(getDoctorProfile(null)); // Get current doctor's profile
    }
  }, [dispatch, currentDoctorId, profile]);

  // Extract address data from profile
  useEffect(() => {
    if (profile && profile.doctor) {
      const doctorData = profile.doctor;
      
      // Check if we have address data
      if (doctorData.address || doctorData.addressComponents) {
        const addressComponents = doctorData.addressComponents || {};
        const coordinates = doctorData.location?.coordinates;
        
        setCurrentAddress({
          street: addressComponents.streetName || '',
          city: addressComponents.city || '',
          state: addressComponents.state || '',
          zipCode: addressComponents.postalCode || '',
          country: addressComponents.country || 'Canada',
          fullAddress: doctorData.address || doctorData.formattedAddress || '',
          coordinates: coordinates ? {
            lat: coordinates[1], // MongoDB stores [lng, lat]
            lng: coordinates[0]
          } : undefined
        });
      } else {
        setCurrentAddress(null);
      }
    }
  }, [profile]);

  // Handle success/error states
  useEffect(() => {
    if (success && !loading && isSubmitting) {
      toast.success('Address updated successfully!');
      setIsSubmitting(false);
      setIsEditMode(false);
      
      // Reload profile to get updated address
      if (currentDoctorId) {
        dispatch(getDoctorProfile(null));
      }
    }
  }, [success, loading, isSubmitting, currentDoctorId, dispatch]);

  useEffect(() => {
    if (error && !loading && isSubmitting) {
      toast.error(`Address update failed: ${error}`);
      setIsSubmitting(false);
    }
  }, [error, loading, isSubmitting]);

  const handleAddressSubmit = async (addressData: AddressData) => {
    if (!currentDoctorId) {
      toast.error('Unable to identify doctor account. Please refresh and try again.');
      return;
    }

    if (!addressData.coordinates) {
      toast.error('Address coordinates are required. Please verify the address.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Format for backend API (expects MongoDB GeoJSON format)
      const updateData = {
        address: addressData.fullAddress,
        coordinates: [addressData.coordinates.lng, addressData.coordinates.lat] // MongoDB format: [lng, lat]
      };

      await dispatch(updateDoctorAddress(updateData)).unwrap();
      
      // Update local state immediately for better UX
      setCurrentAddress(addressData);
      
    } catch (err) {
      console.error('Address update failed:', err);
    }
  };

  const handleEdit = () => {
    setIsEditMode(true);
  };

  const handleCancelEdit = () => {
    setIsEditMode(false);
  };

  const handleDeleteAddress = async () => {
    if (!currentDoctorId) {
      toast.error('Unable to identify doctor account.');
      return;
    }

    if (window.confirm('Are you sure you want to remove your practice address?')) {
      try {
        setIsSubmitting(true);
        
        // Send empty address to backend
        const updateData = {
          address: '',
          coordinates: [0, 0]
        };

        await dispatch(updateDoctorAddress(updateData)).unwrap();
        
        setCurrentAddress(null);
        toast.success('Address removed successfully');
        
      } catch (err) {
        console.error('Address deletion failed:', err);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  // Loading states
  if (loading && !currentAddress) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading address information...</span>
      </div>
    );
  }

  // Google Maps loading error
  if (loadError) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center py-8">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Google Maps Loading Error</h3>
          <p className="text-gray-600 mb-4">{loadError}</p>
          <p className="text-sm text-gray-500">Please check your Google Maps API configuration.</p>
        </div>
      </div>
    );
  }

  // Google Maps not loaded yet
  if (!isLoaded) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Google Maps...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Practice Address</h2>
        <p className="text-gray-600">Manage your practice location for patient appointments and directions</p>
      </div>

      {isEditMode ? (
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            {currentAddress ? 'Update Practice Address' : 'Add Practice Address'}
          </h3>
          <AddressForm
            initialData={currentAddress || undefined}
            onSubmit={handleAddressSubmit}
            onCancel={handleCancelEdit}
            isSubmitting={isSubmitting}
          />
        </div>
      ) : (
        <div className="space-y-6">
          {currentAddress && currentAddress.fullAddress ? (
            <>
              <AddressCard
                address={currentAddress}
                onEdit={handleEdit}
                onDelete={handleDeleteAddress}
                showActions={!isSubmitting}
              />
              
              {/* Large Map Preview */}
              {currentAddress.coordinates && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Location Preview</h3>
                  <MapPreview
                    coordinates={currentAddress.coordinates}
                    address={currentAddress.fullAddress}
                    height="400px"
                    zoom={16}
                    interactive={true}
                  />
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📍</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Practice Address Set</h3>
              <p className="text-gray-600 mb-6">
                Add your practice address to help patients find your location and book appointments
              </p>
              <button
                onClick={() => setIsEditMode(true)}
                disabled={isSubmitting}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
              >
                Add Practice Address
              </button>
            </div>
          )}

          {/* Add/Edit Button for existing address */}
          {currentAddress && currentAddress.fullAddress && (
            <div className="flex justify-center pt-6 border-t">
              <button
                onClick={handleEdit}
                disabled={isSubmitting}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                Update Address
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AddressSection;
