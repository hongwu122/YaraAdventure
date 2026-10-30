(()=>{
  const root=document.documentElement;
  const views=['menuView','levelView','characterView','shanhaiView','growthHallView','cultivateView','economyView','skillTreeView','helpView','settingsView'];
  function update(){
    const w=window.innerWidth,h=window.innerHeight;
    const scale=Math.max(.68,Math.min(1.08,w/1600,h/900));
    root.style.setProperty('--v67-scale',scale.toFixed(4));
    root.dataset.v67Height=h<=700?'700':h<=768?'768':h<=820?'820':h<=900?'900':'full';
    root.dataset.v67Width=w<=1120?'1120':w<=1300?'1300':'full';
  }
  function measure(view){
    const el=typeof view==='string'?document.getElementById(view):view;
    if(!el)return null;
    const r=el.getBoundingClientRect();
    return {id:el.id,viewport:[innerWidth,innerHeight],client:[el.clientWidth,el.clientHeight],scroll:[el.scrollWidth,el.scrollHeight],overflowX:el.scrollWidth>el.clientWidth+1,overflowY:el.scrollHeight>el.clientHeight+1,rect:[Math.round(r.left),Math.round(r.top),Math.round(r.right),Math.round(r.bottom)]};
  }
  window.YaraV67Layout={update,measure,audit:()=>views.map(measure)};
  addEventListener('resize',update,{passive:true});
  addEventListener('orientationchange',update,{passive:true});
  update();
})();
