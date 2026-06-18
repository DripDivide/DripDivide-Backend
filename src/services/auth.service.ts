import type { UserDAL } from '../dal/user.dal';
import { ConflictError, InvalidCredentialsError, ValidationError } from '../utils/errors';
import { comparePassword, hashPassword, validatePasswordStrength } from '../utils/crypto';
import { generateToken, refreshToken } from '../utils/jwt';
import { sleep } from '../utils/helpers';

export class AuthService {
  constructor(private userDAL: UserDAL) {}

  async register(email: string, password: string): Promise<{ userId: string; email: string; token: string }> {
    if (!validatePasswordStrength(password)) {
      throw new ValidationError(
        'Password must be at least 8 characters and include uppercase, lowercase, and a number',
      );
    }

    const existingUser = await this.userDAL.findByEmail(email);
    if (existingUser) throw new ConflictError('Email already registered', 'DUPLICATE_EMAIL');

    const user = await this.userDAL.create({
      email,
      password: await hashPassword(password),
    });

    return {
      userId: user.id,
      email: user.email,
      token: generateToken({ userId: user.id, email: user.email }),
    };
  }

  async login(email: string, password: string): Promise<{ userId: string; email: string; token: string }> {
    await sleep(200);

    const user = await this.userDAL.findByEmail(email);
    if (!user) throw new InvalidCredentialsError();

    const valid = await comparePassword(password, user.password);
    if (!valid) throw new InvalidCredentialsError();

    return {
      userId: user.id,
      email: user.email,
      token: generateToken({ userId: user.id, email: user.email }),
    };
  }

  refresh(token: string): string {
    return refreshToken(token);
  }
}
