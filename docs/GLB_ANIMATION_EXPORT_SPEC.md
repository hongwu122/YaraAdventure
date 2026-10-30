# Animated GLB Export Spec

## Output
`assets/production/characters/Yara_v62/model/yara_v62_animated.glb`

## Required AnimationClip names
Idle, Walk, Run, Turn, JumpStart, JumpLoop, DoubleJump, Fall, Land, Attack01, Attack02, Attack03, SkillU, SkillI, Dash, Musou, HurtLight, HurtHeavy, Knockback, Stun, Knockdown, Getup, Death, Cultivate, Victory, Interact, CastStart, CastLoop.

## Blender requirements
- One Armature for Yara.
- NLA tracks or Actions must export with exact names above.
- No scale animation on Root.
- No accidental object transforms on mesh objects.
- Preserve shape keys/blendshapes from V6.1.
- Include hair/sleeve helper-bone animation.
- Apply modifiers only if they do not destroy rig/shape keys.

## Export
- glTF Binary `.glb`
- +Y up according to project convention documented in model metadata.
- Include skinning, morph targets, animations, materials and embedded textures as appropriate.
- Export all required actions/clips.

## Three.js verification
- `GLTFLoader` loads without error.
- `gltf.animations` contains all required names.
- `AnimationMixer.clipAction()` can play every clip.
- No NaN transforms.
- Idle loop is seamless.
- Mesh remains centered at feet origin.
