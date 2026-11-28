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

## Free rigging tool compatibility decision (2026-11-28)

The game currently uses Phaser 4.2.1. Do not integrate a runtime that only supports Phaser 3: the official OpenBone Phaser package currently declares a Phaser peer range of >=3.60.0 and <4, so it is not compatible with this project's current engine without an engine migration.

Preferred free-tool evaluation for this Phaser 4 project: **Rigby2D**. Its published project information lists Phaser 3.60+ and Phaser 4 runtimes and an MIT/Apache-2.0 open-source editor/runtime. Before integration, verify the exact released Phaser runtime package/API and export format against the repository's Phaser 4.2.1 version.

Implementation sequence:
1. Preserve all original PNG source files and create working copies for rig preparation.
2. For each of the 32 selected enemies and five bosses, separate movable parts only where the original artwork supports clean separation; use weighted mesh deformation for soft/floating creatures or where cutting parts would visibly damage the art.
3. Create and export real idle, locomotion, jump/fall/land, attack, hit, and defeat clips appropriate to each creature. Add a unique special-action clip to each boss.
4. Integrate the Phaser 4-compatible runtime and connect clips to existing gameplay state without changing physics, collision, controls, stages, or hero behaviour.
5. Inspect exported animations in the actual game at mobile resolution. Reject broken cutouts, visible holes, mismatched pivots, and animation/physics drift.
6. Only after all 37 characters are complete, run the single consolidated verification and build the one final Android APK.

No dependency migration, placeholder rigs, vector redraws, or whole-image-only motion may be presented as completed skeletal animation.
## Verified free rigging runtime (2026-11-28)

The free tool selected for the current Phaser 4.2.1 project is Rigby2D 0.6.1 (MIT OR Apache-2.0). Its repository documents a Phaser 4 WebGL runtime, with a Phaser plugin, .skel / .json exports, atlases, sprite-sheet export, and a command-line/MCP workflow. The game must remain on Phaser 4.2.1; do not downgrade or migrate the engine merely to use another runtime.

Documented integration API:

```js
import { rigbyPhaser } from "./vendor/rigby2d-phaser.mjs";
const { RigbyPlugin } = rigbyPhaser(Phaser);
// Scene preload: this.load.rigby(key, skeletonUrl, atlasUrl)
// Scene create: const rig = this.add.rigby(x, y, key, "idle")
```

The runtime is WebGL-only, which matches the intended Phaser 4 runtime path. Before the final APK, the Android WebView must be verified to use WebGL successfully; no silent static-image fallback may be described as a successful rig integration.

### Important source-art limitation

Rigby2D AutoRig does not cut a flattened PNG into limbs. Its AutoRig requires layered artwork: a layered PSD, SVG, or separate same-canvas PNG layers, one image per movable part. A single PNG can be converted to a weighted mesh, but that is mesh deformation of the original image, not independent limb articulation. Therefore:

- Humanoid, quadruped, winged, crab and multi-leg designs need clean separated parts/layers where their visible anatomy requires it.
- Soft, floating, cloud, slime, fish and tentacle designs may use weighted meshes when part cutting would damage the source art.
- Do not create rough rectangular cuts or call them production-ready rigs.
- Keep every original PNG unchanged and use working copies for segmentation/rigging.

### Roster manifest

src/assets/animations/rig-roster.json now records all 32 selected enemy identities, all five bosses, their original source PNGs, anatomy-specific rigging approaches, expected clips, and a completion gate. Its status remains rig-assets-not-yet-created until the actual Rigby2D projects and exports exist.

### Release gate

Do not trigger or deliver an APK until all 37 actual rigs have been exported, all required animation clips exist, the Phaser integration is connected to gameplay state, and the consolidated mobile verification has passed. No debug or intermediate APKs.
## Implementation update (2026-11-28)

The repository now contains a Rigby2D 0.6.1 build-time pipeline:

- `scripts/generate-rigby-rigs.mjs` creates 32 enemy and 5 boss skeleton JSON exports and atlas files from the existing original transparent PNGs. It copies each unchanged source PNG into its matching `public/rigs/...` folder.
- Each character gets a 9×9 weighted mesh (81 vertices), an anatomy-specific bone layout, and non-combat idle, locomotion, jump, fall, land, hit and defeat clips. Bosses additionally receive entrance, phase-change and an individual non-combat signature motion.
- `scripts/fetch-rigby-runtime.mjs` downloads the pinned Phaser runtime v0.6.1 and verifies its published SHA-256 before the build imports it.
- `src/App.jsx` registers the Rigby2D scene plugin, uses Phaser WebGL, loads the 37 skeletons, and chooses movement/reaction clips from the existing enemy and boss state.
- `scripts/validate-rig-roster.mjs` checks all 37 JSON rigs, weighted mesh data, atlas pages and required clips. The regular build runs generation, validation, runtime download and Vite build in that order.

### Artwork and animation scope

The source PNGs are preserved and are not redrawn as vectors. The generated rigs use weighted mesh deformation of the original complete cutout. They are not separate hand-painted limb layers: the mesh bends according to the anatomy-specific bone weights. This is appropriate for the first rig pass, but visual review is still required to catch stretching, transparent-edge artifacts or joints that need a separately layered source part.

### Current release status

`rig-assets-generated-pending-visual-gameplay-verification` is the honest current state. The 37 rig exports are generated during the build, but the final APK must remain locked until the consolidated browser/mobile verification confirms the WebGL runtime, all 37 loaded rigs, and real clip transitions in the running game. No intermediate APK is to be produced.

## Ambient enemy personality and awareness (2026-11-28)

Every regular enemy and boss attendant receives a type-aware awareness radius and a set of idle personality clips. While the hero is far away and the enemy is settled, it stops patrolling and performs a rotating idle activity instead of continuously tracking the hero. The activity changes on a staggered timer so nearby enemies do not all animate in sync.

- Biped / humanoid profiles can use phone-checking, head-scratching, combing/grooming, and looking-around clips. Their arm, forearm, head, and torso bones are animated together.
- Flying, quadruped, fish, tentacle, crab, and soft-bodied profiles use the same idle-action slots with anatomy-appropriate wing, tail, fin, claw, leg, tentacle, head, or core movement; they do not receive human hand gestures when their rig has no arms.
- When the hero enters the awareness radius, the enemy exits its idle activity, turns toward the hero, and resumes its existing role-specific AI. A wider re-entry threshold prevents rapid idle/chase flicker around the boundary.
- Enemies only settle into idle after landing (except flyers), so their spawn drop and normal jump/fall movement are not interrupted.
- This behaviour is applied to regular enemies and boss attendants. Bosses retain their role-specific attacks and phase logic; when settled at close range during a rest state, each boss plays its own authored signature rig clip as an idle/ready stance. Hero controls, stage progression, and all existing visual effects remain outside this change.

The five ambient clips are part of the enemy rig release gate: `idle-phone`, `idle-scratch`, `idle-comb`, `idle-look-around`, and `idle-groom`. These are bone-weighted mesh animations derived from each original PNG, not separate hand-painted sprite sheets. The runtime selects actions from the enemy role and anatomy profile.

- The browser smoke suite now checks that all 32 enemy rigs contain non-empty ambient clips, the enemy awareness helper enters idle at long range and resumes its role AI near the hero, and all five boss signature clips visibly move their own rig bones.
