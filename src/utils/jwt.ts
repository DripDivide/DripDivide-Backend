import jwt from 'jsonwebtoken';
import { config } from '../config';
import { AuthenticationError } from './errors';

export interface TokenPayload {
  userId: string;
  email: string;
  iat?: number;
  exp?: number;
}

export function generateToken(payload: TokenPayload): string {
  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expiration,
    issuer: 'drips-divide-api',
  } as jwt.SignOptions);
}

export function verifyToken(token: string): TokenPayload {
  try {
    return jwt.verify(token, config.jwt.secret, {
      issuer: 'drips-divide-api',
    }) as TokenPayload;
  } catch {
    throw new AuthenticationError('Invalid or expired token');
  }
}

export function refreshToken(token: string): string {
  const payload = verifyToken(token);
  return generateToken({ userId: payload.userId, email: payload.email });
}
