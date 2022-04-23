const getSquadPrefix = (prefixWithBrackets: string): string => {
  const prefixContentRegex = /\[(.*)\]/;
  const matchResult = prefixWithBrackets.match(prefixContentRegex);

  if (!matchResult) return prefixWithBrackets;

  const prefixContent = matchResult[1];

  return prefixContent;
};

export default getSquadPrefix;
