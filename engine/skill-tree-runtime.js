(() => {
'use strict';
const state={loaded:false,index:null,trees:new Map()};
async function load(){
  if(state.loaded)return state;
  state.index=await fetch('data/skills/index_v38.json',{cache:'no-store'}).then(r=>r.json());
  await Promise.all((state.index.characters||[]).map(async x=>{const t=await fetch(`data/skills/${x.file}`,{cache:'no-store'}).then(r=>r.json());state.trees.set(x.id,t)}));
  state.loaded=true;return state;
}
function ensureSave(save){
  save.skillTrees=save.skillTrees||{};
  for(const cid of state.trees.keys())save.skillTrees[cid]=Object.assign({unlocked:[],freeResetUsed:false,lastPreview:null},save.skillTrees[cid]||{});
  return save.skillTrees;
}
function tree(cid){return state.trees.get(cid)||null}
function node(cid,id){return tree(cid)?.nodes?.find(n=>n.id===id)||null}
function canUnlock(save,cid,id){ensureSave(save);const n=node(cid,id),st=save.skillTrees[cid],p=save.characters?.[cid];if(!n||!p)return{ok:false,reason:'角色或技能不存在'};if(st.unlocked.includes(id))return{ok:false,reason:'已学习'};if((p.skillPoints||0)<(n.cost||1))return{ok:false,reason:'技能点不足'};if((n.requires||[]).some(x=>!st.unlocked.includes(x)))return{ok:false,reason:'需要先学习前置节点'};return{ok:true,node:n}}
function preview(save,cid,id){const c=canUnlock(save,cid,id);if(!c.ok)return c;const st=save.skillTrees[cid],p=save.characters[cid];st.lastPreview={nodeId:id,cost:c.node.cost||1,pointsBefore:p.skillPoints||0,pointsAfter:(p.skillPoints||0)-(c.node.cost||1),effect:c.node.effect};return{ok:true,preview:st.lastPreview,node:c.node}}
function confirm(save,cid,id){const c=canUnlock(save,cid,id);if(!c.ok)return c;const p=save.characters[cid],st=save.skillTrees[cid];p.skillPoints-=c.node.cost||1;st.unlocked.push(id);st.lastPreview=null;return{ok:true,node:c.node}}
function countMarrow(save){const p=save.cultivation?.v37?.alchemy?.pills?.marrow_pill||{};return Object.values(p).reduce((a,b)=>a+Number(b||0),0)}
function consumeMarrow(save){const p=save.cultivation?.v37?.alchemy?.pills?.marrow_pill||{};for(const q of ['low','mid','high','supreme'])if((p[q]||0)>0){p[q]--;return true}return false}
function reset(save,cid){ensureSave(save);const st=save.skillTrees[cid],p=save.characters?.[cid];if(!st||!p)return{ok:false,reason:'角色不存在'};if(!st.unlocked.length)return{ok:false,reason:'当前没有已学习节点'};if(st.freeResetUsed&&!consumeMarrow(save))return{ok:false,reason:'需要 1 枚洗髓丹'};const refund=st.unlocked.reduce((s,id)=>s+(node(cid,id)?.cost||1),0);p.skillPoints=(p.skillPoints||0)+refund;st.unlocked=[];st.lastPreview=null;if(!st.freeResetUsed)st.freeResetUsed=true;return{ok:true,refund,usedFree:st.freeResetUsed&&countMarrow(save)>=0}}
function effects(save,cid){ensureSave(save);const out={};for(const id of save.skillTrees[cid]?.unlocked||[]){const e=node(cid,id)?.effect||{};for(const [k,v] of Object.entries(e))out[k]=(out[k]||0)+Number(v||0)}return out}
window.YaraV38Skills={load,ensureSave,tree,node,preview,confirm,reset,effects,countMarrow,state};
})();
