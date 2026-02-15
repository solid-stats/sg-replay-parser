import {
  ParseReplayTaskMessage,
  ParseReplayTaskResponseMessage,
} from '../../../../1 - replays/workers/types';

const satisfies = <T>(value: T): T => value;
const assertNever = (value: never): never => {
  throw new Error(`Unhandled response status: ${value}`);
};

const getResponseStatus = (
  responseMessage: ParseReplayTaskResponseMessage,
): ParseReplayTaskResponseMessage['status'] => {
  switch (responseMessage.status) {
    case 'success':
      return 'success';
    case 'skipped':
      return 'skipped';
    case 'error':
      return 'error';
    default:
      return assertNever(responseMessage);
  }
};

const taskMessage = satisfies<ParseReplayTaskMessage>({
  taskId: 'task-1',
  filename: 'file_1',
  date: '2024-01-01',
  missionName: 'sg@test_mission',
  gameType: 'sg',
});

const correlatedTaskId = 'task-correlated' as const;
const correlatedTaskMessage = satisfies<ParseReplayTaskMessage<typeof correlatedTaskId>>({
  taskId: correlatedTaskId,
  filename: 'file_correlated',
  date: '2024-01-02',
  missionName: 'sg@correlated_task',
  gameType: 'sg',
});

const successData: PlayersGameResult = {
  date: '2024-01-01',
  missionName: 'sg@test_mission',
  result: [],
};

// @ts-expect-error ParseReplayTaskResponseMessage requires taskId for all statuses.
const responseWithoutTaskId: ParseReplayTaskResponseMessage = {
  status: 'success',
  data: successData,
};
void responseWithoutTaskId;

const responseWithInvalidSkippedReason: ParseReplayTaskResponseMessage = {
  taskId: 'task-invalid',
  status: 'skipped',
  filename: 'file_invalid',
  // @ts-expect-error ParseReplayTaskSkippedReason is restricted to known values.
  reason: 'too_few_players',
};
void responseWithInvalidSkippedReason;

const correlatedTaskSuccessResponse = satisfies<ParseReplayTaskResponseMessage<typeof correlatedTaskId>>({
  taskId: correlatedTaskMessage.taskId,
  status: 'success',
  data: successData,
});

test('ParseReplayTaskMessage should contain required fields', () => {
  expect(taskMessage).toMatchObject({
    taskId: 'task-1',
    filename: 'file_1',
    date: '2024-01-01',
    missionName: 'sg@test_mission',
    gameType: 'sg',
  });
});

test('ParseReplayTaskResponseMessage should keep correlated taskId typing', () => {
  expect(correlatedTaskSuccessResponse.taskId).toBe(correlatedTaskId);
});

test('ParseReplayTaskResponseMessage should represent success status', () => {
  const successMessage = satisfies<ParseReplayTaskResponseMessage>({
    taskId: 'task-2',
    status: 'success',
    data: successData,
  });

  expect(successMessage.status).toBe('success');
  expect(getResponseStatus(successMessage)).toBe('success');

  if (successMessage.status === 'success') {
    expect(successMessage.taskId).toBe('task-2');
    expect(successMessage.data).toMatchObject(successData);
  }
});

test('ParseReplayTaskResponseMessage should represent skipped status for mace_min_players', () => {
  const skippedByPlayersCountMessage = satisfies<ParseReplayTaskResponseMessage>({
    taskId: 'task-3',
    status: 'skipped',
    filename: 'file_2',
    reason: 'mace_min_players',
  });

  expect(skippedByPlayersCountMessage.status).toBe('skipped');

  if (skippedByPlayersCountMessage.status === 'skipped') {
    expect(skippedByPlayersCountMessage.taskId).toBe('task-3');
    expect(skippedByPlayersCountMessage.reason).toBe('mace_min_players');
    expect(skippedByPlayersCountMessage.filename).toBe('file_2');
  }
});

test('ParseReplayTaskResponseMessage should represent skipped status for empty_replay', () => {
  const skippedEmptyReplayMessage = satisfies<ParseReplayTaskResponseMessage>({
    taskId: 'task-4',
    status: 'skipped',
    filename: 'file_4',
    reason: 'empty_replay',
  });

  expect(skippedEmptyReplayMessage.status).toBe('skipped');

  if (skippedEmptyReplayMessage.status === 'skipped') {
    expect(skippedEmptyReplayMessage.taskId).toBe('task-4');
    expect(skippedEmptyReplayMessage.reason).toBe('empty_replay');
    expect(skippedEmptyReplayMessage.filename).toBe('file_4');
  }
});

test('ParseReplayTaskResponseMessage should represent error status', () => {
  const errorMessage = satisfies<ParseReplayTaskResponseMessage>({
    taskId: 'task-5',
    status: 'error',
    error: {
      filename: 'file_3',
      message: 'parse failed',
      stack: 'stack trace',
    },
  });

  expect(errorMessage.status).toBe('error');

  if (errorMessage.status === 'error') {
    expect(errorMessage.taskId).toBe('task-5');
    expect(errorMessage.error).toMatchObject({
      filename: 'file_3',
      message: 'parse failed',
      stack: 'stack trace',
    });
  }
});

test('ParseReplayTaskResponseMessage should represent error status without stack', () => {
  const errorMessageWithoutStack = satisfies<ParseReplayTaskResponseMessage>({
    taskId: 'task-6',
    status: 'error',
    error: {
      filename: 'file_6',
      message: 'parse failed without stack',
    },
  });

  expect(errorMessageWithoutStack.status).toBe('error');

  if (errorMessageWithoutStack.status === 'error') {
    expect(errorMessageWithoutStack.taskId).toBe('task-6');
    expect(errorMessageWithoutStack.error).toMatchObject({
      filename: 'file_6',
      message: 'parse failed without stack',
    });
    expect('stack' in errorMessageWithoutStack.error).toBe(false);
  }
});
