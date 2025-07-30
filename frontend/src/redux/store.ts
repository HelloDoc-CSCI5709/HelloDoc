import { configureStore } from '@reduxjs/toolkit';
import authReducer from './reducers/authReducers';
import { forgotPasswordReducer } from './reducers/authReducers'; 
import userReducer from './reducers/userReducers';
import appointmentReducer from './reducers/appointmentReducer';
import patientReducer from './reducers/patientReducer';
import videoReducer from './reducers/videoReducers'
import doctorReducer from './reducers/doctorReducer';
import dashboardReducer from './reducers/dashboardReducer';
import healthRecordReducer from './reducers/healthRecordReducer'; // Add this

export const store = configureStore({
  reducer: {
    auth: authReducer,
    forgotPassword: forgotPasswordReducer, 
    user: userReducer,
    appointment: appointmentReducer,
    patient: patientReducer,
    video: videoReducer,
    doctor: doctorReducer,
    dashboard: dashboardReducer,
    healthRecord: healthRecordReducer, // Add this
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          'doctor/updateAvailability/pending',
          'doctor/updateAvailability/fulfilled',
          'doctor/updateAvailability/rejected',
          'doctor/getAvailability/fulfilled',
          'dashboard/getDashboardStats/fulfilled',
          'dashboard/getTodayAppointments/fulfilled',
          'dashboard/getUpcomingAppointments/fulfilled',
          'healthRecord/getPatientHealthRecords/fulfilled', // Add this
          'healthRecord/getDoctorPatients/fulfilled', // Add this
        ],
        ignoredActionPaths: [
          'payload.headers', 
          'payload.config',
          'meta.arg', 
          'payload.start', 
          'payload.end'
        ],
        ignoredPaths: [
          'auth.refreshToken', 
          'auth.accessToken',
          'forgotPassword',
          'doctor.availability',
          'dashboard',
          'healthRecord', // Add this
          'admin'
        ],
      },
    }),
  devTools: import.meta.env.MODE !== 'production',
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
