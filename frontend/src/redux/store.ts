import { configureStore } from '@reduxjs/toolkit';
import authReducer from './reducers/authReducers';
import { forgotPasswordReducer } from './reducers/authReducers'; 
import userReducer from './reducers/userReducers';
import appointmentReducer from './reducers/appointmentReducer';
import patientReducer from './reducers/patientReducer';
import videoReducer from './reducers/videoReducers'
import doctorReducer from './reducers/doctorReducer'; 
import adminReducer from './reducers/adminReducer'; 
import dashboardReducer from './reducers/dashboardReducer'; 

export const store = configureStore({
  reducer: {
    auth: authReducer,
    forgotPassword: forgotPasswordReducer, 
    user: userReducer,
    appointment: appointmentReducer,
    patient: patientReducer,
    video: videoReducer,
    doctor: doctorReducer,
    admin: adminReducer,
    dashboard: dashboardReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          'doctor/updateAvailability/pending',
          'doctor/updateAvailability/fulfilled',
          'doctor/updateAvailability/rejected',
          'doctor/getAvailability/fulfilled'
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
          'admin'
        ],
      },
    }),
  devTools: import.meta.env.MODE !== 'production',
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
