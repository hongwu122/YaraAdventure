(() => {
'use strict';
const MAP={
  bgm:{menu:'assets/v81/audio/menu.wav',level:'assets/v81/audio/level.wav',boss:'assets/v81/audio/boss.wav'},
  sfx:{attack:'assets/v81/audio/attack.wav',hit:'assets/v81/audio/hit.wav',jump:'assets/v81/audio/jump.wav',dash:'assets/v81/audio/dash.wav',enemyAttack:'assets/v81/audio/enemy_attack.wav',bossAttack:'assets/v81/audio/boss_attack.wav',clear:'assets/v81/audio/clear.wav',muyu:'assets/v81/audio/muyu.wav',alchemy:'assets/v81/audio/alchemy.wav',lightning:'assets/v81/audio/lightning.wav'}
};
const state={unlocked:false,currentBgm:null,bgm:null,settings:{masterVolume:.75,musicVolume:.55,sfxVolume:.8,muted:false}};
function volume(kind){if(state.settings.muted)return 0;return Math.max(0,Math.min(1,(state.settings.masterVolume??.75)*(kind==='bgm'?(state.settings.musicVolume??.55):(state.settings.sfxVolume??.8))))}
function configure(settings={}){Object.assign(state.settings,settings||{});if(state.bgm)state.bgm.volume=volume('bgm')}
function unlock(){state.unlocked=true;playBgm(state.currentBgm||'menu')}
function make(url,loop=false){const a=new Audio(url);a.preload='auto';a.loop=loop;a.addEventListener('error',()=>{if(a.getAttribute('src'))console.warn('[audio] unable to play',url)},{once:true});return a}
function playBgm(name){state.currentBgm=name;const url=MAP.bgm[name]||MAP.bgm.level;if(!state.unlocked)return;if(state.bgm&&state.bgm.dataset?.url===url){state.bgm.volume=volume('bgm');state.bgm.play().catch(()=>{});return}if(state.bgm){state.bgm.pause();state.bgm.src=''}const a=make(url,true);a.dataset.url=url;a.volume=volume('bgm');state.bgm=a;a.play().catch(()=>{})}
function stopBgm(){if(state.bgm){state.bgm.pause();state.bgm=null}state.currentBgm=null}
function playSfx(name,rate=1){if(!state.unlocked)return;const url=MAP.sfx[name];if(!url)return;const a=make(url,false);a.volume=volume('sfx');a.playbackRate=Math.max(.6,Math.min(1.5,rate));a.play().catch(()=>{})}
window.addEventListener('pointerdown',unlock,{once:true});window.addEventListener('keydown',unlock,{once:true});
window.YaraV4Audio={configure,unlock,playBgm,stopBgm,playSfx,state,map:MAP};
})();
