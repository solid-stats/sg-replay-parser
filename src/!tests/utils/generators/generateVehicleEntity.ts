import getNameById from '../getNameById';

type GenerateVehicleEntity = {
  id: VehicleEntity['id'];
  vehicleClass: VehicleEntity['vehicleClass'];
  name?: VehicleEntity['name'];
};

const generateVehicleEntity = ({
  id,
  vehicleClass,
  name,
}: GenerateVehicleEntity): VehicleEntity => ({
  framesFires: [],
  type: 'vehicle',
  vehicleClass,
  startFrameNum: 0,
  positions: [],
  id,
  name: name || getNameById(id),
});

export default generateVehicleEntity;
