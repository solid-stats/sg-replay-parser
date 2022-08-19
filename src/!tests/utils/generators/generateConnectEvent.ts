import getNameById from '../getNameById';

const generateConnectEvent = (
  id: ConnectEvent[3],
  name?: ConnectEvent[2],
): ConnectEvent => ([
  0,
  'connected',
  name || getNameById(id),
  id,
]);

export default generateConnectEvent;
