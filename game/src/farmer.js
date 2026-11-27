// Gobble Dash — the farmer: he chases, searches and corners.
// One job: the pursuer's AI. He gains ground whenever the turkey
// stumbles, loses it when the turkey hides or pulls ahead, and
// gives up searching after a few seconds in the hay.

import { FARMER } from './config.js';

export class Farmer {
  constructor() {
    this.reset();
  }

  reset() {
    this.gap = FARMER.startGap;
    this.state = 'chasing'; // chasing | searching | giving-up
    this.searchLeft = 0;
    this.runTime = 0;
    this.suspicion = 0; // 0..1, shown as the "!" over his head
  }

  get x() { return 170 - this.gap; }
  get caught() { return this.gap <= FARMER.catchGap; }

  // The turkey stumbled: the farmer surges forward.
  surge(amount) {
    if (this.state === 'searching') return;
    this.gap = Math.max(FARMER.catchGap - 6, this.gap - amount);
    this.suspicion = 1;
  }

  // The turkey slipped into a haystack: the farmer stops and searches.
  loseTrail(seconds) {
    this.state = 'searching';
    this.searchLeft = seconds;
    this.suspicion = 0.6;
  }

  update(dt, turkeyHidden, turkeyStumbling, speed) {
    this.runTime += dt;
    if (this.suspicion > 0) this.suspicion = Math.max(0, this.suspicion - dt * 0.4);
    if (this.state === 'searching') {
      this.searchLeft -= dt;
      // Searching costs him ground: the turkey pulls away.
      this.gap = Math.min(FARMER.startGap + 60, this.gap + speed * dt * 0.55);
      if (this.searchLeft <= 0) {
        this.state = 'chasing';
        this.gap = FARMER.startGap;
      }
      return;
    }
    if (turkeyHidden) return;
    // A clean run slowly opens the gap; a stumbling turkey lets him
    // close in. The drift is small on purpose: one hit costs about
    // 40 + 0.7*45 ≈ 70 px of gap (see takeHit), so a single stumble
    // never hands the farmer the run — v1 drifted -95 px/s, which,
    // with the 85 px surge, ended most runs on the first hit.
    const drift = turkeyStumbling ? -45 : 26;
    this.gap = Math.min(FARMER.startGap + 90, Math.max(FARMER.catchGap - 6, this.gap + drift * dt));
  }
}
