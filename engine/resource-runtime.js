(() => {
'use strict';
class ResourceManager{
  constructor(){this.images=new Map();this.scopes=new Map();this.activeScope=null;}
  loadImage(key,url,scope='core'){
    const old=this.images.get(key);if(old?.url===url){this._tag(scope,key);return Promise.resolve(old.image)}
    return new Promise(resolve=>{const im=new Image();im.decoding='async';const rec={image:im,url,scope,key};this.images.set(key,rec);this._tag(scope,key);im.onload=()=>resolve(im);im.onerror=()=>{console.warn('[resource] image unavailable',url);resolve(im)};im.src=url;});
  }
  _tag(scope,key){if(!this.scopes.has(scope))this.scopes.set(scope,new Set());this.scopes.get(scope).add(key)}
  image(key){return this.images.get(key)?.image||null}
  releaseScope(scope){const keys=this.scopes.get(scope);if(!keys)return;for(const key of keys){const rec=this.images.get(key);if(rec&&rec.scope===scope){try{rec.image.onload=null;rec.image.onerror=null;rec.image.src=''}catch{}this.images.delete(key)}}this.scopes.delete(scope)}
  beginLevel(scope){if(this.activeScope&&this.activeScope!==scope)this.releaseScope(this.activeScope);this.activeScope=scope}
  stats(){return{images:this.images.size,scopes:[...this.scopes.keys()]}}
}
window.YaraV4Resources={ResourceManager};
})();
