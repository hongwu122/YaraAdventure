(() => {
  'use strict';
  const S={bound:false,angle:0,zoom:1,drag:false,x:0,last:performance.now(),raf:0,active:false};
  const $=id=>document.getElementById(id);
  function wrapDeg(v){v%=360;return v<0?v+360:v;}
  function setStatus(text){const el=$('modelStatus');if(el)el.textContent=text;}
  function apply(){
    const img=$('characterStageImage');if(!img)return;
    const a=wrapDeg(S.angle),rad=a*Math.PI/180;
    // Pseudo-3D fallback: the input azimuth is full 360°, while the approved single-view master
    // is preserved and only perspective/light are changed. No sprite sheet is ever substituted.
    const tilt=Math.sin(rad)*24,back=Math.cos(rad)<-.12;
    const lean=Math.sin(rad)*10;
    img.style.transform=`perspective(1200px) rotateY(${tilt}deg) translateX(${lean}px) scale(${S.zoom})`;
    img.style.filter=`drop-shadow(0 28px 34px rgba(0,0,0,.42)) brightness(${back?0.74:1}) saturate(${back?0.78:1})`;
    img.classList.toggle('rear-proxy',back);
    const label=$('angleLabel');if(label)label.textContent=`${Math.round(a)}° · ${Math.abs(a)<25||a>335?'正面':a<155?'右侧':a<205?'背面代理':a<335?'左侧':'正面'}`;
  }
  function tick(now){if(S.active&&!S.drag){const dt=Math.min(.05,(now-S.last)/1000);S.angle=wrapDeg(S.angle+dt*5);apply();}S.last=now;S.raf=requestAnimationFrame(tick)}
  async function mount(character){
    const stage=$('characterTurntable'),img=$('characterStageImage');if(!stage||!img||!character)return;
    if(character.id!=='Yara')return;
    S.active=true;
    img.src='assets/characters/Yara_v43/showcase/yara_front_master.webp';
    img.alt='Yara V4.3 定稿角色展示';
    img.classList.add('v43-yara-master');
    const model=window.YaraModelAdapter?.descriptor?.(character);
    if(model?.ready&&window.YaraModelAdapter?.canUseGLB?.(character)){
      try{await window.YaraModelAdapter.mountGLB(character,stage,{orbit:true,zoom:true,autoRotate:true});img.hidden=true;setStatus('GLB · Three.js 实时模型');return;}catch(err){console.warn('[V4.3] GLB fallback',err);}
    }
    img.hidden=false;setStatus('V4.3 伪3D预览 · GLB/Three.js 接口已就绪');
    apply();
    if(!S.bound){S.bound=true;stage.dataset.v43Viewer='1';
      stage.addEventListener('pointerdown',e=>{if(e.target.closest('button'))return;S.drag=true;S.x=e.clientX;stage.classList.add('dragging');try{stage.setPointerCapture(e.pointerId)}catch{}});
      stage.addEventListener('pointermove',e=>{if(!S.drag)return;const dx=e.clientX-S.x;S.x=e.clientX;S.angle=wrapDeg(S.angle+dx*.65);apply()});
      const end=()=>{S.drag=false;stage.classList.remove('dragging')};stage.addEventListener('pointerup',end);stage.addEventListener('pointercancel',end);
      stage.addEventListener('wheel',e=>{e.preventDefault();S.zoom=Math.max(.74,Math.min(1.28,S.zoom*(e.deltaY>0?.94:1.06)));apply()},{passive:false});
      $('anglePrev')?.addEventListener('click',()=>{S.angle=wrapDeg(S.angle-45);apply()});
      $('angleNext')?.addEventListener('click',()=>{S.angle=wrapDeg(S.angle+45);apply()});
      stage.addEventListener('dblclick',()=>{S.angle=0;S.zoom=1;apply()});
      if(!S.raf)S.raf=requestAnimationFrame(tick);
    }
  }
  function deactivate(){S.active=false;}
  window.V43CharacterViewer={mount,deactivate,state:S};
})();
