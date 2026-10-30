(() => {
  'use strict';

  const CharacterState = Object.freeze({
    IDLE: 'idle',
    RUN: 'run',
    JUMP: 'jump',
    ATTACK: 'attack',
    HURT_LIGHT: 'hurt_light',
    HURT_HEAVY: 'hurt_heavy',
    KNOCKBACK: 'knockback',
    STUN: 'stun',
    KNOCKDOWN: 'knockdown',
    GETUP: 'getup',
    DEAD: 'dead'
  });

  const EnemyState = Object.freeze({ ...CharacterState });

  class StateMachine {
    constructor(initial = CharacterState.IDLE) {
      this.state = initial;
      this.previous = null;
      this.elapsed = 0;
      this.lockedUntil = 0;
      this.meta = {};
    }

    set(next, meta = {}, force = false) {
      if (!force && this.state === CharacterState.DEAD && next !== CharacterState.DEAD) return false;
      if (!force && performance.now() < this.lockedUntil && next !== this.state) return false;
      if (next === this.state) return true;
      this.previous = this.state;
      this.state = next;
      this.elapsed = 0;
      this.meta = meta || {};
      if (meta.lockMs) this.lockedUntil = performance.now() + meta.lockMs;
      else if (force) this.lockedUntil = 0;
      return true;
    }

    lock(ms) {
      this.lockedUntil = Math.max(this.lockedUntil, performance.now() + Math.max(0, ms || 0));
    }

    unlock() {
      this.lockedUntil = 0;
    }

    tick(dt) {
      this.elapsed += dt;
      return this.elapsed;
    }

    is(...states) {
      return states.includes(this.state);
    }

    isControlLocked() {
      return [
        CharacterState.HURT_LIGHT,
        CharacterState.HURT_HEAVY,
        CharacterState.KNOCKBACK,
        CharacterState.STUN,
        CharacterState.KNOCKDOWN,
        CharacterState.GETUP,
        CharacterState.DEAD
      ].includes(this.state);
    }
  }

  window.YaraV31 = window.YaraV31 || {};
  Object.assign(window.YaraV31, { CharacterState, EnemyState, StateMachine });
})();
