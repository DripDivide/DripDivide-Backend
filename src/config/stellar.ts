import * as StellarSdk from '@stellar/stellar-sdk';
import { config } from './index';

export const stellarConfig = {
  horizonUrl: config.stellar.horizonUrl,
  isTestnet: config.stellar.isTestnet,
  networkPassphrase: config.stellar.isTestnet
    ? StellarSdk.Networks.TESTNET
    : StellarSdk.Networks.PUBLIC,
  baseFee: StellarSdk.BASE_FEE,
  transactionTimeout: 180,
};
