import { GraphClient } from './GraphClient';
import { UsersService } from './services/UsersService';
import { PhotoService } from './services/PhotoService';
import { TeamsService } from './services/TeamsService';
import { PresenceService } from './services/PresenceService';
import { SharePointService } from './services/SharePointService';
import { CalendarService } from './services/CalendarService';

/**
 * Microsoft Graph SDK
 * Unified interface for all Graph API operations
 */
export class GraphSDK {
  public users: UsersService;
  public photos: PhotoService;
  public teams: TeamsService;
  public presence: PresenceService;
  public sharepoint: SharePointService;
  public calendar: CalendarService;

  private client: GraphClient;

  constructor(tenantId: string, clientId: string, clientSecret?: string) {
    this.client = new GraphClient(tenantId, clientId, clientSecret);

    // Initialize services
    this.users = new UsersService(this.client);
    this.photos = new PhotoService(this.client);
    this.teams = new TeamsService(this.client);
    this.presence = new PresenceService(this.client);
    this.sharepoint = new SharePointService(this.client);
    this.calendar = new CalendarService(this.client);
  }

  /**
   * Get underlying Graph client (for advanced usage)
   */
  getClient(): GraphClient {
    return this.client;
  }
}

// Export singleton instance
const tenantId = process.env.AZURE_TENANT_ID || '';
const clientId = process.env.AZURE_CLIENT_ID || '';
const clientSecret = process.env.AZURE_CLIENT_SECRET;

export const graphSDK = new GraphSDK(tenantId, clientId, clientSecret);

// Export individual services for direct use
export { GraphClient, UsersService, PhotoService, TeamsService, PresenceService, SharePointService, CalendarService };

