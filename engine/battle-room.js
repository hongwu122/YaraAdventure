(() => {
  'use strict';

  class BattleRoomController {
    constructor(config) {
      this.config = config;
      this.rooms = (config.rooms || []).map(r => ({ ...r, state: 'pending', waveIndex: -1, delay: 0 }));
      this.active = null;
      this.lastBanner = '';
    }

    reset() {
      for (const room of this.rooms) {
        room.state = 'pending';
        room.waveIndex = -1;
        room.delay = 0;
      }
      this.active = null;
      this.lastBanner = '';
    }

    update(dt, player, enemies, spawnWave, onMessage) {
      if (!player) return;

      if (!this.active) {
        const next = this.rooms.find(r => r.state === 'pending' && player.x + player.w * 0.5 >= r.triggerX);
        if (next) this.activate(next, spawnWave, onMessage);
      }

      const room = this.active;
      if (!room) return;

      player.x = Math.max(room.lockLeft, Math.min(room.lockRight - player.w, player.x));

      const alive = enemies.some(e => !e.dead && e.roomId === room.id && e.roomWave === room.waveIndex);
      if (alive) { room.delay = 0; return; }

      const nextWave = room.waveIndex + 1;
      if (nextWave < room.waves.length) {
        if (room.waveIndex < 0) {
          this.startWave(room, nextWave, spawnWave, onMessage);
          return;
        }
        if (room.delay <= 0) {
          room.delay = Number(room.waveDelay || 0.8);
          onMessage?.(`${room.label} · 下一波即将出现`);
          return;
        }
        room.delay -= dt;
        if (room.delay <= 0) this.startWave(room, nextWave, spawnWave, onMessage);
        return;
      }

      room.state = 'cleared';
      this.active = null;
      onMessage?.(`${room.label} 已肃清 · 结界解除`);
    }

    activate(room, spawnWave, onMessage) {
      room.state = 'active';
      room.waveIndex = -1;
      room.delay = 0;
      this.active = room;
      onMessage?.(`${room.label} · 结界封锁`);
      this.startWave(room, 0, spawnWave, onMessage);
    }

    startWave(room, waveIndex, spawnWave, onMessage) {
      room.waveIndex = waveIndex;
      room.delay = 0;
      const wave = room.waves[waveIndex];
      spawnWave?.(room, wave, waveIndex);
      const waveName = wave.label || `第 ${waveIndex + 1} 波`;
      onMessage?.(`${room.label} · ${waveName}`);
    }

    cameraX(viewWidth, levelWidth) {
      if (!this.active) return null;
      const room = this.active;
      const center = (room.cameraLeft + room.cameraRight) * 0.5;
      return Math.max(0, Math.min(levelWidth - viewWidth, center - viewWidth * 0.5));
    }

    barriers() {
      if (!this.active) return [];
      return [
        { x: this.active.lockLeft, side: 'left' },
        { x: this.active.lockRight, side: 'right' }
      ];
    }

    hud() {
      if (!this.active) return null;
      return {
        id: this.active.id,
        label: this.active.label,
        wave: this.active.waveIndex + 1,
        totalWaves: this.active.waves.length
      };
    }

    allCleared() {
      return this.rooms.length > 0 && this.rooms.every(r => r.state === 'cleared');
    }

    progress() {
      const cleared = this.rooms.filter(r => r.state === 'cleared').length;
      return { cleared, total: this.rooms.length, active: this.active?.id || null };
    }
  }

  window.YaraV31 = window.YaraV31 || {};
  Object.assign(window.YaraV31, { BattleRoomController });
})();
