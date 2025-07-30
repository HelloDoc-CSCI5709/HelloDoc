import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import CredentialUpload from './CredentialUpload';
import CredentialCard from './CredentialCard';
import { useAppDispatch, useAppSelector } from '../../../redux/hooks';
import { 
  submitDoctorCredential, 
  getDoctorCredentials 
} from '../../../redux/actions/doctorActions';

interface CredentialSectionProps {
  doctorId?: string;
}

const CredentialSection: React.FC<CredentialSectionProps> = ({ doctorId }) => {
  const dispatch = useAppDispatch();
  const { credentials, loading, error, success, profile } = useAppSelector(state => state.doctor);
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

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
      profile?.doctorId?._id,
      profile?._id,
      profile?.id,
      localStorage.getItem('doctorId'),
    ];
    
    for (const source of sources) {
      if (source) {
        return source;
      }
    }
    
    console.error('No doctor ID found in any source');
    return null;
  };

  const currentDoctorId = getCurrentDoctorId();

  useEffect(() => {
    if (currentDoctorId) {
      dispatch(getDoctorCredentials(currentDoctorId));
    }
  }, [dispatch, currentDoctorId]);

  useEffect(() => {
    if (success && !loading && isUploading) {
      toast.success('Credential uploaded successfully!');
      setIsUploading(false);
      setSelectedFile(null);
      setUploadProgress(0);
      if (currentDoctorId) {
        dispatch(getDoctorCredentials(currentDoctorId));
      }
    }
  }, [success, loading, isUploading, currentDoctorId, dispatch]);

  useEffect(() => {
    if (error && !loading && isUploading) {
      toast.error(`Upload failed: ${error}`);
      setIsUploading(false);
      setUploadProgress(0);
    }
  }, [error, loading, isUploading]);

  const handleFileSelected = (file: File) => {
    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error('Please select a PDF file to upload');
      return;
    }
    
    if (!currentDoctorId) {
      toast.error('Unable to identify doctor account. Please refresh the page and try logging in again.');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      try {
        await dispatch(submitDoctorCredential({
          doctorId: currentDoctorId,
          file: selectedFile
        })).unwrap();

        clearInterval(progressInterval);
        setUploadProgress(100);
      } catch (apiError: unknown) {
        console.error('Credential upload failed:', apiError);
        clearInterval(progressInterval);
        setUploadProgress(0);

        if (apiError instanceof Error) {
          if (apiError.message.includes('body')) {
            toast.error('Upload completed but response format unexpected. Please check if the file was uploaded successfully.');
          } else {
            toast.error(`Upload failed: ${apiError.message}`);
          }
        } else {
          toast.error('Upload failed: Unexpected error occurred');
        }
      }

    } catch (err) {
      console.error('Credential upload failed:', err);
      setUploadProgress(0);
    }
  };

  if (loading && (!credentials || (Array.isArray(credentials) && credentials.length === 0))) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading credentials...</span>
      </div>
    );
  }

  const credentialsList = Array.isArray(credentials) ? credentials : 
                         credentials ? [credentials] : [];

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Medical Credentials</h2>
        <p className="text-gray-600">Upload your medical credentials for verification</p>
      </div>

      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Upload New Credential</h3>
        
        <CredentialUpload
          onFileSelected={handleFileSelected}
          disabled={isUploading}
          isUploading={isUploading}
        />

        {isUploading && (
          <div className="mt-4">
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>Uploading...</span>
              <span>{uploadProgress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
          </div>
        )}

        {selectedFile && !isUploading && (
          <div className="mt-4 flex justify-end">
            <button
              onClick={handleUpload}
              disabled={isUploading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              Upload Credential
            </button>
          </div>
        )}
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Your Credentials ({credentialsList.length})
        </h3>

        {credentialsList.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-4">📄</div>
            <p>No credentials uploaded yet</p>
            <p className="text-sm">Upload your first medical credential to get started</p>
          </div>
        ) : (
          <div className="space-y-4">
            {credentialsList.map((credential) => (
              <CredentialCard
                key={credential._id}
                credential={credential}
                showActions={!isUploading}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CredentialSection;
