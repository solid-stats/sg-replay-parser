/**
 * Statistics calculation job
 * Calculates global player statistics from parsed replays
 */

import { getDbClient, disconnectDb } from '../../db';
import { calculateAllStatistics } from '../../services/statistics';

const main = async (): Promise<void> => {
  console.log('Starting statistics calculation...');

  const db = getDbClient();

  // Get counts
  const [parsedCount, sgCount, maceCount] = await Promise.all([
    db.replay.count({ where: { status: 'PARSED' } }),
    db.replay.count({ where: { status: 'PARSED', gameType: 'SG' } }),
    db.replay.count({ where: { status: 'PARSED', gameType: 'MACE' } }),
  ]);

  console.log(`Parsed replays: ${parsedCount} (SG: ${sgCount}, MACE: ${maceCount})`);

  if (parsedCount === 0) {
    console.log('No parsed replays found. Nothing to calculate.');
    await disconnectDb();

    return;
  }

  // Calculate statistics
  console.log('\nCalculating statistics...');
  const stats = await calculateAllStatistics();

  console.log('\n=========================================');
  console.log('STATISTICS SUMMARY');
  console.log('=========================================');
  console.log('\nSG Statistics:');
  console.log(`  - Players: ${stats.sg.global.length}`);
  console.log(`  - Squads: ${stats.sg.squad.length}`);

  if (stats.sg.global.length > 0) {
    console.log('  - Top 5 players by score:');
    stats.sg.global.slice(0, 5).forEach((p, i) => {
      console.log(`    ${i + 1}. ${p.lastSquadPrefix || ''}${p.name} - Score: ${p.totalScore}, K/D: ${p.kdRatio}`);
    });
  }

  if (stats.sg.squad.length > 0) {
    console.log('  - Top 5 squads by score:');
    stats.sg.squad.slice(0, 5).forEach((s, i) => {
      console.log(`    ${i + 1}. ${s.prefix} - Score: ${s.score}, Players: ${s.players.length}`);
    });
  }

  console.log('\nMACE Statistics:');
  console.log(`  - Players: ${stats.mace.global.length}`);
  console.log(`  - Squads: ${stats.mace.squad.length}`);

  if (stats.mace.global.length > 0) {
    console.log('  - Top 5 players by score:');
    stats.mace.global.slice(0, 5).forEach((p, i) => {
      console.log(`    ${i + 1}. ${p.lastSquadPrefix || ''}${p.name} - Score: ${p.totalScore}, K/D: ${p.kdRatio}`);
    });
  }

  if (stats.mace.squad.length > 0) {
    console.log('  - Top 5 squads by score:');
    stats.mace.squad.slice(0, 5).forEach((s, i) => {
      console.log(`    ${i + 1}. ${s.prefix} - Score: ${s.score}, Players: ${s.players.length}`);
    });
  }

  console.log('\n=========================================');

  await disconnectDb();
};

main().catch((error) => {
  console.error('Statistics calculation failed:', error);
  process.exit(1);
});
