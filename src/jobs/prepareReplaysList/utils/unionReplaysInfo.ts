import { orderBy, union } from 'lodash';

const sortByDate = (replays: Output['replays']): Output['replays'] => orderBy(replays, 'date', 'desc');

const unionReplaysInfo = (replaysList: Output, result: Output): Output => {
  const newResult: Output = {
    ...result,
    parsedReplays: union(replaysList.parsedReplays, result.parsedReplays),
    replays: sortByDate(union(replaysList.replays, result.replays)),
  };

  return newResult;
};

export default unionReplaysInfo;
