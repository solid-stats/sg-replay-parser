const findProblematicReplays = (result: Output): Output['problematicReplays'] => {
  const replaysWithoutsFilename = result.replays.filter(
    (val) => val.filename.length === 0,
  );

  return [...replaysWithoutsFilename];
};

const processProblematicReplays = (result: Output): Output => {
  let newResult = { ...result };
  const problematicReplays = findProblematicReplays(result);

  problematicReplays.forEach(({ replayLink }) => {
    const parsedReplaysIndex = newResult.parsedReplays.findIndex(
      (parsedReplay) => parsedReplay === replayLink,
    );
    const replaysIndex = newResult.replays.findIndex(
      (replay) => replay.replayLink === replayLink,
    );

    newResult.parsedReplays.splice(parsedReplaysIndex, 1);
    newResult.replays.splice(replaysIndex, 1);
  });

  newResult = {
    ...result,
    problematicReplays,
  };

  return newResult;
};

export default processProblematicReplays;
