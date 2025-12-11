import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface StudentRecord {
  cases_id: string;
  first_name: string;
  last_name: string;
  date_of_birth: Date | null;
  sex: 'MALE' | 'FEMALE' | null;
  year_level: number | null;
  home_group: string | null;
  house: string | null;
  email: string | null;
  phone: string | null;
  active: boolean;
}

/**
 * Upsert students in batch
 * Uses Prisma's upsertMany pattern (or individual upserts)
 */
export async function upsertStudents(records: StudentRecord[]) {
  const results = {
    created: 0,
    updated: 0,
    errors: 0,
  };

  for (const record of records) {
    try {
      await prisma.student.upsert({
        where: { cases_id: record.cases_id },
        update: {
          first_name: record.first_name,
          last_name: record.last_name,
          date_of_birth: record.date_of_birth,
          sex: record.sex,
          year_level: record.year_level,
          home_group: record.home_group,
          house: record.house,
          email: record.email,
          phone: record.phone,
          active: record.active,
          updated_at: new Date(),
        },
        create: {
          cases_id: record.cases_id,
          first_name: record.first_name,
          last_name: record.last_name,
          date_of_birth: record.date_of_birth,
          sex: record.sex,
          year_level: record.year_level,
          home_group: record.home_group,
          house: record.house,
          email: record.email,
          phone: record.phone,
          active: record.active,
        },
      });

      // Check if this was an update or create by checking if record existed
      const existing = await prisma.student.findUnique({
        where: { cases_id: record.cases_id },
      });

      if (existing) {
        results.updated++;
      } else {
        results.created++;
      }
    } catch (error: any) {
      console.error(`Error upserting student ${record.cases_id}:`, error.message);
      results.errors++;
    }
  }

  return results;
}

