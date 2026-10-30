(() => {
  'use strict';

  class ActionSpriteRuntime {
    constructor(registry) {
      this.registry = registry;
      this.images = new Map();
    }

    image(url) {
      if (!url) return null;
      if (!this.images.has(url)) {
        const im = new Image();
        im.decoding = 'async';
        im.src = url;
        this.images.set(url, im);
      }
      return this.images.get(url);
    }

    preload(entityIds = []) {
      const tasks = [];
      for (const id of entityIds) {
        const table = this.registry.get(id);
        if (!table) continue;
        for (const [name, clip] of Object.entries(table.animations || {})) {
          for (const dir of ['right', 'left']) {
            const urls = this.registry.resolveFrames(id, name, dir) || [this.registry.resolveAsset(id, name, dir)];
            for (const url of urls) {
            if (!url) continue;
            const im = this.image(url);
            if (im.complete) continue;
            tasks.push(new Promise(resolve => {
              im.addEventListener('load', resolve, { once: true });
              im.addEventListener('error', resolve, { once: true });
            }));
            }
          }
        }
      }
      return Promise.all(tasks);
    }

    frame(entityId, animationName, direction, elapsed) {
      const clip = this.registry.clip(entityId, animationName);
      if (!clip) return null;
      const frames = Math.max(1, Number(clip.frames || 1));
      const fps = Math.max(1, Number(clip.fps || 8));
      let index = Math.floor(Math.max(0, elapsed || 0) * fps);
      if (clip.loop) index %= frames;
      else index = Math.min(frames - 1, index);
      const files = this.registry.resolveFrames(entityId, animationName, direction);
      const im = this.image(files ? files[index] : this.registry.resolveAsset(entityId, animationName, direction));
      if (!im || !im.complete || !im.naturalWidth) return null;
      if (files) return { im, clip, index, sx: 0, sy: 0, sw: im.naturalWidth, sh: im.naturalHeight };
      const fw = im.naturalWidth / frames;
      return { im, clip, index, sx: index * fw, sy: 0, sw: fw, sh: im.naturalHeight };
    }

    draw(ctx, entityId, animationName, direction, elapsed, x, y, w, h, opts = {}) {
      if(opts.equipment&&window.YaraV85Motion?.draw(ctx,null,entityId,animationName,direction,elapsed,x,y,w,h,opts.save))return true;
      const fr = this.frame(entityId, animationName, direction, elapsed);
      if (!fr) return false;
      const scale = opts.scale || 1;
      const dw = w * scale, dh = h * scale;
      const rawAnchor = fr.clip.anchor || this.registry.get(entityId)?.anchor || null;
      const anchor=Array.isArray(rawAnchor)?rawAnchor:rawAnchor?[rawAnchor.x??.5,rawAnchor.y??1]:null;
      if (anchor && Array.isArray(anchor) && anchor.length >= 2) {
        const ax = Number(anchor[0] ?? .5), ay = Number(anchor[1] ?? 1);
        const footX = x + w * .5, footY = y + h;
        const dx = footX - dw * ax, dy = footY - dh * ay;
        if(opts.equipment && window.YaraV83Skins) window.YaraV83Skins.drawActor(ctx,fr,entityId,animationName,direction,elapsed,dx,dy,dw,dh,opts.save); else ctx.drawImage(fr.im, fr.sx, fr.sy, fr.sw, fr.sh, dx, dy, dw, dh);
      } else {
        if(opts.equipment && window.YaraV83Skins) window.YaraV83Skins.drawActor(ctx,fr,entityId,animationName,direction,elapsed,x - (dw-w)/2,y-(dh-h),dw,dh,opts.save); else ctx.drawImage(fr.im, fr.sx, fr.sy, fr.sw, fr.sh, x - (dw - w) / 2, y - (dh - h), dw, dh);
      }
      if(opts.equipment && window.YaraV80){const a=anchor||[.5,1];window.YaraV80.drawWearables(ctx,entityId,animationName,direction,elapsed,x+w*.5-dw*a[0],y+h-dh*a[1],dw,dh,opts.save);}
      return true;
    }

    releaseEntity(entityId) {
      const table = this.registry.get(entityId);
      if (!table) return;
      for (const name of Object.keys(table.animations || {})) {
        for (const dir of ['right','left']) {
          const urls = this.registry.resolveFrames(entityId,name,dir) || [this.registry.resolveAsset(entityId,name,dir)];
          for (const url of urls) {
          if (!url) continue;
          const im = this.images.get(url);
          if (im) { try { im.src = ''; } catch {} this.images.delete(url); }
          }
        }
      }
    }

    stats() { return { cachedImages: this.images.size }; }
  }

  window.YaraV33 = window.YaraV33 || {};
  window.YaraV33.ActionSpriteRuntime = ActionSpriteRuntime;
})();

