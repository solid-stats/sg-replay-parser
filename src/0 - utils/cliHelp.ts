const helpFlags = new Set(['--help', '-h']);

const showCliHelp = (command: string, description: string): boolean => {
  const shouldShowHelp = process.argv.slice(2).some((arg) => helpFlags.has(arg));

  if (!shouldShowHelp) {
    return false;
  }

  console.log(`${command}: ${description}`);
  console.log(`Usage: pnpm run ${command}`);

  return true;
};

export default showCliHelp;
