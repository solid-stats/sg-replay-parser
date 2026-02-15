import {
  ParseReplayTaskMessage,
  ParseReplayTaskResponseMessage,
} from '../../../../1 - replays/workers/types';

const taskMessage: ParseReplayTaskMessage = {
  taskId: 'task-1',
  filename: 'file_1',
  date: '2024-01-01',
  missionName: 'sg@test_mission',
  gameType: 'sg',
};

const successData: PlayersGameResult = {
  date: '2024-01-01',
  missionName: 'sg@test_mission',
  result: [],
};

test('ParseReplayTaskMessage should contain required fields', () => {
  expect(taskMessage).toMatchObject({
    taskId: 'task-1',
    filename: 'file_1',
    date: '2024-01-01',
    missionName: 'sg@test_mission',
    gameType: 'sg',
  });
});

test('ParseReplayTaskResponseMessage should represent success status', () => {
  const successMessage: ParseReplayTaskResponseMessage = {
    status: 'success',
    data: successData,
  };

  expect(successMessage.status).toBe('success');

  if (successMessage.status === 'success') {
    expect(successMessage.data).toMatchObject(successData);
  }
});

test('ParseReplayTaskResponseMessage should represent skipped status', () => {
  const skippedMessage: ParseReplayTaskResponseMessage = {
    status: 'skipped',
    filename: 'file_2',
    reason: 'mace_min_players',
  };

  expect(skippedMessage.status).toBe('skipped');

  if (skippedMessage.status === 'skipped') {
    expect(skippedMessage.reason).toBe('mace_min_players');
    expect(skippedMessage.filename).toBe('file_2');
  }
});

test('ParseReplayTaskResponseMessage should represent error status', () => {
  const errorMessage: ParseReplayTaskResponseMessage = {
    status: 'error',
    error: {
      filename: 'file_3',
      message: 'parse failed',
      stack: 'stack trace',
    },
  };

  expect(errorMessage.status).toBe('error');

  if (errorMessage.status === 'error') {
    expect(errorMessage.error).toMatchObject({
      filename: 'file_3',
      message: 'parse failed',
      stack: 'stack trace',
    });
  }
});
