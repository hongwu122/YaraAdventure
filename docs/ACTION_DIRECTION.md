# Yara V6.2 Action Direction

All actions use the **same V6.1 rig/model**. No redesign. Game owns gameplay displacement unless explicitly noted; animation root stays locked.

## Core rules

- 24 FPS production baseline.
- Root and feet baseline must not drift.
- Hair/sleeve helper bones provide secondary motion.
- Attacks require readable anticipation → strike → follow-through.
- VFX are separate from body animation.
- For 2D output use 512×512 RGBA, anchor `[0.5, 0.92]`, baseline at Y=471 px.

## Actions

### Idle
- **FPS / frames / duration:** 24 / 48 / 2.00s
- **Loop:** yes
- **Mirror safe:** yes
- **Direction:** Subtle breathing, eye motion optional, feet/root completely fixed. Must remain spatially stationary for 10s loop test.

### Walk
- **FPS / frames / duration:** 24 / 24 / 1.00s
- **Loop:** yes
- **Mirror safe:** yes
- **Direction:** Natural chibi walk cycle; foot plant readable; no global translation baked.

### Run
- **FPS / frames / duration:** 24 / 18 / 0.75s
- **Loop:** yes
- **Mirror safe:** yes
- **Direction:** True leg run cycle with body lean and weight shift. Never move whole character as a flat sprite.

### Turn
- **FPS / frames / duration:** 24 / 8 / 0.33s
- **Loop:** no
- **Mirror safe:** no
- **Direction:** Readable torso/head/hip turn. Not a mirrored instant swap. Export both sides only if asymmetry requires.

### JumpStart
- **FPS / frames / duration:** 24 / 7 / 0.29s
- **Loop:** no
- **Mirror safe:** yes
- **Direction:** Compression -> push-off. Game physics owns vertical translation.

### JumpLoop
- **FPS / frames / duration:** 24 / 12 / 0.50s
- **Loop:** yes
- **Mirror safe:** yes
- **Direction:** Airborne rising/neutral loop pose; keep feet baseline normalized in render output.

### DoubleJump
- **FPS / frames / duration:** 24 / 10 / 0.42s
- **Loop:** no
- **Mirror safe:** yes
- **Direction:** Clear second impulse: tuck, twist, leg kick or compact spin; visually distinct from first jump.

### Fall
- **FPS / frames / duration:** 24 / 12 / 0.50s
- **Loop:** yes
- **Mirror safe:** yes
- **Direction:** Falling silhouette with slightly raised arms/hair lift; game physics owns descent.

### Land
- **FPS / frames / duration:** 24 / 8 / 0.33s
- **Loop:** no
- **Mirror safe:** yes
- **Direction:** Contact, knee compression, recovery. No foot sliding.

### Attack01
- **FPS / frames / duration:** 24 / 12 / 0.50s
- **Loop:** no
- **Mirror safe:** no
- **Direction:** Fast opening slash. Body twist and weapon arm motion must be real.
- **Combat timing:** windup ends frame 4, active ends frame 7, recover ends frame 11

### Attack02
- **FPS / frames / duration:** 24 / 13 / 0.54s
- **Loop:** no
- **Mirror safe:** no
- **Direction:** Second combo beat: opposite-direction or rising slash; more weight than Attack01.
- **Combat timing:** windup ends frame 4, active ends frame 8, recover ends frame 12

### Attack03
- **FPS / frames / duration:** 24 / 17 / 0.71s
- **Loop:** no
- **Mirror safe:** no
- **Direction:** Heavy finisher with largest body rotation, strongest anticipation and follow-through.
- **Combat timing:** windup ends frame 6, active ends frame 11, recover ends frame 16

### SkillU
- **FPS / frames / duration:** 24 / 22 / 0.92s
- **Loop:** no
- **Mirror safe:** no
- **Direction:** Close-range 回风斩. Full-body spin/arc with clear anticipation and recovery.
- **Combat timing:** windup ends frame 6, active ends frame 14, recover ends frame 21

### SkillI
- **FPS / frames / duration:** 24 / 24 / 1.00s
- **Loop:** no
- **Mirror safe:** no
- **Direction:** 星芒弹 cast: gather -> aim -> release -> recoil/recover. Projectile is separate VFX, not baked into body pose.
- **Combat timing:** windup ends frame 7, active ends frame 16, recover ends frame 23

### Dash
- **FPS / frames / duration:** 24 / 9 / 0.38s
- **Loop:** no
- **Mirror safe:** yes
- **Direction:** Strong forward body lean, compressed silhouette and trailing hair/sleeves. Movement handled by game.
- **Combat timing:** windup ends frame 2, active ends frame 5, recover ends frame 8

### Musou
- **FPS / frames / duration:** 24 / 38 / 1.58s
- **Loop:** no
- **Mirror safe:** no
- **Direction:** Complete burst performance: charge -> multi-hit/finisher -> recovery. Not a static pose with a circle effect.
- **Combat timing:** windup ends frame 10, active ends frame 28, recover ends frame 37

### HurtLight
- **FPS / frames / duration:** 24 / 8 / 0.33s
- **Loop:** no
- **Mirror safe:** yes
- **Direction:** Small recoil; head/shoulder reaction; recover quickly.

### HurtHeavy
- **FPS / frames / duration:** 24 / 13 / 0.54s
- **Loop:** no
- **Mirror safe:** yes
- **Direction:** Clearly stronger than HurtLight: torso fold, arm throw, delayed recovery.

### Knockback
- **FPS / frames / duration:** 24 / 16 / 0.67s
- **Loop:** no
- **Mirror safe:** yes
- **Direction:** Body driven backward with feet losing contact/drag pose. Game applies position displacement.

### Stun
- **FPS / frames / duration:** 24 / 24 / 1.00s
- **Loop:** yes
- **Mirror safe:** yes
- **Direction:** Looping dazed body sway; feet stay planted. Status icon/VFX separate.

### Knockdown
- **FPS / frames / duration:** 24 / 14 / 0.58s
- **Loop:** no
- **Mirror safe:** yes
- **Direction:** Loss of balance to grounded pose. Distinct from knockback.

### Getup
- **FPS / frames / duration:** 24 / 17 / 0.71s
- **Loop:** no
- **Mirror safe:** yes
- **Direction:** Grounded -> kneel -> stand; end exactly aligned to Idle baseline.

### Death
- **FPS / frames / duration:** 24 / 26 / 1.08s
- **Loop:** no
- **Mirror safe:** yes
- **Direction:** Readable defeat with final hold pose. No abrupt disappearing.

### Cultivate
- **FPS / frames / duration:** 24 / 48 / 2.00s
- **Loop:** yes
- **Mirror safe:** yes
- **Direction:** True seated cultivation/meditation pose with subtle breathing and sleeve/hair secondary motion.

### Victory
- **FPS / frames / duration:** 24 / 29 / 1.21s
- **Loop:** no
- **Mirror safe:** yes
- **Direction:** Short celebratory pose suitable for stage clear.

### Interact
- **FPS / frames / duration:** 24 / 19 / 0.79s
- **Loop:** no
- **Mirror safe:** yes
- **Direction:** Generic hand-forward interaction usable for shrine/NPC/object.

### CastStart
- **FPS / frames / duration:** 24 / 13 / 0.54s
- **Loop:** no
- **Mirror safe:** no
- **Direction:** Enter casting posture; transitions to CastLoop.

### CastLoop
- **FPS / frames / duration:** 24 / 24 / 1.00s
- **Loop:** yes
- **Mirror safe:** no
- **Direction:** Looping sustained cast posture. No baked projectile/VFX.
