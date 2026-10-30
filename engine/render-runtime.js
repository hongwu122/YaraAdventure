(() => {
'use strict';
const LEVELS={high:{dpr:2,particle:1,label:'高'},medium:{dpr:1.5,particle:.68,label:'中'},low:{dpr:1,particle:.38,label:'低'}};
const state={quality:'high',logicalW:1920,logicalH:1080,effectiveDpr:1,canvas:null,ctx:null};
function configure(canvas,ctx,quality='high',w=1920,h=1080){
  state.canvas=canvas;state.ctx=ctx;state.logicalW=w;state.logicalH=h;state.quality=LEVELS[quality]?quality:'high';
  const cap=LEVELS[state.quality].dpr, dpr=Math.max(1,Math.min(cap,window.devicePixelRatio||1));state.effectiveDpr=dpr;
  const pw=Math.round(w*dpr),ph=Math.round(h*dpr);
  if(canvas.width!==pw||canvas.height!==ph){canvas.width=pw;canvas.height=ph;}
  ctx.setTransform(dpr,0,0,dpr,0,0);ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality=state.quality==='low'?'medium':'high';
  canvas.dataset.logicalWidth=String(w);canvas.dataset.logicalHeight=String(h);canvas.dataset.quality=state.quality;
  return state;
}
function setQuality(q){return configure(state.canvas,state.ctx,q,state.logicalW,state.logicalH)}
function particleScale(){return LEVELS[state.quality]?.particle||1}
function label(){return LEVELS[state.quality]?.label||'高'}
window.YaraV4Render={configure,setQuality,particleScale,label,state,levels:LEVELS};
})();
