import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateAzure, AuthenticatedRequest } from '../middleware/auth-azure';
import { graphSDK } from '../graph-sdk';

const router = Router();
const prisma = new PrismaClient();

// All routes require authentication
router.use(authenticateAzure);

/**
 * GET /api/staff/enhanced
 * Get enhanced staff directory with Teams, presence, calendar data
 */
router.get('/enhanced', async (req: AuthenticatedRequest, res) => {
  try {
    const { search, department, role } = req.query;

    // Get staff from database
    const where: any = { active: true };
    if (department) where.department = department;
    if (role) where.role = role;

    const staff = await prisma.user.findMany({
      where,
      take: 100,
      orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
    });

    // Enhance with Graph data
    const enhanced = await Promise.all(
      staff.map(async (member) => {
        try {
          // Get Graph user by email
          const graphUser = await graphSDK.users.getUserByEmail(member.email).catch(() => null);

          if (!graphUser) {
            return {
              id: member.id,
              name: `${member.firstName} ${member.lastName}`,
              email: member.email,
              department: member.department,
              position: member.position,
              photoUrl: null,
              presence: null,
              teams: [],
              nextAvailable: null,
              calendar: [],
            };
          }

          // Get photo
          const photoUrl = await graphSDK.photos.getUserPhotoDataUrl(graphUser.id);

          // Get presence
          const presence = await graphSDK.presence.getPresence(graphUser.id).catch(() => null);

          // Get Teams
          const teams = await graphSDK.teams.listMyTeams(graphUser.id).catch(() => []);

          // Get next available time
          const nextAvailable = await graphSDK.calendar
            .getNextAvailableTime(graphUser.id, 30)
            .catch(() => null);

          // Get today's calendar
          const calendar = await graphSDK.calendar.getTodayEvents(graphUser.id).catch(() => []);

          return {
            id: member.id,
            name: `${member.firstName} ${member.lastName}`,
            email: member.email,
            department: member.department,
            position: member.position,
            photoUrl,
            presence: presence?.availability || 'Unknown',
            teams: teams.map(t => t.displayName),
            nextAvailable: nextAvailable?.toISOString() || null,
            calendar: calendar.map(e => ({
              start: e.start.dateTime,
              end: e.end.dateTime,
              subject: e.subject,
            })),
          };
        } catch (error: any) {
          // Return basic info if Graph calls fail
          return {
            id: member.id,
            name: `${member.firstName} ${member.lastName}`,
            email: member.email,
            department: member.department,
            position: member.position,
            photoUrl: null,
            presence: null,
            teams: [],
            nextAvailable: null,
            calendar: [],
            error: error.message,
          };
        }
      })
    );

    // Filter by search if provided
    const filtered = search
      ? enhanced.filter(
          s =>
            s.name.toLowerCase().includes((search as string).toLowerCase()) ||
            s.email.toLowerCase().includes((search as string).toLowerCase())
        )
      : enhanced;

    res.json(filtered);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/staff/enhanced/:id
 * Get enhanced staff member details
 */
router.get('/enhanced/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const member = await prisma.user.findUnique({
      where: { id },
    });

    if (!member) {
      return res.status(404).json({ error: 'Staff member not found' });
    }

    // Get Graph user
    const graphUser = await graphSDK.users.getUserByEmail(member.email).catch(() => null);

    if (!graphUser) {
      return res.json({
        ...member,
        photoUrl: null,
        presence: null,
        teams: [],
      });
    }

    // Get all enhanced data
    const [photoUrl, presence, teams, nextAvailable, calendar] = await Promise.all([
      graphSDK.photos.getUserPhotoDataUrl(graphUser.id).catch(() => null),
      graphSDK.presence.getPresence(graphUser.id).catch(() => null),
      graphSDK.teams.listMyTeams(graphUser.id).catch(() => []),
      graphSDK.calendar.getNextAvailableTime(graphUser.id, 30).catch(() => null),
      graphSDK.calendar.getTodayEvents(graphUser.id).catch(() => []),
    ]);

    res.json({
      ...member,
      photoUrl,
      presence: presence?.availability || null,
      teams: teams.map(t => ({
        id: t.id,
        name: t.displayName,
        description: t.description,
      })),
      nextAvailable: nextAvailable?.toISOString() || null,
      calendar: calendar.map(e => ({
        id: e.id,
        subject: e.subject,
        start: e.start.dateTime,
        end: e.end.dateTime,
        location: e.location?.displayName,
      })),
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

