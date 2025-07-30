import React, { useState, useRef } from 'react';
import { toast } from 'react-toastify';
import { useAppDispatch, useAppSelector } from '../../../redux/hooks';
import { uploadProfilePicture, getDoctorProfile } from '../../../redux/actions/doctorActions';

interface ProfileImageUploadProps {
  currentImage?: string;
  onUploadSuccess?: (imageUrl: string) => void;
  disabled?: boolean;
}

const ProfileImageUpload: React.FC<ProfileImageUploadProps> = ({
  currentImage,
  onUploadSuccess,
  disabled = false
}) => {
  const dispatch = useAppDispatch();
  const {profile } = useAppSelector(state => state.doctor);
  
  const [isUploading, setIsUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(currentImage || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Please select a valid image file (JPEG, JPG, or PNG)');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewImage(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Upload image
    setIsUploading(true);

    try {
      const result = await dispatch(uploadProfilePicture(file)).unwrap();
      
      // Handle different response structures from your backend
      let imageUrl = '';
      if (result) {
        // Try different possible paths for the image URL
        imageUrl = result.imageUrl || 
                  result.url || 
                  result.path || 
                  result.data?.imageUrl || 
                  result.data?.url || 
                  result.data?.path ||
                  previewImage || 
                  '';
      }

      toast.success('Profile picture updated successfully!');
      
      if (onUploadSuccess && imageUrl) {
        onUploadSuccess(imageUrl);
      }

      // Refresh the profile to get updated data
      dispatch(getDoctorProfile(null));
      
    } catch (error) {
      console.error('Profile picture upload failed:', error);
      toast.error('Failed to upload profile picture. Please try again.');
      
      // Reset preview on error
      setPreviewImage(currentImage || null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleImageClick = () => {
    if (!disabled && !isUploading) {
      fileInputRef.current?.click();
    }
  };

  const handleRemoveImage = () => {
    setPreviewImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    toast.info('Profile picture removed');
  };

  const getDisplayImage = () => {
    if (previewImage) return previewImage;
    if (currentImage) return currentImage;
    return null;
  };

  const getInitials = () => {
    const fullName = profile?.user?.fullName || profile?.doctor?.fullName || '';
    if (fullName) {
      const names = fullName.split(' ');
      if (names.length >= 2) {
        return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
      }
      return fullName[0].toUpperCase();
    }
    return 'DR';
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      {/* Image Display with proper circular styling */}
      <div className="relative">
        <div 
          onClick={handleImageClick}
          className={`
            w-32 h-32 rounded-full border-4 border-gray-200 overflow-hidden bg-gray-100
            ${!disabled && !isUploading ? 'cursor-pointer hover:border-blue-400' : 'cursor-default'}
            ${isUploading ? 'opacity-50' : ''}
            transition-all duration-200 flex items-center justify-center
          `}
          style={{ 
            backgroundImage: getDisplayImage() ? `url(${getDisplayImage()})` : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        >
          {!getDisplayImage() && (
            <div className="w-full h-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center rounded-full">
              <span className="text-white text-2xl font-bold">
                {getInitials()}
              </span>
            </div>
          )}
        </div>

        {/* Upload Indicator */}
        {isUploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          </div>
        )}

        {/* Camera Icon Overlay */}
        {!disabled && !isUploading && (
          <div className="absolute bottom-2 right-2 bg-blue-600 rounded-full p-2 shadow-lg hover:bg-blue-700 transition-colors cursor-pointer">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
        )}
      </div>

      {/* Upload Instructions */}
      <div className="text-center">
        <p className="text-sm text-gray-600">
          {isUploading ? 'Uploading...' : 'Click to upload profile picture'}
        </p>
        <p className="text-xs text-gray-500 mt-1">
          JPG, JPEG or PNG. Max size 5MB.
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-3">
        <button
          onClick={handleImageClick}
          disabled={disabled || isUploading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-colors"
        >
          {getDisplayImage() ? 'Change Photo' : 'Upload Photo'}
        </button>

        {getDisplayImage() && (
          <button
            onClick={handleRemoveImage}
            disabled={disabled || isUploading}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-colors"
          >
            Remove
          </button>
        )}
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png"
        onChange={handleImageSelect}
        className="hidden"
        disabled={disabled || isUploading}
      />
    </div>
  );
};

export default ProfileImageUpload;
