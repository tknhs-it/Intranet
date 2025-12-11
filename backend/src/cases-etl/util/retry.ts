import { logger } from './logger';

/**
 * Retry utility for CASES ETL operations
 */

export interface RetryOptions {
  maxAttempts?: number;
  delayMs?: number;
  backoffMultiplier?: number;
  onRetry?: (attempt: number, error: Error) => void;
}

const DEFAULT_OPTIONS: Required<RetryOptions> = {
  maxAttempts: 3,
  delayMs: 1000,
  backoffMultiplier: 2,
  onRetry: () => {},
};

/**
 * Retry a function with exponential backoff
 */
export async function retry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  let lastError: Error;

  for (let attempt = 1; attempt <= opts.maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;
      
      if (attempt < opts.maxAttempts) {
        const delay = opts.delayMs * Math.pow(opts.backoffMultiplier, attempt - 1);
        logger.warn(
          { attempt, maxAttempts: opts.maxAttempts, delay, error: error.message },
          'Retrying operation'
        );
        
        opts.onRetry?.(attempt, error);
        await sleep(delay);
      } else {
        logger.error(
          { attempt, maxAttempts: opts.maxAttempts, error: error.message },
          'Max retry attempts reached'
        );
      }
    }
  }

  throw lastError!;
}

/**
 * Sleep utility
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Retry with specific error types
 */
export async function retryOnError<T>(
  fn: () => Promise<T>,
  errorTypes: string[],
  options: RetryOptions = {}
): Promise<T> {
  return retry(fn, {
    ...options,
    onRetry: (attempt, error) => {
      if (!errorTypes.some(type => error.message.includes(type))) {
        // Don't retry if error is not in the list
        throw error;
      }
      options.onRetry?.(attempt, error);
    },
  });
}

