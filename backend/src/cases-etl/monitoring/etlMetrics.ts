import { logger } from '../util/logger';

/**
 * ETL Metrics and Monitoring
 * Tracks ETL performance and health metrics
 */

export interface EtlMetrics {
  startTime: Date;
  endTime?: Date;
  duration?: number;
  filesProcessed: number;
  recordsProcessed: number;
  recordsCreated: number;
  recordsUpdated: number;
  recordsErrored: number;
  errorRate: number;
  success: boolean;
}

class EtlMetricsCollector {
  private metrics: EtlMetrics[] = [];
  private maxMetrics = 100; // Keep last 100 runs

  /**
   * Record ETL run metrics
   */
  recordMetrics(metrics: EtlMetrics): void {
    this.metrics.push(metrics);
    
    // Keep only last N metrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics.shift();
    }

    logger.info({ metrics }, 'Recorded ETL metrics');
  }

  /**
   * Get recent metrics
   */
  getRecentMetrics(count: number = 10): EtlMetrics[] {
    return this.metrics.slice(-count);
  }

  /**
   * Get average metrics
   */
  getAverageMetrics(): Partial<EtlMetrics> {
    if (this.metrics.length === 0) {
      return {};
    }

    const totals = this.metrics.reduce(
      (acc, m) => ({
        duration: acc.duration + (m.duration || 0),
        recordsProcessed: acc.recordsProcessed + m.recordsProcessed,
        recordsCreated: acc.recordsCreated + m.recordsCreated,
        recordsUpdated: acc.recordsUpdated + m.recordsUpdated,
        recordsErrored: acc.recordsErrored + m.recordsErrored,
        successCount: acc.successCount + (m.success ? 1 : 0),
      }),
      {
        duration: 0,
        recordsProcessed: 0,
        recordsCreated: 0,
        recordsUpdated: 0,
        recordsErrored: 0,
        successCount: 0,
      }
    );

    const count = this.metrics.length;

    return {
      duration: totals.duration / count,
      recordsProcessed: totals.recordsProcessed / count,
      recordsCreated: totals.recordsCreated / count,
      recordsUpdated: totals.recordsUpdated / count,
      recordsErrored: totals.recordsErrored / count,
      errorRate: totals.recordsProcessed > 0 
        ? totals.recordsErrored / totals.recordsProcessed 
        : 0,
      success: totals.successCount / count,
    };
  }

  /**
   * Get health status
   */
  getHealthStatus(): {
    status: 'healthy' | 'degraded' | 'unhealthy';
    message: string;
    metrics: Partial<EtlMetrics>;
  } {
    const recent = this.getRecentMetrics(10);
    
    if (recent.length === 0) {
      return {
        status: 'unhealthy',
        message: 'No ETL runs recorded',
        metrics: {},
      };
    }

    const failures = recent.filter(m => !m.success).length;
    const failureRate = failures / recent.length;
    const avgErrorRate = recent.reduce((sum, m) => sum + m.errorRate, 0) / recent.length;

    if (failureRate > 0.5 || avgErrorRate > 0.2) {
      return {
        status: 'unhealthy',
        message: `High failure rate: ${(failureRate * 100).toFixed(1)}% failures, ${(avgErrorRate * 100).toFixed(1)}% error rate`,
        metrics: this.getAverageMetrics(),
      };
    }

    if (failureRate > 0.2 || avgErrorRate > 0.1) {
      return {
        status: 'degraded',
        message: `Moderate issues: ${(failureRate * 100).toFixed(1)}% failures, ${(avgErrorRate * 100).toFixed(1)}% error rate`,
        metrics: this.getAverageMetrics(),
      };
    }

    return {
      status: 'healthy',
      message: 'ETL running normally',
      metrics: this.getAverageMetrics(),
    };
  }

  /**
   * Clear old metrics
   */
  clearMetrics(): void {
    this.metrics = [];
    logger.info('Cleared ETL metrics');
  }
}

// Export singleton instance
export const etlMetrics = new EtlMetricsCollector();

