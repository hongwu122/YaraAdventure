(() => {
 'use strict';
 const imageCache=new Map(), atlas={};let showcase=null,showcaseId='Yara',pose='idle',direction='right',equipmentStage=null,gearId='Yara',last=performance.now(),elapsed=0,previewRuntime=null;
 function image(url){if(!imageCache.has(url)){const im=new Image();im.src=url;imageCache.set(url,im)}return imageCache.get(url)}
 fetch('assets/v82/items/icons.json').then(r=>r.json()).then(x=>Object.assign(atlas,x)).catch(console.error);
 const aliases={eq_wood_sword:'eq_bamboo_blade',eq_travel_robe:'eq_cloud_robe',eq_cloth_band:'eq_bamboo_headband',eq_hemp_belt:'eq_jade_waist',eq_linen_sash:'eq_jade_waist',eq_spirit_belt:'eq_jade_waist',eq_jade_necklace:'eq_shell_necklace',eq_lotus_necklace:'eq_shell_necklace',eq_spirit_talisman:'eq_peach_talisman',eq_sun_talisman:'eq_peach_talisman'};
 function icon(id){return atlas[id]||atlas[aliases[id]]||null}
 function equipped(save,cid){const econ=window.YaraV36Economy,p=save?.characters?.[cid];return Object.entries(p?.equipment||{}).map(([slot,uid])=>{const inst=uid&&econ?.equipmentInstance(save,uid);return inst?{slot,item:econ.getItem(inst.itemId)}:null}).filter(x=>x?.item)}
 function drawWearables(ctx,cid,anim,dir,time,x,y,w,h,save){
  const order=['body','shoes','waist','necklace','head','talisman','weapon'];const gear=equipped(save,cid).sort((a,b)=>order.indexOf(a.slot)-order.indexOf(b.slot));if(!gear.length)return;
  ctx.save();ctx.translate(x+w/2,y);if(dir==='left')ctx.scale(-1,1);
  const bob=anim==='run'?Math.sin(time*20)*h*.009:0;ctx.translate(0,bob);
  const locations={head:[-.03,.22,.21,.16],body:[.025,.68,.34,.255],waist:[.02,.765,.21,.08],shoes:[.02,.866,.23,.095],necklace:[.04,.60,.13,.10],talisman:[.16,.76,.10,.13],weapon:[.20,.68,.24,.36]};
  const robes={eq_travel_robe:'linen_robe',eq_cloud_robe:'cloud_robe',eq_star_brocade:'star_robe',eq_mystic_mail:'jade_armor'};const shoes={eq_straw_shoes:'straw_shoes',eq_cloud_shoes:'cloud_shoes',eq_thunder_boots:'thunder_boots',eq_heaven_step:'thunder_boots'};
  for(const {slot,item} of gear){const garment=slot==='body'?(robes[item.id]||'linen_robe'):slot==='shoes'?(shoes[item.id]||'leather_shoes'):null;const url=garment?`assets/v82/wearables/${garment}.png`:icon(item.id)||item.icon,im=image(url);if(!im.complete||!im.naturalWidth)continue;const loc=locations[slot]?.slice();const table=window.YaraV31?.animations?.get(cid),clip=window.YaraV31?.animations?.clip(cid,anim);const fi=clip?Math.min(clip.frames-1,Math.floor(time*(clip.fps||12))%(clip.frames||1)):0;const placement=clip?.wearableAnchors?.[fi]?.[slot];if(loc&&placement)loc.splice(0,4,...placement);const legacyFi=Math.min(5,fi);const maps={hurt_light:[.74,.80,.76,.76,.78,.77],hurt_heavy:[.74,.80,.76,.76,.78,.77],dash_L:[.80,.76,.73,.74,.80,.77],musou:[.80,.72,.70,.74,.83,.77],stun:[.75,.78,.79,.77,.77,.77]};if(loc&&!placement&&!clip?.frameImages&&maps[anim]){const delta=maps[anim][legacyFi]-.765;if(['body','waist','necklace','talisman','weapon'].includes(slot))loc[1]+=delta;}if(!loc)continue;let [cx,cy,sw,sh]=loc;
   ctx.save();ctx.translate(cx*w,cy*h);if(slot==='weapon'){ctx.rotate((anim.startsWith('attack')||anim.startsWith('skill')?Math.sin(time*13)*.8:-.35));}
   // Keep item aspect ratio inside the attachment box.
   if(garment){ctx.drawImage(im,-sw*w/2,-sh*h/2,sw*w,sh*h);}else{const k=Math.min(sw*w/im.naturalWidth,sh*h/im.naturalHeight);ctx.drawImage(im,-im.naturalWidth*k/2,-im.naturalHeight*k/2,im.naturalWidth*k,im.naturalHeight*k);}ctx.restore();
  }ctx.restore();
 }
 function createCanvas(host,id){let c=host.querySelector('#'+id);if(!c){c=document.createElement('canvas');c.id=id;c.width=576;c.height=576;c.className='v80-actor';host.appendChild(c)}return c;}
 function mountShowcase(cid){showcaseId=cid;pose='idle';elapsed=0;const host=document.getElementById('characterTurntable');showcase=createCanvas(host,'v80Showcase');document.getElementById('characterStageImage').style.display='none';document.getElementById('modelStatus').textContent='2D 逐帧动作 · 当前穿戴';document.getElementById('angleLabel').textContent='右向';}
 function mountEquipment(host,cid){gearId=cid;equipmentStage=createCanvas(host.querySelector('.v82-character-pane')||host,'v80Equipment');host.querySelector('#v47YaraImage').style.display='none';const hint=host.querySelector('#v47ViewerHint');if(hint)hint.textContent='当前角色 · 2D 穿戴外观';}
 function showcasePose(name,dir){pose=name;direction=dir;elapsed=0;document.getElementById('angleLabel').textContent=dir==='left'?'左向':'右向';document.querySelectorAll('[data-v66-anim]').forEach(b=>b.classList.toggle('active',b.dataset.pose===name));}
 function draw(c,cid,anim,dir,t){const ctx=c.getContext('2d');ctx.clearRect(0,0,c.width,c.height);if(!previewRuntime){previewRuntime=new window.YaraV33.ActionSpriteRuntime(window.YaraV31.animations);previewRuntime.images=imageCache;}const runtime=previewRuntime;
  ctx.fillStyle='rgba(0,0,0,.18)';ctx.beginPath();ctx.ellipse(288,550,100,12,0,0,Math.PI*2);ctx.fill();
  runtime.draw(ctx,cid,anim,dir,t,28,26,520,520,{equipment:true,save:window.YaraV35?.getSave?.()});
 }
 function tick(now){const dt=Math.min(.05,(now-last)/1000);last=now;elapsed+=dt;
  if(showcase&&document.getElementById('characterView').classList.contains('active'))draw(showcase,showcaseId,pose,direction,elapsed);
  if(equipmentStage?.isConnected&&document.getElementById('economyView').classList.contains('active'))draw(equipmentStage,gearId,'idle','right',elapsed);
  document.querySelectorAll('canvas[data-help-pose]').forEach(c=>{if(document.getElementById('helpView').classList.contains('active'))draw(c,'Yara',c.dataset.helpPose,'right',elapsed%1.2)});
  requestAnimationFrame(tick);
 }
 const controls=document.querySelector('.v66-animation-controls');controls.innerHTML=[['Idle','待机','idle'],['Run','奔跑','run'],['Attack','攻击','attack_1'],['Jump','跳跃','double_jump'],['Hurt','受击','hurt_light'],['Victory','胜利','victory'],['Cultivate','修行','cultivate_idle']].map(([id,label,p])=>`<button data-v66-anim="${id}" data-pose="${p}">${label}</button>`).join('');controls.querySelectorAll('button').forEach(b=>b.onclick=()=>window.V44CharacterViewer.play(b.dataset.v66Anim));
 document.querySelector('.v44-view-controls').innerHTML='<button id="v80FaceRight">右向</button><button id="v80FaceLeft">左向</button>';
 document.getElementById('v80FaceRight').onclick=()=>showcasePose(pose,'right');document.getElementById('v80FaceLeft').onclick=()=>showcasePose(pose,'left');
 document.querySelectorAll('[data-v69-action]').forEach(im=>{const c=document.createElement('canvas');c.width=c.height=576;c.dataset.helpPose=im.dataset.v69Action;im.style.display='none';im.parentElement.appendChild(c);im.closest('article').classList.remove('v69-v66-fallback');});
 window.YaraV80={icon,drawWearables,mountShowcase,mountEquipment,showcasePose,stopShowcase:()=>{showcase=null},equipped};requestAnimationFrame(tick);
})();
