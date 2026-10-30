# Root Motion & 2D Anchor Rules

## 3D
- `Root` remains at `(0,0,0)` for all locomotion/combat clips in this project.
- Gameplay code owns horizontal/vertical displacement.
- `Pelvis` may move locally to create weight and bounce, but must return cleanly at loop boundaries.
- Idle 10-second loop test: Root translation delta must be exactly 0; planted foot drift target < 0.5 cm equivalent.

## 2D render
- Frame canvas: `512×512` RGBA.
- Feet anchor: `[0.5,0.92]`.
- Baseline pixel: `y = 471`.
- Character may extend upward/sideways but should keep at least 16 px safe padding when possible.
- Do not crop each frame independently.
- All frames in the same action use identical camera, orthographic scale and canvas.
- Horizontal gameplay displacement is never baked into the strip.

## Baseline QA
`tools/check_baseline.py` measures the lowest non-transparent pixel region and reports per-frame drift. A real production pass should keep standing/running/attacking actions within the configured tolerance, except intentional airborne/grounded states where action-specific baseline logic applies.
