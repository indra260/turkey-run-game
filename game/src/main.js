// Gobble Dash — game orchestration: states, collisions, scoring.
// One job: own the loop and the rules that tie the other modules
// together. No drawing and no physics live here.

import { RUN, VIEW, FARMER } from './config.js';
import { Turkey } from './turkey.js';
import { Farmer } from './farmer.js';
import { World } from './world.js';
import { Input } from './input.js';
import { SoundBank } from './audio.js';
import { drawBackground, drawObstacle, drawTurkey, drawFarmer, drawSpeech } from './render.js';
import { drawHud, drawTitle, drawEnd, drawPaused, button } from './hud.js';
import { parseShot, applyShot } from './shots.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const statusEl = document.getElementById('status');

function fitCanvas() {
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  canvas.width = VIEW.width * dpr;
  canvas.height = VIEW.height * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
fitCanvas();
window.addEventListener('resize', fitCanvas);

export class Game {
  constructor() {
    this.turkey = new Turkey();
    this.farmer = new Farmer();
    this.world = new World(1);
    this.sounds = new SoundBank();
    this.state = 'title'; // title | playing | paused | end
    this.score = 0;
    this.scoreFloat = 0; // fractional distance points, banked to whole
    this.corn = 0;
    this.lives = RUN.startLives;
    this.best = Number(localStorage.getItem('gobble-dash-best') || 0);
    this.outcome = null;
    this.hitGrace = 0;
    this.time = 0;
    this.titleButton = null;
    this.endButton = null;
    this.shotMode = false;
  }

  get distance() { return this.world.distance; }
  set distance(v) { this.world.distance = v; }

  startRun(seed = 1) {
    this.turkey.reset();
    this.farmer.reset();
    this.world.reset(seed);
    this.score = 0;
    this.scoreFloat = 0;
    this.corn = 0;
    this.lives = RUN.startLives;
    this.outcome = null;
    this.hitGrace = 0;
    this.state = 'playing';
    this.sounds.ensure();
    this.sounds.gobble();
    this.sounds.startMusic();
    this.announce('The escape has begun. Jump the fences, slide under the knives.');
  }

  finish(outcome) {
    this.outcome = outcome;
    this.state = 'end';
    this.best = Math.max(this.best, this.score);
    try { localStorage.setItem('gobble-dash-best', String(this.best)); } catch { /* private mode */ }
    this.sounds.stopMusic();
    if (outcome === 'escaped') this.sounds.escaped(); else this.sounds.caught();
    this.announce(outcome === 'escaped'
      ? `You escaped! Final score ${this.score}. Press Enter to run again.`
      : `Caught! Final score ${this.score}. Press Enter to run again.`);
  }

  announce(text) { if (statusEl) statusEl.textContent = text; }

  takeHit(reason) {
    if (this.hitGrace > 0 || this.state !== 'playing') return;
    this.hitGrace = RUN.hitGrace;
    this.lives -= 1;
    this.turkey.stumble(0.7);
    // A hit costs ~40 px of gap plus the stumble drift (~32 px), so
    // one hit never ends the run on its own: v1 surged 85 px and let
    // the farmer close ~151 px per hit, which caught the turkey on
    // the first stumble even with lives left. Getting caught is now
    // decided by the gap check in update(), after the grace window.
    this.farmer.surge(40);
    this.sounds.hit();
    this.announce(`Ouch — ${reason}! ${this.lives} ${this.lives === 1 ? 'life' : 'lives'} left. The farmer is closing in!`);
    if (this.lives <= 0) this.finish('caught');
  }

  // Slip into a haystack: the farmer stops to search, the turkey is
  // safe inside for 2.4 s. Shared by the overlap trigger and the H key.
  hideInHay(hay) {
    if (hay.hideUsed || this.turkey.hidden || !this.turkey.onGround) return false;
    hay.hideUsed = true;
    this.turkey.hide(2.4, this.sounds);
    this.farmer.loseTrail(2.4);
    this.score += 40;
    this.announce('Hidden in the hay! The farmer is searching…');
    return true;
  }

  // H key: hide in the nearest haystack within reach (200 px).
  tryHide() {
    if (this.state !== 'playing' || this.turkey.hidden || !this.turkey.onGround) return;
    const hay = this.world.entities.find(
      (e) => e.kind === 'haystack' && !e.hideUsed && Math.abs(e.x - this.turkey.x) < 200,
    );
    if (hay) this.hideInHay(hay);
  }

  update(dt) {
    if (this.state !== 'playing') return;
    this.time += dt;
    if (this.hitGrace > 0) this.hitGrace -= dt;
    this.turkey.update(dt);
    this.farmer.update(dt, this.turkey.hidden, this.turkey.stumbleLeft > 0, this.world.speed);
    this.world.update(dt);
    const tb = this.turkey.bounds;
    for (const e of this.world.entities) {
      if (e.passed) continue;
      if (e.x + e.w < this.turkey.x) {
        e.passed = true;
        if (e.kind !== 'corn') this.score += RUN.obstacleScore;
        continue;
      }
      if (e.kind === 'corn') {
        if (this.world.overlaps(tb, e)) {
          e.passed = true;
          this.corn += 1;
          this.score += RUN.cornScore;
          this.sounds.corn();
        }
        continue;
      }
      if (e.kind === 'haystack') {
        if (this.world.overlaps(tb, e)) this.hideInHay(e);
        continue;
      }
      // A hidden turkey is inside the hay: obstacles pass over it.
      if (this.turkey.hidden) continue;
      if (this.world.overlaps(tb, e)) {
        const name = e.kind === 'oven' ? 'the oven' : e.kind === 'knife' ? 'a carving knife' : `a ${e.kind}`;
        this.takeHit(`hit ${name}`);
      }
    }
    // No catch while the hit-grace window is open: the farmer's surge
    // lands first, the catch is judged once the turkey recovers.
    if (this.hitGrace <= 0 && this.farmer.caught) { this.finish('caught'); return; }
    if (this.world.done) { this.finish('escaped'); return; }
    // Score ticks up with every metre survived: bank the fractional
    // part, since one frame is only ~0.2 m. v1 floored each frame's
    // slice, which was always 0 — distance score never moved.
    this.scoreFloat += (this.world.speed * dt) / 28;
    const whole = Math.floor(this.scoreFloat);
    if (whole > 0) { this.score += whole; this.scoreFloat -= whole; }
  }

  render() {
    const stage = this.world.stage;
    drawBackground(ctx, stage, this.distance, this.time);
    for (const e of this.world.entities) drawObstacle(ctx, e, stage);
    if (this.state !== 'title') drawTurkey(ctx, this.turkey, this.time);
    if (this.state === 'playing' || this.state === 'paused') {
      drawFarmer(ctx, this.farmer, this.time);
      if (this.farmer.gap < 120) drawSpeech(ctx, 'Come back here, dinner!', this.farmer.x + 10, 90);
    }
    if (this.state === 'playing' || this.state === 'paused') drawHud(ctx, this);
    if (this.state === 'title') this.titleButton = drawTitle(ctx, this.best);
    if (this.state === 'end') this.endButton = drawEnd(ctx, this);
    if (this.state === 'paused') drawPaused(ctx);
    // The title/end panels dim the whole screen, so the turkey and
    // the farmer are drawn again on top of them: the cover must show
    // its player (v1 hid the turkey behind the title panel), and the
    // CAUGHT screen must show the farmer who caught him.
    if (this.state === 'title') {
      drawTurkey(ctx, this.turkey, this.time);
      drawFarmer(ctx, this.farmer, this.time);
    }
    if (this.state === 'end' && this.outcome === 'caught') drawFarmer(ctx, this.farmer, this.time);
  }

  onKey(code) {
    if (code === 'KeyM') { this.sounds.toggleMute(); return; }
    if (this.state === 'title') {
      if (code === 'Enter' || code === 'Space') this.startRun(1 + Math.floor(this.time * 7) % 997);
      return;
    }
    if (this.state === 'end') {
      if (code === 'Enter' || code === 'Space') this.startRun(1 + Math.floor(this.time * 7) % 997);
      return;
    }
    if (code === 'KeyP') {
      this.state = this.state === 'paused' ? 'playing' : 'paused';
      return;
    }
    if (this.state !== 'playing') return;
    if (code === 'Space' || code === 'ArrowUp' || code === 'KeyW') this.turkey.jump(this.sounds);
    if (code === 'ArrowDown' || code === 'KeyS') this.turkey.slide(this.sounds);
    // H was advertised on the title screen and in the README but had
    // no handler in v1 — hide in a nearby haystack when pressed.
    if (code === 'KeyH') this.tryHide();
  }

  onClick(x, y) {
    if (this.state === 'title' && this.titleButton) {
      const b = this.titleButton;
      if (x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h) { this.sounds.click(); this.startRun(7); }
      return;
    }
    if (this.state === 'end' && this.endButton) {
      const b = this.endButton;
      if (x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h) { this.sounds.click(); this.startRun(7); }
      return;
    }
    if (this.state === 'paused') { this.state = 'playing'; return; }
    if (this.state !== 'playing') return;
    // Mouse play: click upper half to jump, lower half to slide.
    if (y < VIEW.height / 2) this.turkey.jump(this.sounds);
    else this.turkey.slide(this.sounds);
  }
}

const game = new Game();
const input = new Input(canvas, {
  onKey: (code) => game.onKey(code),
  onClick: (x, y) => game.onClick(x, y),
});
void input;

const shotInfo = parseShot();
if (shotInfo) {
  game.shotMode = true;
  applyShot(game, shotInfo);
  game.render();
} else {
  let last = performance.now();
  function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    if (game.state === 'playing') game.update(dt);
    game.render();
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}
