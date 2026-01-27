/**
 * Output generation job
 * Calculates statistics and generates JSON output files
 */

import { getDbClient, disconnectDb } from '../../db';
import { calculateAllStatistics } from '../../services/statistics';
import { generateAllOutput } from '../../services/output';

const main = async (): Promise<void> => {
  console.log('Starting output generation...');

  const db = getDbClient();

  // Check for parsed replays
  const parsedCount = await db.replay.count({ where: { status: 'PARSED' } });

  if (parsedCount === 0) {
    console.log('No parsed replays found. Nothing to generate.');
    await disconnectDb();
    return;
  }

  console.log(`Found ${parsedCount} parsed replays`);

  // Calculate statistics
  console.log('\nCalculating statistics...');
  const stats = await calculateAllStatistics();

  console.log(`  - SG: ${stats.sg.global.length} players, ${stats.sg.squad.length} squads`);
  console.log(`  - MACE: ${stats.mace.global.length} players, ${stats.mace.squad.length} squads`);

  // Generate output
  console.log('\nGenerating output files...');
  await generateAllOutput(stats);

  console.log('\n=========================================');
  console.log('OUTPUT GENERATION COMPLETE');
  console.log('=========================================');
  console.log('Files generated in /results/ directory');

  await disconnectDb();
};

main().catch((error) => {
  console.error('Output generation failed:', error);
  process.exit(1);
});
