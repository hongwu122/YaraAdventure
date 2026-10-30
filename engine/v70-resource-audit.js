(() => {
'use strict';
const state={ready:false,manifest:null,availability:null,missingCritical:[],warnings:[]};
const warned=new Set();
function warnOnce(key,msg){if(warned.has(key))return;warned.add(key);state.warnings.push(msg);console.warn('[V8.0 RESOURCE]',msg)}
async function loadJson(url){try{const r=await fetch(url,{cache:'no-store'});if(!r.ok)return null;return await r.json()}catch{return null}}
async function init(){
  const [manifest,availability]=await Promise.all([loadJson('resource_manifest.json'),loadJson('data/v70/resource_availability.json')]);
  state.manifest=manifest;state.availability=availability?.available||{};state.ready=true;
  const critical=[];
  for(const rec of manifest?.logicalResources||[]){
    if(['degraded','partial'].includes(rec.status)){
      const reason=rec.fallbackReason||rec.notes||`missing: ${(rec.missing||[]).join(', ')}`;
      warnOnce(`${rec.category}:${rec.id}`,`${rec.category}/${rec.id} → ${rec.status}. ${reason}`);
      if(rec.category==='character'&&rec.id==='Yara')critical.push('Yara production GLB/actions');
    }
  }
  state.missingCritical=[...new Set(critical)];
  const b=document.getElementById('v70ResourceStatus');
  if(b){
    const degraded=(manifest?.summary?.degraded||0)+(manifest?.summary?.partial||0);
    b.textContent=degraded?`已登记 ${degraded} 项回退`:'2D 资源已登记';
    b.title=degraded?'所有回退原因已登记在 resource_manifest.json / RESOURCE_MANIFEST.md':'动作资源已登记；共享姿势与穿戴限制见 V8 说明';
  }
  document.documentElement.dataset.v70Resources=state.missingCritical.length?'documented-fallback':'ready';
  return state;
}
const ready=init();
function isAvailable(path){return !!state.availability?.[String(path||'').replace(/^\.\//,'')]}
window.YaraV70Audit={state,ready,isAvailable,warnOnce};
})();
