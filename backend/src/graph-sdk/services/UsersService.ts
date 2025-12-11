import { GraphClient } from '../GraphClient';
import { GraphUser } from '../types/GraphTypes';

/**
 * Users Service
 * Handles Microsoft Graph user operations
 */
export class UsersService {
  constructor(private graph: GraphClient) {}

  /**
   * Get user by email address
   */
  async getUserByEmail(email: string): Promise<GraphUser> {
    const response = await this.graph.api(`/users/${email}`).get();
    return response as GraphUser;
  }

  /**
   * Search users by display name
   */
  async searchUsers(query: string): Promise<GraphUser[]> {
    const response = await this.graph
      .api(`/users?$search="displayName:${query}"`)
      .header('ConsistencyLevel', 'eventual')
      .get();

    return response.value || [];
  }

  /**
   * List all users (paginated)
   */
  async listAllUsers(top: number = 999): Promise<GraphUser[]> {
    const response = await this.graph.api(`/users?$top=${top}`).get();
    return response.value || [];
  }

  /**
   * Get user by object ID
   */
  async getUserById(userId: string): Promise<GraphUser> {
    const response = await this.graph.api(`/users/${userId}`).get();
    return response as GraphUser;
  }

  /**
   * Get user's manager
   */
  async getUserManager(userId: string): Promise<GraphUser | null> {
    try {
      const response = await this.graph.api(`/users/${userId}/manager`).get();
      return response as GraphUser;
    } catch (error: any) {
      if (error.statusCode === 404) {
        return null;
      }
      throw error;
    }
  }

  /**
   * Get user's direct reports
   */
  async getDirectReports(userId: string): Promise<GraphUser[]> {
    const response = await this.graph.api(`/users/${userId}/directReports`).get();
    return response.value || [];
  }
}

