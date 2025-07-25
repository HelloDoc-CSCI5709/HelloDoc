import { configureStore } from '@reduxjs/toolkit';
import authReducer from './reducers/authReducers';
import userReducer from './reducers/userReducers';
import appointmentReducer from './reducers/appointmentReducer';
import patientReducer from './reducers/patientReducer';
import videoReducer from './reducers/videoReducers'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    user: userReducer,
    appointment: appointmentReducer,
    patient: patientReducer,
    video:       videoReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActionPaths: ['payload.headers', 'payload.config'],
        ignoredPaths: ['auth.refreshToken', 'auth.accessToken'],
      },
    }),
  devTools: import.meta.env.MODE !== 'production',
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;