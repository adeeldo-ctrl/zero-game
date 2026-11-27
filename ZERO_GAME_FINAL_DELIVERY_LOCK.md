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
