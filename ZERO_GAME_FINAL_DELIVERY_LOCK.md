# ZERO GAME — Final Delivery Lock

**Repository:** adeeldo-ctrl/zero-game  
**Branch:** main  
**Primary specification:** `ZERO_GAME_UPGRADE_MASTER_PLAN.md`

This file is a concise delivery lock. It supplements the master plan and the user's latest direct instructions; it does not replace existing gameplay requirements.

## User's final delivery rule

Do not deliver a partial APK, debug APK, or progress report. Complete the agreed scope first, perform one consolidated verification after implementation, then build and verify the final Android **Release APK**. Deliver the APK and one truthful completion report together. If a genuine blocker prevents completion, report only that blocker and what access/action is required. Never claim a feature, test, build, or device check succeeded unless it actually did.

Do not send intermediate working-step, line-by-line, log, or routine progress updates. Avoid unnecessary repeated audits and tests. Preserve the existing game and all working systems; do not replace it with a new game.

## Latest screenshot defects — mandatory acceptance

The user's 2026-11-27 hero-selection screenshot shows:
- Unwanted triangle/marker shapes above the four hero sprites. Remove these stray decorations from the selection UI; retain only intentional hero artwork.
- Hero description text overlaps and is unreadable. Re-layout the four hero cards with separate readable descriptions, adequate spacing, responsive sizing, and no text collision.
- Improve the selection screen hierarchy and spacing while preserving the ZERO GAME identity and four selectable heroes.

## Visual effects — must be genuinely distinct

Do not reuse one generic particle texture/shape for every effect. Give each effect family and each hero signature move a visibly distinct design, including silhouette/shape, colour palette, scale, motion pattern, animation timing, trail, impact and disappearance behavior as appropriate.

Required separation includes:
- Fire/ember effects: distinct from lightning, energy, magic and snow.
- Lightning/electric effects: branching/arcing visual language, not recoloured fire.
- Energy/projectile effects: their own shapes, trails and impact bursts.
- Snowball visuals: rolling snowball, snow fragments, freeze burst, kicked-ball trail and impact fragments must not all use the same particle shape.
- Each of the twelve hero signature moves should be visually identifiable without relying only on colour changes.
- Impacts, hits, stage clear, boss phase change and defeat feedback must be readable and polished.

All effects must remain fictional, stylized arcade visuals. Do not implement realistic real-world weapon operation, weapon-use instruction, or real-world attack replication.

## Boss encounters — actual playable content

The five boss encounters advertised by the game must exist in campaign progression and be playable, not just be names, labels, or generic enemy variants. Each encounter needs a distinctive boss presentation, health display, intro, readable attack telegraphs, multiple recognizable attack patterns, movement/AI, hit reaction, defeat sequence, and balanced counterplay. Bosses must be distinguishable in silhouette, animation, effects and audio. Preserve the four archetypes and final-warlord phase requirements in the master plan; reconcile the advertised five encounters with the actual 50-stage progression so all five are reachable.

## Audio and music

Finish the music and sound system rather than treating synthesized placeholder beeps as final polish:
- Separate menu, normal-stage, boss, victory and defeat music where appropriate, with clean transitions and no duplicate loops.
- Distinct sound identities for fire, lightning, energy, snowball/freeze/kick, hero specials, boss attacks, impacts, UI, stage start/clear and boss entrance/phase/defeat.
- Balanced mix, working independent music/SFX controls, mute state, mobile first-interaction audio unlock, and correct pause/background/resume lifecycle.
- Use original or properly licensed audio; document sources and licenses.

## Preserve and finish all existing scope

Use the full master plan and latest main branch as the source of truth, including:
- Existing ZERO GAME identity, landscape/fullscreen presentation, 50 fixed authored stages, four heroes, one-time hero selection and hero persistence.
- Three chances with three hearts each, stage transitions, fixed arena/platform rules and Snow Bros.-inspired freeze/roll/kick gameplay.
- Existing joystick, jump/double-jump, fire, super, all three EXTRA buttons, and multitouch. Wi-Fi co-op is explicitly removed per the user's 2026-11-27 instruction.
- EXTRA 1/2/3 remain immediately reusable with no cooldown, meter, counter or animation lock.
- Distinct hero locomotion, attack, hit, jump, landing and special-move animations; grounded enemy behavior; all boss patterns/phases; premium differentiated stages; icon and mobile layout.

## Final integrated acceptance and delivery

After implementation is complete:
1. Run one consolidated, relevant automated verification pass (tests, lint, web build and browser gameplay smoke tests already defined by the repository); fix failures and rerun only what is necessary.
2. Confirm all five bosses are reachable and functional, hero selection is clean, effects are distinct in actual runtime, audio lifecycle works, and mobile input regressions are addressed.
3. Only then manually run the approved Android **Release** APK workflow. Do not dispatch an APK workflow early.
4. Verify the workflow succeeded and the Release APK artifact exists and is downloadable.
5. Report exact commit, verification result, APK artifact link, and clearly separate automated checks from physical Android device checks. Do not claim Redmi Note 8 physical testing unless it was actually performed.

**Status:** This is a requirements/delivery lock, not evidence that implementation or APK delivery is complete.


## One-time final build trigger

The Android Release workflow may be started manually, or by adding `ZERO_GAME_FINAL_RELEASE_TRIGGER.md` to `main` after the final integrated CI run has passed. Ordinary source commits do not trigger APK builds. The marker is a deliberate final-delivery action, not a development build trigger.


## Final build result — 2026-11-27

- Final signed Release APK workflow run: `45954385742` (success).
- Source commit: `5f5e18990bd5cdccb8f3b27d7fe3f59e8af8cd60`.
- Artifact: `zero-game-release-apk` (ID `15178341478`), `zero-game-release.apk`, 3,620,521 bytes.
- APK signature verification and upload succeeded. SHA-256: `513c83f7d817b4bb63b328cd226ba76a2a71eb1f750f017520b10b9b6d64d811`.
- Automated Chromium gameplay checks passed on commit `f98f76d2`; release pipeline game-data tests, lint and web build passed on the release commit.
- No physical Android handset test is claimed.

## Superseding user instruction — final-only delivery hold (2026-11-27)

The earlier Release APK result above is a historical artifact from a prior source snapshot. The user subsequently clarified that development must reach 100% completion before any new APK is built. Therefore:
- Do not deliver the historical artifact as the final game.
- Do not run the Android workflow, create debug/release APKs, or generate interim APK artifacts during development.
- Complete all remaining source work first, run one consolidated final verification, then build and verify a fresh signed Release APK from the verified final source.
- This instruction supersedes any older wording in this file that described the earlier artifact as final delivery.

FINAL_RELEASE_APPROVED: true


## User scope change — 2026-11-27

Wi-Fi co-op is removed from the final product at the user's request. It is not part of final acceptance. Keep the single-player 50-stage campaign and all existing hero, enemy, boss, combat, effects, sound, and mobile-control work. Build the signed Android Release APK after the consolidated verification passes.


## Consolidated verification — 2026-11-27

- Verified source commit: `d9617dabf52475376503e26256959994e75cdcd7`.
- GitHub Actions run: `46015298241` — success.
- Automated tests: 39 passed; lint passed; Android configuration validation passed; web build passed; Chromium campaign/mobile smoke test passed, including the 50-stage campaign sweep and native-touch checks.
- Wi-Fi co-op and relay removed at the user's request. Final product is single-player.
- Android Release APK workflow may now build from the verified source plus this release-only documentation/trigger update.


## Hero identity correction — 2026-11-27

- Fixed the action-state visual swap that hid the selected hero sprite and exposed the shared legacy vector rig during attacks, special moves, and hit reactions.
- The selected hero's own authored sprite now remains visible across all button-triggered actions; legacy rig parts remain hidden.
- Consolidated CI must pass on the fix before generating the fresh signed Android Release APK.


## Latest active roster clarification — 2026-11-28

The user's latest approved active scope is exactly 32 regular enemy identities and five distinct bosses. Each ten-stage region must use only its own exclusive enemy pool. The older 45-enemy art-direction archive is reference-only and must not expand the active campaign. Do not develop or activate the other legacy enemy concepts.

## Original PNG artwork requirement — supersedes all earlier vector-sheet notes

- All 32 regular enemy identities use 32 different original PNG character images already present in the repository. The 32 source images are mapped one-to-one; no enemy identity shares another enemy's PNG.
- The five bosses use their five separate original PNG images. Boss artwork is not reused for regular enemies.
- Original PNG artwork is the visible character texture for every enemy and boss. Do not generate, draw, substitute, or integrate vector/SVG character art.
- Source PNGs are static images, not genuine frame-by-frame animation sheets. Phaser applies identity/role-specific runtime motion directly to each original PNG: idle, directional movement, attack anticipation/strike, hit recoil and defeat. Boss PNGs receive their own entrance, idle, movement, attack, hit, phase-change and defeat motion through runtime transforms and existing boss behaviour.
- Keep the original 32-enemy roster, exclusive five-region/ten-stage grouping, five boss encounters at stages 10/20/30/40/50, their AI/roles, and all previously requested gameplay behaviour.
- The procedural vector character-sheet generator, its automatic npm lifecycle hooks, obsolete enemy/boss vector sheets, and vector-sheet validator have been removed. Future builds must not regenerate them.
- PNG validation checks all 32 unique enemy source mappings and the five separate boss PNGs. Do not describe runtime transforms as hand-drawn frame-by-frame animation.
- The earlier 37-SVG-sheet claims and the earlier 16-base/16-reused-art mapping are superseded by this PNG-only requirement.

## Current implementation status — 2026-11-28

- Updated Phaser enemy rendering to use the 32 unique original PNG textures, including small source crops only where needed to keep adjacent collage fragments outside the visible character.
- Updated all five boss visuals to use their separate original boss PNG textures.
- Retained existing role-specific enemy movement/attack/reaction motion and boss-specific movement/attack/phase behaviour; no gameplay physics, stage quotas, hero controls, or campaign structure were intentionally changed.
- Added a PNG artwork validator that checks the 32 one-to-one enemy mappings, PNG signatures/dimensions, and five boss PNGs.
- Removed the automatic SVG sprite-sheet generation hooks and the old vector character generator/assets.
- The final consolidated verification and the single signed Android Release APK build have not yet been run against this updated source. Do not provide an APK until that one final workflow succeeds. Avoid intermediate/debug APKs and unnecessary repeat tests.

## Final integrated animation and delivery verification — 2026-11-28

- Final source commit before release marker: `d3bd335adff9e85ddddfdac8bfe580ef8234447b`.
- Consolidated GitHub Actions run: `46124423959` — success.
- Automated tests, lint, Android configuration, 32-enemy/five-boss original PNG validation, web build, and Chromium gameplay smoke test all passed.
- Runtime smoke checks confirmed enemy rig movement, ambient idle/hero-awareness transitions, all five boss signature animations, all 37 weighted rig assets, and the hero-selection layout.
- Rig roster validation also checks independent forearm/shin timelines and the required attack clip structure.
- This is automated verification only; no physical Android handset test is claimed.
- The only remaining delivery action is the one signed Android Release APK build from the verified source. No debug APK is to be delivered.

## Final integrated verification — 2026-11-28 (current source)

- **Verified implementation commit:** `7b2273cf88f047873ea48d72781bf5282fb26d99`.
- **Consolidated CI:** run `46153199756` — success.
- **Automated tests:** 64 passed, 0 failed; lint passed; Android configuration validation passed; original 32-enemy/five-boss PNG validation passed; production web build passed.
- **Chromium gameplay smoke:** passed for token start/Continue, hero idle/walk/run/jump, live weighted enemy rigs, each boss's live signature animation on its milestone stage, all 50 stage restarts, and mobile-input regression checks.
- **Performance work:** load only the active ten-stage enemy rig pool plus the shared time-hunter rig; keep the five boss rigs; load only the current backdrop; remove inactive region rig cache entries and atlas textures on region changes; stop invisible competing boss animation loops; do not decode the unused enemy/boss pose sheets.
- **Token/lives:** locally persisted token balance; one token starts/restores three chances with three hearts per chance; proper Continue screen spends one token; stage clear and each 10,000 score threshold award tokens.
- **Physical Android testing:** not performed and not claimed.
- **Final APK:** not yet built. The only remaining action is one signed Android Release APK from the verified source plus this release-only documentation/trigger update. No debug or intermediate APKs.
