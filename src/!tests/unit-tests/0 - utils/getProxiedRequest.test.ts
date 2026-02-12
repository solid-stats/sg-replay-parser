import fetch from 'node-fetch';

import getProxiedRequest from '../../../0 - utils/getProxiedRequest';

jest.mock('node-fetch', () => jest.fn());

const mockedFetch = fetch as jest.MockedFunction<typeof fetch>;

const resetRelayEnv = (): void => {
  delete process.env.REPLAYS_RELAY_URL;
  delete process.env.REPLAYS_RELAY_TOKEN;
};

beforeEach(() => {
  mockedFetch.mockReset();
  resetRelayEnv();
});

afterAll(() => {
  resetRelayEnv();
});

test('should return null when relay URL is not configured', async () => {
  await expect(getProxiedRequest('https://sg.zone/replays?p=1')).resolves.toBeNull();
  expect(mockedFetch).not.toHaveBeenCalled();
});

test('should throw when relay token is missing', async () => {
  process.env.REPLAYS_RELAY_URL = 'https://relay.solid-stats.ru/relay';

  await expect(getProxiedRequest('https://sg.zone/replays?p=1')).rejects
    .toThrow('REPLAYS_RELAY_TOKEN is required when REPLAYS_RELAY_URL is set.');
  expect(mockedFetch).not.toHaveBeenCalled();
});

test('should throw when target URL is not from sg.zone', async () => {
  process.env.REPLAYS_RELAY_URL = 'https://relay.solid-stats.ru/relay';
  process.env.REPLAYS_RELAY_TOKEN = 'token';

  await expect(getProxiedRequest('https://example.com/replays?p=1')).rejects
    .toThrow('Relay mode supports only https://sg.zone URLs.');
  expect(mockedFetch).not.toHaveBeenCalled();
});

test('should throw when target URL is invalid', async () => {
  process.env.REPLAYS_RELAY_URL = 'https://relay.solid-stats.ru/relay';
  process.env.REPLAYS_RELAY_TOKEN = 'token';

  await expect(getProxiedRequest('invalid-url')).rejects
    .toThrow('Relay mode supports only https://sg.zone URLs.');
  expect(mockedFetch).not.toHaveBeenCalled();
});

test('should call relay with relay token and encoded path', async () => {
  process.env.REPLAYS_RELAY_URL = 'https://relay.solid-stats.ru';
  process.env.REPLAYS_RELAY_TOKEN = 'token';
  const relayResponse = { status: 200 } as unknown as Response;

  mockedFetch.mockResolvedValue(relayResponse);

  await expect(getProxiedRequest('https://sg.zone/replays?p=7')).resolves.toBe(relayResponse);
  expect(mockedFetch).toHaveBeenCalledTimes(1);
  expect(mockedFetch).toHaveBeenCalledWith('https://relay.solid-stats.ru/relay?path=%2Freplays%3Fp%3D7', {
    method: 'GET',
    headers: {
      'x-relay-token': 'token',
    },
  });
});
