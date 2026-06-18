import * as StellarSdk from '@stellar/stellar-sdk';
import { stellarConfig } from '../config/stellar';
import { BlockchainError } from '../utils/errors';
import { logger } from '../utils/logger';
import { sleep } from '../utils/helpers';

export class StellarService {
  private server = new StellarSdk.Horizon.Server(stellarConfig.horizonUrl);

  async validatePublicKey(publicKey: string): Promise<boolean> {
    try {
      StellarSdk.StrKey.decodeEd25519PublicKey(publicKey);
      await this.server.loadAccount(publicKey);
      return true;
    } catch {
      return false;
    }
  }

  async createSettlementTransaction(
    sourcePublicKey: string,
    destinationPublicKey: string,
    amount: string,
    memo?: string,
  ): Promise<string> {
    try {
      const sourceAccount = await this.server.loadAccount(sourcePublicKey);
      let builder = new StellarSdk.TransactionBuilder(sourceAccount, {
        fee: stellarConfig.baseFee,
        networkPassphrase: stellarConfig.networkPassphrase,
      }).addOperation(
        StellarSdk.Operation.payment({
          destination: destinationPublicKey,
          asset: StellarSdk.Asset.native(),
          amount,
        }),
      );

      if (memo) builder = builder.addMemo(StellarSdk.Memo.text(memo));

      return builder.setTimeout(stellarConfig.transactionTimeout).build().toXDR();
    } catch (error) {
      logger.error('Failed to create settlement transaction', { error });
      throw new BlockchainError('Failed to create transaction');
    }
  }

  async submitTransaction(signedTransactionXDR: string): Promise<string> {
    try {
      const transaction = StellarSdk.TransactionBuilder.fromXDR(
        signedTransactionXDR,
        stellarConfig.networkPassphrase,
      );
      const result = await this.server.submitTransaction(transaction);
      return result.hash;
    } catch (error: any) {
      logger.error('Transaction submission failed', { error });
      throw new BlockchainError(
        error.response?.data?.extras?.result_codes?.transaction
          ? `Transaction failed: ${error.response.data.extras.result_codes.transaction}`
          : 'Failed to submit transaction',
      );
    }
  }

  async verifyTransaction(transactionHash: string): Promise<boolean> {
    try {
      const transaction = await this.server.transactions().transaction(transactionHash).call();
      return transaction.successful;
    } catch (error) {
      logger.error('Failed to verify transaction', { transactionHash, error });
      return false;
    }
  }

  async monitorTransaction(
    transactionHash: string,
    callback: (success: boolean) => void,
  ): Promise<void> {
    for (let attempt = 0; attempt < 30; attempt += 1) {
      if (await this.verifyTransaction(transactionHash)) {
        callback(true);
        return;
      }
      await sleep(2000);
    }
    callback(false);
  }

  getExplorerUrl(transactionHash: string): string {
    const baseUrl = stellarConfig.isTestnet
      ? 'https://stellar.expert/explorer/testnet'
      : 'https://stellar.expert/explorer/public';
    return `${baseUrl}/tx/${transactionHash}`;
  }
}
