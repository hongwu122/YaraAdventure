# Yara V4.4 GLB production slot

`yara.glb` is intentionally NOT included until a high-quality model can be produced from the approved white-outfit Yara master.

The runtime checks `installed` and the file availability; when unavailable it falls back to the approved high-resolution showcase image without showing spritesheets.

## Required model contract
- 20k–50k triangles
- exact approved face / bun hairstyle / white outfit / Q-body ratio
- skeleton defined in `skeleton.json`
- animation clip names defined in `animation_clips.json`
- target scale about 1.12m in Three.js world units
- 2K texture references are provided in `../textures/` as modeling references, not fake UV maps.
