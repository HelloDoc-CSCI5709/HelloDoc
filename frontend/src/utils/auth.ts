import { jwtDecode } from 'jwt-decode';

export interface JwtPayload {
  exp: number;
  userId?: string;
  role?: string;
}

export const isTokenExpired = (token: string): boolean => {
  try {
    const { exp } = jwtDecode<JwtPayload>(token);
    return Date.now() / 1000 > exp;
  } catch {
    return true;
  }
};

export const refreshTokens = async (refreshToken: string) => {
  const baseUrl = import.meta.env.VITE_BACKEND_BASE_URL;
  if (!baseUrl) {
    throw new Error('Backend base URL is not defined');
  }
  const res = await fetch(`${baseUrl}/api/auth/refresh-token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  });
  if (!res.ok) throw new Error('Token refresh failed');
  return res.json() as Promise<{ accessToken: string; refreshToken: string }>;
};