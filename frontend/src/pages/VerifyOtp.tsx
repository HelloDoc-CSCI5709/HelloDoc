import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { BASE_URL } from '../constant_url';

interface VerifyOtpRequest {
  email: string;
  otp: string;
}

const VerifyOtpPage: React.FC = () => {
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const email = location.state?.email;

  useEffect(() => {
    if (!email) {
      navigate('/forgot-password');
    }
  }, [email, navigate]);

  if (!email) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const verifyOtpApi = async (data: VerifyOtpRequest): Promise<void> => {
    const response = await fetch(`${BASE_URL}/api/auth/verify-reset-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'OTP verification failed');
    }

    return result;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await verifyOtpApi({ email, otp });
      toast.success('OTP verified successfully!');
      navigate('/reset-password', { state: { email, otp } });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Verification failed';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 6) {
      setOtp(value);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Verify OTP
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Enter the 6-digit OTP sent to{' '}
            <span className="font-medium text-blue-600">{email}</span>
          </p>
        </div>

        <div className="bg-white p-8 shadow-md rounded-xl border">
          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-1">
                OTP Code
              </label>
              <input
                id="otp"
                name="otp"
                type="text"
                required
                maxLength={6}
                value={otp}
                onChange={handleOtpChange}
                className="w-full border border-gray-300 rounded px-3 py-2 text-center text-lg tracking-widest focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="000000"
                autoComplete="one-time-code"
              />
            </div>

            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              className={`w-full bg-blue-800 text-white py-2 px-4 rounded hover:bg-blue-900 transition flex justify-center items-center ${
                loading || otp.length !== 6 ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Verifying...
                </>
              ) : 'Verify OTP'}
            </button>

            <div className="text-center">
              <Link 
                to="/forgot-password"
                className="text-blue-600 hover:underline text-sm"
              >
                ← Back to Forgot Password
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default VerifyOtpPage;