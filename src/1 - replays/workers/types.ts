export type ParseReplayTaskMessage<TTaskId extends string = string> = {
  taskId: TTaskId;
  filename: Replay['filename'];
  date: Replay['date'];
  missionName: Replay['mission_name'];
  gameType: GameType;
};

export type ParseReplayTaskSkippedReason = 'mace_min_players' | 'empty_replay';

export type ParseReplayTaskSuccessResponseMessage<TTaskId extends string = string> = {
  taskId: TTaskId;
  status: 'success';
  data: PlayersGameResult;
};

export type ParseReplayTaskSkippedResponseMessage<TTaskId extends string = string> = {
  taskId: TTaskId;
  status: 'skipped';
  filename: Replay['filename'];
  reason: ParseReplayTaskSkippedReason;
};

export type ParseReplayTaskErrorResponseMessage<TTaskId extends string = string> = {
  taskId: TTaskId;
  status: 'error';
  error: {
    filename: Replay['filename'];
    message: string;
    stack?: string;
  };
};

export type ParseReplayTaskResponseMessage<TTaskId extends string = string> =
  | ParseReplayTaskSuccessResponseMessage<TTaskId>
  | ParseReplayTaskSkippedResponseMessage<TTaskId>
  | ParseReplayTaskErrorResponseMessage<TTaskId>;
