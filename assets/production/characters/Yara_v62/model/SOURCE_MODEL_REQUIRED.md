# V6.2 Source Model Requirement

V6.2 **cannot truthfully contain finished GLB AnimationClips or 2D pre-rendered action WebPs until the real V6.1 model exists**.

The supplied V6.1 package explicitly reports:
- `productionReady: false`
- `installed: false`
- real `yara_v61.blend` missing
- real `yara_v61.glb` missing

Place either of these real production files here before animation production:

```text
assets/production/characters/Yara_v62/model/yara_v61.blend
assets/production/characters/Yara_v62/model/yara_v61.glb
```

Preferred source is `.blend`, because rig controls, shape keys, helper bones and animation curves must be authored in Blender.

## Do not do
- Do not create zero-byte `.blend` / `.glb` files.
- Do not rename a 2D image or JSON into a model file.
- Do not claim AnimationClips exist merely because clip names are present in metadata.
- Do not generate 2D strips by sliding the flat front image across frames.

## When the real source arrives
1. Run `tools/blender_create_action_scaffold.py` inside Blender to create named actions + timeline markers.
2. Animate each action according to `docs/ACTION_DIRECTION.md`.
3. Validate root/feet with `tools/check_baseline.py` after render.
4. Render PNG frame sequences with `tools/blender_render_actions.py`.
5. Pack them into horizontal WebP strips with `tools/pack_webp_strips.py`.
6. Open `preview/animation_debug.html` and inspect every action.
7. Export animated GLB and run Three.js validation.
