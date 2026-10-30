(() => {
'use strict';
const E=window.V37CultivationEngine;
const $=id=>document.getElementById(id);
let ready=false,tickHandle=null,selectedFacility=null,layout=null,pageBound=false;
const fmt=n=>Math.floor(Number(n)||0).toLocaleString('zh-CN');
const timeText=sec=>{sec=Math.max(0,Math.floor(sec));const h=Math.floor(sec/3600),m=Math.floor(sec%3600/60),s=sec%60;return `${h}小时${String(m).padStart(2,'0')}分${String(s).padStart(2,'0')}秒`;};
const save=()=>window.YaraV35?.getSave?.();
const mark=()=>window.YaraV35?.markDirty?.();
const persist=()=>window.YaraV35?.save?.(false);
const charName=()=>save()?.selectedCharacter||'Yara';

async function loadLayout(){if(layout)return layout;layout=await fetch('data/ui/v48_sanctum_layout.json',{cache:'no-store'}).then(r=>r.json());return layout;}

async function initSave(){
  await loadLayout();
  if(!E.data.realms) await E.load();
  const s=save();if(!s)return;
  E.ensureSave(s);s.version='8.1';
  const summary=E.applyOffline(s);mark();
  ready=true;
  if(summary) setTimeout(()=>showOffline(summary),120);
  startTicker();bindPage();render();return summary;
}

function startTicker(){
  if(tickHandle)return;
  tickHandle=setInterval(()=>{
    if(!ready||!save())return;
    const r=E.tick(save(),1);mark();
    if($('cultivateView')?.classList.contains('active')) renderLite(r);
  },1000);
}

function showOffline(x){
  const host=$('offlineRewardModal');if(!host)return;
  const herbs=Object.entries(x.garden||{}).filter(([,v])=>v>0).map(([id,v])=>`${E.materialLabel(id)} +${v}`).join(' · ')||'药圃暂无成熟';
  host.classList.remove('hidden');
  host.querySelector('.offline-time').textContent=timeText(x.seconds)+(x.capped?' · 已达10小时上限':'');
  host.querySelector('.offline-cult').textContent='+'+fmt(x.cultivation);
  host.querySelector('.offline-stones').textContent='+'+fmt(x.stones);
  host.querySelector('.offline-herbs').textContent=herbs;
}

function stageProgress(){const s=save(),v=E.ensureSave(s),st=E.stage(s);return {v,st,pct:st?Math.min(100,v.stageExp/Math.max(1,st.needExp)*100):0};}
function majorRealm(label=''){return (layout?.realms||['凡人','练气','筑基','金丹','元婴','化神','炼虚','合体','大乘','渡劫']).find(r=>label.startsWith(r))||'凡人';}

function renderRealmTrack(){
  const host=$('v48RealmTrack');if(!host||!save())return;
  const st=E.stage(save()),current=majorRealm(st?.label||'凡人'),realms=layout?.realms||[];
  host.innerHTML=realms.map((r,i)=>`<div class="v48-realm-node ${r===current?'current':''} ${realms.indexOf(current)>i?'passed':''}"><i></i><span>${r}</span>${r===current?`<small>${st?.label||r}</small>`:''}</div>`).join('');
}

function renderLite(){
  const s=save();if(!s)return;const {v,st,pct}=stageProgress();
  $('v37RealmName')&&($('v37RealmName').textContent=st?.label||'凡人');
  $('v37StageExp')&&($('v37StageExp').textContent=`${fmt(v.stageExp)} / ${fmt(st?.needExp||0)}`);
  if($('v37RealmBar'))$('v37RealmBar').style.width=pct+'%';
  $('v37Stones')&&($('v37Stones').textContent=fmt(s.cultivation.stones));
  $('v37Rate')&&($('v37Rate').textContent=E.cultivationRate(s).toFixed(2)+'/秒');
  $('v37MeditationTime')&&($('v37MeditationTime').textContent=timeText(v.meditation.totalSeconds||0));
  $('v37MuyuToday')&&($('v37MuyuToday').textContent=`${v.muyu.manualToday}/100`);
  $('v37MeditateBtn')&&($('v37MeditateBtn').textContent=v.meditation.active?'结束打坐':'开始打坐');
  $('v37AutoMuyu')&&($('v37AutoMuyu').textContent=v.muyu.auto?'关闭自动木鱼':'开启自动木鱼');
  $('cultivatorAvatar')?.classList.toggle('is-cultivating',!!v.meditation.active);
}

function facilityVisualClass(id){return `facility-${id}`;}
function renderFacilities(){
  const host=$('v37Facilities');if(!host||!layout)return;const s=save();
  host.innerHTML=layout.facilities.map(f=>`<button class="v48-sanctum-hit ${facilityVisualClass(f.id)} ${selectedFacility===f.id?'active':''}" data-facility="${f.id}" style="--x:${f.x}%;--y:${f.y}%;--w:${f.w}%;--h:${f.h}%" aria-label="${f.label}"><span class="v48-object-glow"></span><span class="v48-object-label"><b>${f.label}</b><small>Lv.${E.facilityLevel(s,f.id)}</small></span></button>`).join('');
  host.querySelectorAll('[data-facility]').forEach(btn=>btn.onclick=()=>interactFacility(btn.dataset.facility));
}

function render(){
  if(!ready||!save())return;const s=save(),v=E.ensureSave(s),st=E.stage(s),next=E.nextStage(s);
  renderLite();renderRealmTrack();renderFacilities();
  $('v37Character')&&($('v37Character').textContent=charName());
  const mat=v.garden.materials;
  $('v37HerbSummary')&&($('v37HerbSummary').textContent=`灵草 ${mat.spirit_grass||0} · 赤参 ${mat.red_ginseng||0} · 雪莲 ${mat.snow_lotus||0}`);
  $('v37NextRealm')&&($('v37NextRealm').textContent=next&&st&&next.index!==st.index?next.label:'当前版本最高境界');
  renderPanel(selectedFacility);
}

function pulseScene(type){
  const fx=$('v48SceneFx');if(!fx)return;fx.className='v48-scene-fx';void fx.offsetWidth;fx.classList.add('fx-'+type,'play');setTimeout(()=>fx.className='v48-scene-fx',900);
}
function harvestGarden(id=null){
 const v=E.ensureSave(save()),pending=v.garden.pending||{};let total=0;
 for(const [herb,n] of Object.entries(pending)){if(id&&id!==herb)continue;if(n>0){v.garden.materials[herb]=(v.garden.materials[herb]||0)+n;pending[herb]=0;total+=n;}}
 toast(total?'采摘完成 · 药材 +'+total:'药草正在生长，成熟后再来采摘');mark();persist();
}
function gardenPlots(){const v=E.ensureSave(save());return (E.data.herbs?.herbs||[]).filter(h=>E.facilityLevel(save(),'garden')>=h.unlockGardenLevel).map(h=>{const n=v.garden.pending?.[h.id]||0;return `<button class="v81-herb-plot" data-harvest-herb="${h.id}" ${n>0?'':'disabled'}><img src="assets/v81/facilities/garden.png" alt="${h.label}"><b>${h.label}</b><span>${n>0?'成熟 '+n+' · 点击采摘':'生长中'}</span></button>`}).join('');}
function hitWoodfish(){
  const r=E.manualMuyu(save());window.YaraV4Audio?.playSfx?.('muyu');mark();pulseScene('muyu');
  const target=document.getElementById('v37MuyuHit');if(target){target.classList.remove('hit');void target.offsetWidth;target.classList.add('hit');setTimeout(()=>target.classList.remove('hit'),320);}
  toast(`木鱼功德 +1 · 修为 +${r.cultivation.toFixed(1)}${r.mult<1?'（递减）':''}`);
}
function interactFacility(id){
  selectedFacility=id;


  if(id==='spirit_array')pulseScene('array');
  if(id==='furnace')pulseScene('furnace');
  render();
}
function closePanel(){selectedFacility=null;render();window.YaraV35?.showView?.("growthHallView");window.V35GrowthHall?.render?.();}

function upgradeButton(id){const f=E.facilityDef(id),cur=E.facilityLevel(save(),id),next=f?.levels?.find(x=>x.level===cur+1);if(!next)return '<button disabled>已满级</button>';return `<button class="sanctum-primary" data-upgrade="${id}">升级 · ${fmt(next.costStones||0)} 灵石</button>`;}
function materialRows(){const v=E.ensureSave(save());return (E.data.herbs?.herbs||[]).map(h=>`<div><span>${h.icon} ${h.label}</span><b>${fmt(v.garden.materials[h.id]||0)}</b><small>${E.facilityLevel(save(),'garden')>=h.unlockGardenLevel?'自动产出':`药圃 Lv.${h.unlockGardenLevel} 解锁`}</small></div>`).join('');}
function pillRows(){const v=E.ensureSave(save());return (E.data.recipes?.recipes||[]).map(r=>{const inv=v.alchemy.pills[r.id]||{};const total=Object.values(inv).reduce((a,b)=>a+b,0);return `<div class="pill-row"><span><b>${r.label}</b><small>持有 ${total}</small></span><button data-craft-pill="${r.id}">炼制</button><button data-use-pill="${r.id}">服用</button></div>`;}).join('');}
function recipeCost(r){return Object.entries(r.ingredients||{}).map(([id,n])=>`${E.materialLabel(id)}×${n}`).join(' · ')+` · 灵石×${r.stones}`;}

function renderPanel(id){
  if(window.YaraV83Sanctum)return window.YaraV83Sanctum.renderPanel(id);
  const host=$('v37FacilityDrawer');if(!host)return;
  if(!id){host.classList.remove('open');host.innerHTML='';document.getElementById('v81DialogShade')?.classList.add('hidden');return;}
  const s=save(),v=E.ensureSave(s),f=E.facilityDef(id),lv=E.facilityLevel(s,id);
  let body='';
  if(id==='cushion') body=`<p>在线持续修炼，离开洞府页面后仍累计。</p><div class="facility-metrics"><span>当前效率<b>${E.cultivationRate(s).toFixed(2)} 修为/秒</b></span><span>累计打坐<b>${timeText(v.meditation.totalSeconds||0)}</b></span></div><button class="sanctum-primary" id="v37MeditateBtn">${v.meditation.active?'结束打坐':'开始打坐'}</button>${upgradeButton(id)}`;
  else if(id==='muyu') body=`<p>点击场景里的木鱼即可敲击。前100次收益完整，之后递减。</p><div class="muyu-console"><button id="v37MuyuHit" class="woodfish-big" aria-label="敲击木鱼"><img src="assets/v81/facilities/muyu.png" alt="木鱼"><small>点击敲击</small></button><div><b>今日 ${v.muyu.manualToday}/100</b><span>收益倍率 ${(E.muyuMultiplier(v.muyu.manualToday)*100).toFixed(0)}%</span></div></div><button id="v37AutoMuyu">${v.muyu.auto?'关闭自动木鱼':'开启自动木鱼'}</button>${upgradeButton(id)}`;
  else if(id==='garden') body=`<p>药圃在线与离线都会自动产出。点击植物区域可查看并确认当前收成。</p><div class="v81-garden-bed" id="v81GardenBed">${gardenPlots()}</div><div class="material-grid">${materialRows()}</div>${upgradeButton(id)}`;
  else if(id==='furnace') body=`<div class="v48-alchemy-banner"><i></i><span><b>丹炉 · 七方</b><small>炉火已就绪</small></span></div><div class="recipe-list v48-recipe-list">${(E.data.recipes?.recipes||[]).map(r=>`<div><span><b>${r.label}</b><small>${recipeCost(r)}</small></span><button data-craft-pill="${r.id}">炼制</button></div>`).join('')}</div><div class="pill-bag v48-pill-bag">${pillRows()}</div>${upgradeButton(id)}`;
  else if(id==='spirit_array') body=`<p>聚灵阵环绕静修台运转，直接提高在线打坐效率。</p><div class="facility-metrics"><span>等级<b>Lv.${lv}</b></span><span>效率加成<b>+${Math.round((E.facilityLevelDef(s,id).rateBonus||0)*100)}%</b></span></div>${upgradeButton(id)}`;
  else if(id==='library') body=`<p>藏经阁提供稳定修炼加成，并保留心法熟练度接口。</p><div class="facility-metrics"><span>等级<b>Lv.${lv}</b></span><span>修炼加成<b>+${Math.round((E.facilityLevelDef(s,id).cultivationBonus||0)*100)}%</b></span></div>${upgradeButton(id)}`;
  else if(id==='spring') body=`<p>灵泉用于调息恢复，后续可继续接入更多恢复玩法。</p><div class="facility-metrics"><span>等级<b>Lv.${lv}</b></span><span>恢复加成<b>+${Math.round((E.facilityLevelDef(s,id).recoveryBonus||0)*100)}%</b></span></div>${upgradeButton(id)}`;
  host.className='sanctum-drawer v48-facility-hud open show-'+id;host.setAttribute('role','dialog');host.setAttribute('aria-modal','true');host.setAttribute('aria-label',f?.label||id);document.getElementById('v81DialogShade')?.classList.remove('hidden');
  if(!['muyu','garden'].includes(id))body=`<img class="v48-facility-art" src="assets/v82/facilities/${id}.png" alt="${f?.label||id}">`+body;
  host.innerHTML=`<button class="v48-hud-close" id="v48CloseFacility" aria-label="关闭">×</button><header><small>FACILITY HUD</small><h3>${f?.label||id}</h3><em>Lv.${lv}</em></header>${body}`;
  bindPanelActions();
}

function bindPanelActions(){
  $('v48CloseFacility')?.addEventListener('click',closePanel);
  $('v37MeditateBtn')?.addEventListener('click',()=>{const v=E.ensureSave(save());v.meditation.active?E.stopMeditation(save()):E.startMeditation(save());mark();render();});
  $('v37MuyuHit')?.addEventListener('click',()=>{hitWoodfish();render();});
  $('v37AutoMuyu')?.addEventListener('click',()=>{E.toggleAutoMuyu(save());mark();render();});
  document.querySelectorAll('[data-harvest-herb]').forEach(b=>b.onclick=()=>{harvestGarden(b.dataset.harvestHerb);render();});
  $('v48HarvestGarden')?.addEventListener('click',()=>{harvestGarden();render();});
  document.querySelectorAll('#v37FacilityDrawer [data-upgrade]').forEach(b=>b.onclick=()=>{const r=E.upgradeFacility(save(),b.dataset.upgrade);toast(r.ok?`升级成功 · Lv.${r.level}`:r.reason);if(r.ok){mark();persist();}render();});
  document.querySelectorAll('#v37FacilityDrawer [data-craft-pill]').forEach(b=>b.onclick=()=>{const r=E.craft(save(),b.dataset.craftPill);if(r.ok){window.YaraV4Audio?.playSfx?.('alchemy');pulseScene('furnace');}toast(r.ok?`${r.recipe.label} · ${E.qualityLabel(r.quality)}`:r.reason);if(r.ok){mark();persist();}render();});
  document.querySelectorAll('#v37FacilityDrawer [data-use-pill]').forEach(b=>b.onclick=()=>{const id=b.dataset.usePill,v=E.ensureSave(save()),inv=v.alchemy.pills[id]||{};const q=['supreme','high','mid','low'].find(k=>inv[k]>0);if(!q)return toast('没有可服用的该类丹药');const r=E.usePill(save(),id,q);toast(r.ok?`已服用 ${E.qualityLabel(q)} · 效果 ×${r.mult}`:r.reason);if(r.ok){mark();persist();}render();});
}

function openBreakthrough(){
  const host=$('breakthroughModal'),s=save(),st=E.stage(s),next=E.nextStage(s),check=E.canBreakthrough(s),req=st?.breakthrough||{};
  const mats=Object.entries(req.materials||{}).filter(([,n])=>n>0).map(([id,n])=>`${E.materialLabel(id)} ×${n}`).join(' · ')||'无额外材料';
  host.classList.remove('hidden');host.querySelector('.break-from').textContent=st?.label||'';host.querySelector('.break-to').textContent=next?.label||'';
  host.querySelector('.break-need-cult').textContent=`${fmt(E.ensureSave(s).stageExp)} / ${fmt(st?.needExp||0)}`;
  host.querySelector('.break-need-stones').textContent=`${fmt(s.cultivation.stones||0)} / ${fmt(req.stones||0)}`;
  host.querySelector('.break-need-materials').textContent=`${mats}${req.pill?' · 破境丹×1':''}`;
  host.querySelector('.break-status').textContent=check.ok?'气机圆满，可安全突破。':check.reason;
  host.querySelector('[data-break-now]').disabled=!check.ok;
}

function toast(text){const t=$('v37Toast');if(!t)return;t.textContent=text;t.classList.add('show');clearTimeout(t._to);t._to=setTimeout(()=>t.classList.remove('show'),1800);}

function bindPage(){
  if(pageBound)return;pageBound=true;
  $('v37BreakBtn')?.addEventListener('click',openBreakthrough);
  $('v37CollectGarden')?.addEventListener('click',()=>{selectedFacility='garden';harvestGarden();render();});
  $('v48SanctumBack')?.addEventListener('click',()=>{selectedFacility=null;window.YaraV35?.showView?.('growthHallView');window.V35GrowthHall?.render?.();});
  $('offlineRewardModal')?.querySelector('[data-close-offline]')?.addEventListener('click',()=>$('offlineRewardModal')?.classList.add('hidden'));
  $('breakthroughModal')?.querySelector('[data-close-break]')?.addEventListener('click',()=>$('breakthroughModal')?.classList.add('hidden'));
  $('breakthroughModal')?.querySelector('[data-break-now]')?.addEventListener('click',()=>{const host=$('breakthroughModal'),r=E.breakthrough(save());if(r.ok){mark();persist();host.classList.add('success');host.querySelector('.break-status').textContent=`突破成功：${r.from.label} → ${r.to.label}`;pulseScene('breakthrough');setTimeout(()=>{host.classList.add('hidden');host.classList.remove('success');render();},1400);}else{host.querySelector('.break-status').textContent=r.reason;}});
}

window.V37Cultivation={
  initSave:async()=>{await initSave();},
  render,closePanel,
  realmLabel:()=>save()?E.realmLabel(save()):'凡人',
  open:async(id=null)=>{if(!ready)await initSave();selectedFacility=id;window.YaraV35?.showView?.('cultivateView');render();},
  engine:E
};
})();

