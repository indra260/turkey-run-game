// Gobble Dash — keyboard + mouse input.
// One job: turn keys and clicks into game actions, nothing else.

export class Input {
  constructor(canvas, hooks) {
    this.hooks = hooks;
    this.keys = new Set();
    this.queue = [];
    window.addEventListener('keydown', (e) => {
      if (['ArrowUp', 'ArrowDown', 'Space'].includes(e.code)) e.preventDefault();
      if (e.repeat) return;
      this.keys.add(e.code);
      this.queue.push(e.code);
      this.hooks.onKey(e.code);
    });
    window.addEventListener('keyup', (e) => this.keys.delete(e.code));
    canvas.addEventListener('pointerdown', (e) => {
      const rect = canvas.getBoundingClientRect();
      const x = (e.clientX - rect.left) * (canvas.width / rect.width);
      const y = (e.clientY - rect.top) * (canvas.height / rect.height);
      this.hooks.onClick(x, y);
    });
    window.addEventListener('blur', () => this.keys.clear());
  }

  // Actions pressed since the last frame was consumed.
  drain() {
    const out = this.queue;
    this.queue = [];
    return out;
  }

  down(code) { return this.keys.has(code); }
}
