(() => {
  'use strict';
  let layout=null;
  const $=id=>document.getElementById(id);
  const save=()=>window.YaraV35?.getSave?.();
  async function load(){
    if(layout) return layout;
    layout=await fetch('data/ui/v48_sanctum_layout.json',{cache:'no-store'}).then(r=>r.json());
    return layout;
  }
  function facilityLevel(id){try{return window.V37Cultivation?.engine?.facilityLevel?.(save(),id)||1}catch{return 1}}
  function openDock(d){
    if(d.action?.startsWith('economy:')) return window.V36EconomyUI?.open?.(d.action.split(':')[1]);
    if(d.action==='skillTreeView') return window.V38SkillTree?.open?.();
    if(d.action==='shanhaiView'){document.getElementById('shanhaiBtn')?.click();return;}
  }
  async function render(){
    const data=await load(), s=save();
    const host=$('growthHotspots'); if(!host) return;
    host.innerHTML=data.facilities.map(f=>`<button class="v48-scene-hotspot facility-${f.id}" data-facility="${f.id}" style="--x:${f.x}%;--y:${f.y}%;--w:${f.w}%;--h:${f.h}%" aria-label="${f.label}"><span class="v48-hotspot-glow"></span><span class="v48-hotspot-label"><b>${f.label}</b><small>Lv.${facilityLevel(f.id)} · ${f.hint}</small></span></button>`).join('');
    window.YaraV83Sanctum?.mountCharacter?.();
    host.querySelectorAll('[data-facility]').forEach(btn=>btn.onclick=()=>btn.dataset.facility==='shop'?window.V36EconomyUI?.open?.('shop'):window.V37Cultivation?.open?.(btn.dataset.facility));
    const dock=$('growthDockV48');
    if(dock){dock.innerHTML=data.dock.map(d=>`<button data-dock="${d.id}"><span>${d.label}</span></button>`).join('');dock.querySelectorAll('[data-dock]').forEach(btn=>{const d=data.dock.find(x=>x.id===btn.dataset.dock);btn.onclick=()=>openDock(d)});}
    const account=$('growthAccount');
    if(account){const cid=s?.selectedCharacter||'Yara',p=s?.characters?.[cid]||s?.profile||{};account.innerHTML=`<span>当前角色 <b>${({Yara:"Yara",Aster:"星遥",Moyu:"红舞",Langa:"岚歌",Chenlu:"辰露"})[cid]||cid}</b></span><span>等级 <b>Lv.${p.level||1}</b></span><span>境界 <b>${window.V37Cultivation?.realmLabel?.()||'凡人'}</b></span><span>灵石 <b>${Math.floor(Number(s?.cultivation?.stones||0)).toLocaleString('zh-CN')}</b></span>`;}
  }
  window.V35GrowthHall={load,render};
})();
