import React from 'react';
import CredentialStatusBadge from './CredentialStatusBadge';
import { FileValidator } from '../../../utils/fileValidator';

interface DoctorCredential {
  _id: string;
  id: string;
  doctorId: string;
  fileName: string;
  documentType: string;
  doctorEmail: string;
  doctorName: string;
  doctorProfilePicture: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  adminId?: string;
  submittedAt: Date;
  reviewedAt?: Date;
  reason?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface CredentialCardProps {
  credential: DoctorCredential;
  onDownload?: (credential: DoctorCredential) => void;
  onDelete?: (credentialId: string) => void;
  showActions?: boolean;
}

const CredentialCard: React.FC<CredentialCardProps> = ({
  credential,
  onDownload,
  onDelete,
  showActions = true
}) => {
  const formatDate = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(dateObj);
  };

  const getFileExtension = (filename: string) => {
    return FileValidator.getFileExtension(filename).toUpperCase();
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4 bg-white hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          {/* Header */}
          <div className="flex items-center space-x-3 mb-3">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <span className="text-red-600 font-semibold text-sm">
                  {getFileExtension(credential.fileName)}
                </span>
              </div>
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-gray-900 truncate">
                {credential.fileName}
              </h3>
              <p className="text-sm text-gray-500">
                {credential.documentType}
              </p>
            </div>
            
            <CredentialStatusBadge status={credential.status} />
          </div>

          {/* Details */}
          <div className="space-y-2 text-sm text-gray-600">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <p><strong>Submitted:</strong> {formatDate(credential.submittedAt)}</p>
              
              {credential.reviewedAt && (
                <p><strong>Reviewed:</strong> {formatDate(credential.reviewedAt)}</p>
              )}
            </div>

            {credential.status === 'Rejected' && credential.reason && (
              <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm font-medium text-red-800 mb-1">Rejection Reason:</p>
                <p className="text-sm text-red-700">{credential.reason}</p>
              </div>
            )}

            {credential.status === 'Approved' && (
              <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-700">
                  ✅ This credential has been approved by our medical verification team.
                </p>
              </div>
            )}

            {credential.status === 'Pending' && (
              <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-700">
                  ⏳ This credential is currently under review by our medical verification team.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        {showActions && (
          <div className="flex flex-col space-y-2 ml-4">
            {onDownload && (
              <button
                onClick={() => onDownload(credential)}
                className="text-blue-600 hover:text-blue-800 text-sm flex items-center space-x-1"
              >
                <span>📥</span>
                <span>Download</span>
              </button>
            )}
            
            {onDelete && credential.status !== 'Approved' && (
              <button
                onClick={() => onDelete(credential._id)}
                className="text-red-600 hover:text-red-800 text-sm flex items-center space-x-1"
              >
                <span>🗑️</span>
                <span>Delete</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CredentialCard;
