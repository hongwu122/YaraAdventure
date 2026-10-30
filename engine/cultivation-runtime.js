(() => {
'use strict';
const NS = window.V37CultivationEngine = window.V37CultivationEngine || {};
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const dayKey=()=>new Date().toISOString().slice(0,10);
const now=()=>Date.now();
const clone=x=>JSON.parse(JSON.stringify(x));
NS.data={realms:null,facilities:null,herbs:null,recipes:null};

NS.load = async function(){
  const [realms,facilities,herbs,recipes]=await Promise.all([
    fetch('data/cultivation/realms_v37.json',{cache:'no-store'}).then(r=>r.json()),
    fetch('data/cultivation/facilities_v37.json',{cache:'no-store'}).then(r=>r.json()),
    fetch('data/cultivation/herbs_v37.json',{cache:'no-store'}).then(r=>r.json()),
    fetch('data/cultivation/recipes_v37.json',{cache:'no-store'}).then(r=>r.json())
  ]);
  NS.data={realms,facilities,herbs,recipes};
  return NS.data;
};

NS.ensureSave=function(save){
  const c=save.cultivation=save.cultivation||{};
  c.souls=Math.max(0,Math.floor(Number(c.souls)||0)); c.exp=Number(c.exp||0); c.stones=Math.max(0,Math.floor(Number(c.stones)||0)); c.herbs=Number(c.herbs||0); c.muyu=Number(c.muyu||0); c.onlineSeconds=Number(c.onlineSeconds||0);
  // disable the legacy V3.6 meditation loop; V3.7 owns meditation timing.
  c.meditating=false;
  c.v37=c.v37||{};
  const v=c.v37;
  v.stageIndex=Number.isFinite(v.stageIndex)?v.stageIndex:0;
  v.stageExp=Number.isFinite(v.stageExp)?v.stageExp:c.exp;
  v.totalCultivation=Number.isFinite(v.totalCultivation)?v.totalCultivation:c.exp;
  v.meditation=v.meditation||{active:false,startedAt:0,totalSeconds:0};
  v.lastSeen=Number(v.lastSeen||save.lastSeen||now());
  v.lastOffline=v.lastOffline||null;
  v.facilities=v.facilities||{};
  for(const f of (NS.data.facilities?.facilities||[])) if(!v.facilities[f.id]) v.facilities[f.id]={level:f.baseLevel||1};
  v.muyu=v.muyu||{date:dayKey(),manualToday:0,auto:false,autoCarry:0,totalClicks:Number(c.muyu||0)};
  if(v.muyu.date!==dayKey()){v.muyu.date=dayKey();v.muyu.manualToday=0;}
  v.garden=v.garden||{materials:{spirit_grass:8,red_ginseng:2,snow_lotus:0,fire_pith:0,dragon_leaf:0,star_dust:0},lastTick:now()};
  v.garden.materials=v.garden.materials||{};
  v.garden.plots=v.garden.plots||Array.from({length:6},(_,id)=>({id,tilled:false,herb:null,elapsed:0,watered:false}));
  v.alchemy=v.alchemy||{pills:{},history:[]};
  for(const r of (NS.data.recipes?.recipes||[])){
    if(!v.alchemy.pills[r.id]) v.alchemy.pills[r.id]={low:0,mid:0,high:0,supreme:0};
  }
  v.buffs=v.buffs||{};
  v.breakthroughs=Number(v.breakthroughs||0);
  v.version=1;
  c.exp=v.stageExp;
  return v;
};

NS.stage=function(save){
  const v=NS.ensureSave(save), stages=NS.data.realms?.stages||[];
  return stages[clamp(v.stageIndex,0,Math.max(0,stages.length-1))]||null;
};
NS.nextStage=function(save){
  const v=NS.ensureSave(save), stages=NS.data.realms?.stages||[];
  return stages[Math.min(v.stageIndex+1,stages.length-1)]||null;
};
NS.realmLabel=save=>NS.stage(save)?.label||'凡人';
NS.facilityLevel=function(save,id){return NS.ensureSave(save).facilities[id]?.level||1};
NS.facilityDef=id=>(NS.data.facilities?.facilities||[]).find(x=>x.id===id);
NS.facilityLevelDef=function(save,id){const f=NS.facilityDef(id);return f?.levels?.find(x=>x.level===NS.facilityLevel(save,id))||f?.levels?.[0]||{};};

NS.cultivationRate=function(save){
  const v=NS.ensureSave(save);
  const cushion=NS.facilityLevelDef(save,'cushion').rateBonus||0;
  const array=NS.facilityLevelDef(save,'spirit_array').rateBonus||0;
  const library=NS.facilityLevelDef(save,'library').cultivationBonus||0;
  const realmScale=1+v.stageIndex*.045;
  return +(1.5*realmScale*(1+cushion+array+library)).toFixed(3);
};

NS.addCultivation=function(save,amount){
  const v=NS.ensureSave(save); amount=Math.max(0,Number(amount)||0);
  v.stageExp+=amount; v.totalCultivation+=amount; save.cultivation.exp=v.stageExp;
  return amount;
};

NS.gardenTick=function(save,seconds){
 const v=NS.ensureSave(save),g=v.garden,gains={};
 for(const p of g.plots){if(!p.herb)continue;const h=NS.data.herbs.herbs.find(h=>h.id===p.herb);if(!h)continue;const before=p.elapsed;p.elapsed=Math.min(h.baseSeconds,p.elapsed+Math.max(0,seconds)*(p.watered?1.35:1));if(before<h.baseSeconds&&p.elapsed>=h.baseSeconds)gains[h.id]=(gains[h.id]||0)+1;}
 return gains;
};
NS.gardenAction=function(save,index,action,herb){
 const v=NS.ensureSave(save),g=v.garden,p=g.plots[index];if(index>=Math.min(6,(g.deityLevel||1)+1)&&!p?.herb)return {ok:false,reason:'土地尚未解锁，请每日向土地公祈福'};if(!p)return {ok:false,reason:'土地不存在'};
 if(action==='till'){if(p.herb)return {ok:false,reason:'有作物的土地不能重新翻耕'};p.tilled=true;return {ok:true,message:'土地已翻耕，请选择药材种子'};}
 if(action==='plant'){if(!p.tilled||p.herb)return {ok:false,reason:'请先翻耕空地'};const h=NS.data.herbs.herbs.find(h=>h.id===herb);if(!h||(g.deityLevel||1)<h.unlockGardenLevel)return {ok:false,reason:'药圃等级不足，尚未解锁这种种子'};if(save.cultivation.stones<2)return {ok:false,reason:'购买种子需要 2 灵石'};save.cultivation.stones-=2;Object.assign(p,{herb,elapsed:0,watered:false});return {ok:true,message:h.label+'已种下'};}
 if(action==='water'){if(!p.herb||p.watered)return {ok:false,reason:'请先种植，每茬可浇水一次'};p.watered=true;return {ok:true,message:'已浇水，生长速度提高 35%'};}
 if(action==='harvest'){const h=NS.data.herbs.herbs.find(h=>h.id===p.herb);if(!h||p.elapsed<h.baseSeconds)return {ok:false,reason:'药材还未成熟'};const n=Math.max(1,Math.round(h.baseYield*(NS.facilityLevelDef(save,'garden').yieldMult||1)*(g.blessUntil>Date.now()?1.5:1)));g.materials[h.id]=(g.materials[h.id]||0)+n;Object.assign(p,{herb:null,elapsed:0,watered:false});return {ok:true,message:'采收 '+h.label+' ×'+n};}
 return {ok:false,reason:'未知操作'};
};
NS.gardenBless=function(save){const g=NS.ensureSave(save).garden,day=new Date().toLocaleDateString('en-CA');if(g.lastBlessDay===day)return {ok:false,reason:'今日已经祈福，明日再来'};g.lastBlessDay=day;g.deityExp=(g.deityExp||0)+1;g.deityLevel=Math.min(5,1+Math.floor(g.deityExp/3));g.blessUntil=Date.now()+600000;return {ok:true,message:'祈福成功 · 土地公 Lv.'+g.deityLevel+' · 经验 '+g.deityExp+' / '+(g.deityLevel*3)};};

NS.muyuMultiplier=function(count){
  if(count<100) return 1;
  if(count<150) return .55;
  if(count<250) return .3;
  return .12;
};
NS.manualMuyu=function(save){
  const v=NS.ensureSave(save), m=v.muyu;
  if(m.date!==dayKey()){m.date=dayKey();m.manualToday=0;}
  const mult=NS.muyuMultiplier(m.manualToday);
  m.manualToday++;m.totalClicks++;save.cultivation.muyu=m.totalClicks;
  const gain=+(3*mult).toFixed(2);NS.addCultivation(save,gain);
  const stone=Math.max(1,Math.round(NS.facilityLevel(save,'muyu')*mult));save.cultivation.stones+=stone;
  if(Math.random()<.035*mult){v.garden.materials.spirit_grass=(v.garden.materials.spirit_grass||0)+1;}
  return {mult,cultivation:gain,stone,count:m.manualToday};
};
NS.toggleAutoMuyu=function(save,on){const v=NS.ensureSave(save);v.muyu.auto=typeof on==='boolean'?on:!v.muyu.auto;return v.muyu.auto;};

NS.tick=function(save,seconds=1){
  const v=NS.ensureSave(save);seconds=Math.max(0,seconds);
  const result={cultivation:0,stones:0,garden:{},autoMuyu:0};
  save.cultivation.onlineSeconds=(save.cultivation.onlineSeconds||0)+seconds;
  if(v.meditation.active){
    const gain=NS.cultivationRate(save)*seconds;NS.addCultivation(save,gain);result.cultivation+=gain;
    const stoneChance=.012+.002*Math.min(12,v.stageIndex);const expected=seconds*stoneChance;
    v._stoneCarry=(v._stoneCarry||0)+expected;const whole=Math.floor(v._stoneCarry);if(whole){v._stoneCarry-=whole;save.cultivation.stones+=whole;result.stones+=whole;}
    v.meditation.totalSeconds=(v.meditation.totalSeconds||0)+seconds;
  }
  if(v.muyu.auto){
    const eff=NS.facilityLevelDef(save,'muyu').autoEfficiency||.28;
    v.muyu.autoCarry=(v.muyu.autoCarry||0)+seconds/5;
    const hits=Math.floor(v.muyu.autoCarry);if(hits){v.muyu.autoCarry-=hits;v.muyu.autoTotal=(v.muyu.autoTotal||0)+hits;for(let i=0;i<hits;i++){const mult=NS.muyuMultiplier(v.muyu.manualToday+i)*eff;const g=3*mult;NS.addCultivation(save,g);result.autoMuyu+=g;const stone=Math.max(1,Math.round(NS.facilityLevel(save,'muyu')*mult));save.cultivation.stones+=stone;result.stones+=stone;}}
  }
  result.garden=NS.gardenTick(save,seconds);
  v.lastSeen=now();
  return result;
};

NS.startMeditation=function(save){const v=NS.ensureSave(save);v.meditation.active=true;if(!v.meditation.startedAt)v.meditation.startedAt=now();return true;};
NS.stopMeditation=function(save){const v=NS.ensureSave(save);v.meditation.active=false;v.meditation.startedAt=0;return false;};

NS.applyOffline=function(save){
  const v=NS.ensureSave(save), cap=(NS.data.realms?.maxOfflineHours||10)*3600;
  const current=now(), elapsed=Math.max(0,Math.floor((current-v.lastSeen)/1000)), sec=Math.min(cap,elapsed);
  if(sec<30){v.lastSeen=current;v.lastOffline=null;return null;}
  const medRate=NS.cultivationRate(save)*.45;
  const cult=Math.floor(sec*medRate);NS.addCultivation(save,cult);
  const stones=Math.floor(sec/95*(1+NS.facilityLevel(save,'spirit_array')*.05));save.cultivation.stones+=stones;
  const garden=NS.gardenTick(save,sec);
  const summary={seconds:sec,rawSeconds:elapsed,capped:elapsed>cap,cultivation:cult,stones,garden,at:current};
  v.lastOffline=summary;v.lastSeen=current;return summary;
};

NS.canBreakthrough=function(save){
  const v=NS.ensureSave(save), stage=NS.stage(save), next=NS.nextStage(save);if(!stage||!next||next.index===stage.index)return {ok:false,reason:'已达当前版本最高境界'};
  if(v.stageExp<stage.needExp)return {ok:false,reason:`修为不足，还需 ${Math.ceil(stage.needExp-v.stageExp)}`};
  const req=stage.breakthrough||{}, mats=v.garden.materials||{};
  if((save.cultivation.souls||0)<(req.stones||0))return {ok:false,reason:`灵魂不足，需要 ${req.stones||0}，可击败怪物获得`};
  for(const [id,n] of Object.entries(req.materials||{}))if((mats[id]||0)<n)return {ok:false,reason:`材料不足：${id} ×${n}`};
  if(req.pill){const inv=v.alchemy.pills[req.pill]||{};if(Object.values(inv).reduce((a,b)=>a+b,0)<1)return {ok:false,reason:'需要破境丹'};}
  return {ok:true,stage,next,req};
};
NS.breakthrough=function(save){
  const check=NS.canBreakthrough(save);if(!check.ok)return check;
  const v=NS.ensureSave(save), req=check.req;save.cultivation.souls-=(req.stones||0);
  for(const [id,n] of Object.entries(req.materials||{}))v.garden.materials[id]-=n;
  if(req.pill){const q=['low','mid','high','supreme'];const inv=v.alchemy.pills[req.pill];for(const k of q){if(inv[k]>0){inv[k]--;break;}}}
  v.stageExp=Math.max(0,v.stageExp-check.stage.needExp);v.stageIndex++;v.breakthroughs++;save.cultivation.exp=v.stageExp;
  return {ok:true,from:check.stage,to:NS.stage(save)};
};

NS.upgradeFacility=function(save,id){
  const v=NS.ensureSave(save), f=NS.facilityDef(id);if(!f)return {ok:false,reason:'设施不存在'};
  const cur=v.facilities[id]?.level||1;if(cur>=f.maxLevel)return {ok:false,reason:'已满级'};
  const next=f.levels.find(x=>x.level===cur+1)||{};const stones=next.costStones||0;
  if((save.cultivation.stones||0)<stones)return {ok:false,reason:`灵石不足，需要 ${stones}`};
  const mats=v.garden.materials, econ=save.inventory?.materials||{};
  const dustHave=(mats.spirit_dust||0)+(econ.mat_spirit_dust||0), ironHave=(mats.refined_iron||0)+(econ.mat_refined_iron||0);
  if((next.needDust||0)>dustHave)return {ok:false,reason:'灵尘不足'};
  if((next.needIron||0)>ironHave)return {ok:false,reason:'精铁不足'};
  save.cultivation.stones-=stones;
  if(next.needDust){let n=next.needDust,use=Math.min(n,mats.spirit_dust||0);mats.spirit_dust=(mats.spirit_dust||0)-use;n-=use;if(n)econ.mat_spirit_dust=(econ.mat_spirit_dust||0)-n;}
  if(next.needIron){let n=next.needIron,use=Math.min(n,mats.refined_iron||0);mats.refined_iron=(mats.refined_iron||0)-use;n-=use;if(n)econ.mat_refined_iron=(econ.mat_refined_iron||0)-n;}
  v.facilities[id].level=cur+1;return {ok:true,level:cur+1};
};

NS.recipe=id=>(NS.data.recipes?.recipes||[]).find(x=>x.id===id);
NS.craft=function(save,id){
  const v=NS.ensureSave(save), r=NS.recipe(id);if(!r)return {ok:false,reason:'配方不存在'};
  if(save.cultivation.stones<r.stones)return {ok:false,reason:`灵石不足，需要 ${r.stones}`};
  for(const [mid,n] of Object.entries(r.ingredients||{}))if((v.garden.materials[mid]||0)<n)return {ok:false,reason:`材料不足：${mid}`};
  save.cultivation.stones-=r.stones;for(const [mid,n] of Object.entries(r.ingredients||{}))v.garden.materials[mid]-=n;
  const furnace=NS.facilityLevel(save,'furnace');const roll=Math.random();let q='low';
  const supreme=.02+(furnace-1)*.025, high=.13+(furnace-1)*.035, mid=.35+(furnace-1)*.04;
  if(roll<supreme)q='supreme';else if(roll<supreme+high)q='high';else if(roll<supreme+high+mid)q='mid';
  v.alchemy.pills[id][q]++;v.alchemy.history.unshift({id,q,at:now()});v.alchemy.history=v.alchemy.history.slice(0,20);
  return {ok:true,quality:q,recipe:r};
};
NS.usePill=function(save,id,quality='low'){
  const v=NS.ensureSave(save), r=NS.recipe(id), inv=v.alchemy.pills[id];if(!r||!inv||!inv[quality])return {ok:false,reason:'丹药不足'};
  inv[quality]--;const q=NS.data.recipes.qualities.find(x=>x.id===quality)||{multiplier:1};const mult=q.multiplier||1;
  const p=save.characters?.[save.selectedCharacter||'Yara']||save.profile;
  if(r.effect==='cultivation')NS.addCultivation(save,r.baseValue*mult);
  else if(r.effect==='hp')p.pillBonus.hp=(p.pillBonus.hp||0)+Math.round(r.baseValue*mult);
  else if(r.effect==='mp')p.pillBonus.mp=(p.pillBonus.mp||0)+Math.round(r.baseValue*mult);
  else if(r.effect==='speed_temp')v.buffs.speed={value:r.baseValue*mult,until:now()+(r.durationSec||600)*1000};
  else if(r.effect==='respec'){const spent=Object.values(p.stats||{}).reduce((a,b)=>a+(Number(b)||0),0);p.skillPoints=(p.skillPoints||0)+spent;p.stats={vit:0,spi:0,agi:0,pow:0};}
  else if(r.effect==='heal')v.buffs.healCharge=(v.buffs.healCharge||0)+r.baseValue*mult;
  return {ok:true,effect:r.effect,mult};
};

NS.materialLabel=function(id){const h=(NS.data.herbs?.herbs||[]).find(x=>x.id===id);const map={spirit_dust:'灵尘',refined_iron:'精铁'};return h?.label||map[id]||id;};
NS.qualityLabel=function(id){return NS.data.recipes?.qualities?.find(x=>x.id===id)?.label||id;};
})();
