# ZERO GAME — Enemy & Boss Animation Plan

## Purpose

Implement proper, readable movement and action animations for the game's 32 selected enemy identities and all 5 bosses. Enemies and bosses must feel animated in gameplay, not merely appear as static pictures that slide or scale.

## Non-negotiable art rules

1. Use the original enemy and boss artwork already supplied by the project owner and stored in this repository.
2. Do **not** replace characters with newly drawn vector characters, generic placeholders, or unrelated artwork.
3. Preserve each character's recognizable design, colours, proportions, and visual identity.
4. The repository currently contains a larger original enemy reference set. Select and map the 32 gameplay identities from those original assets; do not invent replacement identities.
5. The five boss identities must continue to use their corresponding original boss artwork:
   - Gatekeeper — green ice monster
   - Iron-Comet — blue ogre A
   - Gale-Talon — armored lizard
   - Suncrest — pumpkin
   - Void-Sovereign — ice knight
6. Keep source artwork intact. Any prepared animation parts, meshes, masks, or frames must be derived from the matching original image.

## Animation approach

Use the existing Phaser game runtime and original PNG artwork. Choose the least destructive technique that produces convincing movement for each source image:

- **Layer/part rigging:** where the source image clearly supports separation, prepare transparent body-part layers and attach them to a 2D bone/skeletal rig. Animate limbs and other movable parts independently.
- **Mesh deformation:** where clean part separation would damage the artwork, use a controlled mesh/warp rig to create movement while preserving the original painted or pixel-art appearance.
- **Frame animation:** create genuine frame variations from the original character artwork when needed and when the result can be made consistent. Do not label a static image or a whole-image transform as a completed sprite sheet.
- **Whole-sprite transforms:** use only as supporting effects (small squash/stretch, recoil, bounce, or anticipation), not as a substitute for limb animation when the character has visible limbs.

If an original image is a single flattened layer, do not assume its limbs can move independently. Prepare and review the artwork carefully before rigging. Avoid rough cutouts, broken edges, missing details, or visible gaps. If a source image cannot support a clean rig, use a suitable mesh/frame technique rather than replacing it.

## Required animation states

Every enemy should receive an appropriate set of states based on its anatomy and behaviour:

- Idle / breathing or subtle living motion
- Walk, crawl, float, slither, or other species-appropriate locomotion
- Jump / take-off where the character can jump
- Fall and landing / recovery
- Attack or ability action
- Hit reaction / brief recoil
- Defeat or disappearance transition suitable for the game's existing non-graphic style

Not every creature should move like a humanoid. Animation must match its own body shape and movement style.

## Enemy-specific movement direction

Build distinct animation profiles rather than applying one generic cycle to all enemies. Examples:

- Yeti, ogres, and heavy creatures: weighty alternating steps, body sway, anticipation before a jump, and a strong landing recovery.
- Bats and owls: wing cycles, hovering, directional flight, and controlled landing where appropriate.
- Crabs: sideways locomotion with coordinated leg movement.
- Slimes and soft-bodied creatures: squash/stretch, compression before a jump, airborne shape change, and landing bounce.
- Skeletons and humanoid guards: coordinated arm/leg walk cycles, jump, fall, attack, and hit reactions.
- Fish, jellyfish, clouds, and floating creatures: buoyant or swimming motion rather than foot-based walking.
- Turtles and armoured creatures: shorter, heavier steps with shell/body follow-through.

These are examples; each of the 32 selected enemies must be assigned a profile that matches its actual original design.

## Boss animation requirements

Each of the five bosses needs its own rig/profile and recognizable signature actions. Bosses must not be implemented as ordinary enemies enlarged on screen.

Each boss should support:
- Distinct idle and entrance presentation
- Locomotion appropriate to its anatomy
- Jump, fall, and landing if supported by its design
- Basic attack animation
- At least one unique special-move animation
- Hit/recovery reaction
- Phase-change or enraged-state transition where the existing boss design supports it
- Defeat transition

Boss actions must be visually distinguishable and timed with the existing gameplay behaviour. Preserve the original boss artwork and identity.

## Runtime integration

1. Add or extend a data-driven animation profile for each enemy and boss.
2. Connect animation state changes to actual gameplay events: idle, movement, jump, falling, landing, attack, hit, special move, and defeat.
3. Keep animation facing/direction consistent with the game's movement and collision logic.
4. Prevent animation updates from overriding physics, controls, attack timing, or hit detection.
5. Keep performance suitable for Android devices. Reuse animation resources and avoid creating unnecessary per-frame objects.
6. Ensure animation transitions are smooth and do not leave a character stuck in the wrong state.

## Stage and roster mapping

- Keep the existing stage plan: distribute the selected enemy identities by the established 10-stage groupings.
- Each 10-stage group must use its assigned enemy set; do not randomly mix all enemy types across every group.
- Boss encounters remain mapped to their planned boss stages.
- Animation work must not silently change stage progression, enemy behaviour, difficulty, controls, or the existing hero animation system.

## Quality and completion criteria

The work is complete only when:

- All 32 selected enemy identities have their own appropriate animation profile and usable gameplay animation states.
- All 5 bosses have distinct animation profiles and signature actions.
- Original supplied artwork is used throughout; no replacement vector characters are introduced.
- Limb/body movement is genuinely animated where the source art allows it; whole-image scaling or sliding alone does not count as a completed walk/jump animation.
- Source images and prepared parts have no obvious segmentation damage, detached-looking edges, or visual gaps.
- Animation state changes are connected to gameplay and remain synchronized with movement and actions.
- The existing game, controls, stages, and hero behaviour remain intact.
- Run one consolidated verification after implementation is complete, fix any failures, and produce only the final Android APK and completion report. Do not create or deliver debug/intermediate APKs or unnecessary test reports.

## Honesty requirement

A static PNG is source artwork, not an animation sheet. Do not claim that an enemy or boss has a complete walk/jump animation until the actual rig, mesh, or frame animation has been implemented and checked in gameplay. If any character's source image prevents a clean result, report that specific limitation rather than claiming it is finished.
