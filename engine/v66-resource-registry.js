(() => {
  'use strict';
  const ROOT='assets/production/';
  const warned=new Set();
  function fallbackWarn(key,msg){if(warned.has(key))return;warned.add(key);console.warn('[V7.0 FALLBACK]',msg);window.YaraV70Audit?.warnOnce?.(key,msg)}
  const BOSS_MAP={
    peachlingBoss:'peachling_chief',redpandaBoss:'redpanda_instructor',golemBoss:'stone_guardian',
    firelingBoss:'lava_boss',phoenixBoss:'celestial_phoenix',frostlingBoss:'frostlingBoss',
    shadowfoxBoss:'shadowfoxBoss',abysslingBoss:'abysslingBoss',runegolemBoss:'runegolemBoss',
    jiangshiBoss:'jiangshiBoss',sunlingBoss:'sunlingBoss'
  };
  const STAGE_BOSS={10:'abysslingBoss',15:'phoenixBoss_stage15',20:'golemBoss_stage20'};
  const KNOWN={
    'assets/production/characters/Yara_v61/model/yara_v61.glb':false,
    'assets/production/characters/Yara_v62/combat/animations.runtime.json':false,
    'assets/production/monsters/peachling/combat/animations.runtime.json':false,
    'assets/production/monsters/redpanda/combat/animations.runtime.json':false,
    'assets/production/monsters/golem/combat/animations.runtime.json':false,
    'assets/production/monsters/fireling/combat/animations.runtime.json':false,
    'assets/production/monsters/phoenix/combat/animations.runtime.json':false,
    'assets/production/monsters/frostling/combat/animations.runtime.json':false,
    'assets/production/monsters/shadowfox/combat/animations.runtime.json':false,
    'assets/production/monsters/abyssling/combat/animations.runtime.json':false,
    'assets/production/monsters/runegolem/combat/animations.runtime.json':false,
    'assets/production/monsters/jiangshi/combat/animations.runtime.json':false,
    'assets/production/monsters/sunling/combat/animations.runtime.json':false
  };
  for(const id of Object.keys(BOSS_MAP))KNOWN[`data/v66/boss_runtime/${id}.json`]=true;
  KNOWN['data/v66/boss_runtime/phoenixBoss_stage15.json']=true;
  KNOWN['data/v66/boss_runtime/golemBoss_stage20.json']=true;
  const MONSTERS=['peachling','redpanda','golem','fireling','phoenix','frostling','shadowfox','abyssling','runegolem','jiangshi','sunling'];
  const LEGACY={
    Yara:'assets/characters/Yara/v32/animations.json',
    peachling:'assets/monsters/peachling/v32/animations.json',redpanda:'assets/monsters/redpanda/v32/animations.json',golem:'assets/monsters/golem/v32/animations.json',
    fireling:'assets/monsters/fireling/v40/animations.json',phoenix:'assets/monsters/phoenix/v40/animations.json',frostling:'assets/monsters/frostling/v40/animations.json',
    shadowfox:'assets/monsters/shadowfox/v40/animations.json',abyssling:'assets/monsters/abyssling/v40/animations.json',runegolem:'assets/monsters/runegolem/v40/animations.json',
    jiangshi:'assets/monsters/jiangshi/v40/animations.json',sunling:'assets/monsters/sunling/v40/animations.json'
  };
  const existsCache=new Map();
  async function exists(url){if(Object.prototype.hasOwnProperty.call(KNOWN,url))return KNOWN[url];if(existsCache.has(url))return existsCache.get(url);let ok=false;try{const r=await fetch(url,{method:'HEAD',cache:'no-store'});ok=r.ok}catch{}existsCache.set(url,ok);return ok}
  function bossFolder(gameType,level){return STAGE_BOSS[Number(level)]&&gameType===String(STAGE_BOSS[Number(level)]).replace(/_stage\d+$/,'')?STAGE_BOSS[Number(level)]:(BOSS_MAP[gameType]||gameType)}
  function bossPortrait(gameType,level){return `${ROOT}bosses/${bossFolder(gameType,level)}/portrait.webp`}
  function bossPreview(gameType,level){return `${ROOT}bosses/${bossFolder(gameType,level)}/preview.webp`}
  function bossRuntimeJson(gameType,level){const suffix=Number(level)===15&&gameType==='phoenixBoss'?'_stage15':Number(level)===20&&gameType==='golemBoss'?'_stage20':'';return `data/v66/boss_runtime/${gameType}${suffix}.json`}
  async function yaraAnimationUrl(){return 'assets/v82/characters/Yara/animations.json'}
  async function monsterAnimationUrl(id){if(MONSTERS.includes(id))return `assets/v8/${id}/animations.json`;const prod=`${ROOT}monsters/${id}/combat/animations.runtime.json`;if(await exists(prod))return prod;const fb=LEGACY[id]||null;if(fb)fallbackWarn(`monster:${id}`,`${id} production action strips are missing; using documented legacy combat animation fallback while keeping production portrait identity.`);return fb}
  async function bossAnimationUrl(gameType,level){const id=Number(level)===15&&gameType==='phoenixBoss'?'phoenixBoss_stage15':Number(level)===20&&gameType==='golemBoss'?'golemBoss_stage20':gameType;return `assets/v8/${id}/animations.json`}
  async function yaraModel(){const glb=`${ROOT}characters/Yara_v61/model/yara_v61.glb`;const ok=await exists(glb);if(!ok)fallbackWarn('Yara-GLB','Yara production GLB is missing; character showcase uses the approved white-Yara front reference and clearly labels the fallback.');return {path:glb,exists:ok,fallback:`${ROOT}characters/Yara_v61/reference/front.webp`,config:`${ROOT}characters/Yara_v61/model/model.json`}}
  async function buildLoadTable(level=1){const out=[];out.push(['Yara',await yaraAnimationUrl()]);for(const id of MONSTERS){const u=await monsterAnimationUrl(id);if(u)out.push([id,u])}for(const gameType of Object.keys(BOSS_MAP)){const u=await bossAnimationUrl(gameType,level);if(u)out.push([gameType,u])}return out}
  window.YaraV66Resources={ROOT,BOSS_MAP,STAGE_BOSS,MONSTERS,LEGACY,exists,bossFolder,bossPortrait,bossPreview,bossRuntimeJson,yaraAnimationUrl,monsterAnimationUrl,bossAnimationUrl,yaraModel,buildLoadTable};
})();
