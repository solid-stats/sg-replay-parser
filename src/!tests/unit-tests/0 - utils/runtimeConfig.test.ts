import os from 'os';

import { getRuntimeConfig } from '../../../0 - utils/runtimeConfig';

const createCpuInfo = (count: number): os.CpuInfo[] => (
  Array.from({ length: count }, (_item, index) => ({
    model: `cpu-${index}`,
    speed: 1000,
    times: {
      user: 0,
      nice: 0,
      sys: 0,
      idle: 0,
      irq: 0,
    },
  }))
);

describe('getRuntimeConfig', () => {
  const originalWorkerCount = process.env.WORKER_COUNT;

  beforeEach(() => {
    delete process.env.WORKER_COUNT;
    jest.restoreAllMocks();
  });

  afterAll(() => {
    if (originalWorkerCount === undefined) {
      delete process.env.WORKER_COUNT;

      return;
    }

    process.env.WORKER_COUNT = originalWorkerCount;
  });

  test('returns default worker count based on CPU count minus one', () => {
    jest.spyOn(os, 'cpus').mockReturnValue(createCpuInfo(8));

    expect(getRuntimeConfig()).toEqual({ workerCount: 7 });
  });

  test('accepts WORKER_COUNT environment override', () => {
    jest.spyOn(os, 'cpus').mockReturnValue(createCpuInfo(8));
    process.env.WORKER_COUNT = '12';

    expect(getRuntimeConfig()).toEqual({ workerCount: 12 });
  });

  test('clamps WORKER_COUNT to lower and upper bounds', () => {
    jest.spyOn(os, 'cpus').mockReturnValue(createCpuInfo(8));

    process.env.WORKER_COUNT = '0';
    expect(getRuntimeConfig()).toEqual({ workerCount: 1 });

    process.env.WORKER_COUNT = '1000';
    expect(getRuntimeConfig()).toEqual({ workerCount: 64 });
  });

  test('falls back to default when WORKER_COUNT is invalid', () => {
    jest.spyOn(os, 'cpus').mockReturnValue(createCpuInfo(6));

    process.env.WORKER_COUNT = '';
    expect(getRuntimeConfig()).toEqual({ workerCount: 5 });

    process.env.WORKER_COUNT = 'NaN';
    expect(getRuntimeConfig()).toEqual({ workerCount: 5 });
  });
});
