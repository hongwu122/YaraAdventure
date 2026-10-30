(() => {
'use strict';
const profiles={
eq_wood_sword:{art:'wood',name:'木剑清风',scale:1,status:null},
eq_bamboo_blade:{art:'bamboo',name:'翠竹缠灵',scale:1.04,status:'root'},
eq_spirit_saber:{art:'spirit',name:'流光凝霜',scale:1.07,status:'slow'},
eq_amethyst_sword:{art:'amethyst',name:'紫霄破甲',scale:1.10,status:'armor_break'},
eq_peach_blossom_sword:{art:'peach',name:'桃华灼影',scale:1.12,status:'burn'},
eq_sun_sword:{art:'sun',name:'曜日神焰',scale:1.16,status:'burn'}
};
function equipped(save,cid){const g=window.YaraV80?.equipped(save,cid)||[];return profiles[g.find(x=>x.slot==='weapon')?.item.id]||null;}
function meta(original,save,cid){const p=equipped(save,cid);return p?{...original,skillScale:(original.skillScale||1)*p.scale,status:p.status||original.status}:original;}
window.YaraV85Weapons={profiles,equipped,meta};
})();
