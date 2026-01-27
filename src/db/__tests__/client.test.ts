import { getDbClient, disconnectDb } from '../client';

describe('Database Client', () => {
  afterAll(async () => {
    await disconnectDb();
  });

  it('should return Prisma client instance', () => {
    const client = getDbClient();

    expect(client).toBeDefined();
    expect(client.replay).toBeDefined();
  });

  it('should return same instance on multiple calls (singleton)', () => {
    const client1 = getDbClient();
    const client2 = getDbClient();

    expect(client1).toBe(client2);
  });
});
