import path from 'path';

import fs from 'fs-extra';

import logger from '../../shared/utils/logger';
import { rawReplaysPath } from '../../shared/utils/paths';
import request from '../../shared/utils/request';

const DATA_BASE_URL = 'https://sg.zone/data';

/** Number of retries for network failures */
const MAX_RETRIES = 3;

/** Exponential backoff base delay (ms) */
const BACKOFF_BASE_DELAY = process.env.NODE_ENV === 'test' ? 0 : 1000;

/**
 * Sleep for a specified number of milliseconds
 */
const sleep = (ms: number): Promise<void> => new Promise((resolve) => {
  setTimeout(resolve, ms);
});

/**
 * Result of saving a replay file
 */
export interface SaveReplayFileResult {
  success: boolean;
  filename: string;
  filePath: string;
  alreadyExists?: boolean;
  error?: string;
}

/**
 * Get the full path for a replay file
 *
 * @param filename - The replay filename (without .json extension)
 * @returns Full path to the file
 */
export const getReplayFilePath = (filename: string): string => path.join(rawReplaysPath, `${filename}.json`);

/**
 * Check if a replay file already exists
 *
 * @param filename - The replay filename (without .json extension)
 * @returns true if file exists
 */
export const replayFileExists = (filename: string): boolean => {
  const filePath = getReplayFilePath(filename);

  try {
    fs.accessSync(filePath);

    return true;
  } catch {
    return false;
  }
};

/**
 * Download and save a replay JSON file from sg.zone
 *
 * The file is downloaded from https://sg.zone/data/{filename}.json
 * and saved to the raw_replays directory.
 *
 * @param filename - The replay filename (without .json extension)
 * @param skipIfExists - If true, skip download if file already exists (default: true)
 * @returns SaveReplayFileResult with status and path
 */
export const saveReplayFile = async (
  filename: string,
  skipIfExists = true,
): Promise<SaveReplayFileResult> => {
  const filePath = getReplayFilePath(filename);

  // Check if file already exists
  if (skipIfExists && replayFileExists(filename)) {
    logger.info(`Replay file already exists: ${filename}`);

    return {
      success: true,
      filename,
      filePath,
      alreadyExists: true,
    };
  }

  const url = `${DATA_BASE_URL}/${filename}.json`;
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < MAX_RETRIES; attempt += 1) {
    try {
      if (attempt > 0) {
        // Exponential backoff: 1s, 2s, 4s
        const backoffDelay = BACKOFF_BASE_DELAY * (2 ** (attempt - 1));

        // eslint-disable-next-line no-await-in-loop
        await sleep(backoffDelay);
      }

      // eslint-disable-next-line no-await-in-loop
      const response = await request(url);

      if (!response) {
        throw new Error(`Failed to download replay file ${filename}: no response`);
      }

      // eslint-disable-next-line no-await-in-loop
      const content = await response.text();

      // Ensure directory exists
      fs.ensureDirSync(rawReplaysPath);

      // Save to file
      fs.writeFileSync(filePath, content);

      logger.info(`Saved replay file: ${filename}`);

      return {
        success: true,
        filename,
        filePath,
      };
    } catch (err) {
      lastError = err as Error;
      logger.warn(`Attempt ${attempt + 1}/${MAX_RETRIES} failed for ${filename}: ${lastError.message}`);
    }
  }

  logger.error(`Failed to save replay file ${filename}: ${lastError?.message}`);

  return {
    success: false,
    filename,
    filePath,
    error: lastError?.message || 'Unknown error',
  };
};

/**
 * Result of batch save operation
 */
export interface BatchSaveReplayFilesResult {
  saved: number;
  skipped: number;
  failed: number;
  errors: string[];
}

/**
 * Download and save multiple replay files
 *
 * @param filenames - Array of replay filenames (without .json extension)
 * @param skipIfExists - If true, skip download if file already exists (default: true)
 * @returns Batch result with counts
 */
export const saveMultipleReplayFiles = async (
  filenames: string[],
  skipIfExists = true,
): Promise<BatchSaveReplayFilesResult> => {
  const result: BatchSaveReplayFilesResult = {
    saved: 0,
    skipped: 0,
    failed: 0,
    errors: [],
  };

  for (const filename of filenames) {
    // eslint-disable-next-line no-await-in-loop
    const saveResult = await saveReplayFile(filename, skipIfExists);

    if (saveResult.success) {
      if (saveResult.alreadyExists) {
        result.skipped += 1;
      } else {
        result.saved += 1;
      }
    } else {
      result.failed += 1;

      if (saveResult.error) {
        result.errors.push(`${filename}: ${saveResult.error}`);
      }
    }
  }

  logger.info(
    `Batch save complete: ${result.saved} saved, ${result.skipped} skipped, ${result.failed} failed`,
  );

  return result;
};
