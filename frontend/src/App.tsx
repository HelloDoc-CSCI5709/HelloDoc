
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Login from './pages/Login'
import PatientRegister from './pages/PatientRegister'
import DoctorRegister from './pages/DoctorRegister'
import Home from './pages/Home'
import AppointmentBooking from './pages/AppointmentBooking'
import DoctorSelection from './pages/DoctorSelection'
//import DoctorProfile from './pages/DoctorProfile'
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
import { ToastContainer } from "react-toastify";
import DoctorProfilePage from './pages/DoctorProfilePage';
import "react-toastify/dist/ReactToastify.css";
//import AdminDashboard from './pages/AdminDashboard'

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
          <Route path="/book-appointment" element={<AppointmentBooking />} />
          <Route path="/select-doctor" element={<DoctorSelection />} />
          {/* <Route path="/doctor-profile" element={<DoctorProfile />} /> */}
          <Route path="/patient-profile" element={<PatientProfile />} />
          <Route path="/patient-dashboard" element={<PatientDashboard />} />
          <Route path="/doctor-dashboard" element={<DoctorDashboard />} />
          <Route path="/patient-calendar" element={<PatientCalendar />} />
          <Route path="/doctor-calendar" element={<DoctorCalendar />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/verify-otp" element={<VerifyOtpPage />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/appointments" element={<AllAppointments />} />

          <Route path="/patient/book-appointment" element={<BookAppointment />} />
          {/*<Route path="/patient/appointments" element={<AppointmentsList />} />*/}
          {/*<Route path="/admin-dashboard" element={<AdminDashboard />} />*/}
          <Route path="/chat" element={<ChatPage />} /> 
          <Route path="/video/:appointmentId" element={<PreJoinVideo />} />
          <Route path="/doctor-profile" element={<DoctorProfilePage />} />
        
          <Route
            path="/video/:appointmentId/room/:roomId"
            element={<VideoCallPage />}
          />

          <Route path="*" element={<Home />} />
        </Routes>
      </Router>
    </div>
  )
}

export default App
