/**
 * Test setup file
 * Run before all tests
 */

import { PrismaClient } from '@prisma/client';

// Use test database
process.env.DATABASE_URL = process.env.TEST_DATABASE_URL || 'postgresql://test:test@localhost:5432/nossal_intranet_test';

const prisma = new PrismaClient();

beforeAll(async () => {
  // Set up test database
  // await prisma.$connect();
});

afterAll(async () => {
  // Clean up
  await prisma.$disconnect();
});

export { prisma };

