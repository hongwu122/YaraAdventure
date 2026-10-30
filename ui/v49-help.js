(() => {
'use strict';
const tabs=[...document.querySelectorAll('[data-help-tab]')];
const pages={controls:document.getElementById('v49HelpControls'),mechanics:document.getElementById('v49HelpMechanics')};
function show(id){tabs.forEach(b=>b.classList.toggle('active',b.dataset.helpTab===id));Object.entries(pages).forEach(([k,p])=>p?.classList.toggle('active',k===id));}
tabs.forEach(b=>b.addEventListener('click',()=>show(b.dataset.helpTab)));
window.V49Help={show};
})();
