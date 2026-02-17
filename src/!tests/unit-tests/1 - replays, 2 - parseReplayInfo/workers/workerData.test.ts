import { workerDataSchema, WorkerData } from '../../../../1 - replays/workers/workerData';

const satisfies = <T>(value: T): T => value;

describe('workerDataSchema', () => {
  test('should accept valid workerData', () => {
    const input = { logsFolderPath: '/home/user/sg_stats/logs/17.02.2026 13:00' };

    const result = workerDataSchema.safeParse(input);

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data.logsFolderPath).toBe(input.logsFolderPath);
    }
  });

  test('should reject when logsFolderPath is missing', () => {
    const result = workerDataSchema.safeParse({});

    expect(result.success).toBe(false);
  });

  test('should reject when logsFolderPath is not a string', () => {
    const result = workerDataSchema.safeParse({ logsFolderPath: 123 });

    expect(result.success).toBe(false);
  });

  test('should reject null', () => {
    const result = workerDataSchema.safeParse(null);

    expect(result.success).toBe(false);
  });

  test('should reject undefined', () => {
    const result = workerDataSchema.safeParse(undefined);

    expect(result.success).toBe(false);
  });

  test('should strip extra fields', () => {
    const input = { logsFolderPath: '/logs/path', extra: 'value' };

    const result = workerDataSchema.safeParse(input);

    expect(result.success).toBe(true);
  });
});

describe('WorkerData type', () => {
  test('should be assignable from valid object', () => {
    const data = satisfies<WorkerData>({
      logsFolderPath: '/home/user/sg_stats/logs/17.02.2026 13:00',
    });

    expect(data.logsFolderPath).toBe('/home/user/sg_stats/logs/17.02.2026 13:00');
  });
});
