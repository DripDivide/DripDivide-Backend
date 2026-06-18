import { createClient } from 'redis';
import { config } from './index';
import { logger } from '../utils/logger';

export const redisClient = createClient({
  url: config.redis.url,
  password: config.redis.password,
  socket: {
    tls: config.redis.tls,
    rejectUnauthorized: false,
  },
});

redisClient.on('error', (error) => {
  logger.error('Redis error', { error });
});

export async function connectRedis(): Promise<void> {
  if (!redisClient.isOpen) await redisClient.connect();
}

export async function cacheGet<T>(key: string): Promise<T | null> {
  const value = await redisClient.get(key);
  return value ? (JSON.parse(value) as T) : null;
}

export async function cacheSet(key: string, value: unknown, seconds = 3600): Promise<void> {
  await redisClient.setEx(key, seconds, JSON.stringify(value));
}
