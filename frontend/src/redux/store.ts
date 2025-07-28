import { configureStore } from '@reduxjs/toolkit';
import authReducer from './reducers/authReducers';
import { forgotPasswordReducer } from './reducers/authReducers'; 
import userReducer from './reducers/userReducers';
import appointmentReducer from './reducers/appointmentReducer';
import patientReducer from './reducers/patientReducer';
import videoReducer from './reducers/videoReducers'
import doctorReducer from './reducers/doctorReducer'; 
//import adminReducer from './reducers/adminReducer'; 

export const store = configureStore({
  reducer: {
    auth: authReducer,
    forgotPassword: forgotPasswordReducer, 
    user: userReducer,
    appointment: appointmentReducer,
    patient: patientReducer,
    video: videoReducer,
    doctor: doctorReducer,
    //admin: adminReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActionPaths: ['payload.headers', 'payload.config'],
        ignoredPaths: [
          'auth.refreshToken', 
          'auth.accessToken',
          'forgotPassword',
          'doctor',
          'admin'
        ],
      },
    }),
  devTools: import.meta.env.MODE !== 'production',
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;