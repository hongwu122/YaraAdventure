(() => {
  'use strict';
  let data = null, category = 'overviews', selected = null, pose = 'idle', direction = 'right', elapsed = 0, last = performance.now(), page = 0, search = '';
  const images = new Map(), $ = id => document.getElementById(id);
  const escape = value => { const span = document.createElement('span'); span.textContent = String(value || ''); return span.innerHTML; };
  function image(url) { if (!images.has(url)) { const im = new Image(); im.src = url; images.set(url, im); } return images.get(url); }
  const categories = [['overviews','资源总览'],['characters','五行角色'],['monsters','怪物'],['bosses','Boss'],['equipment','装备'],['items','丹药与材料'],['skills','技能与特效'],['backgrounds','关卡与地面'],['facilities','洞天设施'],['sanctumArt','洞天新增美术'],['wornCostumes','角色穿戴'],['motionPacks','穿戴动作包'],['weaponPacks','武器与技能包'],['audio','音乐音效'],['sources','原始素材']];
  async function open(next = 'overviews') {
    window.YaraV35.showView('shanhaiView');
    if (!data) { const response = await fetch('data/v82_catalog.json', {cache:'no-store'}); if (!response.ok) throw Error('资源目录载入失败'); data = await response.json(); }
    category = next; page = 0; selected = null; search = ''; render();
  }
  function entries() { return (data[category] || []).filter(e => !search || (e.name + e.id + (e.tags || []).join(' ')).toLowerCase().includes(search.toLowerCase())); }
  function render() {
    const view = $('shanhaiView');
    view.innerHTML = '<header class="v82-page-header"><button id="v82ArchiveBack">← 返回</button><h2>山海录</h2><p>已制作资源 · 动作与原图可直接查看</p><span>' + data.totalFiles + ' 个素材文件</span></header><main class="v82-catalog"><aside class="v82-catalog-nav">' + categories.map(([id,label]) => '<button data-catalog-cat="' + id + '" class="' + (category === id ? 'active' : '') + '">' + label + '<b>' + (data[id]?.length || 0) + '</b></button>').join('') + '</aside><section class="v82-catalog-list"><label>查找资源<input id="v82CatalogSearch" placeholder="名称或编号" value="' + escape(search) + '"></label><div id="v82CatalogEntries"></div><nav class="v82-catalog-pages"><button id="v82CatalogPrev">上一页</button><span id="v82CatalogPage"></span><button id="v82CatalogNext">下一页</button></nav></section><section id="v82CatalogStage"></section><aside id="v82CatalogDetail"></aside></main>';
    $('v82ArchiveBack').onclick = () => window.YaraV35.showView('menuView');
    view.querySelectorAll('[data-catalog-cat]').forEach(b => b.onclick = () => { category = b.dataset.catalogCat; selected = null; page = 0; search = ''; render(); });
    $('v82CatalogSearch').oninput = event => { search = event.target.value; page = 0; selected = null; renderList(); };
    $('v82CatalogPrev').onclick = () => { page = Math.max(0, page - 1); renderList(); };
    $('v82CatalogNext').onclick = () => { page = Math.min(Math.ceil(entries().length / 24) - 1, page + 1); renderList(); };
    renderList();
  }
  function renderList() {
    const list = entries(), batch = list;
    $('v82CatalogEntries').innerHTML = batch.map(e => '<button style="--rar:' + (e.color || 'transparent') + '" data-catalog-id="' + escape(e.id) + '" class="' + (selected?.id === e.id ? 'active' : '') + '">' + (e.image ? '<img loading="lazy" src="' + e.image + '" alt="' + escape(e.name) + '">' : '<span class="v82-resource-kind">' + (e.audio ? '♪' : '文') + '</span>') + '<span><b>' + escape(e.name) + '</b><small>' + escape(e.label || e.id) + '</small></span></button>').join('') || '<p>没有匹配的资源。</p>';
    $('v82CatalogPage').textContent = (list.length ? page + 1 : 0) + ' / ' + Math.ceil(list.length / 24);
    $('v82CatalogPrev').disabled = page <= 0; $('v82CatalogNext').disabled = (page + 1) * 24 >= list.length;
    $('v82CatalogEntries').querySelectorAll('button').forEach(b => b.onclick = () => select(list.find(e => e.id === b.dataset.catalogId)));
    const intro={equipment:'gear-overview',monsters:'monsters-overview',bosses:'bosses-overview',backgrounds:'level-overview'}[category];if(!selected)select(data.overviews?.find(x=>x.id===intro)||batch[0]);else if(!list.some(e=>e.id===selected.id)&&!selected.html)select(batch[0]);
  }
  async function select(entry) {
    $('v82CatalogStage').dataset.category = category;
    document.querySelector('.v82-catalog')?.classList.toggle('v85-overview-layout',!!entry?.html);
    selected = entry; pose = entry?.pose || 'idle'; direction = 'right'; elapsed = 0;
    if (!entry) { $('v82CatalogStage').innerHTML = '<p>请选择一个资源。</p>'; $('v82CatalogDetail').innerHTML = ''; return; }
    document.querySelectorAll('[data-catalog-id]').forEach(b => b.classList.toggle('active', b.dataset.catalogId === entry.id));
    if (entry.animations && !entry.table) { const response = await fetch(entry.animations); entry.table = await response.json(); entry.base = entry.animations.slice(0, entry.animations.lastIndexOf('/') + 1); }
    if (selected !== entry) return;
    if(entry.html){$('v82CatalogStage').innerHTML='<div class="v84-overview">'+entry.html+'</div>';$('v82CatalogDetail').innerHTML='<h3>'+escape(entry.name)+'</h3><p>'+escape(entry.description)+'</p>';return;}
    const actions = Object.keys(entry.table?.animations || {});
    if (actions.length && !actions.includes(pose)) pose = actions[0];
    $('v82CatalogStage').innerHTML = '<div class="v82-resource-stage ' + (entry.background ? 'is-landscape' : '') + '">' + (actions.length ? '<canvas id="v82ResourceCanvas" width="800" height="800"></canvas>' : entry.audio ? '<div class="v82-audio-art">♪</div><audio controls loop src="' + entry.audio + '"></audio>' : '<img id="v82ResourceImage" src="' + entry.image + '" alt="' + escape(entry.name) + '">') + '</div>' + (actions.length ? '<div class="v82-action-controls"><label>动作<select id="v82CatalogAction">' + actions.map(a => '<option value="' + a + '">' + escape(entry.actionLabels?.[a] || data.actionLabels?.[a] || a) + '</option>').join('') + '</select></label><button id="v82FaceRight">右向</button><button id="v82FaceLeft">左向</button><button id="v82PlayPause">暂停动画</button><input id="v82Frame" type="range" min="0" max="0" value="0"><span id="v82FrameText"></span></div>' : '') + (entry.ground ? '<div class="v82-ground-preview"><small>对应可行走地面</small><img src="' + entry.ground + '"></div>' : '');
    $('v82CatalogDetail').innerHTML = '<small>RESOURCE LIBRARY</small><h3>' + escape(entry.name) + '</h3><div class="v82-resource-tags">' + (entry.tags || []).map(t => '<span>' + escape(t) + '</span>').join('') + '</div><p>' + escape(entry.description || '已制作的游戏资源。') + '</p>' + (actions.length ? '<p>' + actions.length + ' 个动作状态 · ' + actions.reduce((sum,a) => sum + (entry.table.animations[a].frames || 1), 0) + ' 帧定义</p>' : '') + '<a href="' + (entry.animations || entry.audio || entry.image) + '" target="_blank">打开资源文件 ↗</a>' + (entry.folder ? '<p class="v82-resource-path">' + escape(entry.folder) + '</p>' : '') + '<p class="v82-resource-note">' + escape(entry.note || '') + '</p>';
    if(entry.fx){const effect=document.createElement('div');effect.className='v85-weapon-effect-preview';effect.innerHTML='<p>对应武器技能特效</p><img src="'+entry.fx+'" alt="'+escape(entry.name)+'技能特效">';$('v82CatalogStage').append(effect);}
    if(entry.roster){const roster=document.createElement('div');roster.className='v84-level-roster';roster.innerHTML=entry.roster.map(x=>'<span><img src="'+x.image+'" alt="">'+escape(x.name)+(x.boss?' · Boss':'')+'</span>').join('');const ground=$('v82CatalogStage').querySelector('.v82-ground-preview');if(ground)ground.prepend(roster);else $('v82CatalogStage').append(roster);}
    playing = true;
    if (actions.length) {
      $('v82CatalogAction').value = pose; $('v82CatalogAction').onchange = e => { pose = e.target.value; elapsed = 0; playing = true; updateControls(); };
      $('v82FaceRight').onclick = () => direction = 'right'; $('v82FaceLeft').onclick = () => direction = 'left';
      $('v82PlayPause').onclick = () => { playing = !playing; $('v82PlayPause').textContent = playing ? '暂停动画' : '播放动画'; };
      $('v82Frame').oninput = e => { playing = false; elapsed = Number(e.target.value) / (entry.table.animations[pose].fps || 8); $('v82PlayPause').textContent = '播放动画'; };
      updateControls();
    }
  }
  let playing = true;
  function updateControls() { const clip = selected?.table?.animations?.[pose]; if (!clip) return; $('v82Frame').max = Math.max(0, clip.frames - 1); }
  function draw(time) {
    const dt = Math.min(.05, (time - last) / 1000); last = time;
    if ($('shanhaiView').classList.contains('active') && selected?.table && $('v82ResourceCanvas')) {
      if (playing) elapsed += dt;
      const clip = selected.table.animations[pose];
      if (clip) {
        const count = Math.max(1, clip.frames || 1), fps = clip.fps || 8, index = Math.floor(elapsed * fps) % count;
        const frames = clip.frameImages?.[direction] || clip.frameImages?.right;
        const url = selected.base + (frames ? frames[index] : clip.directions?.[direction] || clip.directions?.right);
        const im = image(url), canvas = $('v82ResourceCanvas'), ctx = canvas.getContext('2d'); ctx.clearRect(0,0,800,800);
        if (im.complete && im.naturalWidth) { const fw = frames ? im.naturalWidth : im.naturalWidth / count; const rect=clip.frameRects?.[index];if(rect){ctx.save();if(selected.mirrorLeft&&direction==='left'){ctx.translate(800,0);ctx.scale(-1,1);}const scale=Math.min(700/rect[2],700/rect[3]);ctx.drawImage(im,...rect,400-rect[2]*scale/2,400-rect[3]*scale/2,rect[2]*scale,rect[3]*scale);ctx.restore();}else ctx.drawImage(im, frames ? 0 : index * fw, 0, fw, im.naturalHeight, 50, 50, 700, 700); }
        $('v82Frame').value = index; $('v82FrameText').textContent = '第 ' + (index + 1) + ' / ' + count + ' 帧';
      }
    }
    requestAnimationFrame(draw);
  }
  $('shanhaiBtn').addEventListener('click', event => { event.stopImmediatePropagation(); open().catch(error => { $('shanhaiView').textContent = error.message; }); }, true);
  $('characterBtn').addEventListener('click', event => { event.stopImmediatePropagation(); open('characters'); }, true);
  window.YaraV82Catalog = { open, refresh: async () => { data = null; await open(category); } }; requestAnimationFrame(draw);
})();
