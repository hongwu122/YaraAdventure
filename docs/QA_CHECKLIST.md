# V6.2 Animation QA Checklist

## 3D clips
- [ ] Real V6.1 model used
- [ ] All required clip names exist
- [ ] Idle loops without root drift for 10 seconds
- [ ] Run uses real leg cycle and weight transfer
- [ ] Attack01/02/03 clearly differ and escalate
- [ ] JumpStart -> JumpLoop -> Fall -> Land transitions read naturally
- [ ] DoubleJump has visible second impulse
- [ ] HurtLight / HurtHeavy / Knockback / Knockdown / Getup are distinct
- [ ] Dash has forward lean + secondary hair/sleeve motion
- [ ] Musou is a full-body burst performance
- [ ] Cultivate is a genuine seated meditation loop
- [ ] Hair/sleeves do not explode or clip severely
- [ ] No mesh/armature scale errors

## 2D strips
- [ ] 512×512 per frame
- [ ] RGBA transparent
- [ ] Same orthographic camera for all frames
- [ ] Anchor [0.5, 0.92]
- [ ] No black/white fringe
- [ ] No colored bars / residual rectangles
- [ ] No frame-to-frame sudden offset
- [ ] No per-frame recrop
- [ ] WebP files decode correctly
- [ ] `animation_debug.html` plays every strip

## Deliverable honesty
- [ ] Do not mark productionReady unless the real model and rendered files exist
- [ ] Missing output remains explicitly listed in status/manifest
