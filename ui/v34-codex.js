(() => {
'use strict';
const shanhaiBtn=document.getElementById('shanhaiBtn'),view=document.getElementById('shanhaiView'),tabs=document.getElementById('archiveTabs'),entries=document.getElementById('archiveEntries'),detail=document.getElementById('archiveDetail'),title=document.getElementById('archiveTitle'),kicker=document.getElementById('archiveKicker'),intro=document.getElementById('archiveIntro');
let data=null,activeCategory=null,extra={};
const elementZh={wood:'木',earth:'土',water:'水',fire:'火',metal:'金'},weakBy={wood:'金',earth:'木',water:'土',fire:'水',metal:'火'};
const rarityZh={common:'凡品',verdant:'灵秀',arcane:'玄品',immortal:'仙珍',heaven:'天工',divine:'神铸'};
const visualMap={
 yara:'assets/v8/Yara/portrait.png',aster:'assets/v8/Aster/portrait.png',moyu:'assets/v8/Moyu/portrait.png',langa:'assets/v8/Langa/portrait.png',
 combo:'assets/v8/Yara/frames/attack_1_01.png',dash:'assets/v8/Yara/frames/dash_L_00.png',windslash:'assets/v8/Yara/frames/skill_U_01.png',starlight:'assets/v8/Yara/frames/skill_I_01.png',musou:'assets/v8/Yara/frames/musou_01.png',
 peachling:'assets/production/monsters/peachling/portrait.webp',redpanda:'assets/production/monsters/redpanda/portrait.webp',golem:'assets/production/monsters/golem/portrait.webp',elite_golem:'assets/production/monsters/runegolem/portrait.webp',
 peach_guardian:'assets/production/bosses/peachling_chief/portrait.webp',bamboo_master:'assets/production/bosses/redpanda_instructor/portrait.webp',stone_guardian:'assets/production/bosses/stone_guardian/portrait.webp',
 weapon:'assets/production/equipment/eq_spirit_saber/preview.webp',armor:'assets/production/equipment/eq_star_brocade/preview.webp',artifact:'assets/production/equipment/eq_sun_talisman/preview.webp',
 herb:'assets/items/icons/mat_peach_petal.webp',stone:'assets/items/icons/mat_spirit_dust.webp',iron:'assets/items/icons/mat_refined_iron.webp',
 l1:'assets/backgrounds/level1_peach_valley.webp',l2:'assets/backgrounds/level2_bamboo_forest.webp',l3:'assets/backgrounds/level3_ancient_temple.webp'
};
const equipMap={weapon:'eq_spirit_saber',armor:'eq_star_brocade',artifact:'eq_sun_talisman'};
async function showArchive(){if(window.YaraV35?.showView)window.YaraV35.showView('shanhaiView');else document.querySelectorAll('.view').forEach(v=>v.classList.toggle('active',v===view));if(!data)await load()}
async function load(){try{const [c,b,it,lt,ci]=await Promise.all([
 fetch('data/ui/v34_codex.json',{cache:'no-store'}).then(r=>r.json()),
 fetch('data/balance/enemies_v38.json',{cache:'no-store'}).then(r=>r.json()),
 fetch('data/economy/items.json',{cache:'no-store'}).then(r=>r.json()),
 fetch('data/economy/loot_tables.json',{cache:'no-store'}).then(r=>r.json()),
 fetch('assets/characters/index.json',{cache:'no-store'}).then(r=>r.json())]);
 data=c;extra.balance=b;extra.items=Object.fromEntries((it.items||[]).map(x=>[x.id,x]));extra.loot=lt.tables||{};extra.characters={};for(const ch of ci.characters||[]){try{extra.characters[ch.id]=await fetch(`assets/characters/${ch.folder}/${ch.data}`,{cache:'no-store'}).then(r=>r.json())}catch{}}
 activeCategory=data.categories[0];renderTabs();renderCategory(activeCategory.id)}catch(err){detail.innerHTML=`<div class="v49-empty"><span>!</span><p>山海录数据载入失败<br>${String(err.message||err)}</p></div>`}}
function renderTabs(){tabs.innerHTML=data.categories.map((c,i)=>`<button class="${i===0?'active':''}" data-cat="${c.id}">${c.label}<small>${String(i+1).padStart(2,'0')}</small></button>`).join('');tabs.querySelectorAll('[data-cat]').forEach(btn=>btn.addEventListener('click',()=>renderCategory(btn.dataset.cat)))}
function visualFor(e,cid){if(cid==='elements')return null;return visualMap[e.id]||null}
function renderCategory(id){const c=data.categories.find(x=>x.id===id)||data.categories[0];activeCategory=c;tabs.querySelectorAll('button').forEach(b=>b.classList.toggle('active',b.dataset.cat===c.id));kicker.textContent=c.kicker;title.textContent=c.label;intro.textContent=c.intro;entries.innerHTML=c.entries.map((e,i)=>{const v=visualFor(e,c.id);const sigil=c.id==='elements'?`<span class="sigil ${e.id}">${e.name}</span>`:(v?`<img src="${v}" alt="${e.name}">`:`<span class="sigil">${String(i+1).padStart(2,'0')}</span>`);return `<button class="v49-codex-entry" data-entry="${e.id}"><span class="v49-codex-thumb">${sigil}</span><span class="v49-codex-entry-copy"><small>${e.tag||String(i+1).padStart(2,'0')}</small><strong>${e.name}</strong><p>${e.summary||''}</p></span></button>`}).join('');entries.querySelectorAll('[data-entry]').forEach(btn=>btn.addEventListener('click',()=>renderDetail(btn.dataset.entry)));if(c.entries[0])renderDetail(c.entries[0].id)}
function lootNames(tableId){const t=extra.loot?.[tableId];if(!t)return[];return (t.entries||[]).slice(0,5).map(x=>extra.items[x.item]?.name||x.item)}
function infoFor(e,cid){let stats=null,tags=[],weak=null,drops=[],rarity=null,visual=visualFor(e,cid),heroClass='';
 if(cid==='characters'){const key={yara:'Yara',aster:'Aster',moyu:'Moyu',langa:'Langa'}[e.id],c=extra.characters[key];if(c){const s=c.baseStats||{};stats={生命:s.hp,灵力:s.mp,攻击:s.attack,防御:s.defense,身法:s.speed};tags=[c.elementLabel||elementZh[c.element],c.role];weak=weakBy[c.element];heroClass='character'}}
 if(cid==='monsters'){const m=extra.balance?.enemies?.[e.id==='elite_golem'?'golemElite':e.id];if(m){stats={生命:m.hp,攻击:m.damage,速度:m.speed};tags=[elementZh[m.element],m.elite?'精英':'普通怪'];weak=weakBy[m.element];drops=lootNames(m.lootTable)}}
 if(cid==='bosses'){const k={peach_guardian:'peachGuardian',bamboo_master:'redpandaBoss',stone_guardian:'golemBoss'}[e.id],m=extra.balance?.bosses?.[k];if(m){stats={生命:m.hp,攻击:m.damage};tags=[elementZh[m.element],'Boss'];weak=weakBy[m.element];drops=lootNames(m.lootTable)}}
 if(cid==='equipment'){const item=extra.items?.[equipMap[e.id]];if(item){visual=item.icon;stats=item.stats||null;rarity=item.rarity;tags=[rarityZh[item.rarity]||item.rarity,item.slot||'装备'];drops=item.exclusive?[item.exclusive]:[]}}
 if(cid==='materials'){const itemId={herb:'mat_peach_petal',stone:'mat_spirit_dust',iron:'mat_refined_iron'}[e.id],item=extra.items?.[itemId];if(item){visual=item.icon;rarity=item.rarity;tags=[rarityZh[item.rarity]||item.rarity,'材料']}}
 if(cid==='elements'){tags=['五行'];weak=weakBy[e.id]}
 return{stats,tags,weak,drops,rarity,visual,heroClass}}
function chart(stats){if(!stats)return'';const vals=Object.values(stats).map(v=>Number(v)||0),mx=Math.max(...vals,1);return `<div class="v49-stat-chart">${Object.entries(stats).map(([k,v])=>`<div class="v49-stat-row"><span>${k}</span><i style="--pct:${Math.min(100,(Number(v)||0)/mx*100)}%"></i><b>${typeof v==='number'&&v<1?Math.round(v*100)+'%':v}</b></div>`).join('')}</div>`}
function renderDetail(id){const e=activeCategory.entries.find(x=>x.id===id);if(!e)return;entries.querySelectorAll('[data-entry]').forEach(b=>b.classList.toggle('active',b.dataset.entry===id));const inf=infoFor(e,activeCategory.id),rows=Object.entries(e.meta||{}).map(([k,v])=>`<div><span>${k}</span><b>${v}</b></div>`).join(''),img=inf.visual?`<img src="${inf.visual}" alt="${e.name}">`:`<div class="sigil ${e.id}">${e.name.slice(0,1)}</div>`;detail.innerHTML=`<article><div class="v49-detail-hero ${inf.heroClass}">${img}</div><div class="v49-detail-kicker">${e.tag||activeCategory.kicker}</div><h4>${e.name}</h4>${inf.rarity?`<span class="v49-rarity rarity-${inf.rarity}">${rarityZh[inf.rarity]||inf.rarity}</span>`:''}<p class="v49-detail-summary">${e.description||e.summary||''}</p><div class="v49-tag-row">${inf.tags.filter(Boolean).map(x=>`<span class="v49-tag">${x}</span>`).join('')}${inf.weak?`<span class="v49-tag weak">弱点：${inf.weak}</span>`:''}${inf.drops.map(x=>`<span class="v49-tag drop">${x}</span>`).join('')}</div>${chart(inf.stats)}<div class="v49-detail-meta">${rows}</div></article>`}
if(shanhaiBtn)shanhaiBtn.addEventListener('click',showArchive);
window.addEventListener('keydown',e=>{if(e.key!=='Escape')return;const active=document.querySelector('.view.active');if(!active||active.id==='menuView'||active.id==='gameView')return;if(window.YaraV35?.showView)window.YaraV35.showView('menuView')});
})();
