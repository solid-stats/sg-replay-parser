import path from 'path';
import { parentPort } from 'worker_threads';

import fs from 'fs-extra';

import { rawReplaysPath } from '../../0 - utils/paths';
import parseReplayInfo from '../../2 - parseReplayInfo';
import {
  ParseReplayTaskMessage,
  ParseReplayTaskResponseMessage,
} from './types';

const getError = (error: unknown): Error => {
  if (error instanceof Error) return error;

  return new Error(String(error));
};

export const runParseTask = async <TTaskId extends string>(
  task: ParseReplayTaskMessage<TTaskId>,
): Promise<ParseReplayTaskResponseMessage<TTaskId>> => {
  try {
    const replayInfo = await fs.readJson(path.join(rawReplaysPath, `${task.filename}.json`)) as ReplayInfo;
    const parsedReplayInfo = parseReplayInfo(replayInfo, task.date);
    const result = Object.values(parsedReplayInfo);

    if (result.length === 0) {
      return {
        taskId: task.taskId,
        status: 'skipped',
        filename: task.filename,
        reason: 'empty_replay',
      };
    }

    if (task.gameType === 'mace' && result.length < 10) {
      return {
        taskId: task.taskId,
        status: 'skipped',
        filename: task.filename,
        reason: 'mace_min_players',
      };
    }

    return {
      taskId: task.taskId,
      status: 'success',
      data: {
        date: task.date,
        missionName: task.missionName,
        result,
      },
    };
  } catch (error) {
    const parsedError = getError(error);

    return {
      taskId: task.taskId,
      status: 'error',
      error: {
        filename: task.filename,
        message: parsedError.message,
        stack: parsedError.stack,
      },
    };
  }
};

const workerPort = parentPort;

if (workerPort) {
  workerPort.on('message', async (task: ParseReplayTaskMessage) => {
    try {
      const response = await runParseTask(task);

      workerPort.postMessage(response);
    } catch (error) {
      const parsedError = getError(error);

      workerPort.postMessage({
        taskId: task.taskId,
        status: 'error',
        error: {
          filename: task.filename,
          message: parsedError.message,
          stack: parsedError.stack,
        },
      });
    }
  });
}
