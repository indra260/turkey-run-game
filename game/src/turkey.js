// Gobble Dash — the turkey: run, jump, slide, hide, stumble.
// One job: the player's body and its physics. No drawing here.

import { TURKEY, VIEW } from './config.js';

export class Turkey {
  constructor() {
    this.reset();
  }

  reset() {
    this.x = TURKEY.x;
    this.y = VIEW.groundY - TURKEY.height;
    this.vy = 0;
    this.width = TURKEY.width;
    this.height = TURKEY.height;
    this.onGround = true;
    this.sliding = false;
    this.slideLeft = 0;
    this.hidden = false;
    this.hideLeft = 0;
    this.runTime = 0;
    this.stumbleLeft = 0;
  }

  get bounds() {
    // Sliding makes the turkey low and long; hiding shrinks it inside
    // the hay, low and narrow, so obstacles pass over the haystack.
    if (this.hidden) return { x: this.x + 8, y: VIEW.groundY - 30, w: 48, h: 30 };
    if (this.sliding) return { x: this.x - 6, y: VIEW.groundY - 30, w: 78, h: 30 };
    return { x: this.x, y: this.y, w: this.width, h: this.height };
  }

  jump(sounds) {
    if (!this.onGround || this.hidden) return false;
    this.vy = TURKEY.jumpVelocity;
    this.onGround = false;
    this.sliding = false;
    this.slideLeft = 0;
    sounds.jump();
    return true;
  }

  slide(sounds) {
    if (!this.onGround || this.hidden) return false;
    this.sliding = true;
    this.slideLeft = TURKEY.slideTime;
    sounds.slide();
    return true;
  }

  hide(seconds, sounds) {
    this.hidden = true;
    this.hideLeft = seconds;
    sounds.hide();
  }

  stumble(seconds) {
    this.stumbleLeft = Math.max(this.stumbleLeft, seconds);
  }

  update(dt) {
    this.runTime += dt;
    if (this.stumbleLeft > 0) this.stumbleLeft -= dt;
    if (this.slideLeft > 0) {
      this.slideLeft -= dt;
      if (this.slideLeft <= 0) this.sliding = false;
    }
    if (this.hideLeft > 0) {
      this.hideLeft -= dt;
      if (this.hideLeft <= 0) this.hidden = false;
    }
    if (!this.onGround) {
      this.vy += TURKEY.gravity * dt;
      this.y += this.vy * dt;
      const floor = VIEW.groundY - this.height;
      if (this.y >= floor) {
        this.y = floor;
        this.vy = 0;
        this.onGround = true;
      }
    }
  }
}
