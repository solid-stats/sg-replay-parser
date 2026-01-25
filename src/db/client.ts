import { PrismaClient } from '../generated/prisma/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';

let prismaClient: PrismaClient | null = null;

export const getDbClient = (): PrismaClient => {
  if (!prismaClient) {
    const adapter = new PrismaLibSql({
      url: process.env.DATABASE_URL || 'file:./dev.db',
    });

    prismaClient = new PrismaClient({ adapter });
  }
  return prismaClient;
};

export const disconnectDb = async (): Promise<void> => {
  if (prismaClient) {
    await prismaClient.$disconnect();
    prismaClient = null;
  }
};
