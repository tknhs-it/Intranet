import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface StaffRecord {
  cases_id: string;
  first_name: string;
  last_name: string;
  email: string;
  employment_type: string | null;
  department: string | null;
  position: string | null;
  phone: string | null;
  active: boolean;
}

/**
 * Upsert staff in batch
 */
export async function upsertStaff(records: StaffRecord[]) {
  const results = {
    created: 0,
    updated: 0,
    errors: 0,
  };

  for (const record of records) {
    try {
      await prisma.user.upsert({
        where: { casesId: record.cases_id },
        update: {
          firstName: record.first_name,
          lastName: record.last_name,
          email: record.email,
          department: record.department,
          position: record.position,
          updatedAt: new Date(),
        },
        create: {
          casesId: record.cases_id,
          firstName: record.first_name,
          lastName: record.last_name,
          email: record.email,
          department: record.department,
          position: record.position,
          role: 'TEACHER', // Default, can be updated later
        },
      });

      const existing = await prisma.user.findUnique({
        where: { casesId: record.cases_id },
      });

      if (existing) {
        results.updated++;
      } else {
        results.created++;
      }
    } catch (error: any) {
      console.error(`Error upserting staff ${record.cases_id}:`, error.message);
      results.errors++;
    }
  }

  return results;
}

