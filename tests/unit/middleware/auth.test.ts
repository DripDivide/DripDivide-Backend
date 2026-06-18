import type { NextFunction, Request, Response } from 'express';
import { authenticate } from '../../../src/middleware/auth';
import { generateToken } from '../../../src/utils/jwt';

function response() {
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };
  return res as unknown as Response & typeof res;
}

describe('authenticate', () => {
  it('attaches a verified user to the request', () => {
    const req = {
      headers: {
        authorization: `Bearer ${generateToken({ userId: 'user-1', email: 'u@example.com' })}`,
      },
    } as Request;
    const res = response();
    const next = jest.fn() as NextFunction;

    authenticate(req, res, next);

    expect(req.user).toEqual({ userId: 'user-1', email: 'u@example.com' });
    expect(next).toHaveBeenCalledTimes(1);
  });

  it('rejects requests without a bearer token', () => {
    const req = { headers: {} } as Request;
    const res = response();

    authenticate(req, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
    });
  });
});
