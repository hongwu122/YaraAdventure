(() => {
'use strict';
const NS={loaded:false,mainline:null,dungeons:null,rewards:null};
async function load(){
  if(NS.loaded)return NS;
  [NS.mainline,NS.dungeons,NS.rewards]=await Promise.all([
    fetch('data/progression/v39_mainline.json',{cache:'no-store'}).then(r=>r.json()),
    fetch('data/dungeons/v39_dungeons.json',{cache:'no-store'}).then(r=>r.json()),
    fetch('data/dungeons/v39_reward_pools.json',{cache:'no-store'}).then(r=>r.json())
  ]);
  NS.loaded=true;return NS;
}
function ensureSave(save){
  save.progression=save.progression||{};
  save.progression.v39=save.progression.v39||{discoveredDungeons:{},clearedDungeons:{},bestDungeonStars:{}};
  return save.progression.v39;
}
function level(id){return NS.mainline?.mainline?.find(x=>Number(x.id)===Number(id))||null}
function dungeon(id){return NS.dungeons?.dungeons?.find(x=>x.id===id)||null}
function discoverAfterLevel(save,levelId){
  const s=ensureSave(save),found=[];
  for(const e of NS.mainline?.dungeonEntries||[]){
    if(Number(e.afterLevel)===Number(levelId)&&!s.discoveredDungeons[e.dungeonId]){
      s.discoveredDungeons[e.dungeonId]=Date.now(); found.push(e.dungeonId);
    }
  }
  return found;
}
function dungeonState(save,id){const s=ensureSave(save);return s.clearedDungeons[id]?'cleared':(s.discoveredDungeons[id]?'discovered':'hidden')}
function clearDungeon(save,id,stars=1){const s=ensureSave(save);s.discoveredDungeons[id]=s.discoveredDungeons[id]||Date.now();s.clearedDungeons[id]=(s.clearedDungeons[id]||0)+1;s.bestDungeonStars[id]=Math.max(s.bestDungeonStars[id]||0,stars);return s}
function grantDungeonReward(save,id){
  const econ=window.YaraV36Economy,d=dungeon(id);if(!d)return [];
  const out=[]; const add=(item,qty)=>{if(qty>0&&econ?.addItem){econ.addItem(save,item,qty);out.push(`${item} ×${qty}`)}};
  if(id==='herb_valley'){add('mat_peach_petal',8);add('mat_bamboo_fiber',6);add('mat_spirit_dust',3);save.cultivation.herbs=(save.cultivation.herbs||0)+18;out.push('药材 +18')}
  else if(id==='iron_tomb'){add('mat_refined_iron',8);add('mat_spirit_dust',5);const pool=['eq_wood_sword','eq_bamboo_blade','eq_mystic_mail'];add(pool[Math.floor(Math.random()*pool.length)],1)}
  else if(id==='boss_realm'){add('mat_peach_core',2);add('mat_spirit_dust',8);add('eq_peach_blossom_sword',Math.random()<.45?1:0)}
  else if(id==='five_trial'){add('mat_spirit_dust',10);add('mat_refined_iron',4);save.profile.skillPoints=(save.profile.skillPoints||0)+1;out.push('技能点 +1')}
  save.cultivation.stones=(save.cultivation.stones||0)+(id==='boss_realm'?260:120);out.push(`灵石 +${id==='boss_realm'?260:120}`);return out;
}
window.YaraV39Progression={load,ensureSave,level,dungeon,discoverAfterLevel,dungeonState,clearDungeon,grantDungeonReward,state:NS};
})();
