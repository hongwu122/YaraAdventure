(() => {
 'use strict';let current=null,pose='idle',direction='right';
 function mount(c){current=c;pose='idle';direction='right';window.YaraV80?.mountShowcase(c.id);}
 function play(name){pose=({Idle:'idle',Victory:'victory',Cultivate:'cultivate_idle',Run:'run',Attack:'attack_1',Jump:'double_jump',Hurt:'hurt_light'})[name]||name;window.YaraV80?.showcasePose(pose,direction);return true;}
 function setAzimuth(a){direction=(a===270||a===180)?'left':'right';window.YaraV80?.showcasePose(pose,direction);}
 function deactivate(){window.YaraV80?.stopShowcase();}
 document.querySelectorAll('[data-v66-anim]').forEach(b=>b.onclick=()=>play(b.dataset.v66Anim));
 document.querySelectorAll('[data-v44-view]').forEach(b=>b.onclick=()=>setAzimuth(b.dataset.v44View==='left'?270:0));
 document.getElementById('anglePrev').onclick=()=>setAzimuth(270);document.getElementById('angleNext').onclick=()=>setAzimuth(0);
 document.getElementById('v44ViewReset').onclick=()=>play('Idle');
 window.V44CharacterViewer={mount,play,deactivate,setAzimuth,reset:()=>play('Idle')};
})();