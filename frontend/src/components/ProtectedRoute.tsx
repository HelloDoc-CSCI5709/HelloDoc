import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import {jwtDecode} from 'jwt-decode';
import { clearUser } from '../redux/reducers/userReducers'; 
import { isTokenExpired, refreshTokens } from '../utils/auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

interface TokenPayload {
  exp: number;
  role?: string;
  email?: string;
  userId?: string
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const dispatch = useDispatch();
  const location = useLocation();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const verify = async () => {
      const accessToken  = localStorage.getItem('accessToken');
      const refreshToken = localStorage.getItem('refreshToken');

      if (!accessToken || !refreshToken) {
        dispatch(clearUser());
        return setChecking(false);
      }

      if (isTokenExpired(accessToken)) {
        try {
          const { accessToken: newAT, refreshToken: newRT } = await refreshTokens(refreshToken);
          localStorage.setItem('accessToken', newAT);
          localStorage.setItem('refreshToken', newRT);
        } catch {
          dispatch(clearUser());
        }
      }

      setChecking(false);
    };

    verify();
  }, [dispatch]);

  if (checking) {
    return <div>Loading…</div>;
  }

  const token = localStorage.getItem('accessToken');
  if (!token) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  let userRole: string | undefined;
  try {
    const payload = jwtDecode<TokenPayload>(token);
    userRole = payload.role;
  } catch {
    userRole = undefined;
  }

  if (allowedRoles && (!userRole || !allowedRoles.includes(userRole))) {

    const dest = userRole === 'doctor'
      ? '/doctor-dashboard'
      : userRole === 'patient'
        ? '/patient-dashboard'
        : userRole === 'admin'
        ? '/admin-dashboard'
        :'/login';
    return <Navigate to={dest} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
