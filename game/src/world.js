// Gobble Dash — the road ahead: obstacles, corn, haystacks, stages.
// One job: spawn and move everything the turkey must dodge, jump or
// hide in, from a seeded generator so runs are replayable.

import { OBSTACLES, RUN, VIEW, stageAt } from './config.js';
import { makeRng, pick, range } from './random.js';

const PATTERNS = ['fence', 'pumpkin', 'knife', 'fence', 'pumpkin', 'oven', 'knife', 'haystack'];

export class World {
  constructor(seed = 1) {
    this.rng = makeRng(seed);
    this.reset(seed);
  }

  reset(seed = 1) {
    this.rng = makeRng(seed);
    this.distance = 0;
    this.speed = RUN.baseSpeed;
    this.entities = [];
    this.nextSpawnX = 980;
    this.spawnCount = 0;
    this.stage = stageAt(0);
    this.stageFlash = 0;
    this.stageFlashText = '';
  }

  get done() { return this.distance >= RUN.totalDistance; }

  spawnOne(x) {
    const kind = pick(this.rng, PATTERNS);
    const def = OBSTACLES[kind];
    const stage = stageAt(this.distance);
    // Ovens only appear once the kitchen stage begins.
    const finalKind = kind === 'oven' && stage.name !== 'KITCHEN' ? 'fence' : kind;
    const d = OBSTACLES[finalKind];
    const ent = { kind: finalKind, x, y: VIEW.groundY - d.height, w: d.width, h: d.height, passed: false, bob: this.rng() * 6 };
    if (finalKind === 'knife') { ent.y = VIEW.groundY - 84; ent.swing = 0; }
    if (finalKind === 'haystack') ent.hideUsed = false;
    this.entities.push(ent);
    this.spawnCount += 1;
    // Corn trails: a reward line over a low obstacle, or on the ground.
    if (this.rng() < 0.7) {
      const n = 3;
      for (let i = 0; i < n; i++) {
        this.entities.push({
          kind: 'corn', x: x + 40 + i * 34, y: ent.kind === 'pumpkin' || ent.kind === 'fence'
            ? VIEW.groundY - 110 : VIEW.groundY - 34,
          w: 26, h: 30, passed: false, bob: this.rng() * 6,
        });
      }
    }
  }

  update(dt) {
    const prevStage = this.stage;
    this.distance += (this.speed * dt) / 28; // ~28 px per metre
    this.speed = Math.min(RUN.maxSpeed, RUN.baseSpeed + this.distance * RUN.speedPerMetre);
    this.stage = stageAt(this.distance);
    if (this.stage.name !== prevStage.name) {
      this.stageFlash = 2.2;
      this.stageFlashText = this.stage.label;
    }
    if (this.stageFlash > 0) this.stageFlash -= dt;
    this.nextSpawnX -= this.speed * dt;
    // Spawn spacing tightens as the run gets faster.
    const gap = Math.max(300, 560 - this.distance * 0.22);
    if (this.nextSpawnX < VIEW.width) {
      this.spawnOne(VIEW.width + 40 + range(this.rng, 0, 120));
      this.nextSpawnX += gap + range(this.rng, 0, 140);
    }
    for (const e of this.entities) {
      e.x -= this.speed * dt;
      if (e.kind === 'knife') e.swing += dt * 5;
      e.bobPhase = (e.bobPhase || 0) + dt * 3;
    }
    this.entities = this.entities.filter((e) => e.x > -140);
  }

  overlaps(a, b) {
    return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
  }
}
