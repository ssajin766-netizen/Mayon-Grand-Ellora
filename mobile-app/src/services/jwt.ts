// src/services/jwt.ts
import jwtDecode from 'jwt-decode';

type JwtPayload = {
  sub: string;
  role: 'admin' | 'user';
  exp: number;
  iat: number;
  // add any other fields your backend includes
};

/**
 * Decode stored JWT and return payload.
 * Returns null if token missing or malformed.
 */
export function getJwtPayload(token: string | null): JwtPayload | null {
  if (!token) return null;
  try {
    return jwtDecode<JwtPayload>(token);
  } catch (e) {
    console.warn('Invalid JWT', e);
    return null;
  }
}
