export type ParseReplayTaskMessage = {
  taskId: string;
  filename: Replay['filename'];
  date: Replay['date'];
  missionName: Replay['mission_name'];
  gameType: GameType;
};

export type ParseReplayTaskSkippedReason = 'mace_min_players' | 'empty_replay';

export type ParseReplayTaskSuccessResponseMessage = {
  status: 'success';
  data: PlayersGameResult;
};

export type ParseReplayTaskSkippedResponseMessage = {
  status: 'skipped';
  filename: Replay['filename'];
  reason: ParseReplayTaskSkippedReason;
};

export type ParseReplayTaskErrorResponseMessage = {
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
