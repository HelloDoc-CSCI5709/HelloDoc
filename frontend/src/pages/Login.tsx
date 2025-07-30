import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAppDispatch } from '../redux/hooks';
import { loginSuccess } from '../redux/reducers/userReducers'; 
import { toast } from 'react-toastify';
import { BASE_URL } from '../constant_url';
function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1); 
  const [securityQuestion, setSecurityQuestion] = useState('');
  const [securityAnswer, setSecurityAnswer] = useState('');
  const [tempToken, setTempToken] = useState('');
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const handleStepOne = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
        credentials: 'same-origin',
      });

      const result = await response.json();

      if (!response.ok) {
        switch (response.status) {
          case 400:
            throw new Error(result.message || 'Invalid email or password');
          case 401:
            throw new Error(result.message || 'Invalid credentials');
          case 403:
            throw new Error(result.message || 'Account not verified. Please check your email.');
          case 404:
            throw new Error(result.message || 'Account not found');
          case 409:
            throw new Error(result.message || 'Account conflict. Please contact support.');
          case 500:
            throw new Error('Server error. Please try again later.');
          default:
            throw new Error(result.message || `Login failed (${response.status})`);
        }
      }

      if (result.status === 200 && result.body) {
        const data = result.body;
        
        if (data.accessToken && data.user) {
          const { accessToken, refreshToken, user } = data;
          
          localStorage.setItem('accessToken', accessToken);
          if (refreshToken) {
            localStorage.setItem('refreshToken', refreshToken);
          }

          dispatch(loginSuccess({
            id: user.ID || user._id || user.id, 
            email: user.email,
            role: user.role,
            isVerified: user.emailVerified || user.isVerified || true, 
            profile: {
              fullName: user.fullName || user.name || 'User',
              email: user.email,
            },
          }));

          const redirectPath = user.role === 'doctor'
            ? '/doctor-dashboard'
            : user.role === 'admin'
              ? '/admin-dashboard'
              : '/patient-dashboard';

          navigate(redirectPath);
          toast.success('Login successful!');
          
        } else if (data.tempToken && data.question) {
          const { tempToken, question } = data;
          setTempToken(tempToken);
          setSecurityQuestion(question);
          setStep(2);
          toast.info('Please answer your security question to continue.');
        } else {
          throw new Error('Unexpected response format from server');
        }
      } else if (result.success && result.data) {
        const data = result.data;
        
        if (data.accessToken && data.user) {
          const { accessToken, refreshToken, user } = data;
          
          localStorage.setItem('accessToken', accessToken);
          if (refreshToken) {
            localStorage.setItem('refreshToken', refreshToken);
          }

          dispatch(loginSuccess({
            id: user._id || user.id,
            email: user.email,
            role: user.role,
            isVerified: user.emailVerified || user.isVerified,
            profile: {
              fullName: user.fullName || user.name,
              email: user.email,
            },
          }));

          const redirectPath = user.role === 'doctor'
            ? '/doctor-dashboard'
            : user.role === 'admin'
              ? '/admin-dashboard'
              : '/patient-dashboard';

          navigate(redirectPath);
          toast.success('Login successful!');
          
        } else if (data.tempToken && data.question) {
          const { tempToken, question } = data;
          setTempToken(tempToken);
          setSecurityQuestion(question);
          setStep(2);
        }
      } else {
        throw new Error('Unexpected response format from server');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStepTwo = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`${BASE_URL}/api/auth/login/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tempToken}`,
        },
        body: JSON.stringify({ securityAnswer }),
        credentials: 'same-origin',
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Verification failed');
      }

      if (result.status === 200 && result.body) {
        const { accessToken, refreshToken, user } = result.body;

        if (!accessToken || !user) {
          throw new Error('Missing required authentication data');
        }

        localStorage.setItem('accessToken', accessToken);
        if (refreshToken) {
          localStorage.setItem('refreshToken', refreshToken);
        }

        dispatch(loginSuccess({
          id: user.ID || user.id || user._id,
          email: user.email,
          role: user.role,
          isVerified: true,
          profile: {
            fullName: user.fullName || user.name || 'User', 
            email: user.email,
          },
        }));

        // Updated dashboard routing
        const redirectPath = user.role === 'doctor'
          ? '/doctor-dashboard'
          : user.role === 'admin'
            ? '/admin-dashboard'
            : '/patient-dashboard';

        navigate(redirectPath);
        toast.success('Login successful!');

      } else {
        throw new Error('Invalid authentication data received');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Verification failed. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
      <div className="max-w-5xl w-full grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="hidden md:flex flex-col justify-center items-center bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 text-white p-10 rounded-3xl shadow-2xl">
          <h1 className="text-4xl font-bold mb-4 text-pink-400">Hello<span className="text-white">Doc</span></h1>
          <img src="/login-illustration.png" alt="Login" className="w-64 h-auto mb-6 drop-shadow-lg" />
          <p className="text-lg font-semibold text-center mb-2">Your Health, Your Way — Anytime, Anywhere.</p>
          <p className="text-sm text-center max-w-md text-blue-100 leading-relaxed">
            Log in to connect with licensed healthcare providers for secure, convenient care. New here? Sign up to get started on your path to better health.
          </p>
        </div>

        <div className="bg-white p-8 shadow-2xl rounded-3xl border border-gray-100">
          <div className="mb-4">
            <Link to="/" className="text-blue-600 text-sm font-medium underline hover:text-blue-800 transition-colors duration-200">← Back to Home</Link>
          </div>

          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            {step === 1 ? 'Login to Your Account' : 'Answer Security Question'}
          </h2>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          {step === 1 ? (
            <form onSubmit={handleStepOne} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                <input
                  type="email"
                  className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="relative">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 pr-12 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  minLength={6}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-9 text-sm text-blue-600 font-medium hover:text-blue-800 transition-colors duration-200"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className={`w-full bg-gradient-to-r from-blue-700 to-blue-800 text-white py-3 rounded-lg font-semibold hover:from-blue-800 hover:to-blue-900 transition-all duration-200 flex justify-center items-center shadow-lg hover:shadow-xl transform hover:scale-105 ${isLoading ? 'opacity-75 cursor-not-allowed' : ''}`}
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Logging in...
                  </>
                ) : 'Continue'}
              </button>

              <p className="text-sm text-center mt-6 text-gray-600">
                Don't have an account?{' '}
                <Link to="/patientregister" className="text-blue-600 font-medium hover:text-blue-800 hover:underline transition-colors duration-200">Sign Up as Patient</Link>
                {' '}or{' '}
                <Link to="/doctorregister" className="text-blue-600 font-medium hover:text-blue-800 hover:underline transition-colors duration-200">Doctor</Link>
              </p>
            </form>
          ) : (
            <form onSubmit={handleStepTwo} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Security Question</label>
                <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg">
                  <p className="text-sm text-gray-800 font-medium">{securityQuestion}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Your Answer</label>
                <input
                  type="text"
                  className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                  placeholder="Enter your answer"
                  value={securityAnswer}
                  onChange={(e) => setSecurityAnswer(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className={`w-full bg-gradient-to-r from-blue-700 to-blue-800 text-white py-3 rounded-lg font-semibold hover:from-blue-800 hover:to-blue-900 transition-all duration-200 flex justify-center items-center shadow-lg hover:shadow-xl transform hover:scale-105 ${isLoading ? 'opacity-75 cursor-not-allowed' : ''}`}
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Verifying...
                  </>
                ) : 'Complete Login'}
              </button>

              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-full text-blue-600 font-medium text-sm hover:text-blue-800 hover:underline mt-4 transition-colors duration-200"
              >
                ← Back to email/password
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default Login;