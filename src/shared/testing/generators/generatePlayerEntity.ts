import { defaultName } from '../consts';
import getNameById from '../getNameById';

type GeneratePlayerEntity = {
  id: PlayerEntity['id'];
  side: PlayerEntity['side'];
  description?: PlayerEntity['description'];
  isPlayer?: PlayerEntity['isPlayer'];
  name?: PlayerEntity['name'];
};

const generatePlayerEntity = ({
  isPlayer,
  side,
  id,
  name,
  description,
}: GeneratePlayerEntity): PlayerEntity => ({
  description: description === undefined ? defaultName : description,
  framesFired: [],
  isPlayer: isPlayer === undefined ? 1 : 0,
  startFrameNum: 0,
  positions: [],
  side,
  id,
  name: name || getNameById(id),
  group: defaultName,
  type: 'unit',
});

export default generatePlayerEntity;
