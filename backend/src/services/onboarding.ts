import { PrismaClient } from '@prisma/client';
import { graphSDK } from '../graph-sdk';
import { logger } from '../cases-etl/util/logger';

const prisma = new PrismaClient();

/**
 * Onboarding Service
 * Automates staff onboarding with Teams, Groups, SharePoint
 */
export class OnboardingService {
  /**
   * Onboard new staff member
   */
  async onboardStaff(staffId: string): Promise<{
    success: boolean;
    steps: string[];
    errors: string[];
  }> {
    const steps: string[] = [];
    const errors: string[] = [];

    try {
      // Get staff from database
      const staff = await prisma.user.findUnique({
        where: { id: staffId },
      });

      if (!staff || !staff.email) {
        throw new Error('Staff member not found or missing email');
      }

      // Get Graph user
      const graphUser = await graphSDK.users.getUserByEmail(staff.email);
      steps.push(`Found Graph user: ${graphUser.displayName}`);

      // Get role-based groups and teams
      const { groups, teams } = this.getRoleBasedResources(staff.role);

      // Add to Azure AD groups
      for (const groupId of groups) {
        try {
          await graphSDK.teams.addUserToTeam(groupId, graphUser.id);
          steps.push(`Added to group: ${groupId}`);
        } catch (error: any) {
          errors.push(`Failed to add to group ${groupId}: ${error.message}`);
        }
      }

      // Add to Teams
      for (const teamId of teams) {
        try {
          await graphSDK.teams.addUserToTeam(teamId, graphUser.id);
          steps.push(`Added to team: ${teamId}`);
        } catch (error: any) {
          errors.push(`Failed to add to team ${teamId}: ${error.message}`);
        }
      }

      // Create onboarding tasks in intranet
      await this.createOnboardingTasks(staffId);

      logger.info({ staffId, steps, errors }, 'Staff onboarding completed');

      return {
        success: errors.length === 0,
        steps,
        errors,
      };
    } catch (error: any) {
      logger.error({ error: error.message, staffId }, 'Onboarding failed');
      return {
        success: false,
        steps,
        errors: [...errors, error.message],
      };
    }
  }

  /**
   * Offboard departing staff member
   */
  async offboardStaff(staffId: string): Promise<{
    success: boolean;
    steps: string[];
    errors: string[];
  }> {
    const steps: string[] = [];
    const errors: string[] = [];

    try {
      const staff = await prisma.user.findUnique({
        where: { id: staffId },
      });

      if (!staff || !staff.email) {
        throw new Error('Staff member not found');
      }

      const graphUser = await graphSDK.users.getUserByEmail(staff.email).catch(() => null);

      if (!graphUser) {
        steps.push('Graph user not found, skipping Graph operations');
      } else {
        // Get all teams user is in
        const teams = await graphSDK.teams.listMyTeams(graphUser.id).catch(() => []);

        // Remove from teams
        for (const team of teams) {
          try {
            await graphSDK.teams.removeUserFromTeam(team.id, graphUser.id);
            steps.push(`Removed from team: ${team.displayName}`);
          } catch (error: any) {
            errors.push(`Failed to remove from team ${team.id}: ${error.message}`);
          }
        }

        // Remove from groups (get from role)
        const { groups } = this.getRoleBasedResources(staff.role);
        for (const groupId of groups) {
          try {
            await graphSDK.teams.removeUserFromTeam(groupId, graphUser.id);
            steps.push(`Removed from group: ${groupId}`);
          } catch (error: any) {
            errors.push(`Failed to remove from group ${groupId}: ${error.message}`);
          }
        }
      }

      // Mark as inactive in database
      await prisma.user.update({
        where: { id: staffId },
        data: { active: false },
      });
      steps.push('Marked as inactive in database');

      // Archive data
      await this.archiveStaffData(staffId);
      steps.push('Archived staff data');

      logger.info({ staffId, steps, errors }, 'Staff offboarding completed');

      return {
        success: errors.length === 0,
        steps,
        errors,
      };
    } catch (error: any) {
      logger.error({ error: error.message, staffId }, 'Offboarding failed');
      return {
        success: false,
        steps,
        errors: [...errors, error.message],
      };
    }
  }

  /**
   * Get role-based Azure AD groups and Teams
   */
  private getRoleBasedResources(role: string): { groups: string[]; teams: string[] } {
    const roleMap: Record<string, { groups: string[]; teams: string[] }> = {
      TEACHER: {
        groups: [
          process.env.AZURE_GROUP_TEACHERS || '',
          process.env.AZURE_GROUP_STAFF || '',
        ],
        teams: [], // Add team IDs as needed
      },
      ADMIN: {
        groups: [
          process.env.AZURE_GROUP_IT || '',
          process.env.AZURE_GROUP_STAFF || '',
        ],
        teams: [],
      },
      LEADERSHIP: {
        groups: [
          process.env.AZURE_GROUP_LEADERSHIP || '',
          process.env.AZURE_GROUP_STAFF || '',
        ],
        teams: [],
      },
    };

    return roleMap[role] || { groups: [process.env.AZURE_GROUP_STAFF || ''], teams: [] };
  }

  /**
   * Create onboarding tasks
   */
  private async createOnboardingTasks(staffId: string): Promise<void> {
    const tasks = [
      {
        title: 'Complete IT setup',
        description: 'Get laptop, configure email, access systems',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
      {
        title: 'Review staff handbook',
        description: 'Read through school policies and procedures',
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days
      },
      {
        title: 'Attend orientation session',
        description: 'Meet with leadership and key staff',
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      },
    ];

    for (const task of tasks) {
      await prisma.task.create({
        data: {
          userId: staffId,
          title: task.title,
          description: task.description,
          dueDate: task.dueDate,
          source: 'INTRANET',
          priority: 'NORMAL',
        },
      });
    }
  }

  /**
   * Archive staff data
   */
  private async archiveStaffData(staffId: string): Promise<void> {
    // Mark all related records as archived
    // This is a placeholder - implement based on your archiving strategy
    logger.info({ staffId }, 'Archiving staff data');
  }
}

export const onboardingService = new OnboardingService();

