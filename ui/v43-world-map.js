(() => {
  'use strict';


  const regionBadgeMap={domain1:'taoyuan',domain2:'bamboo_temple',domain3:'red_fire',domain4:'frost_sea',domain5:'qingqiu',domain6:'kunlun',domain7:'star_sky',beyond:'outer_realms'};
  const bossBadgeAsset='assets/production/ui_art/boss_badges/phase_boss.svg';

  const state = {
    data: null,
    scale: 1,
    x: 0,
    y: 0,
    drag: false,
    lastX: 0,
    lastY: 0,
    save: null,
    hooks: null
  };

  const $ = (id) => document.getElementById(id);
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  async function load() {
    if (state.data) return state.data;
    try {
      const res = await fetch('data/ui/world_map.json', { cache: 'no-store' });
      if (!res.ok) throw new Error('world_map.json ' + res.status);
      state.data = await res.json();
    } catch (err) {
      console.warn('[V4.6] Fallback to legacy world map json', err);
      const res = await fetch('data/ui/v43_world_map.json', { cache: 'no-store' });
      state.data = await res.json();
    }
    return state.data;
  }

  function viewport() { return $('v46WorldViewport'); }
  function stage() { return $('v46WorldStage'); }
  function config() { return state.data?.scale || { min: 0.75, max: 1.8, overview: 0.78 }; }
  function currentPlayableId() { return Math.min(state.save?.unlocked || 1, 20); }

  function nodeState(node, save = state.save || {}) {
    const stars = save.stars?.[node.id] || 0;
    const playableLimit = Math.min(save.unlocked || 1, 20);
    const unlocked = node.playable && node.id <= playableLimit;
    const cleared = stars > 0;
    const current = unlocked && !cleared && node.id === playableLimit;
    return { stars, unlocked, cleared, current, planned: !!node.plannedOnly };
  }

  function regionState(region, save = state.save || {}) {
    const ids = region.levels || [];
    const playable = ids.filter((id) => id <= 20);
    const limit = Math.min(save.unlocked || 1, 20);
    const discovered = playable.some((id) => id <= limit);
    const cleared = playable.length && playable.every((id) => (save.stars?.[id] || 0) > 0);
    return region.planned ? 'planned' : (cleared ? 'cleared' : (discovered ? 'discovered' : 'locked'));
  }

  function siteState(site) {
    if (site.planned) return 'planned';
    const hooks = state.hooks || {};
    return hooks.dungeonState?.(site.id) || 'hidden';
  }

  function clampPan() {
    const vp = viewport();
    const st = stage();
    if (!vp || !st) return;
    const sw = state.data.canvas.width * state.scale;
    const sh = state.data.canvas.height * state.scale;
    if (sw <= vp.clientWidth) {
      state.x = Math.round((vp.clientWidth - sw) / 2);
    } else {
      const minX = vp.clientWidth - sw;
      state.x = clamp(state.x, minX, 0);
    }
    if (sh <= vp.clientHeight) {
      state.y = Math.round((vp.clientHeight - sh) / 2);
    } else {
      const minY = vp.clientHeight - sh;
      state.y = clamp(state.y, minY, 0);
    }
  }

  function applyTransform(animated = false) {
    const st = stage();
    if (!st) return;
    clampPan();
    st.classList.toggle('moving', !!animated);st.classList.toggle('v80-overview',state.scale<.6);st.style.setProperty('--v80-node-scale',String(Math.min(2.6,Math.max(1,1/state.scale))));
    st.style.transform = `translate3d(${state.x}px, ${state.y}px, 0) scale(${state.scale})`;
    const zoom = $('v46MapZoom');
    if (zoom) zoom.textContent = Math.round(state.scale * 100) + '%';
  }

  function setScaleAround(nextScale, clientX, clientY, animated = false) {
    const vp = viewport();
    if (!vp) return;
    const conf = config();
    const scale = clamp(nextScale, conf.min ?? 0.75, conf.max ?? 1.8);
    const rect = vp.getBoundingClientRect();
    const mx = clientX ?? rect.left + rect.width / 2;
    const my = clientY ?? rect.top + rect.height / 2;
    const localX = mx - rect.left;
    const localY = my - rect.top;
    const old = state.scale || scale;
    state.x = localX - (localX - state.x) * (scale / old);
    state.y = localY - (localY - state.y) * (scale / old);
    state.scale = scale;
    applyTransform(animated);
  }

  function findNode(id) { return state.data?.nodes?.find((n) => Number(n.id) === Number(id)); }
  function pointFromPercent(x, y) {
    const d = state.data;
    return { px: d.canvas.width * x / 100, py: d.canvas.height * y / 100 };
  }

  function focusOnPoint(xPercent, yPercent, targetScale = state.scale, animated = true) {
    const vp = viewport();
    if (!vp) return;
    state.scale = clamp(targetScale, config().min ?? 0.75, config().max ?? 1.8);
    const { px, py } = pointFromPercent(xPercent, yPercent);
    state.x = vp.clientWidth / 2 - px * state.scale;
    state.y = vp.clientHeight / 2 - py * state.scale;
    applyTransform(animated);
  }

  function focusOnNode(id, animated = true) {
    const node = findNode(id);
    if (!node) return;
    const focusScale = node.id >= 17 ? 1.02 : (node.id >= 10 ? 1.08 : 1.14);
    focusOnPoint(node.x, node.y, Math.max(config().min ?? 0.75, focusScale), animated);
    highlightSelection(id);
  }

  function focusCurrent(animated = true) { focusOnNode(currentPlayableId(), animated); }
  function focusOverview(animated = true) {
    const conf = config();
    const vp = viewport();
    if (!vp) return;
    const fit = Math.min(vp.clientWidth / state.data.canvas.width, vp.clientHeight / state.data.canvas.height);
    const base = clamp(fit * .96, conf.min ?? 0.18, conf.max ?? 1.8);
    state.scale = base;
    state.x = (vp.clientWidth - state.data.canvas.width * state.scale) / 2;
    state.y = (vp.clientHeight - state.data.canvas.height * state.scale) / 2;
    applyTransform(animated);
    highlightSelection(null);
  }

  function highlightSelection(levelId) {
    const host = $('levelGrid');
    if (!host) return;
    host.querySelectorAll('.world-node').forEach((el) => {
      el.classList.toggle('selected', Number(el.dataset.level) === Number(levelId));
    });
  }

  function nodeMarkup(n) {
    const s = nodeState(n);const landmarkIndex=({domain1:0,domain2:1,domain3:2,domain4:3,domain5:4,domain6:5,domain7:5,beyond:5})[n.region]??0;
    const classes = ['world-node'];
    if (s.unlocked) classes.push('unlocked'); else classes.push('locked');
    if (s.cleared) classes.push('cleared');
    if (s.current) classes.push('current');
    if (s.planned) classes.push('planned');
    if (n.bossTier) classes.push('boss-node', `boss-${n.bossTier}`);
    const bossBadge = n.bossTier ? `<span class="world-boss-badge"><img src="${bossBadgeAsset}" alt="Boss"><em>BOSS</em></span>` : '';
    const landmark = n.landmark ? `<span class="world-node-landmark">${n.landmark}</span>` : '';
    const statusText = s.planned ? '后续章节规划' : (s.cleared ? '已通关' : (s.current ? '当前可挑战' : (s.unlocked ? `Lv.${n.recommendedLevel} · 战力 ${n.recommendedPower}` : '未解锁')));
    return `<button class="${classes.join(' ')}" data-level="${n.id}" style="left:${n.x}%;top:${n.y}%" ${s.unlocked ? '' : 'aria-disabled="true"'}>
      ${n.id<=20?`<span class="v87-landmark-art" style="--landmark-x:${((n.id-1)%5)*25}%;--landmark-y:${Math.floor((n.id-1)/5)*100/3}%"></span>`:''}<span class="world-node-orb"><i>${s.cleared ? '✓' : n.id}</i>${bossBadge}</span>
      <span class="world-node-copy"><small>${n.region === 'beyond' ? 'FUTURE ARC' : 'MAIN STAGE'} · ${String(n.id).padStart(2,'0')}</small><b>${n.name}</b><em>${statusText}</em>${landmark}</span>
    </button>`;
  }

  function siteIcon(type) {
    return ({ cave: '◈', ruin: '⟠', rift: '✶', altar: '⟁', tower: '⌂' })[type] || '◇';
  }

  function siteMarkup(site) {
    const s = siteState(site);
    if (s === 'hidden') return '';
    const playable = s !== 'planned';
    const cls = ['world-site', `site-${s}`];
    if (playable) cls.push('is-active');
    return `<button class="${cls.join(' ')}" data-site="${site.id}" style="left:${site.x}%;top:${site.y}%" ${playable ? '' : 'aria-disabled="true"'}>
      <span class="world-site-icon" style="background-image:url('${({herb_valley:'assets/backgrounds/level9_divine_tree.webp',iron_tomb:'assets/v82/backgrounds/level15.webp',boss_realm:'assets/backgrounds/level4_lava_cavern.webp',five_trial:'assets/v87/backgrounds/five-trial.png',sky_tower:'assets/v82/backgrounds/level17.webp'})[site.dungeonId||site.id]||'assets/v87/backgrounds/five-trial.png'}')"></span>
      <span class="world-site-copy"><small>${site.type}</small><b>${site.name}</b><em>${s === 'cleared' ? '已通关，可再次进入' : (s === 'discovered' ? '已发现，可进入' : '后续规划地点')}</em></span>
    </button>`;
  }

  function regionMarkup(r) {
    const s = regionState(r);
    return `<section class="world-region ${s} ${r.planned ? 'planned' : ''}" data-region="${r.id}" style="left:${r.x}%;top:${r.y}%;width:${r.w}%;height:${r.h}%">
      <img class="v69-region-badge" src="assets/production/ui_art/map_region_badges/${regionBadgeMap[r.id]||'outer_realms'}.svg" alt="${r.label}">
      <div class="world-region-title"><small>${r.chapter}</small><strong>${r.label}</strong><span>${r.subtitle}</span></div>
      <div class="world-region-state">${s === 'cleared' ? '已通关' : s === 'discovered' ? '已发现' : s === 'locked' ? '云雾未散' : '后续篇章'}</div>
      <div class="world-region-fog"></div>
    </section>`;
  }

  function routePoint(pt) {
    const d = state.data;
    if (typeof pt === 'number') {
      const n = findNode(pt);
      if (!n) return null;
      return [d.canvas.width * n.x / 100, d.canvas.height * n.y / 100];
    }
    if (Array.isArray(pt) && pt.length >= 2) return pt;
    if (pt && typeof pt.x === 'number' && typeof pt.y === 'number') return [d.canvas.width * pt.x / 100, d.canvas.height * pt.y / 100];
    return null;
  }

  function bindMap() {
    const shell = $('levelGrid');
    const vp = viewport();
    if (!shell || !vp || shell.dataset.v46Bound) return;
    shell.dataset.v46Bound = '1';

    vp.addEventListener('pointerdown', (e) => {
      if (e.target.closest('button')) return;
      state.drag = true;
      state.lastX = e.clientX;
      state.lastY = e.clientY;
      shell.classList.add('dragging');
      try { vp.setPointerCapture(e.pointerId); } catch {}
    });
    vp.addEventListener('pointermove', (e) => {
      if (!state.drag) return;
      state.x += e.clientX - state.lastX;
      state.y += e.clientY - state.lastY;
      state.lastX = e.clientX;
      state.lastY = e.clientY;
      applyTransform();
    });
    const endDrag = () => { state.drag = false; shell.classList.remove('dragging'); };
    vp.addEventListener('pointerup', endDrag);
    vp.addEventListener('pointercancel', endDrag);
    vp.addEventListener('wheel', (e) => {
      e.preventDefault();
      const factor = e.deltaY > 0 ? 0.92 : 1.08;
      setScaleAround(state.scale * factor, e.clientX, e.clientY);
    }, { passive: false });
    vp.addEventListener('dblclick', (e) => {
      const rect = vp.getBoundingClientRect();
      const mapX = (e.clientX - rect.left - state.x) / state.scale;
      const mapY = (e.clientY - rect.top - state.y) / state.scale;
      let best = null;
      for (const n of state.data.nodes) {
        const px = state.data.canvas.width * n.x / 100;
        const py = state.data.canvas.height * n.y / 100;
        const dist = Math.hypot(px - mapX, py - mapY);
        if (!best || dist < best.dist) best = { n, dist };
      }
      if (best) focusOnNode(best.n.id, true);
    });

    $('v46MapZoomIn')?.addEventListener('click', () => setScaleAround(state.scale * 1.12));
    $('v46MapZoomOut')?.addEventListener('click', () => setScaleAround(state.scale / 1.12));
    $('v46MapCurrent')?.addEventListener('click', () => focusCurrent(true));
    $('v46MapOverview')?.addEventListener('click', () => focusOverview(true));

    let resizeTimer = null;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        if (document.getElementById('levelView')?.classList.contains('active')) {
          focusCurrent(false);
        }
      }, 60);
    });
  }

  async function render(hooks) {
    state.hooks = hooks || {};
    state.save = hooks.save || {};
    const data = await load();
    const shell = $('levelGrid');
    if (!shell) return;

    const sitesHtml = (data.sideSites || []).map(siteMarkup).join('');
    shell.innerHTML = `
      <div class="worldmap-hud v46-hud">
        <div class="worldmap-hud-copy"><small>THE REALM ATLAS</small><b>拖动地图 · 滚轮缩放 · 双击定位</b></div>
        <div class="worldmap-tools">
          <button id="v46MapZoomOut" title="缩小">−</button>
          <span id="v46MapZoom">100%</span>
          <button id="v46MapZoomIn" title="放大">＋</button>
          <button id="v46MapCurrent">回到当前关卡</button>
          <button id="v46MapOverview">总览地图</button>
        </div>
      </div>
      <div id="v46WorldViewport" class="worldmap-viewport v46-worldmap-viewport" style="--v86-map:url('${data.canvas.background}')">
        <div id="v46WorldStage" class="worldmap-stage v46-worldmap-stage" style="width:${data.canvas.width}px;height:${data.canvas.height}px;background-image:url('${data.canvas.background}')">
          <svg class="worldmap-routes v46-worldmap-routes" viewBox="0 0 ${data.canvas.width} ${data.canvas.height}" aria-hidden="true"></svg>
          ${(data.regions || []).map(regionMarkup).join('')}
          ${(data.nodes || []).map(nodeMarkup).join('')}
          ${sitesHtml}
        </div>
      </div>`;

    const svg = shell.querySelector('.worldmap-routes');
    const ns = 'http://www.w3.org/2000/svg';
    for (const route of data.routes || []) {
      const pts = (route.points || []).map(routePoint).filter(Boolean);
      if (pts.length < 2) continue;
      const glow = document.createElementNS(ns, 'polyline');
      glow.setAttribute('points', pts.map((p) => p.join(',')).join(' '));
      glow.setAttribute('class', `route-glow route-${route.type || 'road'}`);
      svg.appendChild(glow);
      const line = document.createElementNS(ns, 'polyline');
      line.setAttribute('points', pts.map((p) => p.join(',')).join(' '));
      line.setAttribute('class', `route-line route-${route.type || 'road'}`);
      svg.appendChild(line);
    }

    shell.querySelectorAll('.world-node').forEach((btn) => {
      const id = Number(btn.dataset.level);
      const meta = findNode(id);
      const ns = nodeState(meta, state.save);
      btn.addEventListener('click', () => {
        focusOnNode(id, true);
        if (ns.unlocked) hooks.startLevel?.(id);
      });
    });

    shell.querySelectorAll('.world-site.is-active').forEach((btn) => {
      const id = btn.dataset.site;
      btn.addEventListener('click', () => hooks.startDungeon?.(id));
    });

    bindMap();
    requestAnimationFrame(() => {
      const initial = currentPlayableId();
      focusOverview(false);
    });
  }

  function dispose(){
    const shell=$('levelGrid');if(shell){shell.innerHTML='';shell.dataset.v46Bound='';}
    const scroller=document.getElementById('levelView');if(scroller)scroller.classList.remove('dragging-map');
    state.drag=false;state.x=0;state.y=0;state.scale=1;
  }
  window.V43WorldMap = { load, render, focusCurrent, focusOverview, focusOnNode, dispose };
})();
