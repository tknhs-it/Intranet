import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// Get all rooms
router.get('/', async (req, res) => {
  try {
    const { building, type } = req.query;
    
    const where: any = {};
    if (building) where.building = building;
    if (type) where.type = type;

    const rooms = await prisma.room.findMany({
      where,
      include: {
        bookings: {
          where: {
            startTime: {
              lte: new Date()
            },
            endTime: {
              gte: new Date()
            }
          }
        }
      },
      orderBy: {
        code: 'asc'
      }
    });

    res.json(rooms);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get room availability
router.get('/availability', async (req, res) => {
  try {
    const { startTime, endTime, building, type } = req.query;
    
    if (!startTime || !endTime) {
      return res.status(400).json({ error: 'startTime and endTime required' });
    }

    const start = new Date(startTime as string);
    const end = new Date(endTime as string);

    const where: any = {};
    if (building) where.building = building;
    if (type) where.type = type;

    // Get all rooms
    const allRooms = await prisma.room.findMany({ where });

    // Get bookings in the time range
    const bookings = await prisma.roomBooking.findMany({
      where: {
        OR: [
          {
            startTime: { lte: end },
            endTime: { gte: start }
          }
        ]
      }
    });

    const bookedRoomIds = new Set(bookings.map(b => b.roomId));

    // Filter available rooms
    const availableRooms = allRooms.filter(room => !bookedRoomIds.has(room.id));

    res.json({
      available: availableRooms,
      booked: allRooms.filter(room => bookedRoomIds.has(room.id))
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get room details
router.get('/:id', async (req, res) => {
  try {
    const room = await prisma.room.findUnique({
      where: { id: req.params.id },
      include: {
        bookings: {
          where: {
            startTime: {
              gte: new Date()
            }
          },
          orderBy: {
            startTime: 'asc'
          },
          take: 10
        },
        timetable: {
          where: {
            year: new Date().getFullYear(),
            term: 1 // TODO: Calculate current term
          }
        }
      }
    });

    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }

    res.json(room);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Book a room
router.post('/:id/book', async (req, res) => {
  try {
    const { userId, startTime, endTime, purpose } = req.body;

    if (!userId || !startTime || !endTime) {
      return res.status(400).json({ error: 'userId, startTime, and endTime required' });
    }

    // Check for conflicts
    const conflicts = await prisma.roomBooking.findMany({
      where: {
        roomId: req.params.id,
        OR: [
          {
            startTime: { lte: new Date(endTime) },
            endTime: { gte: new Date(startTime) }
          }
        ]
      }
    });

    if (conflicts.length > 0) {
      return res.status(409).json({ error: 'Room is already booked for this time' });
    }

    const booking = await prisma.roomBooking.create({
      data: {
        roomId: req.params.id,
        userId,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        purpose
      }
    });

    res.json(booking);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

