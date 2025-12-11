import { GraphClient } from '../GraphClient';
import { GraphTeam, GraphChannel } from '../types/GraphTypes';

/**
 * Teams Service
 * Handles Microsoft Teams operations
 */
export class TeamsService {
  constructor(private graph: GraphClient) {}

  /**
   * List teams the user is a member of
   */
  async listMyTeams(userId: string): Promise<GraphTeam[]> {
    const response = await this.graph.api(`/users/${userId}/joinedTeams`).get();
    return response.value || [];
  }

  /**
   * List all teams (requires admin permissions)
   */
  async listAllTeams(): Promise<GraphTeam[]> {
    const response = await this.graph.api('/teams').get();
    return response.value || [];
  }

  /**
   * Get team details
   */
  async getTeam(teamId: string): Promise<GraphTeam> {
    const response = await this.graph.api(`/teams/${teamId}`).get();
    return response as GraphTeam;
  }

  /**
   * List channels in a team
   */
  async listChannels(teamId: string): Promise<GraphChannel[]> {
    const response = await this.graph.api(`/teams/${teamId}/channels`).get();
    return response.value || [];
  }

  /**
   * Get channel details
   */
  async getChannel(teamId: string, channelId: string): Promise<GraphChannel> {
    const response = await this.graph.api(`/teams/${teamId}/channels/${channelId}`).get();
    return response as GraphChannel;
  }

  /**
   * Add user to team
   */
  async addUserToTeam(teamId: string, userId: string): Promise<void> {
    await this.graph
      .api(`/groups/${teamId}/members/$ref`)
      .post({
        '@odata.id': `https://graph.microsoft.com/v1.0/users/${userId}`,
      });
  }

  /**
   * Remove user from team
   */
  async removeUserFromTeam(teamId: string, userId: string): Promise<void> {
    await this.graph.api(`/groups/${teamId}/members/${userId}/$ref`).delete();
  }

  /**
   * Create channel in team
   */
  async createChannel(teamId: string, displayName: string, description?: string): Promise<GraphChannel> {
    const response = await this.graph
      .api(`/teams/${teamId}/channels`)
      .post({
        displayName,
        description,
      });

    return response as GraphChannel;
  }
}

