# ZERO GAME — Upgrade Master Plan

**Repository:** adeeldo-ctrl/zero-game  
**Branch:** main  
**Baseline:** Current approved APK / latest main build (2026-11-20).  
**Project rule:** Keep the existing ZERO GAME project and gameplay identity. These are upgrades to the same game, not a replacement or a new game.

## Non-negotiable preservation rules
- Preserve the currently working joystick/controller movement and touch mapping. Do not regress the approved controls.
- Keep the game in landscape and make the playable scene fill the complete device viewport.
- Preserve existing working fire/super controls unless a change is explicitly required below.
- Do not rename the hero. Do not add a character name above the hero; keep the HUD clean.
- Do not call a feature complete until it has been implemented, automated checks pass, and a fresh Android APK has been built. Device-only behavior must be reported as awaiting physical-device verification until tested.

## 1. Hero movement and animation
- Replace placeholder/basic hero locomotion with polished side-scrolling beat-'em-up / arcade-fighter style movement inspired by the responsiveness and visual quality of classic fighting games (including Street Fighter-style animation quality), while retaining ZERO GAME's own original character design.
- Add coherent animation states and transitions for idle, walk/run, take-off, rising jump, falling, landing, attack, hit reaction, and special moves.
- Walking and jumping must visibly animate the whole character with consistent timing, readable poses, and correct facing direction; no sliding, frozen frames, or abrupt pose snapping.
- Jump input must work reliably on touch and keyboard/controller. A held jump must not block subsequent jumps. Preserve the intended double-jump and flip/back-flip behavior, with correct landing/reset logic.
- Keep the existing joystick behavior unchanged unless a verified defect requires a minimal targeted correction.

## 2. Enemy movement and collision
- Fix enemies appearing to float or fly unintentionally. Ground-based enemies must remain grounded, obey gravity/floor/platform collision, and use appropriate walk, jump, attack, hit, and defeat states.
- Any intentional airborne enemy must have an explicit designed airborne behavior and animation; no accidental drifting or hovering.
- Ensure enemy collision bodies match visible sprites closely and remain stable on platforms and ledges.
- Verify enemy spawn, landing, knockback, and recovery behavior across all stage layouts.

## 3. Sound and audio settings
- Add a polished, consistent audio set:
  - Background music for menus and gameplay (appropriate looping and transitions).
  - Hero movement/landing where useful, jump, double-jump, fire/projectile, hit, enemy defeat, special attacks, snowball roll/kick, boss entrance/attacks/defeat, stage start/clear, and UI confirmation sounds.
- Use original or properly licensed/royalty-free audio assets; record asset source and license in the repository.
- Avoid harsh volume spikes. Mix music and effects at balanced levels.
- Add working music and sound-effects volume controls, mute persistence for the app session, and sensible audio initialization after the player's first interaction (mobile browser/WebView autoplay restrictions).
- Prevent duplicate overlapping loops and stop/release sounds when changing scenes or restarting.

## 4. Fifty fixed, designed stages
- Implement exactly 50 authored stage definitions. Stage layouts, enemy sets, spawn positions, boss encounters, and difficulty progression must be deterministic and fixed—not randomly generated on each play.
- Each stage must have a distinct, intentional layout/theme and a clear difficulty curve. Use reusable data-driven stage definitions, but author and verify every stage individually.
- Upgrade stage presentation to a premium arcade look: coherent background art, layered scenery, lighting/depth, stage title/number, clear visual hierarchy, and polished start/clear transitions.
- Increase the number and variety of horizontal platforms/lines compared with the current layout. Platforms should extend upward through the arena, in the classic Snow Bros.-style multi-level arrangement, while remaining readable and playable.
- Design platform placement so the hero and enemies cannot become trapped between lines, inside geometry, or in unreachable pockets. Provide adequate gaps, safe landing zones, reachable routes, and escape paths.
- Check collision boundaries, spawn points, platform edges, jump reachability, and enemy navigation for every one of the 50 stages.
- Keep the camera and stage framing consistent with the existing fixed single-screen arena approach; do not introduce unwanted scrolling.

## 5. Snowball freeze-and-kick mechanic
- Add a Snow Bros.-inspired original snowball mechanic adapted to ZERO GAME:
  - A suitable enemy hit/freeze interaction turns the enemy into a snowball.
  - The snowball has clear visual feedback and rolls along the platform with reliable collision behavior.
  - When the hero gets close and uses the appropriate fire/action interaction, the hero performs a visible kick that launches the snowball.
  - A kicked snowball travels through enemies and damages/defeats them according to balanced rules, with hit feedback and impact effects.
  - Snowballs must not become stuck in platforms, pass through floors unexpectedly, or trap the hero.
- Make the mechanic understandable through visual cues or a short first-use hint. Do not copy Snow Bros. artwork, assets, or exact presentation.

## 6. Extra 1 / Extra 2 / Extra 3 special buttons
- Fix all three special buttons so each reliably damages or affects valid enemies; currently they appear not to damage enemies.
- Give each button its own distinct, polished, readable hero animation and matching visual/audio effect. The moves should feel like original arcade-fighter specials, not generic or identical attacks.
- Ensure hitboxes, target detection, damage application, cooldowns, and animation timing are synchronized. A successful visual attack must produce its intended gameplay effect.
- Provide clear cooldown/availability feedback and prevent accidental repeated activation while an animation is locked.
- Test each special against normal enemies and bosses, including edge-of-screen and airborne/grounded cases where supported.
- Preserve existing button positions and working touch targeting unless a tested usability correction is essential.

## 7. Final four boss characters
Create four original boss archetypes inspired by the broad fighting styles previously requested from the final-four-boss concept. Do not copy protected character designs, names, costumes, signature move names, or exact animations.

1. **Boxer boss:** powerful punch combinations, readable charge-up, forward rush, and an uppercut-style arcade attack.
2. **Agile claw fighter boss:** fast repositioning, leaps, aerial approaches, and quick multi-hit claw-like energy attacks (stylized, non-graphic).
3. **Martial-arts master boss:** heavy kicks, longer-range attacks, disciplined combos, and strong recovery/telegraph windows.
4. **Final warlord boss:** fast movement, multiple distinct special attacks, and a multi-phase final encounter with clearly signaled phase changes.

For all four:
- Create distinctive silhouettes, palettes, names, intro/defeat sequences, health presentation, attack patterns, and original animation sets.
- Tune movement and attacks to ZERO GAME's fixed arena/platform gameplay rather than importing one-to-one fighting-game behavior.
- Telegraph major attacks, provide fair dodge/jump opportunities, and ensure boss collision/arena boundaries work.
- Make the fourth boss a memorable final challenge, not an unfair damage sponge.

## 8. ZERO GAME app icon and Android launcher icon
- Create a professional, original ZERO GAME app icon/logo artwork suitable for a mobile arcade fighting game.
- Apply the artwork to the in-game/app branding where appropriate and to Android launcher icon resources so the installed app no longer shows the generic/default icon.
- Generate all required Android icon densities and adaptive icon foreground/background resources; verify Capacitor/Android project configuration uses them.
- Ensure icon remains legible at small sizes, has safe margins, and looks correct on Android 10 launchers.
- Keep app display name as **ZERO GAME** and package id as `com.zerogame.arcade`.

## 9. Quality gates and delivery
- Inspect the existing implementation before changing it; reuse existing systems and avoid unnecessary rewrites.
- Implement the work in integrated phases, with each phase including its own automated tests and regression checks. Do not defer all verification to a separate review phase.
- Add/update automated tests for fixed stage determinism, stage count, platform collision/reachability invariants, enemy grounding, snowball collision/kick, special-button damage/cooldowns, boss phase logic, and audio lifecycle where testable.
- Run dependency checks, lint/type/build checks available in the repository, game tests, and Android Gradle debug APK build.
- Test Android landscape/fullscreen, touch target alignment, joystick, fire, super, jump/double-jump, and all three special buttons for regressions. Clearly distinguish automated verification from physical-device testing.
- Build a fresh installable APK from the final commit and provide the GitHub Actions run/artifact link. Do not claim device testing unless actually performed.
- Update this document with implementation status, commit SHAs, test results, and APK build result as work proceeds.

## Acceptance checklist
- [ ] Hero has polished walk/jump/land/attack animations; no name label above hero.
- [ ] Existing joystick/controller behavior remains correct.
- [ ] Enemies no longer float unintentionally.
- [ ] Background music and all requested gameplay/UI sound effects work with volume controls.
- [ ] All 50 stages are fixed, distinct, and deterministic.
- [ ] Premium stage presentation and increased upward platform layout are complete.
- [ ] No platform geometry traps the hero or enemies; all routes are playable.
- [ ] Snowball freeze/roll/close-range kick mechanic works reliably.
- [ ] Extra 1, Extra 2, and Extra 3 each damage enemies and have distinct special animations.
- [ ] Four original final bosses implement the specified archetypes and suitable movement/animations.
- [ ] Original ZERO GAME icon is applied to Android launcher and app branding.
- [ ] Automated checks pass and a fresh Android APK is built and linked.
- [ ] Physical-device verification status is reported honestly.


## Implementation progress — 2026-11-20

The following source changes have been committed to `main`:

- **50 stage layouts:** Added fixed platform definitions for every stage, with four elevated platforms plus the permanent floor. Layouts are deterministic and have 50 distinct signatures.
- **Enemy movement:** Removed the unintended gravity-disabled flyer from the normal enemy spawn rotation. Ground-based enemy types now use the existing physics/platform collision system.
- **Special damage:** Routed special-move impacts through the same enemy hit/damage pipeline used by projectiles, so damage counters, defeat progression, and scoring stay synchronized.
- **Boss archetypes:** Replaced the final four milestone boss descriptions with original martial-arts-master, agile-claw, boxing-champion, and final-warlord archetypes; added silhouette details keyed to those styles.
- **Audio foundation:** Added original synthesized music and sound effects, session-persistent music/SFX toggles, HUD toggles, and M/N keyboard shortcuts. Connected jump, double-jump, fire, special, enemy hit/defeat, snowball kick, and boss sounds.
- **Android icon:** Added original vector launcher artwork and a build script that installs adaptive and legacy Android launcher icon resources.
- **Automated checks:** Added Node tests for 50-stage count, unique fixed layouts, in-bounds platform geometry, deterministic reads, and final boss archetype coverage. Added `npm test` to the Android CI workflow.


- **Hero special animation poses:** Added separate visual pose states for wave, uppercut, spin, rapid, electric, roll, and throw signature moves, while retaining the existing walk/jump/double-jump/landing animation flow.
- **Stage-layout refinement:** Removed a temporary width-only distinction and adjusted repeated layouts so all 50 stage platform arrangements are distinct through actual platform placement changes; all 200 elevated platforms remain within the 960×540 arena bounds.

### Still pending before APK delivery

- Complete and verify the requested hero animation upgrade and all special-move-specific animation timing.
- Complete boss-specific attack/intro/defeat animation and phase behavior beyond the current style-based movement/pattern foundation.
- Finish and verify the full snowball freeze/roll/kick collision rules and tutorial cue.
- Verify audio playback, mobile HUD toggle usability, volume balance, and lifecycle behavior on Android.
- Run the new tests, lint, web build, and Android Gradle APK build; resolve any failures.
- Physically test the resulting APK on the target Android device before claiming device verification.

**Status:** Implementation is in progress. No upgraded APK is declared ready until the CI checks and Android APK artifact have completed successfully.

## User clarification — movement and premium stage redesign (2026-11-20)

The user clarified the exact required platform behavior and rejected the current stage presentation as not yet premium:

### Platform traversal and ground boundary
- The hero must be able to jump upward through every elevated platform/line from below, rather than colliding with the underside.
- The hero must be able to intentionally drop down through an elevated platform by pressing DOWN on the joystick together with JUMP.
- The DOWN + JUMP drop-through action must work from any elevated platform and land on the next lower platform when present.
- The permanent bottom ground/floor must remain solid: the hero must never drop below or fall through the ground.
- Preserve the currently approved horizontal joystick movement and all action-button touch hit areas.

### Premium redesign of all 50 stages
- Redesign the presentation of all 50 stages; the current repeated castle/building background with only palette changes is not acceptable as the final premium design.
- Every stage must have its own recognizable, polished composition while belonging to a coherent world theme. Use the existing ten world themes as a foundation, with five increasingly polished stage variations per world.
- Give each world/stage a distinct visual identity through scenery landmarks, layered background/foreground, lighting/atmosphere, premium platform materials and trims, stage number/title treatment, and coordinated colors.
- Keep the fixed 960×540 single-screen arena and ensure all platforms remain reachable with safe landing routes.
- Do not change the approved joystick feel or break the existing gameplay baseline.

**Acceptance checks added:** upward pass-through from below on every elevated platform; DOWN + JUMP drop-through from elevated platforms; solid bottom floor; no out-of-bounds fall; all 50 stages visibly differentiated beyond color-only changes; stage layout and collision tests pass.

## Clarification implementation log — 2026-11-20

Source changes committed to main after the user's clarification:

- Added a hero-only one-way platform collision filter: upward movement passes through elevated platforms; descending from above can land on them.
- Added joystick vertical-down detection while preserving the existing horizontal axis mapping.
- Added DOWN + JUMP drop-through handling only while grounded on an elevated platform. The permanent floor is explicitly exempt from drop-through and remains solid.
- Removed the repeated castle/building/tree backdrop from every stage.
- Added ten world-specific landmark/scenery compositions (Emerald, Candy, Frozen, Desert, Moonlit Forest, Crystal, Coral, Sky Islands, Volcano, Starfall Citadel), with five deterministic visual variations per world.
- Added themed platform tint, illuminated trim and a subtle pulsing accent.
- Added automated data checks for ten worlds, five stages per world, unique stage names and themed palette data.

### Verification still required

- Run npm test, npm run lint, and npm run build.
- Inspect/fix any Phaser runtime issues in the one-way collision/drop-through behavior.
- Verify all 50 stages visually in-game, especially that their five variations are genuinely distinct and platforms remain reachable.
- Build a fresh Android APK and physically test on the user's Redmi Note 8.
- Do not mark the movement or premium stage redesign complete until those checks pass.


## User clarification — campaign selection, chances, hearts and stage transitions (2026-11-20)

### One-time hero selection
- Show the hero-selection screen once when a new campaign begins.
- Lock the selected hero for the entire 50-stage campaign; do not show hero selection again on every stage or after a stage transition.
- Preserve the chosen hero and campaign progress through stage changes and continue/retry flows.

### Three chances, three hearts each
- The player has exactly **3 chances** for the campaign.
- Each chance contains **3 hearts** (health points).
- Losing all 3 hearts consumes one chance. If another chance remains, restore the player to 3 hearts and resume the current stage without asking for hero selection again.
- When all 3 chances are consumed, show Game Over. Do not silently grant unlimited retries or make the old demo-token system bypass the three-chance campaign rule.
- Display chances and hearts clearly in the HUD and failure screen. Keep score/extra-life rules separate unless explicitly integrated and tested.

### Snow Bros.-inspired stage transitions
- On stage clear, use a polished transition that brings the *next stage itself* into view, not only a text overlay or instant scene restart.
- Author a deterministic entry direction per stage: some stages enter from above moving downward, others from left moving right, and others from right moving left.
- Use a fixed stage-number-to-direction mapping (never random) and animate the incoming stage's scenery, platforms and stage identity together.
- Spawn/activate enemies and resume player control only after the transition completes.
- Keep the 960×540 fixed arena, preserve the selected hero and campaign state, and prevent transition animation from moving or resizing the gameplay camera.

### Acceptance checks
- Hero selection appears once per new campaign and remains locked for all 50 stages.
- The selected hero persists across stage changes, retries and chance loss.
- HUD shows 3 chances and 3 hearts per chance; losing all hearts consumes exactly one chance.
- The next chance restores 3 hearts; after the third chance is lost, Game Over is shown.
- All 50 stage transitions use the authored direction mapping and correctly load the matching next-stage scenery/platform layout.
- Transition completion starts gameplay exactly once and does not duplicate enemies, timers, music loops or physics objects.

## APK build policy — strict
- Every workflow capable of producing an Android APK must use manual `workflow_dispatch` only.
- Pushes and pull requests may run tests, lint and web build, but must never run Gradle APK assembly or upload APK artifacts.
- Do not dispatch any APK workflow, run `assembleDebug`, or create a release APK until every requested feature, regression test, lint check and web build is complete and accepted.
- The Android APK is the final delivery step only.


## Campaign systems implementation progress — 2026-11-20

Committed source implementation:

- Added `src/campaignRules.js` with a campaign life-state model: three chances, three hearts per chance, chance decrement after the third heart is lost, and Game Over after the third chance.
- Added regression tests for fresh campaign state, all three chance-loss boundaries, Game Over, and deterministic transition directions for all 50 stage numbers.
- Hero selection is now guarded by a campaign lock. Selecting a hero starts a new campaign; stage restarts keep the same selected hero and do not return to hero selection.
- Replaced the old token-based continue screen with a Game Over screen and an explicit new-campaign action. Losing a chance restores three hearts and respawns the same selected hero in the current stage.
- HUD now separates hearts from remaining chances. The existing 10,000-score bonus is retained as a heart/chance recovery reward, capped at three hearts and three chances.
- Stage advance (both the Next Stage control and keyboard advance) uses a fixed repeating direction map across the 50 stages: downward entry, left-to-right entry, right-to-left entry. The stage scene's background, scenery, platforms and hero are animated into the fixed 960×540 arena before enemies and controls resume.
- The transition pauses the physics world while stage objects move and synchronizes Arcade bodies with their display objects; gameplay resumes after the transition callback.

### Automated verification

- CI run [44751094986](https://github.com/adeeldo-ctrl/zero-game/actions/runs/44751094986) completed successfully after the transition-index correction.
- `npm test`, `npm run lint`, and `npm run build` all passed on commit `f80b5127a0b4b1cefb52d156a24e304b50e55946`.
- The earlier failing test run was caused by an off-by-one in the stage-direction helper; it was corrected and the subsequent full CI run passed.

### Remaining integration verification

- Inspect the transition animation in a running Phaser game for all three entry directions, including static-platform collision-body alignment throughout movement.
- Verify hero selection appears exactly once in a complete campaign and persists through all stage advances and chance losses.
- Verify the chance/heart HUD, damage invulnerability, respawn timing, Game Over and new-campaign reset in gameplay.
- Continue the remaining animation, enemy/snowball, specials, bosses, audio and Android compatibility work.
- Do not create an Android APK until every requested feature and all regression checks are complete.


### Follow-up implementation — automatic stage loading and snowball guidance

- Cleared stages now advance automatically after a short victory interlude; the player may also tap the on-screen Next Stage prompt to advance immediately.
- Keyboard stage advance uses the same single guarded transition function, preventing double stage increments.
- Stage transition direction is calculated from the incoming stage number and remains deterministic.
- Added a first-time-per-campaign tutorial cue when an enemy freezes: move close and tap Fire to kick the elemental ball. The cue resets for a fresh campaign.
- Removed the obsolete demo-token continue state; the campaign's three-chance rule is now the only retry system.
- CI run [44751502299](https://github.com/adeeldo-ctrl/zero-game/actions/runs/44751502299) passed `npm test`, `npm run lint`, and `npm run build` on commit `f6f7b023eff1b3e1d99715b187427a060fc51127`. The later documentation-only commit also passed CI in [run 44751573442](https://github.com/adeeldo-ctrl/zero-game/actions/runs/44751573442).

**Still not claimed as physically verified:** the transition animation and physics-body alignment require in-game runtime inspection. No Android APK has been built for this work.


## Integrated hardening follow-up — 2026-11-20

- Refactored heart loss so each hit is processed through the three-hearts/three-chances state helper; added a chance-loss lock to prevent repeated collision callbacks from consuming more than one chance during the respawn interval.
- Capped treasure-heart rewards at three hearts and capped score-bonus recovery at the campaign maximum of three hearts / three chances.
- Fixed boss visual initialization ordering: boss archetype flags are now initialized before the boxer-specific fist artwork uses them. This was a runtime issue that lint/build alone would not detect.
- Extracted one-way platform collision and DOWN+JUMP drop-through decisions into `src/platformRules.js`; wired the Phaser collision callback and input path to those rules.
- Added `tests/platformRules.test.js` covering upward pass-through, descending landing, intentional drop-through, and the permanent ground exception.
- Confirmed all three repository workflows are present; both APK workflows remain manual `workflow_dispatch` only, while CI push/PR workflow performs tests, lint and web build only.
- CI passed for the boss initialization fix on commit `13d6e33fa9a512bc547ad1caa1da7dd76da29615` (run [44755215793](https://github.com/adeeldo-ctrl/zero-game/actions/runs/44755215793)). The campaign hardening commit `94155b89d1713c61901422cab5fbcab20cad6e5c` also passed (run [44755180266](https://github.com/adeeldo-ctrl/zero-game/actions/runs/44755180266)).
- Platform-rule integration and its new regression tests are committed; their CI runs are pending verification at the time of this update.

**Still outstanding:** visual/runtime inspection of all stages and transitions; verify the complete campaign on the actual game runtime; further animation polish, enemy grounding and AI checks, snowball collision edge cases, special-move/boss balance, audio lifecycle, Android icon resources and Android compatibility. No APK has been built.


## Further integrated work — 2026-11-20

- Added a reachability regression test across all 50 authored stage layouts. It verifies every elevated platform can be reached from the permanent floor through a sequence of reasonable vertical and horizontal jumps; all 50 layouts pass this graph-based design check.
- Added persisted music and SFX volume levels (0%, 25%, 50%, 75%, 100%). Tapping the MUSIC / SFX HUD labels cycles their respective volume levels; keyboard M/N continues to toggle each channel on/off. Audio volume settings are stored locally.
- Restarted the background music/stage cue from the campaign entry path so it resumes after a stage scene restart instead of waiting indefinitely for a new keyboard event.
- Added independent cooldown timers for EXTRA 1, EXTRA 2 and EXTRA 3, with a remaining-time message when a move is pressed before it is ready. Cooldowns reset on a new campaign.
- Fixed the fresh-campaign reset so a Game Over chance-loss lock cannot remain active and make the next campaign immune to enemy damage.
- CI passed for the latest campaign reset and special-move cooldown changes on commit `fa6ee007be52d3ed0dd96ea80b74c0fb39f53699`, run [44756020934](https://github.com/adeeldo-ctrl/zero-game/actions/runs/44756020934). The associated audio-volume and audio-resume commits also passed CI (runs [44755848793](https://github.com/adeeldo-ctrl/zero-game/actions/runs/44755848793) and [44755917082](https://github.com/adeeldo-ctrl/zero-game/actions/runs/44755917082)).
- CI includes `npm test`, `npm run lint`, and `npm run build`; all passed on those commits.

**Remaining work is still substantial:** runtime/visual verification in the actual Phaser game, final animation and visual polish, detailed enemy and boss balancing, snowball edge-case verification, Android workflow/icon/landscape/fullscreen validation, and final integrated Android build. Automated data/rule checks do not replace gameplay runtime or physical-device testing. APK workflows remain manual-only and have not been dispatched.


## Android policy and launcher validation hardening — 2026-11-20

- Added `scripts/validate-android-config.py` to statically validate the package id, app name, Capacitor web directory, adaptive/legacy icon XML, icon installation script, and workflow trigger policy.
- Added the static Android validation to the push/PR CI workflow. It does not create an Android project, invoke Gradle, assemble an APK, or upload an APK.
- CI run [44756164437](https://github.com/adeeldo-ctrl/zero-game/actions/runs/44756164437) passed on commit `da0aaaed028db5db1ce3290ce50e0241a4de5cdd`: automated tests, lint, Android configuration validation, and web build all succeeded.
- Confirmed both APK workflows remain manual-only. No APK workflow has been dispatched.


## Combat, snowball and audio regression coverage — 2026-11-20

- Extracted boss phase thresholds and per-special cooldown timing into `src/combatRules.js`; tests cover ready/recharging countdowns and phase changes at 60% / 25% boss health.
- Extracted snowball kick eligibility, rolling-ball hit proximity, and arena cleanup bounds into `src/snowballRules.js`; tests cover frozen/nearby/in-front eligibility, target collision envelope, and out-of-bounds cleanup.
- Extracted audio volume clamping and added tests for mute, normal levels, numeric strings, invalid values, and over-range values.
- Removed direct named references to existing fighting-game characters from the normal enemy roster; all enemy names are now original.
- Added music/SFX volume hit targets to the Android touch overlay, since the full-screen overlay intercepts touches before Phaser HUD labels receive them. This preserves the existing joystick and action-button hit areas.
- The snowball rule tests and the preceding combat/audio unit tests passed in CI run [44756530964](https://github.com/adeeldo-ctrl/zero-game/actions/runs/44756530964), alongside lint, Android static validation, and web build.
- Latest mobile HUD touch-zone adjustments are committed and awaiting their CI run. No Android APK has been built.
