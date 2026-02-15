export type ParseReplayTaskMessage = {
  taskId: string;
  filename: Replay['filename'];
  date: Replay['date'];
  missionName: Replay['mission_name'];
  gameType: GameType;
};

export type ParseReplayTaskSkippedReason = 'mace_min_players' | 'empty_replay';

export type ParseReplayTaskSuccessResponseMessage = {
  taskId: ParseReplayTaskMessage['taskId'];
  status: 'success';
  data: PlayersGameResult;
};

export type ParseReplayTaskSkippedResponseMessage = {
  taskId: ParseReplayTaskMessage['taskId'];
  status: 'skipped';
  filename: Replay['filename'];
  reason: ParseReplayTaskSkippedReason;
};

export type ParseReplayTaskErrorResponseMessage = {
  taskId: ParseReplayTaskMessage['taskId'];
  status: 'error';
  error: {
    filename: Replay['filename'];
    message: string;
    stack?: string;
  };
};

export type ParseReplayTaskResponseMessage =
  | ParseReplayTaskSuccessResponseMessage
  | ParseReplayTaskSkippedResponseMessage
  | ParseReplayTaskErrorResponseMessage;
