(() => {
'use strict';
class ObjectPool{
  constructor(factory,reset,max=300){this.factory=factory;this.reset=reset;this.max=max;this.free=[];this.created=0;}
  acquire(seed={}){const o=this.free.pop()||this.factory();if(!o.__poolCreated){o.__poolCreated=true;this.created++;}this.reset(o,seed);return o}
  release(o){if(!o||this.free.length>=this.max)return;this.free.push(o)}
  stats(){return{created:this.created,free:this.free.length,max:this.max}}
}
const particlePool=new ObjectPool(()=>({}), (o,s)=>{for(const k of Object.keys(o))if(k!=='__poolCreated')delete o[k];Object.assign(o,s)},600);
const enemyPool=new ObjectPool(()=>({}), (o,s)=>{for(const k of Object.keys(o))if(k!=='__poolCreated')delete o[k];Object.assign(o,s)},120);
window.YaraV4Pools={ObjectPool,particlePool,enemyPool};
})();
