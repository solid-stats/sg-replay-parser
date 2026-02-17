import { Worker } from 'worker_threads';

import {
  ParseReplayTaskMessage,
  ParseReplayTaskResponseMessage,
} from './types';
import { WorkerData } from './workerData';

type WorkerPoolConfig = {
  workerCount: number;
  workerScriptPath: string;
  workerData?: WorkerData;
};

type TaskWithoutId = Omit<ParseReplayTaskMessage, 'taskId'>;

type QueuedTask = {
  task: ParseReplayTaskMessage;
  resolve: (response: ParseReplayTaskResponseMessage) => void;
};

type InFlightTask = QueuedTask & {
  worker: Worker;
};

const toError = (error: unknown): Error => {
  if (error instanceof Error) return error;

  return new Error(String(error));
};

export class WorkerPool {
  private readonly workerScriptPath: string;

  private readonly workerData: WorkerData | undefined;

  private readonly workers: Worker[] = [];

  private readonly queuedTasks: QueuedTask[] = [];

  private readonly inFlightTasks = new Map<string, InFlightTask>();

  private readonly workerActiveTaskId = new Map<Worker, string | null>();

  private taskIdCounter = 0;

  private isDestroyed = false;

  constructor(config: WorkerPoolConfig) {
    if (!Number.isInteger(config.workerCount) || config.workerCount <= 0) {
      throw new Error('WorkerPool workerCount must be greater than 0');
    }

    this.workerScriptPath = config.workerScriptPath;
    this.workerData = config.workerData;

    for (let index = 0; index < config.workerCount; index += 1) {
      this.spawnWorker();
    }
  }

  runTask(taskWithoutId: TaskWithoutId): Promise<ParseReplayTaskResponseMessage> {
    if (this.isDestroyed) {
      return Promise.reject(new Error('WorkerPool is destroyed'));
    }

    const task: ParseReplayTaskMessage = {
      ...taskWithoutId,
      taskId: this.createTaskId(),
    };

    return new Promise((resolve) => {
      this.queuedTasks.push({
        task,
        resolve,
      });

      this.dispatchTasks();
    });
  }

  async destroy(): Promise<void> {
    this.isDestroyed = true;

    const destroyError = new Error('WorkerPool destroyed');

    this.flushQueuedTasksWithError(destroyError);
    this.flushInFlightTasksWithError(destroyError);

    const workers = [...this.workers];

    await Promise.all(workers.map(async (worker) => {
      this.detachWorker(worker);
      await worker.terminate();
    }));

    this.workers.length = 0;
  }

  private spawnWorker(): void {
    const worker = new Worker(
      this.workerScriptPath,
      { workerData: this.workerData },
    );

    this.workers.push(worker);
    this.workerActiveTaskId.set(worker, null);

    worker.on('message', (response: ParseReplayTaskResponseMessage) => {
      this.onWorkerMessage(worker, response);
    });

    worker.on('error', (error) => {
      this.resolveWorkerActiveTaskAsError(worker, toError(error));
      worker.terminate();
    });

    worker.on('exit', (code) => {
      this.onWorkerExit(worker, code);
    });

    this.dispatchTaskToWorker(worker);
  }

  private onWorkerMessage(
    worker: Worker,
    response: ParseReplayTaskResponseMessage,
  ): void {
    const inFlightTask = this.inFlightTasks.get(response.taskId);

    if (!inFlightTask) {
      return;
    }

    this.inFlightTasks.delete(response.taskId);

    if (this.workerActiveTaskId.get(worker) === response.taskId) {
      this.workerActiveTaskId.set(worker, null);
    }

    inFlightTask.resolve(response);

    this.dispatchTaskToWorker(worker);
  }

  private onWorkerExit(worker: Worker, code: number): void {
    this.resolveWorkerActiveTaskAsError(
      worker,
      new Error(`Worker exited with code ${code}`),
    );

    this.detachWorker(worker);

    if (!this.isDestroyed) {
      this.spawnWorker();
      this.dispatchTasks();
    }
  }

  private resolveWorkerActiveTaskAsError(worker: Worker, error: Error): void {
    const activeTaskId = this.workerActiveTaskId.get(worker);

    if (!activeTaskId) {
      return;
    }

    const activeTask = this.inFlightTasks.get(activeTaskId);

    this.workerActiveTaskId.set(worker, null);

    if (!activeTask) {
      return;
    }

    this.inFlightTasks.delete(activeTaskId);

    activeTask.resolve({
      taskId: activeTask.task.taskId,
      status: 'error',
      error: {
        filename: activeTask.task.filename,
        message: error.message,
        stack: error.stack,
      },
    });
  }

  private dispatchTasks(): void {
    this.workers.forEach((worker) => {
      this.dispatchTaskToWorker(worker);
    });
  }

  private dispatchTaskToWorker(worker: Worker): void {
    if (this.workerActiveTaskId.get(worker)) {
      return;
    }

    const queuedTask = this.queuedTasks.shift();

    if (!queuedTask) {
      return;
    }

    this.workerActiveTaskId.set(worker, queuedTask.task.taskId);

    this.inFlightTasks.set(queuedTask.task.taskId, {
      ...queuedTask,
      worker,
    });

    try {
      worker.postMessage(queuedTask.task);
    } catch (error) {
      const parsedError = toError(error);

      this.workerActiveTaskId.set(worker, null);
      this.inFlightTasks.delete(queuedTask.task.taskId);

      queuedTask.resolve({
        taskId: queuedTask.task.taskId,
        status: 'error',
        error: {
          filename: queuedTask.task.filename,
          message: parsedError.message,
          stack: parsedError.stack,
        },
      });

      this.dispatchTasks();
    }
  }

  private flushQueuedTasksWithError(error: Error): void {
    while (this.queuedTasks.length > 0) {
      const queuedTask = this.queuedTasks.shift();

      if (queuedTask) {
        queuedTask.resolve({
          taskId: queuedTask.task.taskId,
          status: 'error',
          error: {
            filename: queuedTask.task.filename,
            message: error.message,
            stack: error.stack,
          },
        });
      }
    }
  }

  private flushInFlightTasksWithError(error: Error): void {
    this.inFlightTasks.forEach((inFlightTask, taskId) => {
      inFlightTask.resolve({
        taskId,
        status: 'error',
        error: {
          filename: inFlightTask.task.filename,
          message: error.message,
          stack: error.stack,
        },
      });
    });

    this.inFlightTasks.clear();
  }

  private detachWorker(worker: Worker): void {
    worker.removeAllListeners();

    this.workerActiveTaskId.delete(worker);

    const workerIndex = this.workers.indexOf(worker);

    if (workerIndex >= 0) {
      this.workers.splice(workerIndex, 1);
    }
  }

  private createTaskId(): string {
    this.taskIdCounter += 1;

    return `task-${this.taskIdCounter}`;
  }
}
