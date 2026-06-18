import dotenv from 'dotenv';

dotenv.config({ path: process.env.NODE_ENV === 'test' ? '.env.test' : '.env' });

interface Config {
  env: string;
  port: number;
  apiVersion: string;
  database: {
    url: string;
    poolMin: number;
    poolMax: number;
    ssl: boolean;
  };
  redis: {
    url: string;
    password?: string;
    tls: boolean;
  };
  jwt: {
    secret: string;
    expiration: string;
  };
  stellar: {
    horizonUrl: string;
    isTestnet: boolean;
  };
  rateLimit: {
    windowMs: number;
    maxRequests: number;
  };
  cors: {
    origin: string;
    credentials: boolean;
  };
  logging: {
    level: string;
    format: string;
  };
}

function numberFromEnv(name: string, fallback: number): number {
  const raw = process.env[name];
  if (!raw) return fallback;
  const value = Number.parseInt(raw, 10);
  if (Number.isNaN(value)) throw new Error(`${name} must be a number`);
  return value;
}

export const config: Config = {
  env: process.env.NODE_ENV || 'development',
  port: numberFromEnv('PORT', 3000),
  apiVersion: process.env.API_VERSION || 'v1',
  database: {
    url: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/drips_divide',
    poolMin: numberFromEnv('DATABASE_POOL_MIN', 2),
    poolMax: numberFromEnv('DATABASE_POOL_MAX', 10),
    ssl: process.env.DATABASE_SSL === 'true',
  },
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
    password: process.env.REDIS_PASSWORD || undefined,
    tls: process.env.REDIS_TLS === 'true',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'dev_secret_change_in_production',
    expiration: process.env.JWT_EXPIRATION || '24h',
  },
  stellar: {
    horizonUrl: process.env.STELLAR_HORIZON_URL || 'https://horizon-testnet.stellar.org',
    isTestnet: (process.env.STELLAR_NETWORK || 'testnet') === 'testnet',
  },
  rateLimit: {
    windowMs: numberFromEnv('RATE_LIMIT_WINDOW_MS', 60000),
    maxRequests: numberFromEnv('RATE_LIMIT_MAX_REQUESTS', 100),
  },
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    credentials: process.env.CORS_CREDENTIALS === 'true',
  },
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    format: process.env.LOG_FORMAT || 'json',
  },
};
