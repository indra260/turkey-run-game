// Gobble Dash — deterministic screenshot states.
// One job: ?shot=start|play|end (and &seed=) puts the game into a
// fixed, readable pose so screenshots are reproducible renders.

export function parseShot() {
  const q = new URLSearchParams(window.location.search);
  const shot = q.get('shot');
  if (!shot) return null;
  const seed = Number(q.get('seed') || '1') || 1;
  return { shot, seed, outcome: q.get('outcome') || 'escaped' };
}

// Build the exact state a screenshot needs, before the first frame.
export function applyShot(game, shotInfo) {
  const { shot, seed, outcome } = shotInfo;
  if (shot === 'start') {
    game.state = 'title';
    game.best = 1250;
    return;
  }
  if (shot === 'play') {
    game.startRun(seed);
    // Fixed mid-run pose: farmyard, farmer closing in, obstacles ahead.
    game.world.distance = 148;
    game.world.speed = 330;
    game.score = 740;
    game.corn = 6;
    game.farmer.gap = 96;
    game.farmer.suspicion = 1;
    game.world.entities = [
      { kind: 'fence', x: 520, y: 388, w: 26, h: 64, passed: false, bob: 0, bobPhase: 0 },
      { kind: 'corn', x: 560, y: 342, w: 26, h: 30, passed: false, bob: 0, bobPhase: 0.5 },
      { kind: 'corn', x: 594, y: 342, w: 26, h: 30, passed: false, bob: 0, bobPhase: 0.5 },
      { kind: 'pumpkin', x: 700, y: 412, w: 46, h: 40, passed: false, bob: 0, bobPhase: 0 },
      { kind: 'knife', x: 830, y: 368, w: 58, h: 22, passed: false, bob: 0, bobPhase: 0, swing: 0.4 },
    ];
    game.turkey.y = 452 - 58;
    game.turkey.runTime = 1.2;
    game.farmer.runTime = 1.2;
    return;
  }
  if (shot === 'end') {
    game.startRun(seed);
    game.score = 2480;
    game.corn = 14;
    game.distance = outcome === 'escaped' ? 1000 : 612;
    game.world.distance = game.distance;
    game.best = 2480;
    game.finish(outcome);
  }
}
