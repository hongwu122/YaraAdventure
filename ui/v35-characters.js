(() => {
  'use strict';
  const state = { registry:null, characters:[], activeId:'Yara', angle:2, dragging:false, startX:0, dragX:0 };
  const $ = id => document.getElementById(id);

  async function load(){
    if(state.registry) return state.characters;
    const registry = await fetch('assets/characters/index.json',{cache:'no-store'}).then(r=>r.json());
    const chars = [];
    for(const item of registry.characters.slice().sort((a,b)=>(a.order||0)-(b.order||0))){
      const base=`assets/characters/${item.folder}/`;
      const data=await fetch(base+(item.data||'character.json'),{cache:'no-store'}).then(r=>r.json());
      data._base=base; data._registry=item; chars.push(data);
    }
    state.registry=registry; state.characters=chars;
    window.YaraV35?.ensureCharacterProfiles?.(chars);
    const save=window.YaraV35?.getSave?.();
    state.activeId=save?.selectedCharacter || 'Yara';
    return chars;
  }

  function statRows(c,eq={}){
    const s=c.baseStats||{};
    return [
      ['生命',s.hp||0,eq.hp||0,620],['灵力',s.mp||0,eq.mp||0,320],['攻击',s.attack||0,eq.attack||0,70],['防御',s.defense||0,eq.defense||0,45],['身法',s.speed||0,eq.speed||0,430]
    ].map(([k,base,bonus,max])=>{const total=base+bonus;return `<div class="v35-stat"><span>${k}</span><b>${total}${bonus?` <em>+${bonus}</em>`:''}</b><i style="--p:${Math.min(100,Math.round(total/max*100))}%"></i></div>`}).join('');
  }

  function renderRoster(){
    const host=$('rosterList'); if(!host) return;
    host.innerHTML=state.characters.map(c=>`
      <button class="roster-item-v35${c.id===state.activeId?' active':''}" data-char="${c.id}">
        <img src="${c._base}${c.render?.portrait||'portrait.webp'}" alt="${c.displayName}">
        <span><strong>${c.displayName}</strong><small>${c.role}</small></span>
        <em>${c.playable?'可玩':'展示'}</em>
      </button>`).join('');
    host.querySelectorAll('[data-char]').forEach(btn=>btn.onclick=()=>select(btn.dataset.char));
  }

  function renderDetail(){
    const c=state.characters.find(x=>x.id===state.activeId) || state.characters[0]; if(!c) return;
    const save=window.YaraV35?.getSave?.(); const profile=save?.characters?.[c.id] || c.growthDefaults || {};
    $('charName').textContent=c.displayName;
    $('charNo').textContent=`NO. ${c.number||'---'}`;
    $('charTitle').textContent=c.title||'';
    $('charRole').textContent=c.role||'';
    $('charElement').textContent=`五行 · ${c.elementLabel||'-'}`;
    $('charDesc').textContent=c.description||'';
    $('charPlayStatus').textContent=c.playable?'可进入主线与副本':'动作展示 · 暂未开放战斗';
    $('charLevel').textContent=`Lv.${profile.level||1}`;
    $('charExp').textContent=`${profile.exp||0} / ${profile.nextExp||100}`;
    $('charPoints').textContent=profile.skillPoints||0;
    const eq=window.YaraV36Economy?.equipmentBonus?.(save,c.id)||{};
    $('charStats').innerHTML=statRows(c,eq);
    $('charBasic').innerHTML=`<b>${c.basicAttack?.pattern||'J-J-J'}</b><span>${c.basicAttack?.summary||''}</span>`;
    $('charSkills').innerHTML=(c.skills||[]).map(s=>`<span><kbd>${s.key}</kbd><b>${s.name}</b><small>${s.role}</small></span>`).join('');
    state.angle=2; renderAngle(); renderRoster(); window.V36EconomyUI?.renderCharacterSummary?.(); window.V44CharacterViewer?.mount?.(c);
  }

  function renderAngle(){
    const c=state.characters.find(x=>x.id===state.activeId); const img=$('characterStageImage'); if(!c||!img) return;
    const arr=c.render?.previewAngles||[c.render?.portrait||'portrait.webp'];
    state.angle=Math.max(0,Math.min(arr.length-1,state.angle));
    img.src=c._base+arr[Math.min(state.angle,arr.length-1)];
    const deg=(state.angle-(arr.length-1)/2)*7;
    img.style.transform=`perspective(1100px) rotateY(${deg}deg) translateX(${state.dragX*.05}px)`;
    $('angleLabel').textContent=['左侧','左前','正面','右前','右侧'][state.angle] || `角度 ${state.angle+1}`;
    const model=c.render?.model;
    $('modelStatus').textContent='2D 动作与穿戴预览';
  }

  function select(id){
    const c=state.characters.find(x=>x.id===id); if(!c) return;
    state.activeId=id; state.angle=2; state.dragX=0;
    const save=window.YaraV35?.getSave?.();
    // Half-complete characters remain browseable without silently replacing the active combat character.
    if(save && c.playable && !save.slotCharacter){ save.selectedCharacter=id; save.selected=id; save.profile=save.characters?.[id]||save.profile; window.YaraV35?.markDirty?.(); window.YaraV35?.save?.(false); }
    renderDetail();
  }

  function bindStage(){
    const stage=$('characterTurntable'); if(!stage || stage.dataset.bound) return; stage.dataset.bound='1';
    const end=()=>{state.dragging=false;stage.classList.remove('dragging');state.dragX=0;renderAngle();};
    stage.addEventListener('pointerdown',e=>{if(state.activeId==='Yara')return;state.dragging=true;state.startX=e.clientX;state.dragX=0;stage.setPointerCapture(e.pointerId);stage.classList.add('dragging');});
    stage.addEventListener('pointermove',e=>{
      if(state.activeId==='Yara'||!state.dragging) return; state.dragX=e.clientX-state.startX;
      const step=58;
      if(Math.abs(state.dragX)>=step){ state.angle += state.dragX>0?-1:1; state.angle=Math.max(0,Math.min(4,state.angle)); state.startX=e.clientX; state.dragX=0; }
      renderAngle();
    });
    stage.addEventListener('pointerup',end); stage.addEventListener('pointercancel',end);
    $('anglePrev')?.addEventListener('click',()=>{if(state.activeId==='Yara')return;state.angle=Math.max(0,state.angle-1);renderAngle();});
    $('angleNext')?.addEventListener('click',()=>{if(state.activeId==='Yara')return;state.angle=Math.min(4,state.angle+1);renderAngle();});
  }

  async function render(){
    try{await load(); renderRoster(); renderDetail(); bindStage();}
    catch(err){console.error('V6.8 character registry load failed',err); const host=$('charDesc'); if(host) host.textContent='角色注册数据载入失败：'+String(err.message||err);}
  }

  window.V35Characters={load,render,select,getCharacters:()=>state.characters};
})();
