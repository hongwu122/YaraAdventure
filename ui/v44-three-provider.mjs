/* V6.6 production Three.js provider. This module is only imported when model.installed=true. */
export async function installThreeProvider(){
  if(window.YaraModelAdapter?.providerFor?.({render:{model:{loader:'threejs',path:'x',installed:true}}})) return true;
  const THREE=await import('../vendor/three/three.module.js');
  const {GLTFLoader}=await import('../vendor/three/GLTFLoader.js');
  const {OrbitControls}=await import('../vendor/three/OrbitControls.js');
  window.YaraModelAdapter.registerProvider('threejs',{
    async mount({mountEl,descriptor,options}){
      const host=document.createElement('div');host.className='v44-three-host';mountEl.appendChild(host);
      const scene=new THREE.Scene();const camera=new THREE.PerspectiveCamera(28,1,.01,100);camera.position.set(0,1.05,3.4);
      const renderer=new THREE.WebGLRenderer({alpha:true,antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio||1,2));renderer.outputColorSpace=THREE.SRGBColorSpace;host.appendChild(renderer.domElement);
      const hemi=new THREE.HemisphereLight(0xfff4dd,0x1a2b3c,2.1);scene.add(hemi);const key=new THREE.DirectionalLight(0xffddb2,2.8);key.position.set(3,5,4);scene.add(key);const rim=new THREE.DirectionalLight(0x8fc8ff,1.5);rim.position.set(-4,3,-2);scene.add(rim);
      const controls=new OrbitControls(camera,renderer.domElement);controls.enablePan=false;controls.enableDamping=true;controls.target.set(0,.58,0);controls.minDistance=2.1;controls.maxDistance=5.2;controls.update();
      const gltf=await new Promise((resolve,reject)=>new GLTFLoader().load(descriptor.path,resolve,undefined,reject));const model=gltf.scene;model.scale.setScalar(descriptor.scale||1);scene.add(model);const mixer=new THREE.AnimationMixer(model);const clips=new Map(gltf.animations.map(c=>[c.name,c]));let current=null;
      function resize(){const r=mountEl.getBoundingClientRect(),w=Math.max(1,r.width),h=Math.max(1,r.height);renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix()}resize();const ro=new ResizeObserver(resize);ro.observe(mountEl);
      let raf=0,last=performance.now(),az=0,auto=true;function frame(now){const dt=Math.min(.05,(now-last)/1000);last=now;if(auto&&!controls._state){az+=dt*.08}mixer.update(dt);controls.update();renderer.render(scene,camera);raf=requestAnimationFrame(frame)}raf=requestAnimationFrame(frame);
      return {dispose(){cancelAnimationFrame(raf);ro.disconnect();controls.dispose();mixer.stopAllAction();model.traverse(o=>{o.geometry?.dispose?.();if(o.material){const ms=Array.isArray(o.material)?o.material:[o.material];ms.forEach(m=>{for(const k of Object.keys(m))if(m[k]?.isTexture)m[k].dispose?.();m.dispose?.()})}});renderer.dispose();host.remove()},setAzimuth(deg){const rad=deg*Math.PI/180,dist=camera.position.distanceTo(controls.target);camera.position.set(controls.target.x+Math.sin(rad)*dist,camera.position.y,controls.target.z+Math.cos(rad)*dist);controls.update()},setZoom(v){const dist=3.4/Math.max(.72,Math.min(1.32,v)),dir=camera.position.clone().sub(controls.target).normalize();camera.position.copy(controls.target.clone().add(dir.multiplyScalar(dist)));controls.update()},reset(){camera.position.set(0,1.05,3.4);controls.target.set(0,.58,0);controls.update()},play(name){const clip=clips.get(name);if(!clip)return false;if(current)current.fadeOut(.12);current=mixer.clipAction(clip);current.reset().fadeIn(.12).play();return true},tick(){}};
    }
  });
  return true;
}
