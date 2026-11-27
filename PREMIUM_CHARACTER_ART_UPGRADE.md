# ZERO GAME — Premium Enemy & Boss Art Upgrade

**Repository:** adeeldo-ctrl/zero-game  
**Branch:** main  
**Status:** In progress — scope recorded; artwork integration not yet complete.

## Goal
Replace the current SVG/vector enemy and boss visuals with premium-quality raster character sprite sheets that visually match the finish and presentation quality of the existing hero PNG sheets.

## Locked scope
- Preserve the four existing hero designs and their PNG sprite sheets.
- Preserve all 50 stages, campaign/world structure, controls, movement, combat rules, enemy AI, boss mechanics, scoring, rewards, and audio behavior.
- Upgrade all **45 campaign enemy identities** (9 distinct enemy types in each of 5 worlds/regions).
- Upgrade all **5 unique bosses** with clearly different silhouettes, costumes, materials, and visual themes.
- Each character must have usable animation states, not a static portrait: idle, movement, attack, hit reaction, and defeat; add jump/airborne or special-action frames where the existing runtime uses them.
- Maintain transparent backgrounds, consistent character scale/pivot, clean frame boundaries, and readable silhouettes at mobile resolution.
- Optimize PNG dimensions and file sizes for Android; avoid oversized atlases and excessive runtime memory use.
- Update the Phaser asset imports, frame dimensions, animation definitions, and enemy/boss texture selection only as required to consume the new sheets.

## Quality requirements
- Premium hand-painted / polished 2D game-character appearance consistent with the existing hero sheets; not flat vector art, simple geometric shapes, recolored copies, or procedural overlays presented as finished art.
- Distinct visual identity for every enemy and boss; no repeated character design with only palette swaps.
- Consistent lighting, material rendering, anatomy, outlines/edge treatment, and perspective across the campaign.
- Sprite-sheet frames must be aligned and animation-ready, with no labels, grids, captions, shadows outside the character silhouette, or unintended background artifacts.

## Implementation sequence
1. Audit the current hero/enemy/boss image dimensions, runtime animation definitions, texture selection, and all references to the current SVG sheets.
2. Create and integrate the five regional enemy sets and five boss sheets, preserving the existing character roster and gameplay contracts.
3. Validate every sprite sheet's dimensions, frame count, transparency, and runtime key/frame mapping.
4. Run one consolidated test/lint/build and Android release verification after all art and integration work is complete.
5. Produce the replacement Android APK and a concise completion report. Do not claim a physical-device test unless one was actually performed.

## Current repository findings
- src/App.jsx imports four hero PNG sheets.
- Enemy visuals currently load from enemy-fast-sheet.svg, enemy-heavy-sheet.svg, enemy-special-sheet.svg, and premium-enemy-atlas.svg.
- Five separate boss SVG sheets are currently loaded: Gatekeeper, Iron Comet, Gale Talon, Suncrest, and Void Sovereign.
- Phaser currently loads enemy frames at 128×128 and boss frames at 160×160. These dimensions must be checked against the final replacement assets rather than assumed.
- src/premiumCampaignData.js contains the 45 enemy identities and five boss profiles; keep these identities and mappings intact.

## Constraints / honest status
- The art replacement is **not complete** merely because the roster data, SVG sheets, procedural details, or effects exist.
- Do not ship SVG/vector placeholders as the requested premium character artwork.
- Do not replace existing gameplay or remove features while doing this art-only upgrade.
- No APK should be labelled final until the new raster sheets are integrated and the consolidated Android release build succeeds.