import React from 'react';

interface CredentialStatusBadgeProps {
  status: 'Pending' | 'Approved' | 'Rejected';
  size?: 'sm' | 'md' | 'lg';
}

const CredentialStatusBadge: React.FC<CredentialStatusBadgeProps> = ({ 
  status, 
  size = 'md' 
}) => {
  const getStatusStyles = () => {
    switch (status) {
      case 'Pending':
        return {
          bg: 'bg-yellow-100',
          text: 'text-yellow-800',
          border: 'border-yellow-200',
          icon: '⏳'
        };
      case 'Approved':
        return {
          bg: 'bg-green-100',
          text: 'text-green-800',
          border: 'border-green-200',
          icon: '✅'
        };
      case 'Rejected':
        return {
          bg: 'bg-red-100',
          text: 'text-red-800',
          border: 'border-red-200',
          icon: '❌'
        };
      default:
        return {
          bg: 'bg-gray-100',
          text: 'text-gray-800',
          border: 'border-gray-200',
          icon: '❓'
        };
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return 'px-2 py-1 text-xs';
      case 'lg':
        return 'px-4 py-2 text-base';
      default:
        return 'px-3 py-1 text-sm';
    }
  };

  const styles = getStatusStyles();

  return (
    <span className={`
      inline-flex items-center space-x-1 rounded-full border font-medium
      ${styles.bg} ${styles.text} ${styles.border} ${getSizeStyles()}
    `}>
      <span>{styles.icon}</span>
      <span>{status}</span>
    </span>
  );
};

export default CredentialStatusBadge;
