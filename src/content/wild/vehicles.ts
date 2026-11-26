// Vehicle construction (section 20). Vehicles are built at the Zonai Workshop from
// Zonaite and Zonai Devices; they run on the army's shared Energy Cell.

export interface VehicleDef {
  id: string;
  /** Passengers carried (crew). */
  crew: number;
  /** Energy drained each player phase (example: 2 Fans + 1 Beam Emitter = 8/turn). */
  energy: number;
  /** Zonai Devices used to build it. */
  devices: Record<string, number>;
  zonaite: number;
  rupees: number;
  purpose: string;
  /** Can cross water. */
  swims?: boolean;
  /** Runs without anyone aboard. */
  autonomous?: boolean;
}

export const VEHICLES: VehicleDef[] = [
  { id: 'scoutCart', crew: 1, energy: 2, devices: { zonaiCart: 1, smallWheel: 2, steeringStick: 1 }, zonaite: 4, rupees: 80, purpose: 'recon' },
  { id: 'armoredRover', crew: 3, energy: 4, devices: { zonaiCart: 1, bigWheel: 2, steeringStick: 1 }, zonaite: 10, rupees: 200, purpose: 'armored transport' },
  { id: 'assaultTank', crew: 2, energy: 7, devices: { bigWheel: 2, zonaiCannon: 1, steeringStick: 1 }, zonaite: 12, rupees: 260, purpose: 'heavy artillery' },
  { id: 'hoverbike', crew: 1, energy: 4, devices: { zonaiFan: 2, steeringStick: 1 }, zonaite: 4, rupees: 120, purpose: 'fast aerial' },
  { id: 'attackGlider', crew: 2, energy: 8, devices: { zonaiWing: 1, zonaiFan: 2, beamEmitter: 1 }, zonaite: 8, rupees: 220, purpose: 'aerial combat' },
  { id: 'transportBalloon', crew: 4, energy: 3, devices: { zonaiBalloon: 1, flameEmitter: 1 }, zonaite: 6, rupees: 150, purpose: 'vertical transport' },
  { id: 'floatingFortress', crew: 8, energy: 12, devices: { hoverStone: 2, zonaiCannon: 1, beamEmitter: 1, steeringStick: 1 }, zonaite: 25, rupees: 600, purpose: 'aerial siege' },
  { id: 'assaultRaft', crew: 4, energy: 7, devices: { zonaiFan: 1, zonaiCannon: 1, steeringStick: 1 }, zonaite: 8, rupees: 180, purpose: 'aquatic combat', swims: true },
  { id: 'homingDrone', crew: 0, energy: 3, devices: { constructHead: 1, zonaiFan: 1 }, zonaite: 3, rupees: 90, purpose: 'autonomous assault', autonomous: true },
  { id: 'miningMachine', crew: 2, energy: 4, devices: { bigWheel: 2, steeringStick: 1 }, zonaite: 10, rupees: 180, purpose: 'ore and obstacles' },
];
export const VEHICLE_BY_ID: Record<string, VehicleDef> = Object.fromEntries(VEHICLES.map((v) => [v.id, v]));
