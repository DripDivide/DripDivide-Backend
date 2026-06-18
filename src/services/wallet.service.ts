import type { UserDAL } from '../dal/user.dal';
import { NotFoundError, ValidationError } from '../utils/errors';
import type { StellarService } from './stellar.service';

export class WalletService {
  constructor(
    private stellarService: StellarService,
    private userDAL: UserDAL,
  ) {}

  async connectWallet(userId: string, publicKey: string) {
    const valid = await this.stellarService.validatePublicKey(publicKey);
    if (!valid) throw new ValidationError('Invalid Stellar public key or account does not exist');

    const user = await this.userDAL.updateStellarKey(userId, publicKey);
    if (!user) throw new NotFoundError('User');

    return {
      userId: user.id,
      stellarPublicKey: user.stellarPublicKey,
      verified: true,
    };
  }

  async getWallet(userId: string) {
    const user = await this.userDAL.findById(userId);
    if (!user) throw new NotFoundError('User');
    return {
      userId: user.id,
      stellarPublicKey: user.stellarPublicKey ?? null,
      connected: Boolean(user.stellarPublicKey),
    };
  }
}
