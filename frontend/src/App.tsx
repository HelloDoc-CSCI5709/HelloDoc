// src/App.tsx
import React, { Suspense } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

const Login = React.lazy(() => import("./pages/Login"));
const PatientRegister = React.lazy(() => import("./pages/PatientRegister"));
const DoctorRegister = React.lazy(() => import("./pages/DoctorRegister"));
const AppointmentBooking = React.lazy(() =>
  import("./pages/AppointmentBooking")
);
const DoctorSelection = React.lazy(() => import("./pages/DoctorSelection"));
const DoctorProfile = React.lazy(() => import("./pages/DoctorProfile"));
const PatientProfile = React.lazy(() => import("./pages/PatientProfile"));
const PatientDashboard = React.lazy(() => import("./pages/PatientDashboard"));
const DoctorDashboard = React.lazy(() => import("./pages/DoctorDashboard"));
const ForgotPassword = React.lazy(() => import("./pages/ForgotPassword"));
const VerifyOtpPage = React.lazy(() => import("./pages/VerifyOtp"));
const ResetPassword = React.lazy(() => import("./pages/ResetPassword"));
const VerifyEmail = React.lazy(() => import("./pages/VerifyEmail"));
const PatientCalendar = React.lazy(() => import("./pages/PatientCalendar"));
const DoctorCalendar = React.lazy(() => import("./pages/DoctorCalendar"));
const ChatPage = React.lazy(() => import("./pages/ChatPage"));
const Home = React.lazy(() => import("./pages/Home"));



function App() {
  return (
    <div data-testid="app-container">
      <Router>
        <Suspense
          fallback={<div className="text-center py-10">Loading...</div>}
        >
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/patientregister" element={<PatientRegister />} />
            <Route path="/doctorregister" element={<DoctorRegister />} />
            <Route path="/book-appointment" element={<AppointmentBooking />} />
            <Route path="/select-doctor" element={<DoctorSelection />} />
            <Route path="/doctor-profile" element={<DoctorProfile />} />
            <Route path="/patient-profile" element={<PatientProfile />} />
            <Route path="/patient-dashboard" element={<PatientDashboard />} />
            <Route path="/doctor-dashboard" element={<DoctorDashboard />} />
            <Route path="/patient-calendar" element={<PatientCalendar />} />
            <Route path="/doctor-calendar" element={<DoctorCalendar />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/verify-otp" element={<VerifyOtpPage />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/chat" element={<ChatPage />} />
            <Route path="*" element={<Home />} />
          </Routes>
        </Suspense>
      </Router>
    </div>
  );
}

export default App;
