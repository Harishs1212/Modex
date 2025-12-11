import redis, { isRedisConnected } from '../config/redis';
import { REDIS_TTL } from './constants';

export class RedisClient {
  /**
   * Check if Redis is available before operations
   */
  private static async safeOperation<T>(
    operation: () => Promise<T>,
    fallback: T
  ): Promise<T> {
    if (!isRedisConnected() || !redis) {
      return fallback;
    }

    try {
      return await operation();
    } catch (error) {
      // Silently fail if Redis is unavailable
      console.warn('Redis operation failed, using fallback:', error instanceof Error ? error.message : 'Unknown error');
      return fallback;
    }
  }

  /**
   * Set a key-value pair with optional TTL
   */
  static async set(key: string, value: string, ttl?: number): Promise<void> {
    await this.safeOperation(async () => {
      if (!redis) return;
    if (ttl) {
      await redis.setex(key, ttl, value);
    } else {
      await redis.set(key, value);
    }
    }, undefined);
  }

  /**
   * Get a value by key
   */
  static async get(key: string): Promise<string | null> {
    return this.safeOperation(async () => {
      if (!redis) return null;
    return redis.get(key);
    }, null);
  }

  /**
   * Delete a key
   */
  static async del(key: string): Promise<void> {
    await this.safeOperation(async () => {
      if (!redis) return;
    await redis.del(key);
    }, undefined);
  }

  /**
   * Check if a key exists
   */
  static async exists(key: string): Promise<boolean> {
    return this.safeOperation(async () => {
      if (!redis) return false;
    const result = await redis.exists(key);
    return result === 1;
    }, false);
  }

  /**
   * Set a distributed lock (returns true if lock acquired)
   * Without Redis, we return true to allow operations to proceed
   * Note: This means no distributed locking protection without Redis
   */
  static async acquireLock(key: string, ttl: number = REDIS_TTL.appointmentLock): Promise<boolean> {
    return this.safeOperation(async () => {
      if (!redis) return true; // Allow operation if Redis unavailable
    const result = await redis.set(key, 'locked', 'EX', ttl, 'NX');
    return result === 'OK';
    }, true); // Default to allowing the operation
  }

  /**
   * Release a distributed lock
   */
  static async releaseLock(key: string): Promise<void> {
    await this.safeOperation(async () => {
      if (!redis) return;
    await redis.del(key);
    }, undefined);
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
    return this.safeOperation(async () => {
      if (!redis) return 0;
    return redis.incr(key);
    }, 0);
  }

  /**
   * Set expiration on existing key
   */
  static async expire(key: string, seconds: number): Promise<void> {
    await this.safeOperation(async () => {
      if (!redis) return;
    await redis.expire(key, seconds);
    }, undefined);
  }
}

