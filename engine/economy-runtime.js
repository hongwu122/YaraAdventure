(() => {
'use strict';
const state={loaded:false,items:null,loot:null,shop:null,itemMap:new Map(),rarities:{},slots:{}};
const uid=()=>`eq_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,8)}`;
const randInt=(a,b)=>Math.floor(a+Math.random()*(b-a+1));
function weighted(entries){const total=entries.reduce((s,e)=>s+Number(e.weight||0),0);let r=Math.random()*total;for(const e of entries){r-=Number(e.weight||0);if(r<=0)return e}return entries[entries.length-1]||null}
async function load(){
  if(state.loaded)return state;
  const [items,loot,shop]=await Promise.all([
    fetch('data/economy/items.json',{cache:'no-store'}).then(r=>r.json()),
    fetch('data/economy/loot_tables.json',{cache:'no-store'}).then(r=>r.json()),
    fetch('data/economy/shop.json',{cache:'no-store'}).then(r=>r.json())
  ]);
  state.items=items;state.loot=loot;state.shop=shop;state.rarities=items.rarities||{};state.slots=items.slots||{};
  state.itemMap=new Map((items.items||[]).map(x=>[x.id,x]));state.loaded=true;return state;
}
function getItem(id){return state.itemMap.get(id)||null}
function ensureSave(save){
  save.inventory=save.inventory||{};
  save.inventory.equipment=Array.isArray(save.inventory.equipment)?save.inventory.equipment:[];
  save.inventory.consumables=save.inventory.consumables||{};
  save.inventory.materials=save.inventory.materials||{};
  save.inventory.quest=save.inventory.quest||{};
  save.shop=save.shop||{purchases:{}};
  if(!save.inventory.v36Initialized){save.inventory.v36Initialized=true;save.inventory.equipment.push({uid:uid(),itemId:'eq_wood_sword',acquiredAt:Date.now()});save.inventory.consumables.potion_red=(save.inventory.consumables.potion_red||0)+3;save.inventory.consumables.potion_blue=(save.inventory.consumables.potion_blue||0)+2;}
  save.characters=save.characters||{};
  for(const p of Object.values(save.characters)){
    if(!p||typeof p!=='object')continue;
    p.equipment=p.equipment||{};
    for(const slot of Object.keys(state.slots||{weapon:1,head:1,body:1,waist:1,shoes:1,talisman:1,necklace:1})) if(!(slot in p.equipment)) p.equipment[slot]=null;
  }
  if(save.profile){save.profile.equipment=save.profile.equipment||{};if(!('necklace' in save.profile.equipment))save.profile.equipment.necklace=null}
  return save.inventory;
}
function addItem(save,itemId,qty=1){
  const item=getItem(itemId);if(!item||qty<=0)return[];ensureSave(save);const added=[];
  if(item.category==='equipment'){
    for(let i=0;i<qty;i++){const inst={uid:uid(),itemId,acquiredAt:Date.now()};save.inventory.equipment.push(inst);added.push(inst)}
  }else{
    const key=item.category==='consumable'?'consumables':item.category==='material'?'materials':'quest';
    save.inventory[key][itemId]=(save.inventory[key][itemId]||0)+qty;added.push({itemId,qty});
  }
  return added;
}
function count(save,itemId){ensureSave(save);const item=getItem(itemId);if(!item)return 0;if(item.category==='equipment')return save.inventory.equipment.filter(x=>x.itemId===itemId).length;const key=item.category==='consumable'?'consumables':item.category==='material'?'materials':'quest';return save.inventory[key][itemId]||0}
function removeStack(save,itemId,qty=1){const item=getItem(itemId);if(!item||item.category==='equipment')return false;ensureSave(save);const key=item.category==='consumable'?'consumables':item.category==='material'?'materials':'quest',n=save.inventory[key][itemId]||0;if(n<qty)return false;save.inventory[key][itemId]=n-qty;if(save.inventory[key][itemId]<=0)delete save.inventory[key][itemId];return true}
function equipmentInstance(save,uidValue){ensureSave(save);return save.inventory.equipment.find(x=>x.uid===uidValue)||null}
function equippedUids(save){const s=new Set();for(const p of Object.values(save.characters||{}))for(const u of Object.values(p?.equipment||{}))if(u)s.add(u);return s}
function equip(save,charId,uidValue){ensureSave(save);const p=save.characters?.[charId];const inst=equipmentInstance(save,uidValue);const item=inst&&getItem(inst.itemId);if(!p||!item||item.category!=='equipment')return {ok:false};p.equipment=p.equipment||{};for(const cid of Object.keys(save.characters||{})){const ep=save.characters[cid]?.equipment||{};for(const s of Object.keys(ep))if(ep[s]===uidValue)ep[s]=null}const previous=p.equipment[item.slot]||null;p.equipment[item.slot]=uidValue;return {ok:true,slot:item.slot,previous,item}}
function unequip(save,charId,slot){const p=save.characters?.[charId];if(!p?.equipment)return false;p.equipment[slot]=null;return true}
function equipmentBonus(save,charId='Yara'){ensureSave(save);const p=save.characters?.[charId]||save.profile||{},sum={hp:0,mp:0,attack:0,defense:0,crit:0,speed:0,cooldown:0,drop:0};for(const u of Object.values(p.equipment||{})){if(!u)continue;const inst=equipmentInstance(save,u),item=inst&&getItem(inst.itemId);if(!item?.stats)continue;for(const [k,v] of Object.entries(item.stats))sum[k]=(sum[k]||0)+Number(v||0)}return sum}
function compare(save,charId,uidValue){const inst=equipmentInstance(save,uidValue),item=inst&&getItem(inst.itemId);if(!item)return null;const currentUid=save.characters?.[charId]?.equipment?.[item.slot],curInst=currentUid&&equipmentInstance(save,currentUid),cur=curInst&&getItem(curInst.itemId);const keys=new Set([...Object.keys(cur?.stats||{}),...Object.keys(item.stats||{})]),delta={};for(const k of keys)delta[k]=Number(item.stats?.[k]||0)-Number(cur?.stats?.[k]||0);return {candidate:item,current:cur||null,delta}}
function disassemble(save,uids){ensureSave(save);const equipped=equippedUids(save),rar=state.rarities;let iron=0,dust=0,stones=0,removed=0;const set=new Set(uids||[]);save.inventory.equipment=save.inventory.equipment.filter(inst=>{if(!set.has(inst.uid)||equipped.has(inst.uid))return true;const item=getItem(inst.itemId),rank=rar[item?.rarity]?.rank||0;iron+=1+rank;dust+=Math.max(0,rank);stones+=2+rank*4;removed++;return false});if(iron)addItem(save,'mat_refined_iron',iron);if(dust)addItem(save,'mat_spirit_dust',dust);save.cultivation.stones=(save.cultivation.stones||0)+stones;return {removed,iron,dust,stones}}
function sell(save,selection){ensureSave(save);const equipped=equippedUids(save);let stones=0,removed=0;const eqSet=new Set(selection?.equipment||[]);save.inventory.equipment=save.inventory.equipment.filter(inst=>{if(!eqSet.has(inst.uid)||equipped.has(inst.uid))return true;const item=getItem(inst.itemId);stones+=item?.sell||0;removed++;return false});for(const group of ['consumables','materials'])for(const [itemId,qty] of Object.entries(selection?.[group]||{})){const n=Math.min(qty,save.inventory[group][itemId]||0),item=getItem(itemId);if(n>0&&item?.sell>0){save.inventory[group][itemId]-=n;if(save.inventory[group][itemId]<=0)delete save.inventory[group][itemId];stones+=item.sell*n;removed+=n}}save.cultivation.stones=(save.cultivation.stones||0)+stones;return {removed,stones}}
function tableForEnemy(e){if(e?.lootTable)return e.lootTable;if(e?.boss)return e.type==='peachGuardian'?'boss_peach':'boss_generic';if(e?.elite)return'elite';if(e?.profileKey==='redpanda'||e?.type==='redpanda')return'redpanda';return'normal'}
function lootPlan(e){const level=Math.max(1,Number(e.level)||1),cap=level>=18?5:level>=15?4:level>=11?3:level>=7?2:level>=4?1:0;const rank=e.boss?cap:e.elite?Math.max(0,cap-1):0;const pool=(state.items?.items||[]).filter(i=>i.category==='equipment'&&(state.rarities[i.rarity]?.rank||0)===rank);let hash=0;for(const ch of String(e.type||e.profileKey||'normal'))hash=(hash*31+ch.charCodeAt(0))>>>0;const start=(e.boss?(level-[1,4,7,11,15,18][rank])*3:hash+level*3)%Math.max(1,pool.length),candidates=Array.from({length:Math.min(3,pool.length)},(_,i)=>pool[(start+i)%pool.length].id);return{level,rank,candidates,chance:e.boss?.85:e.elite?.35:.12};}
function rollLoot(e){const plan=lootPlan(e),scale=e.boss?8:e.elite?3:1,out=[{kind:'stones',qty:randInt(1+Math.floor(plan.level/3),3+plan.level)*scale},{kind:'souls',qty:randInt(2,4)+plan.level*(e.boss?12:e.elite?4:1)}];if(plan.candidates.length&&Math.random()<plan.chance)out.push({itemId:plan.candidates[randInt(0,plan.candidates.length-1)],qty:1});return out;}

function shopStock(save){const unlocked=Number(save.unlocked||1);return(state.shop?.stock||[]).filter(s=>unlocked>=Number(s.unlockLevel||1)).map(s=>({...s,item:getItem(s.item)})).filter(x=>x.item)}
function buy(save,itemId,qty=1){const entry=shopStock(save).find(x=>x.item?.id===itemId);const item=getItem(itemId);if(!entry||!item||!item.buy)return {ok:false,reason:'尚未解锁或不可购买'};qty=Math.floor(Number(qty));if(!Number.isFinite(qty)||qty<1)return {ok:false,reason:'购买数量无效'};const cost=item.buy*qty;if((save.cultivation.stones||0)<cost)return {ok:false,reason:'灵石不足'};save.cultivation.stones-=cost;addItem(save,itemId,qty);save.shop.purchases[itemId]=(save.shop.purchases[itemId]||0)+qty;return {ok:true,cost,item}}
function useConsumable(save,itemId,player){const item=getItem(itemId);if(!item||item.category!=='consumable'||!removeStack(save,itemId,1))return false;if(player&&item.effect?.hpFlat)player.hp=Math.min(player.maxHp,player.hp+item.effect.hpFlat);if(player&&item.effect?.mpFlat)player.mp=Math.min(player.maxMp,player.mp+item.effect.mpFlat);return true}
window.YaraV36Economy={state,load,getItem,ensureSave,addItem,count,equipmentInstance,equippedUids,equip,unequip,equipmentBonus,compare,disassemble,sell,rollLoot,lootPlan,shopStock,buy,useConsumable};
})();
