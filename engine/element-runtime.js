(() => {
'use strict';
const NS={loaded:false,data:null,balance:null,enemies:null};
async function load(){
  if(NS.loaded)return NS;
  const [data,balance,enemies]=await Promise.all([
    fetch('data/elements/elements_v38.json',{cache:'no-store'}).then(r=>r.json()),
    fetch('data/balance/levels_v38.json',{cache:'no-store'}).then(r=>r.json()),
    fetch('data/balance/enemies_v38.json',{cache:'no-store'}).then(r=>r.json())
  ]);
  NS.data=data;NS.balance=balance;NS.enemies=enemies;NS.loaded=true;return NS;
}
function multiplier(attacker,target){
  if(!attacker||!target||attacker==='neutral'||target==='neutral'||attacker===target)return NS.data?.multipliers?.neutral||1;
  const cyc=NS.data?.cycle||{},m=NS.data?.multipliers||{};
  if(cyc[attacker]===target)return Number(m.advantage||1.25);
  if(cyc[target]===attacker)return Number(m.disadvantage||0.85);
  return Number(m.neutral||1);
}
function levelInfo(id){return NS.balance?.levels?.find(x=>Number(x.id)===Number(id))||null}
function enemyDef(type,boss=false){const src=boss?NS.enemies?.bosses:NS.enemies?.enemies;return src?.[type]||null}
function elementLabel(id){return NS.data?.elements?.[id]?.label||id||'无'}
function ensureStatus(entity){entity.statusEffects=entity.statusEffects||{};return entity.statusEffects}
function applyStatus(entity,statusId,source={}){
  if(!entity||!statusId)return false;
  const def=NS.data?.statuses?.[statusId];if(!def)return false;
  const s=ensureStatus(entity);s[statusId]={id:statusId,elapsed:0,duration:Number(def.duration||1),tick:0,source,def};
  if(statusId==='stun'&&typeof window.YaraV38Hooks?.stun==='function')window.YaraV38Hooks.stun(entity,def.duration||.9);
  return true;
}
function tickStatuses(entity,dt,hooks={}){
  if(!entity?.statusEffects)return;
  for(const [id,s] of Object.entries(entity.statusEffects)){
    s.elapsed+=dt;s.tick+=dt;
    const interval=Number(s.def.tickInterval||0);
    if(interval>0&&s.tick>=interval){s.tick-=interval;
      if(s.def.damagePerTickScale&&hooks.damage)hooks.damage(Math.max(1,Math.round((s.source.baseDamage||10)*s.def.damagePerTickScale)),id);
      if(s.def.healPerTickScale&&hooks.heal)hooks.heal(Math.max(1,Math.round((s.source.baseHp||100)*s.def.healPerTickScale)),id);
    }
    if(s.elapsed>=s.duration)delete entity.statusEffects[id];
  }
}
function speedMultiplier(entity){return entity?.statusEffects?.slow?Number(entity.statusEffects.slow.def.speedMultiplier||.72):1}
function damageTakenMultiplier(entity){return entity?.statusEffects?.shield?Number(entity.statusEffects.shield.def.damageTakenMultiplier||.82):1}
function defenseMultiplier(entity){return entity?.statusEffects?.armor_break?Number(entity.statusEffects.armor_break.def.defenseMultiplier||.75):1}
function rooted(entity){return !!entity?.statusEffects?.root}
window.YaraV38Elements={load,multiplier,levelInfo,enemyDef,elementLabel,applyStatus,tickStatuses,speedMultiplier,damageTakenMultiplier,defenseMultiplier,rooted,state:NS};
})();
