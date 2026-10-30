# 2D Pre-render Pipeline

1. Open the real `yara_v61.blend`.
2. Complete and approve one AnimationClip at a time.
3. Use one fixed orthographic side-view camera.
4. Render PNG sequence with transparent film.
5. Keep canvas/camera constant; never crop per frame.
6. Run alpha + baseline QA.
7. Pack frames into one horizontal WebP strip per action.
8. Only after QA set the action status in `animations.json` to `production_ready`.

## Render target
- 512×512 per frame
- RGBA
- Transparent background
- 24 FPS
- Fixed anchor `[0.5,0.92]`
- Fixed side camera

## Left/right
Safe-to-mirror actions may output only `_right.webp` and use `mirrorSafe: true`.
Asymmetric weapon/casting clips must output explicit left/right versions.

## Prohibited shortcuts
- Translating a flat portrait between frames.
- Drawing a slash arc around a static body and calling it an attack.
- Cropping each frame differently.
- Baking black/white matte into transparent edges.
