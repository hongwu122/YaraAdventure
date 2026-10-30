(() => {
  'use strict';
  const $ = id => document.getElementById(id), Slots = window.YaraV82Slots;
  const escape = value => { const span = document.createElement('span'); span.textContent = String(value || ''); return span.innerHTML; };
  let mode = 'load', chosen = 'Yara', bound = false;
  const show = id => window.YaraV35.showView(id);
  const name = cid => window.V35Characters?.getCharacters().find(c => c.id === cid)?.displayName || cid;
  async function enter(raw) {
    await window.YaraV35.replaceSave(raw);
    document.querySelector('#menuView h1').textContent = Slots.active()?.name || raw.slotName || '山海之旅';
    show('menuView'); refreshHome();
  }
  function refreshHome() {
    const active = Slots.active();
    $('v82LastSlot').textContent = active ? active.name + ' · ' + name(active.character) + ' · Lv.' + (active.save.characters?.[active.character]?.level || 1) : '尚未创建冒险';
    $('v82Continue').disabled = !active;
    $('v82HomeStatus').textContent = Slots.isQA ? '独立预览 · 不写入正式存档' : '';
  }
  async function openSlots(next) {
    mode = next; await window.YaraV35.save(false);
    const characters = await window.V35Characters.load();
    $('v82SlotsTitle').textContent = mode === 'new' ? '开始新的冒险' : '读取存档';
    $('v82Creation').hidden = mode !== 'new';
    $('v82SlotNotice').textContent = mode === 'new' ? '先填写名称和选择角色，再点击一个存档位置；已有存档可确认覆盖。每个存档绑定一个角色。' : '选择想继续的旅程。';
    $('v82ChooseCharacter').innerHTML = characters.map(c => '<button data-new-char="' + c.id + '" class="' + (chosen === c.id ? 'active' : '') + '"><img src="' + c._base + c.render.portrait + '" alt="' + escape(c.displayName) + '"><b>' + escape(c.displayName) + '</b><span>' + escape(c.elementLabel) + '系</span></button>').join('');
    $('v82ChooseCharacter').querySelectorAll('button').forEach(button => button.onclick = () => { chosen = button.dataset.newChar; $('v82ChooseCharacter').querySelectorAll('button').forEach(b => b.classList.toggle('active', b === button)); });
    $('v82SlotsGrid').innerHTML = Slots.get().slots.map((slot, i) => '<article class="v82-slot-card"><button data-slot-index="' + i + '" ' + ((mode === 'load' && !slot) ? 'disabled' : '') + '><small>存档 ' + String(i + 1).padStart(2, '0') + '</small>' + (slot ? '<h3>' + escape(slot.name) + '</h3>'+(mode==='new'?'<p>点击覆盖此存档</p>':'')+'<p>' + escape(name(slot.character)) + ' · Lv.' + (slot.save.characters?.[slot.character]?.level || 1) + '</p><span>主线 ' + (slot.save.unlocked || 1) + '/20 · ' + (slot.updatedAt ? new Date(slot.updatedAt).toLocaleDateString() : '') + '</span>' : '<h3>空存档</h3><p>在这里开启新的冒险</p>') + '</button>' + (slot ? '<button class="v82-delete-slot" data-delete-slot="'+i+'">删除存档</button>' : '') + '</article>').join('');
    $('v82SlotsGrid').querySelectorAll('[data-slot-index]').forEach(button => button.onclick = async () => {
      try { const index = Number(button.dataset.slotIndex); if(mode==='new'&&Slots.get().slots[index]&&!confirm('覆盖「'+Slots.get().slots[index].name+'」？原旅程将被新存档替换。'))return;button.disabled=true;const raw = mode === 'new' ? await Slots.create(index, $('v82SlotName').value, chosen, true) : await Slots.select(index); await enter(raw); }
      catch (error) { button.disabled = false; $('v82SlotNotice').textContent = error.message; }
    });
    $('v82SlotsGrid').querySelectorAll('[data-delete-slot]').forEach(button=>button.onclick=async()=>{const i=Number(button.dataset.deleteSlot),slot=Slots.get().slots[i];if(!confirm('删除「'+slot.name+'」？'))return;try{await Slots.remove(i);refreshHome();await openSlots(mode)}catch(e){$('v82SlotNotice').textContent=e.message}});
    show('slotsView');
  }
  $('v82New').onclick = () => openSlots('new'); $('v82Load').onclick = () => openSlots('load');
  $('v82Continue').onclick = async () => { try { await enter(await Slots.select(Slots.get().active)); } catch (error) { $('v82HomeStatus').textContent = error.message; } };
  $('v82SlotsBack').onclick = () => show('landingView');
  function result(game) {
    const panel = $('v82Result'); if (!game.cleared) { panel.classList.add('hidden'); return; }
    panel.classList.remove('hidden');
    $('v82ResultStats').textContent = game.level.name + ' · 得分 ' + game.score + ' · 用时 ' + Math.floor(game.time) + ' 秒';
    $('v82ResultNext').hidden = !!game.dungeonId || Number(game.level.id) >= 20;
    $('v82ResultNext').onclick = () => window.YaraV4Debug.startLevel(Number(game.level.id) + 1);
    $('v82ResultReplay').onclick = () => game.dungeonId ? window.YaraV4Debug.startDungeon(game.dungeonId) : window.YaraV4Debug.startLevel(Number(game.level.id));
    $('v82ResultMap').onclick = () => { $('levelBtn').click(); panel.classList.add('hidden'); };
    $('v82ResultHome').onclick = () => { show('menuView'); panel.classList.add('hidden'); };
  }
  function bind() {
    if (bound || !window.YaraV4Debug) return; bound = true;
    $('continueBtn').querySelector('.aaa-label').textContent = '诸界舆图'; $('continueBtn').querySelector('.aaa-note').textContent = 'WORLD MAP';
    $('continueBtn').onclick = () => $('levelBtn').click(); $('levelBtn').hidden = true; $('characterBtn').hidden = true;
    $('saveBtn').parentElement.hidden = true;
    $('cultivateBtn').querySelector('.aaa-label').textContent = '我的洞天';
    $('continueBtn').after($('cultivateBtn')); 
    const out = document.createElement('button'); out.className = 'aaa-item'; out.id = 'v82ToLanding'; out.textContent = '切换存档';
    out.onclick = async () => { await window.YaraV35.save(true); show('landingView'); refreshHome(); }; $('continueBtn').parentElement.append(out);
    $('pauseMenuBtn').onclick = () => show('menuView');
    document.querySelectorAll('[data-settings-section]').forEach(button => button.onclick = () => { document.querySelectorAll('.v49-settings-card').forEach((card, i) => card.hidden = i !== Number(button.dataset.settingsSection)); document.querySelectorAll('[data-settings-section]').forEach(b => b.classList.toggle('active', b === button)); });
    document.querySelector('[data-settings-section="0"]').click(); $('settingsBtn').addEventListener('click', () => document.querySelector('[data-settings-section="0"]').click());
    document.querySelectorAll('.v49-settings-note,.v49-settings-status p').forEach(e => e.hidden = true);
    $('v82SaveFromSettings').onclick = async () => {try{await window.YaraV35.save(true);$('v82SaveMessage').textContent='已保存当前旅程。';}catch(e){$('v82SaveMessage').textContent='保存失败：'+e.message;}};
    $('v82ImportFromSettings').onclick=()=>$('importBtn').click();
    $('v82LoadFromSettings').onclick=()=>openSlots('load');
    $('v40SaveMode').textContent = '八格独立存档 · 自动保存当前旅程'; $('v50RestoreBackup').hidden = true;
    const text = $('v40SaveMode').parentElement.querySelector('.v49-muted'); if (text) text.textContent = '每个存档绑定一个角色。切换存档请返回首页，选择「读取存档」。';
    refreshHome();
  }
  setInterval(() => { bind(); const game = window.YaraV4Debug?.getGame(); if (game && !game.cleared) $('v82Result').classList.add('hidden'); }, 200);
  document.addEventListener('keydown', event => { if (event.key !== 'Escape') return; const id = document.querySelector('.view.active')?.id; if (id === 'landingView') { event.stopImmediatePropagation(); return; } if (id === 'slotsView') { event.preventDefault(); event.stopImmediatePropagation(); show('landingView'); } if (id === 'shanhaiView') { event.preventDefault(); event.stopImmediatePropagation(); show('menuView'); } }, true);
  window.YaraV82Shell = { refreshHome, openSlots, enter, result };
})();
