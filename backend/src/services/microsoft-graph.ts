import { Client } from '@microsoft/microsoft-graph-client';
import { TokenCredentialAuthenticationProvider } from '@microsoft/microsoft-graph-client/authProviders/azureTokenCredentials';
import { ClientSecretCredential } from '@azure/identity';
import axios from 'axios';

const AZURE_TENANT_ID = process.env.AZURE_TENANT_ID || '';
const AZURE_CLIENT_ID = process.env.AZURE_CLIENT_ID || '';
const AZURE_CLIENT_SECRET = process.env.AZURE_CLIENT_SECRET || '';

/**
 * Microsoft Graph Service
 * Handles all Graph API interactions
 */
class MicrosoftGraphService {
  private graphClient: Client | null = null;
  private credential: ClientSecretCredential | null = null;

  /**
   * Initialize Graph client with client credentials
   */
  private async getGraphClient(): Promise<Client> {
    if (this.graphClient) {
      return this.graphClient;
    }

    this.credential = new ClientSecretCredential(
      AZURE_TENANT_ID,
      AZURE_CLIENT_ID,
      AZURE_CLIENT_SECRET
    );

    const authProvider = new TokenCredentialAuthenticationProvider(
      this.credential,
      {
        scopes: ['https://graph.microsoft.com/.default'],
      }
    );

    this.graphClient = Client.initWithMiddleware({ authProvider });

    return this.graphClient;
  }

  /**
   * Get Graph client with user token (delegated permissions)
   */
  private getGraphClientWithToken(accessToken: string): Client {
    return Client.init({
      authProvider: (done) => {
        done(null, accessToken);
      },
    });
  }

  /**
   * Get staff photo
   * GET /v1.0/users/{id}/photo/$value
   */
  async getStaffPhoto(userId: string): Promise<Buffer | null> {
    try {
      const client = await this.getGraphClient();
      const photo = await client
        .api(`/users/${userId}/photo/$value`)
        .get();

      return photo as Buffer;
    } catch (error: any) {
      if (error.statusCode === 404) {
        return null; // No photo available
      }
      throw error;
    }
  }

  /**
   * Get staff photo URL (for embedding)
   */
  async getStaffPhotoUrl(userId: string): Promise<string | null> {
    try {
      const client = await this.getGraphClient();
      const photo = await client
        .api(`/users/${userId}/photo/$value`)
        .responseType('arraybuffer')
        .get();

      // Convert to base64 data URL
      const base64 = Buffer.from(photo).toString('base64');
      return `data:image/jpeg;base64,${base64}`;
    } catch (error: any) {
      if (error.statusCode === 404) {
        return null;
      }
      throw error;
    }
  }

  /**
   * List Teams the user is a member of
   * GET /v1.0/me/joinedTeams
   */
  async getUserTeams(userId: string): Promise<any[]> {
    try {
      const client = await this.getGraphClient();
      const teams = await client
        .api(`/users/${userId}/joinedTeams`)
        .get();

      return teams.value || [];
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * List channels in a team
   * GET /v1.0/teams/{teamId}/channels
   */
  async getTeamChannels(teamId: string): Promise<any[]> {
    try {
      const client = await this.getGraphClient();
      const channels = await client
        .api(`/teams/${teamId}/channels`)
        .get();

      return channels.value || [];
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * Get user calendar events
   * GET /v1.0/me/calendar/events
   */
  async getUserCalendarEvents(
    userId: string,
    startDateTime: string,
    endDateTime: string
  ): Promise<any[]> {
    try {
      const client = await this.getGraphClient();
      const events = await client
        .api(`/users/${userId}/calendar/events`)
        .filter(`start/dateTime ge '${startDateTime}' and end/dateTime le '${endDateTime}'`)
        .orderby('start/dateTime')
        .get();

      return events.value || [];
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * Get SharePoint sites
   * GET /v1.0/sites
   */
  async getSharePointSites(): Promise<any[]> {
    try {
      const client = await this.getGraphClient();
      const sites = await client
        .api('/sites')
        .get();

      return sites.value || [];
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * Get SharePoint site drive items
   * GET /v1.0/sites/{siteId}/drive/root/children
   */
  async getSiteDriveItems(siteId: string, itemPath: string = ''): Promise<any[]> {
    try {
      const client = await this.getGraphClient();
      const path = itemPath ? `/drive/root:/${itemPath}:/children` : '/drive/root/children';
      const items = await client
        .api(`/sites/${siteId}${path}`)
        .get();

      return items.value || [];
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * Get user presence
   * GET /v1.0/users/{id}/presence
   */
  async getUserPresence(userId: string): Promise<any> {
    try {
      const client = await this.getGraphClient();
      const presence = await client
        .api(`/users/${userId}/presence`)
        .get();

      return presence;
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * Get user details
   * GET /v1.0/users/{id}
   */
  async getUser(userId: string): Promise<any> {
    try {
      const client = await this.getGraphClient();
      const user = await client
        .api(`/users/${userId}`)
        .get();

      return user;
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * Add user to group (onboarding)
   */
  async addUserToGroup(userId: string, groupId: string): Promise<void> {
    try {
      const client = await this.getGraphClient();
      await client
        .api(`/groups/${groupId}/members/$ref`)
        .post({
          '@odata.id': `https://graph.microsoft.com/v1.0/users/${userId}`,
        });
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * Remove user from group (offboarding)
   */
  async removeUserFromGroup(userId: string, groupId: string): Promise<void> {
    try {
      const client = await this.getGraphClient();
      await client
        .api(`/groups/${groupId}/members/${userId}/$ref`)
        .delete();
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * Create Teams channel
   */
  async createTeamChannel(teamId: string, displayName: string, description?: string): Promise<any> {
    try {
      const client = await this.getGraphClient();
      const channel = await client
        .api(`/teams/${teamId}/channels`)
        .post({
          displayName,
          description,
        });

      return channel;
    } catch (error: any) {
      throw error;
    }
  }
}

export default new MicrosoftGraphService();

