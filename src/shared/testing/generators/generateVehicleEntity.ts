import getNameById from '../getNameById';

type GenerateVehicleEntity = {
  id: VehicleEntity['id'];
  class: VehicleEntity['class'];
  name?: VehicleEntity['name'];
};

const generateVehicleEntity = ({
  id,
  class: vehicleClass,
  name,
}: GenerateVehicleEntity): VehicleEntity => ({
  framesFired: [[0, [0, 0]]],
  type: 'vehicle',
  class: vehicleClass,
  startFrameNum: 0,
  positions: [],
  id,
  name: name || getNameById(id),
});

export default generateVehicleEntity;
