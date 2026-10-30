(() => {
  'use strict';

  class AnimationRegistry {
    constructor() {
      this.tables = new Map();
    }

    async load(id, url) {
      const res = await fetch(url, { cache: 'no-store' });
      if (!res.ok) throw new Error(`animation metadata load failed: ${url}`);
      const data = await res.json();
      data.__url = url;
      data.__base = url.includes('/') ? url.slice(0, url.lastIndexOf('/') + 1) : '';
      this.tables.set(id, data);
      return data;
    }

    get(id) {
      return this.tables.get(id) || null;
    }

    clip(id, name) {
      const table = this.get(id);
      const aliases = table?.stateAliases || {};
      const resolved = table?.animations?.[name] ? name : aliases[name];
      return table?.animations?.[resolved] || null;
    }

    resolvedName(id, name) {
      const table = this.get(id);
      if (!table) return name;
      if (table.animations?.[name]) return name;
      return table.stateAliases?.[name] || name;
    }

    timing(id, name) {
      return this.clip(id, name)?.timing || null;
    }

    resolveFrames(id, name, direction = 'right') {
      const table = this.get(id), clip = this.clip(id, name);
      const files = clip?.frameImages?.[direction] || clip?.frameImages?.right;
      return files ? files.map(rel => table.__base + rel) : null;
    }

    resolveAsset(id, name, direction = 'right') {
      const table = this.get(id);
      if (!table) return null;
      const resolved = this.resolvedName(id, name);
      const clip = table.animations?.[resolved];
      if (!clip) return null;
      const rel = clip.directions?.[direction] || clip.directions?.right || null;
      return rel ? table.__base + rel : null;
    }
  }

  const animations = new AnimationRegistry();

  window.YaraV31 = window.YaraV31 || {};
  Object.assign(window.YaraV31, { AnimationRegistry, animations });
})();
