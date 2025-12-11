import { GraphClient } from '../GraphClient';
import { GraphPresence } from '../types/GraphTypes';

/**
 * Presence Service
 * Handles user presence/availability operations
 */
export class PresenceService {
  constructor(private graph: GraphClient) {}

  /**
   * Get user presence
   */
  async getPresence(userId: string): Promise<GraphPresence> {
    const response = await this.graph.api(`/users/${userId}/presence`).get();
    return response as GraphPresence;
  }

  /**
   * Get presence for multiple users (batch)
   */
  async getPresenceBatch(userIds: string[]): Promise<GraphPresence[]> {
    // Graph API doesn't support batch presence, so we'll do parallel requests
    const promises = userIds.map(id => this.getPresence(id).catch(() => null));
    const results = await Promise.all(promises);
    return results.filter((p): p is GraphPresence => p !== null);
  }

  /**
   * Check if user is available
   */
  async isAvailable(userId: string): Promise<boolean> {
    try {
      const presence = await this.getPresence(userId);
      return presence.availability === 'Available';
    } catch {
      return false;
    }
  }
}

