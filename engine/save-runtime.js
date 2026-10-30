(() => {
  'use strict';

  const SAVE_VERSION = 5;
  const APP_VERSION = '8.2';

  function clone(x){ return JSON.parse(JSON.stringify(x)); }
  function isObj(x){ return !!x && typeof x === 'object' && !Array.isArray(x); }
  function merge(a,b){
    if(!isObj(a) || !isObj(b)) return b === undefined ? a : b;
    for(const [k,v] of Object.entries(b||{})){
      if(isObj(v) && isObj(a[k])) merge(a[k],v);
      else a[k]=clone(v);
    }
    return a;
  }
  function stableStringify(value){
    if(value === null || typeof value !== 'object') return JSON.stringify(value);
    if(Array.isArray(value)) return '['+value.map(stableStringify).join(',')+']';
    return '{'+Object.keys(value).sort().map(k=>JSON.stringify(k)+':'+stableStringify(value[k])).join(',')+'}';
  }
  async function checksum(save){
    const copy=clone(save||{}); delete copy.checksum;
    const text=stableStringify(copy);
    if(globalThis.crypto?.subtle){
      const buf=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(text));
      return [...new Uint8Array(buf)].map(x=>x.toString(16).padStart(2,'0')).join('');
    }
    let h=2166136261>>>0; for(let i=0;i<text.length;i++){h^=text.charCodeAt(i);h=Math.imul(h,16777619)>>>0;}
    return 'fnv1a-'+h.toString(16).padStart(8,'0');
  }
  function requiredEquipment(){return{weapon:null,head:null,body:null,waist:null,shoes:null,talisman:null,necklace:null};}
  function requiredProfile(){
    return {level:1,exp:0,nextExp:100,skillPoints:0,equipment:requiredEquipment(),skills:{},stats:{vit:0,spi:0,agi:0,pow:0},pillBonus:{hp:0,mp:0}};
  }
  function skeleton(){
    const now=new Date().toISOString();
    const chars={Yara:requiredProfile(),Aster:requiredProfile(),Moyu:requiredProfile(),Langa:requiredProfile(),Chenlu:requiredProfile()};
    return {
      saveVersion:SAVE_VERSION, appVersion:APP_VERSION, createdAt:now, updatedAt:now, checksum:'',
      selectedCharacter:'Yara', selected:'Yara', characters:chars,
      inventory:{equipment:[],consumables:{},materials:{},quest:{}},
      equipment:{byCharacter:Object.fromEntries(Object.entries(chars).map(([id,p])=>[id,clone(p.equipment)]))},
      levels:{unlocked:1,lastLevel:1,stars:{}},
      cultivation:{exp:0,stones:0,herbs:0,muyu:0,onlineSeconds:0,meditating:false,pills:{qi:0,body:0,spirit:0}},
      skillTrees:{}, dungeons:{discovered:{},cleared:{},bestStars:{}},
      progression:{v39:{discoveredDungeons:{},clearedDungeons:{},bestDungeonStars:{}}},
      shop:{purchases:{}}, settings:{quality:'high',masterVolume:.75,musicVolume:.55,sfxVolume:.8,muted:false,debugPerformance:false},
      manualSavedAt:0,lastSeen:Date.now(),lastExportAt:0,
      version:APP_VERSION,unlocked:1,lastLevel:1,stars:{},profile:chars.Yara
    };
  }
  function syncCompatibility(s){
    s.levels=s.levels||{unlocked:1,lastLevel:1,stars:{}};
    if(Number.isFinite(Number(s.unlocked)))s.levels.unlocked=Math.max(Number(s.levels.unlocked||1),Number(s.unlocked||1));
    if(Number.isFinite(Number(s.lastLevel)))s.levels.lastLevel=Number(s.lastLevel||s.levels.lastLevel||1);
    s.levels.stars=Object.assign({},s.levels.stars||{},s.stars||{});
    s.unlocked=Number(s.levels.unlocked||1);s.lastLevel=Number(s.levels.lastLevel||1);s.stars=s.levels.stars;
    s.selectedCharacter=s.selectedCharacter||s.selected||'Yara';s.selected=s.selectedCharacter;
    s.characters=s.characters||{};
    if(!s.characters.Yara)s.characters.Yara=merge(requiredProfile(),s.profile||{});
    for(const id of ['Yara','Aster','Moyu','Langa','Chenlu'])if(!s.characters[id])s.characters[id]=requiredProfile();
    for(const p of Object.values(s.characters||{})){if(!p)continue;p.equipment=Object.assign(requiredEquipment(),p.equipment||{});p.stats=Object.assign(requiredProfile().stats,p.stats||{});p.pillBonus=Object.assign(requiredProfile().pillBonus,p.pillBonus||{});}
    s.profile=s.characters[s.selectedCharacter]||s.characters.Yara;
    s.inventory=Object.assign({equipment:[],consumables:{},materials:{},quest:{}},s.inventory||{});
    s.shop=Object.assign({purchases:{}},s.shop||{});s.skillTrees=s.skillTrees||{};
    s.progression=s.progression||{};s.progression.v39=Object.assign({discoveredDungeons:{},clearedDungeons:{},bestDungeonStars:{}},s.progression.v39||{});
    s.dungeons=s.dungeons||{};
    s.dungeons.discovered=Object.assign({},s.dungeons.discovered||{},s.progression.v39.discoveredDungeons||{});
    s.dungeons.cleared=Object.assign({},s.dungeons.cleared||{},s.progression.v39.clearedDungeons||{});
    s.dungeons.bestStars=Object.assign({},s.dungeons.bestStars||{},s.progression.v39.bestDungeonStars||{});
    s.progression.v39.discoveredDungeons=s.dungeons.discovered;s.progression.v39.clearedDungeons=s.dungeons.cleared;s.progression.v39.bestDungeonStars=s.dungeons.bestStars;
    s.cultivation=Object.assign({exp:0,stones:0,herbs:0,muyu:0,onlineSeconds:0,meditating:false,pills:{qi:0,body:0,spirit:0}},s.cultivation||{});
    s.settings=Object.assign({quality:'high',masterVolume:.75,musicVolume:.55,sfxVolume:.8,muted:false,debugPerformance:false},s.settings||{});
    s.equipment=s.equipment||{byCharacter:{}};s.equipment.byCharacter=s.equipment.byCharacter||{};
    for(const [id,p] of Object.entries(s.characters))s.equipment.byCharacter[id]=clone(p.equipment||requiredEquipment());
    s.version=APP_VERSION;s.appVersion=APP_VERSION;s.saveVersion=SAVE_VERSION;
    return s;
  }
  function migrate(input,base=null){
    const src=clone(input||{});const out=merge(base?clone(base):skeleton(),src);
    if(!out.createdAt)out.createdAt=new Date().toISOString();
    if(!out.levels)out.levels={unlocked:Number(out.unlocked||1),lastLevel:Number(out.lastLevel||1),stars:out.stars||{}};
    return syncCompatibility(out);
  }
  async function finalize(save){
    const s=syncCompatibility(save);s.updatedAt=new Date().toISOString();if(!s.createdAt)s.createdAt=s.updatedAt;s.checksum='';s.checksum=await checksum(s);return s;
  }
  function structuralErrors(s){
    const err=[];if(!isObj(s))return['存档根节点不是对象'];
    if(Number(s.saveVersion)!==SAVE_VERSION)err.push(`saveVersion 必须为 ${SAVE_VERSION}`);
    for(const k of ['characters','inventory','equipment','levels','cultivation','skillTrees','dungeons','settings'])if(!isObj(s[k]))err.push(`缺少或损坏字段：${k}`);
    if(!isObj(s.characters?.Yara))err.push('缺少 Yara 角色数据');
    if(!Array.isArray(s.inventory?.equipment))err.push('inventory.equipment 必须为数组');
    const unlocked=Number(s.levels?.unlocked);if(!Number.isFinite(unlocked)||unlocked<1||unlocked>30)err.push('levels.unlocked 超出范围');
    if(typeof s.selectedCharacter!=='string')err.push('selectedCharacter 无效');
    if(typeof s.createdAt!=='string'||typeof s.updatedAt!=='string')err.push('createdAt / updatedAt 无效');
    return err;
  }
  async function validate(s,{allowMigrate=false,requireChecksum=false}={}){
    let x=s;
    if(requireChecksum && (typeof x?.checksum!=="string" || !x.checksum))return {ok:false,errors:["存档缺少校验标识，拒绝导入"],save:x};
    if(allowMigrate&&Number(x?.saveVersion)!==SAVE_VERSION)x=migrate(x);
    const errors=structuralErrors(x);if(errors.length)return{ok:false,errors,save:x};
    if(x.checksum){const expected=await checksum(x);if(expected!==x.checksum)return{ok:false,errors:['checksum 校验失败：存档可能损坏或被截断'],save:x};}
    return{ok:true,errors:[],save:x};
  }
  window.YaraV4Save={SAVE_VERSION,APP_VERSION,skeleton,requiredProfile,migrate,syncLegacy:syncCompatibility,syncCompatibility,finalize,validate,checksum,stableStringify};
})();
