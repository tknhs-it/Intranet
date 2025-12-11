import axios from 'axios';

const MICROSOFT_CLIENT_ID = process.env.MICROSOFT_CLIENT_ID;
const MICROSOFT_CLIENT_SECRET = process.env.MICROSOFT_CLIENT_SECRET;
const MICROSOFT_TENANT_ID = process.env.MICROSOFT_TENANT_ID;

class MicrosoftService {
  private accessToken: string | null = null;
  private tokenExpiry: Date | null = null;

  /**
   * Get access token for Microsoft Graph API
   */
  private async getAccessToken(): Promise<string> {
    // Check if token is still valid
    if (this.accessToken && this.tokenExpiry && this.tokenExpiry > new Date()) {
      return this.accessToken;
    }

    try {
      const response = await axios.post(
        `https://login.microsoftonline.com/${MICROSOFT_TENANT_ID}/oauth2/v2.0/token`,
        new URLSearchParams({
          client_id: MICROSOFT_CLIENT_ID!,
          client_secret: MICROSOFT_CLIENT_SECRET!,
          scope: 'https://graph.microsoft.com/.default',
          grant_type: 'client_credentials',
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      this.accessToken = response.data.access_token;
      // Set expiry to 5 minutes before actual expiry for safety
      this.tokenExpiry = new Date(Date.now() + (response.data.expires_in - 300) * 1000);

      return this.accessToken;
    } catch (error) {
      console.error('Error getting Microsoft access token:', error);
      throw error;
    }
  }

  /**
   * Get user's Teams
   */
  async getUserTeams(userId: string) {
    try {
      const token = await this.getAccessToken();
      
      // TODO: Implement Graph API call to get user's teams
      // GET /users/{userId}/joinedTeams
      
      return [];
    } catch (error) {
      console.error('Error fetching user teams:', error);
      throw error;
    }
  }

  /**
   * Get class Teams
   */
  async getClassTeams() {
    try {
      const token = await this.getAccessToken();
      
      // TODO: Implement Graph API call to get class teams
      // Filter teams by naming convention or metadata
      
      return [];
    } catch (error) {
      console.error('Error fetching class teams:', error);
      throw error;
    }
  }

  /**
   * Get O365 tasks for user
   */
  async getUserTasks(userId: string) {
    try {
      const token = await this.getAccessToken();
      
      // TODO: Implement Graph API call to get tasks
      // GET /users/{userId}/todo/lists/{todoTaskListId}/tasks
      
      return [];
    } catch (error) {
      console.error('Error fetching O365 tasks:', error);
      throw error;
    }
  }

  /**
   * Send Teams notification
   */
  async sendTeamsNotification(teamId: string, message: string) {
    try {
      const token = await this.getAccessToken();
      
      // TODO: Implement Graph API call to send message to Teams channel
      // POST /teams/{teamId}/channels/{channelId}/messages
      
      return true;
    } catch (error) {
      console.error('Error sending Teams notification:', error);
      throw error;
    }
  }
}

export default new MicrosoftService();

