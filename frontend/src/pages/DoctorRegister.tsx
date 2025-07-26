import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { BASE_URL } from '../constant_url';

function DoctorRegister() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    dob: '',
    specialty: '',
    age: '',
    gender: '',
    password: '',
    confirmPassword: '',
  });

  const [securityQuestion, setSecurityQuestion] = useState("What city were you born in?");
  const [securityAnswer, setSecurityAnswer] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState(''); 

  const securityQuestions = [
    "What city were you born in?",
    "What was your first pet's name?",
    "What is your mother's maiden name?",
    "What was your first school's name?",
    "What was your childhood nickname?"
  ];

  const specialties = [
    "Cardiology",
    "Neurology",
    "Pediatrics",
    "General Medicine",
    "Dermatology",
    "Orthopedics",
    "Ophthalmology",
    "Psychiatry"
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccessMessage('');

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    if (parseInt(form.age) < 25) {
      setError('You must be at least 25 years old to register as a doctor');
      setIsLoading(false);
      return;
    }

    if (form.password.length < 6) {
      setError('Password must be at least 6 characters');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`${BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullName: form.fullName,
          email: form.email,
          password: form.password,
          role: 'doctor',
          securityQuestion,
          securityAnswer,
          phone: form.phone,
          dob: form.dob,
          specialty: form.specialty,
          age: form.age,
          gender: form.gender
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle specific error codes
        switch (response.status) {
          case 400:
            throw new Error(data.message || 'Invalid registration data');
          case 409:
            throw new Error(data.message || 'Email already exists. Please use a different email or login.');
          case 500:
            throw new Error('Server error. Please try again later.');
          default:
            throw new Error(data.message || `Registration failed (${response.status})`);
        }
      }

      // Success - show message and redirect
      setSuccessMessage(data.message || 'Registration successful! A verification link has been sent to your email.');
      toast.success('Registration successful! Please check your email.');

      setTimeout(() => {
        navigate('/login', { 
          state: { 
            message: 'Registration successful! Please check your email for verification and then login.',
            email: form.email,
            role: 'doctor'
          } 
        });
      }, 3000);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Registration failed. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
      <div className="max-w-5xl w-full grid grid-cols-1 md:grid-cols-2 gap-6">

        <div className="hidden md:flex flex-col justify-center items-center bg-gradient-to-br from-blue-900 to-blue-700 text-white p-8 rounded-2xl shadow-md">
          <h1 className="text-3xl font-bold mb-3 text-pink-400">Hello<span className="text-white">Doc</span></h1>
          <img src="/login-illustration.png" alt="Doctor" className="w-56 h-auto mb-4" />
          <p className="text-base font-semibold text-center mb-1">Welcome, Doctor!</p>
          <p className="text-xs text-center max-w-md">
            Sign up to manage appointments, consult patients, and deliver quality care on HelloDoc.
          </p>
        </div>

        <div className="bg-white p-6 shadow-md rounded-xl">
          <div className="mb-2">
            <Link to="/" className="text-blue-600 text-xs underline hover:text-blue-800">
              ← Back to Home
            </Link>
          </div>

          <div className="flex justify-center mb-4">
            <div className="inline-flex rounded-full border border-gray-300 overflow-hidden">
              <Link to="/patientregister" className="px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-100">Patient</Link>
              <span className="px-3 py-1 text-xs font-medium bg-blue-800 text-white">Doctor</span>
            </div>
          </div>

          <h2 className="text-xl font-bold text-gray-800 mb-4">Create Your Doctor Account</h2>

          {error && (
            <div className="mb-3 p-2 bg-red-100 text-red-700 rounded-md text-xs">
              {error}
            </div>
          )}

          {successMessage && (
            <div className="mb-3 p-2 bg-green-100 text-green-700 rounded-md text-xs">
              {successMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Full Name*</label>
                <input 
                  type="text" 
                  name="fullName" 
                  className="w-full border border-gray-300 rounded px-2 py-1 text-xs" 
                  value={form.fullName} 
                  onChange={handleChange} 
                  required 
                />
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Email*</label>
                <input 
                  type="email" 
                  name="email" 
                  className="w-full border border-gray-300 rounded px-2 py-1 text-xs" 
                  value={form.email} 
                  onChange={handleChange} 
                  required 
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Phone*</label>
                <input 
                  type="tel" 
                  name="phone" 
                  className="w-full border border-gray-300 rounded px-2 py-1 text-xs" 
                  value={form.phone} 
                  onChange={handleChange} 
                  required 
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Date of Birth*</label>
                <input 
                  type="date" 
                  name="dob" 
                  className="w-full border border-gray-300 rounded px-2 py-1 text-xs" 
                  value={form.dob} 
                  onChange={handleChange} 
                  required 
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Specialty*</label>
                <select 
                  name="specialty" 
                  className="w-full border border-gray-300 rounded px-2 py-1 text-xs" 
                  value={form.specialty} 
                  onChange={handleChange} 
                  required
                >
                  <option value="">Select Specialty</option>
                  {specialties.map((spec) => (
                    <option key={spec} value={spec}>{spec}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Age*</label>
                <select 
                  name="age" 
                  className="w-full border border-gray-300 rounded px-2 py-1 text-xs" 
                  value={form.age} 
                  onChange={handleChange} 
                  required
                >
                  <option value="">Select Age</option>
                  {Array.from({ length: 50 }, (_, i) => (
                    <option key={i} value={i + 25}>{i + 25}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Gender*</label>
                <select 
                  name="gender" 
                  className="w-full border border-gray-300 rounded px-2 py-1 text-xs" 
                  value={form.gender} 
                  onChange={handleChange} 
                  required
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                  <option value="prefer-not-to-say">Prefer not to say</option>
                </select>
              </div>

              <div className="relative">
                <label className="block text-xs font-medium text-gray-700 mb-1">Password* (min 6 chars)</label>
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  name="password" 
                  className="w-full border border-gray-300 rounded px-2 py-1 text-xs pr-6" 
                  value={form.password} 
                  onChange={handleChange} 
                  minLength={6}
                  required 
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)} 
                  className="absolute right-1 bottom-1 text-xs text-blue-600 px-1"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>

              <div className="relative">
                <label className="block text-xs font-medium text-gray-700 mb-1">Confirm Password*</label>
                <input 
                  type={showConfirmPassword ? 'text' : 'password'} 
                  name="confirmPassword" 
                  className="w-full border border-gray-300 rounded px-2 py-1 text-xs pr-6" 
                  value={form.confirmPassword} 
                  onChange={handleChange} 
                  required 
                />
                <button 
                  type="button" 
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)} 
                  className="absolute right-1 bottom-1 text-xs text-blue-600 px-1"
                >
                  {showConfirmPassword ? 'Hide' : 'Show'}
                </button>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Security Question*</label>
                <select 
                  value={securityQuestion}
                  onChange={(e) => setSecurityQuestion(e.target.value)}
                  className="w-full border border-gray-300 rounded px-2 py-1 text-xs"
                  required
                >
                  {securityQuestions.map((question, index) => (
                    <option key={index} value={question}>{question}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Security Answer*</label>
                <input 
                  type="text" 
                  value={securityAnswer}
                  onChange={(e) => setSecurityAnswer(e.target.value)}
                  className="w-full border border-gray-300 rounded px-2 py-1 text-xs"
                  required
                />
              </div>
            </div>

            <div className="flex items-center text-xs">
              <input
                id="terms-checkbox"
                type="checkbox"
                className="h-3 w-3 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                required
              />
              <label htmlFor="terms-checkbox" className="ml-2 text-gray-700">
                I agree to the <a href="#" className="text-blue-600 hover:underline">Terms</a> and <a href="#" className="text-blue-600 hover:underline">Privacy Policy</a>
              </label>
            </div>

            <button 
              type="submit" 
              className={`w-full bg-blue-800 text-white py-1.5 rounded hover:bg-blue-900 transition flex justify-center items-center text-xs ${isLoading ? 'opacity-75' : ''}`}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-1 h-3 w-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Registering...
                </>
              ) : 'Register'}
            </button>
          </form>

          <p className="text-xs text-center mt-3 text-gray-600">
            Already have an account? <Link to="/login" className="text-blue-600 hover:underline">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default DoctorRegister;