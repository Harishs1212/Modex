import redis from '../config/redis';
import { REDIS_TTL } from './constants';

export class RedisClient {
  /**
   * Set a key-value pair with optional TTL
   */
  static async set(key: string, value: string, ttl?: number): Promise<void> {
    if (ttl) {
      await redis.setex(key, ttl, value);
    } else {
      await redis.set(key, value);
    }
  }

  /**
   * Get a value by key
   */
  static async get(key: string): Promise<string | null> {
    return redis.get(key);
  }

  /**
   * Delete a key
   */
  static async del(key: string): Promise<void> {
    await redis.del(key);
  }

  /**
   * Check if a key exists
   */
  static async exists(key: string): Promise<boolean> {
    const result = await redis.exists(key);
    return result === 1;
  }

  /**
   * Set a distributed lock (returns true if lock acquired)
   */
  static async acquireLock(key: string, ttl: number = REDIS_TTL.appointmentLock): Promise<boolean> {
    const result = await redis.set(key, 'locked', 'EX', ttl, 'NX');
    return result === 'OK';
  }

  /**
   * Release a distributed lock
   */
  static async releaseLock(key: string): Promise<void> {
    await redis.del(key);
  }

  /**
   * Set cache with default TTL
   */
  static async setCache(key: string, value: string, ttl: number = REDIS_TTL.riskCache): Promise<void> {
    await this.set(key, value, ttl);
  }

  /**
   * Get cache value
   */
  static async getCache(key: string): Promise<string | null> {
    return this.get(key);
  }

  /**
   * Increment a counter
   */
  static async incr(key: string): Promise<number> {
    return redis.incr(key);
  }

  /**
   * Set expiration on existing key
   */
  static async expire(key: string, seconds: number): Promise<void> {
    await redis.expire(key, seconds);
  }
}

