import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { BASE_URL } from '../constant_url';

const VerifyEmail: React.FC = () => {
  const [status, setStatus] = useState<'loading' | 'success' | 'already-verified' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const hasVerified = useRef(false);

  useEffect(() => {
    const verifyEmail = async () => {
      if (hasVerified.current) return;
      hasVerified.current = true;

      const token = new URLSearchParams(window.location.search).get('token');

      if (!token) {
        setStatus('error');
        setMessage('Invalid or missing verification token.');
        toast.error('Invalid or missing verification token.');
        return;
      }

      try {
        const response = await fetch(`${BASE_URL}/api/auth/verify-email?token=${token}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        let data;
        try {
          data = await response.json();
        } catch {
          data = { message: 'Invalid response from server' };
        }

        if (response.ok) {
          setStatus('success');
          setMessage('Your email has been verified successfully! Redirecting to login...');
          toast.success('Email verified successfully!');
          
          setTimeout(() => {
            navigate('/login');
          }, 3000);
          
        } else if (response.status === 409) {
          setStatus('already-verified');
          setMessage('Your email is already verified! You can proceed to login.');
          toast.info('Email already verified!');
          
          setTimeout(() => {
            navigate('/login');
          }, 3000);
          
        } else {
          // Handle actual errors
          let errorMessage = 'Email verification failed';
          
          if (response.status === 400) {
            errorMessage = data.message || 'Invalid verification token';
          } else if (response.status === 401) {
            errorMessage = 'Invalid or expired verification token';
          } else if (response.status === 404) {
            errorMessage = 'Verification token not found or expired';
          } else if (response.status === 500) {
            errorMessage = 'Server error. Please try again later.';
          } else {
            errorMessage = data.message || `Verification failed (${response.status})`;
          }
          
          setStatus('error');
          setMessage(errorMessage);
          toast.error(errorMessage);
        }
      } catch (error) {
        const errMsg = error instanceof Error ? error.message : 'Network error. Please check your connection and try again.';
        setStatus('error');
        setMessage(errMsg);
        toast.error(errMsg);
      }
    };

    verifyEmail();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-lg text-center border">
        <div className="mb-6">
          {status === 'loading' && (
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
              <h1 className="text-2xl font-bold text-gray-800 mb-2">Verifying Email</h1>
              <p className="text-blue-600 text-sm">Please wait while we verify your email address...</p>
            </div>
          )}

          {status === 'success' && (
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-green-600 mb-2">Email Verified!</h1>
              <p className="text-green-600 text-sm mb-4">{message}</p>
            </div>
          )}

          {status === 'already-verified' && (
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-blue-600 mb-2">Already Verified!</h1>
              <p className="text-blue-600 text-sm mb-4">{message}</p>
              <button
                onClick={() => navigate('/login')}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
              >
                Go to Login
              </button>
            </div>
          )}

          {status === 'error' && (
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-red-600 mb-2">Verification Failed</h1>
              <p className="text-red-600 text-sm mb-4">{message}</p>
              <button
                onClick={() => navigate('/login')}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
              >
                Go to Login
              </button>
            </div>
          )}
        </div>

        {(status === 'success' || status === 'already-verified') && (
          <div className="text-xs text-gray-500">
            Redirecting automatically in 3 seconds...
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;