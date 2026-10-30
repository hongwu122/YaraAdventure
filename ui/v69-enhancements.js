(() => {
'use strict';
const $=id=>document.getElementById(id);
const FAC={
  muyu:{dir:'muyu',idle:'states/hit_01.webp',hover:'states/hit_02.webp'},
  spirit_array:{dir:'spirit_array',idle:'states/idle.webp',hover:'states/active.webp'},
  garden:{dir:'herb_garden',idle:'states/ready.webp',hover:'states/harvest.webp'},
  furnace:{dir:'alchemy_furnace',idle:'states/idle.webp',hover:'states/flame.webp'},
  library:{dir:'library',idle:'states/idle.webp',hover:'states/glow.webp'},
  spring:{dir:'spring',idle:'states/loop_01.webp',hover:'states/loop_02.webp'},
  cushion:{dir:'cultivation_seat',idle:'states/idle.webp',hover:'states/aura.webp'}
};
function facSrc(id,state='idle'){const f=FAC[id];return f?`assets/production/facilities/${f.dir}/${f[state]||f.idle}`:''}
function decorateFacilities(){
  const host=$('v37Facilities'); if(!host)return;
  host.querySelectorAll('[data-facility]').forEach(btn=>{
    const id=btn.dataset.facility, f=FAC[id]; if(!f)return;
    let img=btn.querySelector('.v69-facility-art');
    if(!img){img=document.createElement('img');img.className='v69-facility-art';img.alt=btn.getAttribute('aria-label')||id;btn.prepend(img)}
    if(!btn.dataset.v69bound){
      btn.dataset.v69bound='1';
      btn.addEventListener('mouseenter',()=>{img.src=facSrc(id,'hover');btn.classList.add('v69-live')});
      btn.addEventListener('mouseleave',()=>{img.src=facSrc(id,'idle');btn.classList.remove('v69-live')});
      btn.addEventListener('click',()=>{
        const seq=id==='muyu'?['hit_01.webp','hit_02.webp']:id==='furnace'?['flame.webp','craft_success.webp']:id==='garden'?['ready.webp','harvest.webp']:id==='spirit_array'?['active.webp','levelup.webp']:null;
        if(seq){img.src=`assets/production/facilities/${f.dir}/states/${seq[0]}`;setTimeout(()=>img.src=`assets/production/facilities/${f.dir}/states/${seq[1]}`,120);setTimeout(()=>img.src=facSrc(id,'idle'),480)}
      });
    }
    if(!img.src) img.src=facSrc(id,'idle');
  });
}


function animateFacility(id,frames,delay=140){
  const btn=document.querySelector(`#v37Facilities [data-facility="${id}"]`),img=btn?.querySelector('.v69-facility-art'),f=FAC[id];
  if(!img||!f||!frames?.length)return;
  frames.forEach((name,i)=>setTimeout(()=>{img.src=`assets/production/facilities/${f.dir}/states/${name}`;btn.classList.add('v69-live')},i*delay));
  setTimeout(()=>{img.src=facSrc(id,'idle');btn.classList.remove('v69-live')},frames.length*delay+220);
}
function bindFacilityActionFeedback(){
  document.addEventListener('click',e=>{
    if(e.target.closest('[data-craft-pill]')) animateFacility('furnace',['flame.webp','craft_success.webp','flame.webp'],150);
    if(e.target.closest('#v48HarvestGarden,#v37CollectGarden')) animateFacility('garden',['ready.webp','harvest.webp'],170);
    if(e.target.closest('#v37MuyuHit')) animateFacility('muyu',['hit_01.webp','hit_02.webp','hit_01.webp'],110);
    if(e.target.closest('[data-upgrade="spirit_array"]')) animateFacility('spirit_array',['active.webp','levelup.webp','active.webp'],170);
  },true);
}

const actionFiles={run:'run_right.webp',attack_1:'attack_1_right.webp',double_jump:'double_jump_right.webp',dash_L:'dash_L_right.webp',skill_U:'skill_U_right.webp',skill_I:'skill_I_right.webp',musou:'musou_right.webp'};
function testImage(src){return new Promise(res=>{const im=new Image();im.onload=()=>res(src);im.onerror=()=>res(null);im.src=src})}
async function resolveHelpActions(){
  await window.YaraV70Audit?.ready;
  const imgs=[...document.querySelectorAll('[data-v69-action]')];
  for(const img of imgs){
    const key=img.dataset.v69Action, fn=actionFiles[key]; if(!fn)continue;
    const v62=`assets/production/characters/Yara_v62/combat/actions/${fn}`;
    const known=window.YaraV70Audit?.isAvailable?.(v62);
    if(known){img.src=v62;img.closest('.v49-key-card')?.classList.add('v69-v62-real')}
    else{img.closest('.v49-key-card')?.classList.add('v69-v66-fallback');img.title='V6.2正式动作文件尚未落地；V7.0使用已登记的V6.6回退动作，不发起缺失资源请求。';window.YaraV70Audit?.warnOnce?.(`help:${key}`,`Help action ${key}: V6.2 WebP missing; documented V6.6 fallback retained.`)}
  }
}

function decorateSkillTree(){
  const view=$('skillTreeView'); if(!view)return;
  const el=view.dataset.element||'metal';
  view.querySelectorAll('.v49-skill-node').forEach(btn=>{
    if(btn.querySelector('.v69-skill-orbit'))return;
    const orbit=document.createElement('span');orbit.className='v69-skill-orbit';btn.appendChild(orbit);
  });
  view.querySelectorAll('.v49-skill-link').forEach(link=>link.classList.add('v69-flow-link'));
}

function decorateCodex(){
  const detail=$('archiveDetail'); if(!detail)return;
  detail.querySelectorAll('.v49-detail-hero img').forEach(img=>{img.decoding='async';img.loading='eager'});
  document.querySelectorAll('.v49-codex-entry img').forEach(img=>{img.decoding='async';img.loading='lazy'});
}

function decorateMap(){
  const host=$('levelGrid');if(!host)return;
  host.querySelectorAll('.world-node').forEach(n=>{
    const id=Number(n.dataset.level||0);if(!id)return;
    n.classList.toggle('v69-stage-boss',[10,15,20].includes(id));
  });
}

function observe(id,fn){const el=$(id);if(!el||el.nodeType!==1)return;const mo=new MutationObserver(()=>fn());mo.observe(el,{childList:true,subtree:true,attributes:false});fn()}
function init(){
  observe('v37Facilities',decorateFacilities);
  observe('v38SkillBranches',decorateSkillTree);
  observe('archiveEntries',decorateCodex);observe('archiveDetail',decorateCodex);
  observe('levelGrid',decorateMap);
  bindFacilityActionFeedback();
  document.documentElement.dataset.v69='ready';
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
window.V69Enhancements={decorateFacilities,resolveHelpActions,decorateSkillTree,decorateCodex,decorateMap};
})();
