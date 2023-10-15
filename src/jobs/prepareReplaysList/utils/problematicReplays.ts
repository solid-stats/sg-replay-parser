const findProblematicReplays = (result: Output): Output['problematicReplays'] => {
  const replaysWithoutsFilename = result.problematicReplays.filter(
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

    delete newResult.parsedReplays[parsedReplaysIndex];
    delete newResult.replays[replaysIndex];
  });

  newResult = {
    ...result,
    problematicReplays,
  };

  return newResult;
};

export default processProblematicReplays;
