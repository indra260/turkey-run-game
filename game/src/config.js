// Gobble Dash — tuning constants and stage definitions.
// One job: every number the game balances on lives here, so tuning
// never means hunting through gameplay code.

export const VIEW = { width: 960, height: 540, groundY: 452 };

export const TURKEY = {
  x: 170,
  width: 64,
  height: 58,
  jumpVelocity: -640,
  gravity: 1750,
  slideTime: 0.55,
  runBobHz: 11,
};

export const FARMER = {
  width: 72,
  height: 96,
  // Gap (px) from the turkey's left edge to the farmer's right edge.
  // 160 keeps him on screen at the run's start, closing in as he gains.
  startGap: 160,
  // Gap (px) at which the farmer grabs the turkey.
  catchGap: 60,
};

// Distance (metres) at which each stage begins. The run is 1000 m:
// farmyard -> barn -> kitchen -> the woods (freedom).
export const STAGES = [
  { name: 'FARMYARD', from: 0, sky: '#f7c873', ground: '#b97e3e', grass: '#7fae4c', label: 'STAGE 1 · THE FARMYARD' },
  { name: 'BARN', from: 300, sky: '#e8a35c', ground: '#8a5a30', grass: '#a8873f', label: 'STAGE 2 · THE BARN' },
  { name: 'KITCHEN', from: 620, sky: '#d97b4f', ground: '#6e3f2a', grass: '#c96a3a', label: 'STAGE 3 · THE KITCHEN' },
  { name: 'WOODS', from: 900, sky: '#8fb573', ground: '#5d7a44', grass: '#4e7a3a', label: 'FINAL STRETCH · THE WOODS' },
];

export const RUN = {
  totalDistance: 1000,
  baseSpeed: 300,
  maxSpeed: 470,
  speedPerMetre: 0.16,
  cornScore: 25,
  obstacleScore: 10,
  // Metres of grace after a hit before the next hit can land.
  hitGrace: 1.1,
  startLives: 3,
};

export const OBSTACLES = {
  fence: { width: 26, height: 64, jump: true },
  pumpkin: { width: 46, height: 40, jump: true },
  oven: { width: 84, height: 96, jump: true, fire: true },
  knife: { width: 58, height: 22, slide: true },
  haystack: { width: 70, height: 62, hide: true },
};

export function stageAt(distance) {
  let stage = STAGES[0];
  for (const s of STAGES) if (distance >= s.from) stage = s;
  return stage;
}
