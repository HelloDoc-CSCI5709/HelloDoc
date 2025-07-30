import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import ProtectedRoute from './components/ProtectedRoute';

import DoctorProfile from './pages/DoctorProfile';
import Login from './pages/Login'
import PatientRegister from './pages/PatientRegister'
import DoctorRegister from './pages/DoctorRegister'
import Home from './pages/Home'
import AppointmentBooking from './pages/AppointmentBooking'
import DoctorSelection from './pages/DoctorSelection'
import PatientProfile from './pages/PatientProfile'
import PatientDashboard from './pages/PatientDashboard'
import DoctorDashboard from './pages/DoctorDashboard'
import ForgotPassword from './pages/ForgotPassword'
import VerifyOtpPage from './pages/VerifyOtp'
import ResetPassword from './pages/ResetPassword'
import VerifyEmail from './pages/VerifyEmail'
import PatientCalendar from './pages/PatientCalendar'
import DoctorCalendar from './pages/DoctorCalendar'
import PreJoinVideo from './pages/PreJoinVideo'
import VideoCallPage from './pages/VideoCallPage'
import BookAppointment from './pages/AppointmentBooking'
import DoctorProfilePage from './pages/DoctorProfilePage';
import AdminDashboard from './pages/AdminDashboard'

import ChatPage from './pages/ChatPage'

import AllAppointments from './pages/AllAppointments'


function App() {
  return (
    <div data-testid="app-container">
      <ToastContainer position="top-right" autoClose={4000} hideProgressBar />
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/patientregister" element={<PatientRegister />} />
          <Route path="/doctorregister" element={<DoctorRegister />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/verify-otp" element={<VerifyOtpPage />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/" element={<Home />} />

          <Route
            path="/chat"
            element={
              <ProtectedRoute>
                <ChatPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/video/:appointmentId"
            element={
              <ProtectedRoute>
                <PreJoinVideo />
              </ProtectedRoute>
            }
          />
          <Route path="/appointments" element={<AllAppointments />} />
        
          <Route
            path="/video/:appointmentId/room/:roomId"
            element={
              <ProtectedRoute>
                <VideoCallPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/book-appointment"
            element={
              <ProtectedRoute allowedRoles={['patient']}>
                <AppointmentBooking />
              </ProtectedRoute>
            }
          />
          <Route
            path="/select-doctor"
            element={
              <ProtectedRoute allowedRoles={['patient']}>
                <DoctorSelection />
              </ProtectedRoute>
            }
          />
          <Route
            path="/doctor-profile"
            element={
              <ProtectedRoute allowedRoles={['patient']}>
                <DoctorProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/patient-profile"
            element={
              <ProtectedRoute allowedRoles={['patient']}>
                <PatientProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/patient-dashboard"
            element={
              <ProtectedRoute allowedRoles={['patient']}>
                <PatientDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/patient-calendar"
            element={
              <ProtectedRoute allowedRoles={['patient']}>
                <PatientCalendar />
              </ProtectedRoute>
            }
          />
          <Route
            path="/patient/book-appointment"
            element={
              <ProtectedRoute allowedRoles={['patient']}>
                <BookAppointment />
              </ProtectedRoute>
            }
          />

          <Route
            path="/doctor-dashboard"
            element={
              <ProtectedRoute allowedRoles={['doctor']}>
                <DoctorDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/doctor/doctor-profile"
            element={
              <ProtectedRoute allowedRoles={['doctor']}>
                <DoctorProfilePage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/doctor-calendar"
            element={
              <ProtectedRoute allowedRoles={['doctor']}>
                <DoctorCalendar />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin-dashboard"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
