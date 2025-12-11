import { PrismaClient } from '@prisma/client';
import { graphSDK } from '../graph-sdk';
import compassService from './compass';
import { logger } from '../cases-etl/util/logger';

const prisma = new PrismaClient();

/**
 * Data Merge Service
 * 
 * The "Golden Rule":
 * - CASES = Source of truth for identity
 * - Compass = School operations
 * - Teams/Graph = Communication metadata
 * 
 * This service merges all three into unified views
 */
export class DataMergeService {
  /**
   * Get merged staff profile
   * Combines CASES identity + Compass operations + Graph metadata
   */
  async getMergedStaffProfile(staffId: string): Promise<MergedStaffProfile | null> {
    try {
      // 1. Get CASES identity (from database)
      const staff = await prisma.user.findUnique({
        where: { id: staffId },
      });

      if (!staff || !staff.email) {
        return null;
      }

      // 2. Get Compass operational data
      const compassData = await this.getCompassData(staff);

      // 3. Get Graph metadata
      const graphData = await this.getGraphData(staff.email);

      // 4. Merge into unified profile
      return {
        // CASES Identity
        id: staff.id,
        casesId: staff.casesId,
        name: `${staff.firstName} ${staff.lastName}`,
        firstName: staff.firstName,
        lastName: staff.lastName,
        email: staff.email,
        faculty: staff.department,
        role: staff.role,
        position: staff.position,
        active: true,

        // Compass Operations
        timetable: compassData.timetable,
        absences: compassData.absences,
        extras: compassData.extras,
        roomChanges: compassData.roomChanges,
        duties: compassData.duties,

        // Graph Metadata
        photo: graphData.photo,
        presence: graphData.presence,
        teams: graphData.teams,
        calendar: graphData.calendar,
        nextFree: graphData.nextFree,
      };
    } catch (error: any) {
      logger.error({ error: error.message, staffId }, 'Failed to merge staff profile');
      return null;
    }
  }

  /**
   * Get merged staff directory
   * Returns all staff with merged data
   */
  async getMergedStaffDirectory(filters?: {
    faculty?: string;
    role?: string;
    search?: string;
  }): Promise<MergedStaffProfile[]> {
    try {
      // Get staff from CASES (database)
      const where: any = { active: true };
      if (filters?.faculty) where.department = filters.faculty;
      if (filters?.role) where.role = filters.role;

      const staff = await prisma.user.findMany({
        where,
        take: 100,
        orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
      });

      // Merge with Compass and Graph data
      const merged = await Promise.all(
        staff.map(async (member) => {
          const compassData = await this.getCompassData(member).catch(() => ({
            timetable: [],
            absences: [],
            extras: [],
            roomChanges: [],
            duties: [],
          }));

          const graphData = await this.getGraphData(member.email).catch(() => ({
            photo: null,
            presence: null,
            teams: [],
            calendar: [],
            nextFree: null,
          }));

          return {
            id: member.id,
            casesId: member.casesId,
            name: `${member.firstName} ${member.lastName}`,
            firstName: member.firstName,
            lastName: member.lastName,
            email: member.email,
            faculty: member.department,
            role: member.role,
            position: member.position,
            active: true,
            timetable: compassData.timetable,
            absences: compassData.absences,
            extras: compassData.extras,
            roomChanges: compassData.roomChanges,
            duties: compassData.duties,
            photo: graphData.photo,
            presence: graphData.presence,
            teams: graphData.teams,
            calendar: graphData.calendar,
            nextFree: graphData.nextFree,
          };
        })
      );

      // Apply search filter if provided
      if (filters?.search) {
        const searchLower = filters.search.toLowerCase();
        return merged.filter(
          s =>
            s.name.toLowerCase().includes(searchLower) ||
            s.email.toLowerCase().includes(searchLower) ||
            s.faculty?.toLowerCase().includes(searchLower)
        );
      }

      return merged;
    } catch (error: any) {
      logger.error({ error: error.message }, 'Failed to get merged staff directory');
      return [];
    }
  }

  /**
   * Get today's merged dashboard data for a staff member
   */
  async getTodayDashboard(staffId: string): Promise<MergedDashboard> {
    try {
      const staff = await prisma.user.findUnique({
        where: { id: staffId },
      });

      if (!staff) {
        throw new Error('Staff not found');
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      // Get Compass data for today
      const compassUserId = parseInt(staff.casesId || '0');
      const compassEvents = compassUserId > 0
        ? await compassService.getEventsByUser(
            compassUserId,
            today.toISOString().split('T')[0],
            tomorrow.toISOString().split('T')[0]
          ).catch(() => [])
        : [];

      // Transform Compass events
      const timetable = compassEvents
        .filter(e => e.EventType === 'Class')
        .map(e => ({
          period: this.getPeriodFromTime(e.StartTime),
          subject: e.Subject || '',
          className: e.ClassName || '',
          room: e.Room || '',
          startTime: e.StartTime,
          endTime: e.EndTime,
        }));

      const extras = compassEvents.filter(e => e.IsReplacement);
      const roomChanges = compassEvents.filter(e => e.EventType === 'RoomChange');
      const duties = compassEvents.filter(e => e.EventType === 'Duty' || e.EventType === 'YardDuty');

      // Get Graph calendar
      const graphUser = await graphSDK.users.getUserByEmail(staff.email).catch(() => null);
      const calendar = graphUser
        ? await graphSDK.calendar.getTodayEvents(graphUser.id).catch(() => [])
        : [];

      return {
        today: today.toISOString().split('T')[0],
        timetable,
        extras: extras.length,
        extrasDetails: extras,
        roomChanges,
        duties,
        calendar,
        nextFree: graphUser
          ? await graphSDK.calendar.getNextAvailableTime(graphUser.id, 30).catch(() => null)
          : null,
      };
    } catch (error: any) {
      logger.error({ error: error.message, staffId }, 'Failed to get today dashboard');
      throw error;
    }
  }

  /**
   * Get Compass operational data
   */
  private async getCompassData(staff: any): Promise<{
    timetable: any[];
    absences: any[];
    extras: any[];
    roomChanges: any[];
    duties: any[];
  }> {
    if (!staff.casesId) {
      return {
        timetable: [],
        absences: [],
        extras: [],
        roomChanges: [],
        duties: [],
      };
    }

    try {
      const compassUserId = parseInt(staff.casesId);
      const today = new Date();
      const startDate = today.toISOString().split('T')[0];
      const endDate = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      const events = await compassService.getEventsByUser(compassUserId, startDate, endDate);

      return {
        timetable: events.filter(e => e.EventType === 'Class'),
        absences: [], // TODO: Get from Compass absences API
        extras: events.filter(e => e.IsReplacement),
        roomChanges: events.filter(e => e.EventType === 'RoomChange'),
        duties: events.filter(e => e.EventType === 'Duty' || e.EventType === 'YardDuty'),
      };
    } catch (error) {
      return {
        timetable: [],
        absences: [],
        extras: [],
        roomChanges: [],
        duties: [],
      };
    }
  }

  /**
   * Get Graph metadata
   */
  private async getGraphData(email: string): Promise<{
    photo: string | null;
    presence: string | null;
    teams: string[];
    calendar: any[];
    nextFree: Date | null;
  }> {
    try {
      const graphUser = await graphSDK.users.getUserByEmail(email);
      
      const [photo, presence, teams, calendar, nextFree] = await Promise.all([
        graphSDK.photos.getUserPhotoDataUrl(graphUser.id).catch(() => null),
        graphSDK.presence.getPresence(graphUser.id).catch(() => null),
        graphSDK.teams.listMyTeams(graphUser.id).catch(() => []),
        graphSDK.calendar.getTodayEvents(graphUser.id).catch(() => []),
        graphSDK.calendar.getNextAvailableTime(graphUser.id, 30).catch(() => null),
      ]);

      return {
        photo,
        presence: presence?.availability || null,
        teams: teams.map(t => t.displayName),
        calendar,
        nextFree,
      };
    } catch (error) {
      return {
        photo: null,
        presence: null,
        teams: [],
        calendar: [],
        nextFree: null,
      };
    }
  }

  /**
   * Extract period number from time string
   */
  private getPeriodFromTime(time: string): number {
    // Simple mapping - adjust based on your bell times
    const hour = parseInt(time.split(':')[0]);
    if (hour >= 8 && hour < 9) return 1;
    if (hour >= 9 && hour < 10) return 2;
    if (hour >= 10 && hour < 11) return 3;
    if (hour >= 11 && hour < 12) return 4;
    if (hour >= 12 && hour < 13) return 5;
    if (hour >= 13 && hour < 14) return 6;
    return 0;
  }
}

export interface MergedStaffProfile {
  // CASES Identity
  id: string;
  casesId: string | null;
  name: string;
  firstName: string;
  lastName: string;
  email: string;
  faculty: string | null;
  role: string;
  position: string | null;
  active: boolean;

  // Compass Operations
  timetable: any[];
  absences: any[];
  extras: any[];
  roomChanges: any[];
  duties: any[];

  // Graph Metadata
  photo: string | null;
  presence: string | null;
  teams: string[];
  calendar: any[];
  nextFree: Date | null;
}

export interface MergedDashboard {
  today: string;
  timetable: Array<{
    period: number;
    subject: string;
    className: string;
    room: string;
    startTime: string;
    endTime: string;
  }>;
  extras: number;
  extrasDetails: any[];
  roomChanges: any[];
  duties: any[];
  calendar: any[];
  nextFree: Date | null;
}

export const dataMergeService = new DataMergeService();

