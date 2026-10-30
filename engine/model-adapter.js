(() => {
  'use strict';
  const providers=new Map();
  function descriptor(character){
    const render=character?.render||{},model=render.model||{};
    return {mode:render.mode||'pseudo3d-webp',type:model.type||'glb',path:model.path||null,config:model.config||null,loader:model.loader||'threejs',scale:Number(model.scale||1),installed:model.installed!==false,ready:Boolean(model.path)&&model.installed!==false};
  }
  function registerProvider(name,provider){if(name&&provider)providers.set(name,provider);}
  function providerFor(character){const d=descriptor(character);return providers.get(d.loader)||null;}
  function canUseGLB(character){const d=descriptor(character),p=providerFor(character);return !!(d.ready&&d.type==='glb'&&p&&typeof p.mount==='function');}
  async function mountGLB(character,mountEl,options={}){
    const d=descriptor(character),p=providerFor(character);
    if(!d.ready)throw new Error('GLB model file is not installed; using the V4.4 approved pseudo-3D fallback.');
    if(!p)throw new Error(`Renderer provider '${d.loader}' is not registered.`);
    return p.mount({character,mountEl,descriptor:d,options});
  }
  /*
    Local Three.js contract:
      YaraModelAdapter.registerProvider('threejs', {
        async mount({character,mountEl,descriptor,options}) {
          // Load descriptor.path with a local GLTFLoader, create scene/camera/lights,
          // return {dispose(), setAzimuth(deg), setZoom(v), play(name)}.
        }
      });
    No CDN dependency is forced in V4.4; dropping a validated local provider + GLB activates it.
  */
  window.YaraModelAdapter={descriptor,registerProvider,providerFor,canUseGLB,mountGLB};
})();
