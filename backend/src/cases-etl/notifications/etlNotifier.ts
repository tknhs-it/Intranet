import { logger } from '../util/logger';

/**
 * ETL Notification Service
 * Sends notifications when ETL jobs fail or have issues
 */

export interface EtlNotificationOptions {
  email?: string[];
  slack?: string; // Slack webhook URL
  teams?: string; // Teams webhook URL
}

export interface EtlNotification {
  type: 'success' | 'warning' | 'error';
  title: string;
  message: string;
  stats?: any;
  errors?: string[];
  timestamp: Date;
}

class EtlNotifier {
  private options: EtlNotificationOptions;

  constructor(options: EtlNotificationOptions = {}) {
    this.options = {
      email: options.email || process.env.ETL_NOTIFICATION_EMAIL?.split(',') || [],
      slack: options.slack || process.env.SLACK_WEBHOOK_URL,
      teams: options.teams || process.env.TEAMS_WEBHOOK_URL,
    };
  }

  /**
   * Send notification
   */
  async notify(notification: EtlNotification): Promise<void> {
    logger.info({ notification }, 'Sending ETL notification');

    const promises: Promise<void>[] = [];

    // Send to Slack if configured
    if (this.options.slack) {
      promises.push(this.sendToSlack(notification));
    }

    // Send to Teams if configured
    if (this.options.teams) {
      promises.push(this.sendToTeams(notification));
    }

    // Send email if configured
    if (this.options.email && this.options.email.length > 0) {
      promises.push(this.sendEmail(notification));
    }

    // Wait for all notifications
    await Promise.allSettled(promises);
  }

  /**
   * Send notification to Slack
   */
  private async sendToSlack(notification: EtlNotification): Promise<void> {
    if (!this.options.slack) return;

    try {
      const color = notification.type === 'error' ? '#ff0000' : 
                   notification.type === 'warning' ? '#ffaa00' : '#00ff00';

      const payload = {
        text: notification.title,
        attachments: [
          {
            color,
            fields: [
              {
                title: 'Message',
                value: notification.message,
                short: false,
              },
              {
                title: 'Timestamp',
                value: notification.timestamp.toISOString(),
                short: true,
              },
            ],
          },
        ],
      };

      if (notification.stats) {
        payload.attachments[0].fields.push({
          title: 'Statistics',
          value: JSON.stringify(notification.stats, null, 2),
          short: false,
        });
      }

      if (notification.errors && notification.errors.length > 0) {
        payload.attachments[0].fields.push({
          title: 'Errors',
          value: notification.errors.join('\n'),
          short: false,
        });
      }

      const response = await fetch(this.options.slack, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Slack notification failed: ${response.statusText}`);
      }
    } catch (error: any) {
      logger.error({ error: error.message }, 'Failed to send Slack notification');
    }
  }

  /**
   * Send notification to Teams
   */
  private async sendToTeams(notification: EtlNotification): Promise<void> {
    if (!this.options.teams) return;

    try {
      const color = notification.type === 'error' ? 'FF0000' : 
                   notification.type === 'warning' ? 'FFAA00' : '00FF00';

      const payload = {
        '@type': 'MessageCard',
        '@context': 'https://schema.org/extensions',
        summary: notification.title,
        themeColor: color,
        title: notification.title,
        text: notification.message,
        sections: [
          {
            facts: [
              {
                name: 'Timestamp',
                value: notification.timestamp.toISOString(),
              },
            ],
          },
        ],
      };

      if (notification.stats) {
        payload.sections[0].facts.push({
          name: 'Statistics',
          value: JSON.stringify(notification.stats, null, 2),
        });
      }

      if (notification.errors && notification.errors.length > 0) {
        payload.sections.push({
          title: 'Errors',
          text: notification.errors.join('\n'),
        });
      }

      const response = await fetch(this.options.teams, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Teams notification failed: ${response.statusText}`);
      }
    } catch (error: any) {
      logger.error({ error: error.message }, 'Failed to send Teams notification');
    }
  }

  /**
   * Send email notification
   * TODO: Implement actual email sending (using nodemailer, SendGrid, etc.)
   */
  private async sendEmail(notification: EtlNotification): Promise<void> {
    if (!this.options.email || this.options.email.length === 0) return;

    // For now, just log. In production, use nodemailer or SendGrid
    logger.info({
      to: this.options.email,
      subject: notification.title,
      message: notification.message,
    }, 'Email notification (not implemented)');

    // TODO: Implement email sending
    // const nodemailer = require('nodemailer');
    // const transporter = nodemailer.createTransport({ ... });
    // await transporter.sendMail({ ... });
  }

  /**
   * Notify on ETL success
   */
  async notifySuccess(stats: any): Promise<void> {
    await this.notify({
      type: 'success',
      title: 'CASES ETL Completed Successfully',
      message: `ETL processed ${stats.students?.created || 0} students and ${stats.staff?.created || 0} staff members.`,
      stats,
      timestamp: new Date(),
    });
  }

  /**
   * Notify on ETL warning
   */
  async notifyWarning(message: string, stats?: any, errors?: string[]): Promise<void> {
    await this.notify({
      type: 'warning',
      title: 'CASES ETL Completed with Warnings',
      message,
      stats,
      errors,
      timestamp: new Date(),
    });
  }

  /**
   * Notify on ETL error
   */
  async notifyError(message: string, errors: string[], stats?: any): Promise<void> {
    await this.notify({
      type: 'error',
      title: 'CASES ETL Failed',
      message,
      stats,
      errors,
      timestamp: new Date(),
    });
  }
}

// Export singleton instance
export const etlNotifier = new EtlNotifier();

