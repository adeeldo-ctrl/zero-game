# ZERO GAME — Premium Enemy & Boss Art Upgrade

**Repository:** adeeldo-ctrl/zero-game  
**Branch:** main  
**Status:** In progress — approved static reference cutouts prepared; full animated production sheets remain outstanding.

## Locked active scope

- Preserve the four existing hero designs and their PNG sprite sheets.
- Preserve all 50 stages, campaign/world structure, controls, movement, combat rules, enemy AI, boss mechanics, scoring, rewards, and audio behavior.
- Upgrade exactly **32 active regular enemy identities**: 16 approved original character designs plus 16 separately named variants.
- Upgrade exactly **5 unique bosses** with clearly different silhouettes, costumes, materials, and visual themes.
- Do not activate or develop the other 29 legacy enemy concepts. They remain outside the active campaign.
- Keep each 10-stage region's enemy pool exclusive to that region.
- Each of the 32 regular enemies needs usable idle, movement, attack, hit-reaction and defeat animation frames. Add jump/airborne or special-action frames where its runtime behavior requires them.
- Each of the five bosses needs its own dedicated animation sheet and recognizable entrance, idle, movement, attack, hit, phase-change and defeat states.
- Maintain transparent backgrounds, consistent character scale/pivot, clean frame boundaries, and readable silhouettes at mobile resolution.
- Optimize PNG dimensions and file sizes for Android; avoid oversized atlases and excessive runtime memory use.

## Quality requirements

- Premium polished 2D character artwork consistent with the finish and presentation quality of the existing hero sheets.
- Distinct visual identity for every active regular enemy and boss; variants must have their own authored design details and must not be only palette swaps of a shared base image.
- Consistent lighting, material rendering, anatomy, outlines/edge treatment, and perspective across the campaign.
- Sprite-sheet frames must be aligned and animation-ready, with no labels, grids, captions, or unintended background artifacts.
- Do not fabricate animation by duplicating one static frame. Existing Phaser motion may remain as a gameplay fallback until genuine frame artwork is ready, but it must not be described as completed sprite-sheet animation.

## Current approved reference-art status

- 48 reference crops have been segmented into transparent 128×128 cutouts for review.
- 21 cutouts are approved as intact character references; only 16 are used as the active regular-enemy base designs.
- The 16 named variants remain separate campaign identities. They require their own final authored artwork rather than reusing a base PNG as if it were a unique completed character.
- Five separate 160×160 boss base cutouts have been prepared from five approved references.
- All prepared regular and boss images are static single-frame cutouts. They are not production animation sheets.
- The current runtime still uses SVG fallback art and Phaser pose/motion effects for some visuals. Do not remove the fallback until the replacement production sheets are integrated and verified.

## Implementation sequence

1. Audit the current hero/enemy/boss image dimensions, runtime animation definitions, texture selection, and references to the current SVG sheets.
2. Complete distinct transparent production artwork for all 32 active regular enemies and five bosses.
3. Author the required real animation frames and build optimized PNG sprite sheets with a manifest covering all 32 regular enemies and five bosses.
4. Integrate the new sheets into Phaser while preserving existing gameplay contracts and fallback behavior until each replacement is verified.
5. Validate every sheet's dimensions, frame count, transparency, unique character mapping, and runtime key/frame mapping.
6. After all approved development is complete, run one consolidated test/lint/build/browser verification pass, fix any failures, then build one fresh signed Android Release APK.
7. Deliver the APK and a truthful completion report. Do not claim a physical-device test unless one actually occurred.

## Explicit supersession note

This 32-regular-enemy / 5-boss scope follows the user's latest approved active roster and supersedes older planning text that described a 45-regular-enemy campaign-art target. The 45-entry art-direction archive is historical reference material only; it must not expand the active campaign or production-art acceptance criteria.

## Honest completion gate

The art upgrade is **not complete** merely because reference cutouts, roster data, SVG sheets, procedural details, or Phaser effects exist. The production validator must pass with exactly 32 unique regular enemy sheets and five unique boss sheets, with every required animation state represented. Do not label an APK final until this gate and the consolidated Android release build both succeed.


## Free-resource research — 2026-11-28

A source register is maintained at `assets/FREE_ASSET_SOURCE_REGISTER.json`. It records CC0 candidates and the animation coverage actually claimed by their publishers.

- SpriteCanvas's four-monster CC0 pack is the strongest technical candidate: transparent PNG sheets and JSON atlases for idle, walk, attack, hurt and death. It must be visually reviewed before assigning any of those characters to the existing approved identities.
- IsabellaP's Crypt pack provides CC0 bat, spider and mummy animation assets; the documented coverage differs by character and must not be overstated.
- OpenGameArt's stealthix animated monsters are CC0 and include idle, walk, punch, hurt and fall sheets for three characters; visual fit still needs review.
- Kenney's Monster Builder Pack is CC0 modular static parts, not an animation pack.
- Kenney's Abstract Platformer is CC0 and includes static enemy variations/environment assets; it does not satisfy the character animation gate.

These sources are documented as candidates, not as integrated game content. No third-party sprite is mapped into an approved character solely to increase a completion count. Before import, inspect the actual artwork, confirm that its silhouette and style fit the already-approved concept, retain the source/license notice, and verify its dimensions and atlas metadata. The active roster remains exactly 32 regular enemies and five bosses.
