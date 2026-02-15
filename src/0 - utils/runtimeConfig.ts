import os from 'os';

const MIN_WORKER_COUNT = 1;
const MAX_WORKER_COUNT = 64;

const clampWorkerCount = (value: number): number => (
  Math.min(MAX_WORKER_COUNT, Math.max(MIN_WORKER_COUNT, value))
);

const getDefaultWorkerCount = (): number => {
  const cpuCount = os.cpus().length;

  return clampWorkerCount(Math.max(MIN_WORKER_COUNT, cpuCount - 1));
};

export const getRuntimeConfig = (): { workerCount: number } => {
  const envWorkerCount = process.env.WORKER_COUNT;

  if (envWorkerCount === undefined || envWorkerCount.trim() === '') {
    return { workerCount: getDefaultWorkerCount() };
  }

  const parsedWorkerCount = Number(envWorkerCount);

  if (!Number.isFinite(parsedWorkerCount)) {
    return { workerCount: getDefaultWorkerCount() };
  }

  return { workerCount: clampWorkerCount(Math.trunc(parsedWorkerCount)) };
};
