import z from 'zod';

export const workerDataSchema = z.object({
  logsFolderPath: z.string(),
});

export type WorkerData = z.infer<typeof workerDataSchema>;
