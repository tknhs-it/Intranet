import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Seed script for development/testing
 * Creates sample data for local development
 */
async function main() {
  console.log('Seeding database...');

  // Create sample rooms
  // Note: For SQL Server, arrays are stored as JSON strings and enums as strings
  const rooms = [
    { code: 'A101', name: 'Science Lab 1', building: 'A Block', floor: 1, capacity: 24, type: 'LAB', equipment: '[]' },
    { code: 'A102', name: 'Science Lab 2', building: 'A Block', floor: 1, capacity: 24, type: 'LAB', equipment: '[]' },
    { code: 'B201', name: 'Maths Room 1', building: 'B Block', floor: 2, capacity: 30, type: 'CLASSROOM', equipment: '[]' },
    { code: 'B202', name: 'Maths Room 2', building: 'B Block', floor: 2, capacity: 30, type: 'CLASSROOM', equipment: '[]' },
    { code: 'LIB1', name: 'Library', building: 'Library', floor: 1, capacity: 50, type: 'LIBRARY', equipment: '[]' },
  ];

  for (const room of rooms) {
    await prisma.room.upsert({
      where: { code: room.code },
      update: {},
      create: room,
    });
  }

  console.log(`✓ Created ${rooms.length} rooms`);

  // Create sample user (for testing)
  // Note: For SQL Server, role is stored as a string, not an enum
  const testUser = await prisma.user.upsert({
    where: { email: 'test@nossalhs.vic.edu.au' },
    update: {},
    create: {
      email: 'test@nossalhs.vic.edu.au',
      firstName: 'Test',
      lastName: 'User',
      role: 'TEACHER', // String, not enum
      department: 'IT',
    },
  });

  console.log('✓ Created test user');

  // Create sample announcement
  // Note: For SQL Server, tags is stored as JSON string, priority as string
  const announcement = await prisma.announcement.create({
    data: {
      title: 'Welcome to Nossal Intranet',
      content: 'This is a sample announcement. The intranet is now live!',
      authorId: testUser.id,
      tags: JSON.stringify(['general']), // Convert array to JSON string
      priority: 'NORMAL', // String, not enum
      isPinned: true,
    },
  });

  console.log('✓ Created sample announcement');

  console.log('✅ Seeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

