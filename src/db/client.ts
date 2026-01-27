import { PrismaLibSql } from '@prisma/adapter-libsql';

import { PrismaClient } from '../generated/prisma/client';

let prismaClient: PrismaClient | null = null;

export const initDbClient = (): PrismaClient => {
  if (!prismaClient) {
    const adapter = new PrismaLibSql({
      url: process.env.DATABASE_URL || 'file:./dev.db',
    });

    prismaClient = new PrismaClient({ adapter });
  }

  return prismaClient;
};

export const getDbClient = (): PrismaClient => {
  if (!prismaClient) {
    return initDbClient();
  }

  return prismaClient;
};

export const disconnectDb = async (): Promise<void> => {
  if (prismaClient) {
    await prismaClient.$disconnect();
    prismaClient = null;
  }
};
