import Redis from 'ioredis';
import { config } from './env';

let redis: Redis | null = null;
let isRedisAvailable = false;
let connectionAttempted = false;

/**
 * Initialize Redis connection lazily
 */
function initRedis() {
  if (connectionAttempted) {
    return redis;
  }

  connectionAttempted = true;

  try {
    redis = new Redis({
  host: config.redis.host,
  port: config.redis.port,
  password: config.redis.password,
  retryStrategy: (times) => {
        // Stop retrying after 3 attempts
        if (times > 3) {
          console.warn('Redis connection failed after multiple attempts. Running without Redis cache.');
          isRedisAvailable = false;
          return null; // Stop retrying
        }
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
      maxRetriesPerRequest: null, // Don't fail requests if Redis is down
      enableOfflineQueue: false, // Don't queue commands if Redis is down
      lazyConnect: false, // Connect immediately but handle errors gracefully
      connectTimeout: 5000, // 5 second timeout
});

    let errorLogged = false;
redis.on('error', (err) => {
      // Suppress repeated connection errors
      if (!errorLogged) {
        console.warn('Redis connection failed. Application will run without Redis cache.');
        errorLogged = true;
      }
      isRedisAvailable = false;
});

redis.on('connect', () => {
  console.log('Redis Client Connected');
      isRedisAvailable = true;
});

    redis.on('ready', () => {
      console.log('Redis Client Ready');
      isRedisAvailable = true;
    });

    redis.on('close', () => {
      isRedisAvailable = false;
    });

    // Check connection status after a short delay
    setTimeout(() => {
      if (redis && redis.status !== 'ready' && redis.status !== 'connect') {
        isRedisAvailable = false;
      }
    }, 1000);
  } catch (error) {
    console.warn('Failed to initialize Redis. Application will run without Redis cache.');
    isRedisAvailable = false;
    redis = null;
  }

  return redis;
}

// Initialize on module load
initRedis();

export function isRedisConnected(): boolean {
  if (!redis) return false;
  const status = redis.status;
  return isRedisAvailable && (status === 'ready' || status === 'connect');
}

export default redis;

