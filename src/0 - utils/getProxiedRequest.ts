import dotenv from 'dotenv';
import fetch, { Response } from 'node-fetch';

const relayUrlEnvVariableName = 'REPLAYS_RELAY_URL';
const relayTokenEnvVariableName = 'REPLAYS_RELAY_TOKEN';
const relaySupportedHost = 'sg.zone';
const requestTimeoutMs = 30 * 1000;

type RelayConfig = {
  relayToken: string;
  relayUrl: string;
};

dotenv.config();

const isRelaySupportedUrl = (url: string): boolean => {
  try {
    const parsedUrl = new URL(url);

    return parsedUrl.protocol === 'https:' && parsedUrl.hostname === relaySupportedHost;
  } catch (err) {
    return false;
  }
};

const getRelayConfig = (): RelayConfig | null => {
  const relayUrl = process.env[relayUrlEnvVariableName];
  const relayToken = process.env[relayTokenEnvVariableName];

  if (!relayUrl) return null;

  if (!relayToken) {
    throw new Error(`${relayTokenEnvVariableName} is required when ${relayUrlEnvVariableName} is set.`);
  }

  return {
    relayToken,
    relayUrl,
  };
};

const getProxiedRequest = async (url: string): Promise<Response | null> => {
  const relayConfig = getRelayConfig();

  if (!relayConfig) return null;

  if (!isRelaySupportedUrl(url)) {
    throw new Error(`Relay mode supports only https://${relaySupportedHost} URLs.`);
  }

  const parsedTargetUrl = new URL(url);
  const targetPath = `${parsedTargetUrl.pathname}${parsedTargetUrl.search}`;
  const relayRequestUrl = new URL(relayConfig.relayUrl);

  if (!relayRequestUrl.pathname || relayRequestUrl.pathname === '/') {
    relayRequestUrl.pathname = '/relay';
  }

  relayRequestUrl.searchParams.set('path', targetPath);

  return fetch(relayRequestUrl.toString(), {
    method: 'GET',
    headers: {
      'x-relay-token': relayConfig.relayToken,
    },
    timeout: requestTimeoutMs,
  });
};

export default getProxiedRequest;
