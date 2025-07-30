import { jwtDecode } from 'jwt-decode';

export interface JwtPayload { exp: number; [key: string]: any; }

export const isTokenExpired = (token: string): boolean => {
  try {
    const { exp } = jwtDecode<JwtPayload>(token);
    return Date.now() / 1000 > exp;
  } catch {
    return true;
  }
};

export const refreshTokens = async (refreshToken: string) => {
  const res = await fetch(`${process.env.REACT_APP_BASE_URL}/api/auth/refresh-token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  });
  if (!res.ok) throw new Error('Token refresh failed');
  return res.json() as Promise<{ accessToken: string; refreshToken: string }>;
};
