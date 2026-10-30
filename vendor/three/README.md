# Optional local Three.js runtime

V4.4 does not download libraries at runtime. To activate the real GLB path after a production `yara.glb` is installed, place compatible ES modules here:

- `three.module.js`
- `GLTFLoader.js`
- `OrbitControls.js`

`GLTFLoader.js` and `OrbitControls.js` should import the local Three.js module (or be adjusted accordingly). The viewer does not import these files while `model.installed=false`, so the offline game has no 404/error and uses the approved Yara fallback.
