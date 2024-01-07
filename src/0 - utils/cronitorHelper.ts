import qs from 'qs';

import jobsName from './jobsName';
import request from './request';

type JobKey = keyof typeof jobsName;

const apiKey = process.env.CRONITOR_API_KEY;

const getCronitorURL = (jobKey: JobKey) => (
  `https://cronitor.link/p/${apiKey}/${jobsName[jobKey]}`
);

export const pingMonitor = (
  jobKey: JobKey,
  state: 'run' | 'complete' | 'fail' | 'ok',
  message?: string,
) => {
  if (!apiKey) throw new Error('CRONITOR_API_KEY environment variable is not set');

  const url = getCronitorURL(jobKey);

  const params = qs.stringify(
    {
      state,
      message,
    },
    { arrayFormat: 'repeat', encode: false },
  );

  return request(`${url}?${params}`, {}, 5);
};
