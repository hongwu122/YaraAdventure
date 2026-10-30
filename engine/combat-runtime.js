(() => {
  'use strict';

  class InputBuffer {
    constructor() { this.items = []; }
    push(name, ttl = 0.22, payload = null) { this.items.push({ name, ttl, payload }); }
    tick(dt) { for (const x of this.items) x.ttl -= dt; this.items = this.items.filter(x => x.ttl > 0); }
    consume(name) {
      const i = this.items.findIndex(x => x.name === name);
      if (i < 0) return null;
      return this.items.splice(i, 1)[0];
    }
    clear(name = null) { this.items = name ? this.items.filter(x => x.name !== name) : []; }
  }

  class ActionTimeline {
    constructor(name, clip, meta = {}) {
      const t = clip?.timing || meta.timing || {windup:0.12,active:0.20,recover:0.18};
      this.name = name;
      this.animation = meta.animation || name;
      this.windup = Number(t.windup || 0);
      this.active = Number(t.active || 0);
      this.recover = Number(t.recover || 0);
      this.elapsed = 0;
      this.hitSet = new Set();
      this.meta = meta;
      this.phase = 'windup';
      this.finished = false;
    }
    total() { return this.windup + this.active + this.recover; }
    tick(dt) {
      this.elapsed += dt;
      if (this.elapsed < this.windup) this.phase = 'windup';
      else if (this.elapsed < this.windup + this.active) this.phase = 'active';
      else if (this.elapsed < this.total()) this.phase = 'recover';
      else { this.phase = 'done'; this.finished = true; }
      return this.phase;
    }
    progress() { return Math.min(1, this.elapsed / Math.max(0.001, this.total())); }
    canDashCancel() {
      const from = Number(this.meta.dashCancelFromRecover || 0.25);
      if (this.phase !== 'recover' || this.recover <= 0) return false;
      const recoverElapsed = this.elapsed - this.windup - this.active;
      return recoverElapsed >= this.recover * from;
    }
  }

  window.YaraV33 = window.YaraV33 || {};
  Object.assign(window.YaraV33, { InputBuffer, ActionTimeline });
})();
