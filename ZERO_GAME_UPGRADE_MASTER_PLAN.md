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
- Ensure hitboxes, target detection, damage application, and animation timing are synchronized. A successful visual attack must produce its intended gameplay effect.
- All three EXTRA moves have unlimited immediate use: no cooldown, countdown, power meter, limited-use counter, or animation lock. Repeated presses must trigger the move again immediately.
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
- Add/update automated tests for fixed stage determinism, stage count, platform collision/reachability invariants, enemy grounding, snowball collision/kick, special-button damage and immediate repeat-use, boss phase logic, and audio lifecycle where testable.
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


## Headless gameplay runtime smoke test — 2026-11-20

- Added `scripts/smoke-game-browser.mjs` and a Chromium smoke-test step to CI. It opens the actual Vite game, verifies the fixed 960×540 canvas, enters the campaign, selects a hero, waits for gameplay/enemy spawning, exercises jump, all three special keys and fire, and fails on uncaught browser/runtime console errors.
- Pinned the CI runner to Ubuntu 24.04 because the prior `ubuntu-latest` image had moved to Ubuntu 26.04, which Playwright 1.56.1 did not yet support.
- Corrected smoke-test server startup/cleanup to launch Vite directly and terminate the exact child process. The first smoke-test attempt exposed a lingering npm-child process; the corrected run completes cleanly.
- Headless Chromium campaign smoke test passed on commit `16c73ca96c3f1e4745ec7c48afab10983bc930e4`: [CI run 44757318455](https://github.com/adeeldo-ctrl/zero-game/actions/runs/44757318455).
- This is automated browser testing, not physical Android device testing. Boss-stage progression through all 50 stages and touch interaction on the Redmi Note 8 still require dedicated verification.


## Final integrated hardening — 2026-11-20

- Latest 50-stage Chromium run [44772529464](https://github.com/adeeldo-ctrl/zero-game/actions/runs/44772529464) passed: all 50 stage restarts, 50 unique landmark signatures, hero/lives persistence, all three stage-entry directions, grounded regular enemies, real platform physics, boss archetype attack patterns, and no uncaught browser runtime errors.
- Extended the headless runtime suite to exercise all three RYO special moves against live Phaser enemies, verify independent cooldown activation, and kick an elemental ball into a second enemy. The updated test is running in CI after this commit.
- Removed the redundant legacy Android APK workflow. There is now one manual-only APK workflow, which applies landscape orientation, immersive full-screen navigation/status-bar hiding, launcher resources, and only then assembles/uploads the debug APK.
- Strengthened Android static validation so CI checks the single workflow's manual-only trigger, landscape setting, immersive flags, APK artifact step, and absence of APK building in continuous checks.
- APK workflows have not been dispatched. No APK has been built. Physical Redmi Note 8 touch/display/audio testing remains a user-device verification step; Chromium automation is not represented as physical-device testing.


## Latest integrated verification — 2026-11-20

- Updated the Chromium smoke harness to stabilize the hero and test enemies before invoking directional special moves. This prevents enemy AI/physics drift from making the EXTRA 2 / EXTRA 3 assertions depend on frame timing.
- Latest integrated CI run **44778446475** completed successfully: `npm test`, `npm run lint`, Android static validation, `npm run build`, Chromium installation, and the full Chromium campaign smoke test all passed.
- The Chromium smoke test verified all three special moves against active Phaser enemies, the snowball kick/roll collision, three hearts / three chances / Game Over / new-campaign reset, upward platform pass-through, elevated-platform landing, DOWN+JUMP drop-through, permanent-floor protection, four boss archetypes and their attack patterns, all three stage-entry directions, campaign persistence, all 50 real stage restarts, 50 unique stage landmark compositions, grounded enemy spawns, and no uncaught browser runtime errors.
- The CI run is automated browser verification only; it does not prove physical Android touch/audio/display behavior.
- Confirmed `.github/workflows/` contains only `zero-game-ci.yml` and `zero-game-android.yml`. The CI workflow performs no APK assembly or artifact upload; the sole APK workflow remains `workflow_dispatch` only.
- No APK workflow has been dispatched and no APK has been built.

### Remaining before final APK delivery

- Review the remaining animation and boss behavior in the actual game, including phase transitions and attack/defeat feedback; automated smoke currently verifies boss archetype visuals and first attack patterns.
- Complete any final gameplay/Android configuration checks, then rerun integrated CI after the last source/documentation changes.
- Only after every requested feature and verification is complete, manually dispatch the single APK workflow and verify the generated APK artifact.
- Redmi Note 8 physical touch, screen, audio and installation checks remain pending user-device verification.


## Mobile-input and boss-phase integration verification — 2026-11-20

- Latest integrated CI run **44779266235** passed in full: unit/regression tests, lint, Android static configuration, web build, and the expanded Chromium gameplay smoke test.
- Expanded runtime coverage now exercises the DOM touch overlay used by mobile devices: joystick rightward axis, DOWN direction, joystick release/reset, MUSIC and SFX volume hit targets, and all three on-screen EXTRA buttons.
- Expanded boss integration coverage verifies the final warlord enters phase two at 60% health and phase three at 25% health, and that phase three fires the expected seven-projectile volley.
- All automated project checks are now green on the tested commit. This remains headless-browser verification; native Android WebView behavior, device-specific touch alignment, audio playback and installation still need physical-device confirmation after APK delivery.
- The APK workflow remains manual-only and has not yet been dispatched. The APK is still reserved as the final build step.


## Unlimited special-move use and final-only APK build — 2026-11-21

- The latest direct user instruction supersedes earlier cooldown wording: EXTRA 1, EXTRA 2 and EXTRA 3 must be usable repeatedly with no cooldown, countdown, meter, use counter or animation lock.
- Removed the cooldown timer/state and recharge-message path from the Phaser scene and combat rules.
- Updated the Chromium gameplay smoke test to press every on-screen EXTRA button twice in immediate succession and verify repeated special-projectile activation.
- Android APK creation is manual-only and must not be started until the approved scope is complete.
- Automated CI and the fresh APK workflow are pending for this commit. Physical Android device verification remains separate and must not be claimed without testing.


## User instruction — no intermediate updates and final-only delivery (2026-11-25)

- Continue the complete approved ZERO GAME scope in the existing repository; preserve the existing game identity, campaign, controls, 50 stages, selected-hero persistence, chances/hearts, co-op and gameplay systems.
- Do not send intermediate working-step, log, line-by-line or progress updates in chat. Provide the completion report only when the work is finished, or state a genuine unavoidable blocker.
- Avoid unnecessary repeated testing. Keep the integrated CI workflow manually dispatchable and run the consolidated verification once after the requested development is complete.
- The Android APK workflow is manual-only. Do not build or upload an APK while the project is paused.
- Latest delivery workflow change: both `.github/workflows/zero-game-ci.yml` and `.github/workflows/zero-game-android.yml` are manual-only; Android static validation enforces the no-auto-build policy.
- README now documents the final-only APK process.
- Additional polish committed: boss phase changes now have a distinct visual/audio cue; boss anticipation, dash, slam and energy-volley poses vary by boss archetype; bosses remain stationary during their volley pose. Added original synthesized landing, pickup, stage-clear, game-over and boss-phase sound cues and connected them to the corresponding game events.
- The final delivery commit is intended to start one consolidated CI run, followed by the Android APK build only if CI succeeds. Do not mark delivery complete until the run and artifact are confirmed. Physical-device behavior must remain clearly distinguished from automated verification.


## Safety pause — 2026-11-25

- Work on weapon-use or attack-enabling mechanics is paused. Do not continue those features or build an APK containing new weapon-use functionality.
- Non-combat work such as menus, stage presentation, accessibility, sound settings, general performance, and documentation can be considered separately.
- No APK has been built from the current changes.


## Audio-control usability correction — 2026-11-25

- Updated the in-game MUSIC and SFX HUD labels so tapping either label toggles that channel on/off without changing its saved volume level.
- Keyboard shortcuts M and N use the same toggle path as the HUD, keeping labels and enabled state synchronized.
- Volume cycling remains a separate operation and saved volume preferences are preserved when muting/unmuting.
- Source change: `src/App.jsx`, commit `318fcf29a8863db4473e672592bd4617c0ed1e76`.
- This is a focused source change; consolidated CI and Android delivery have not been run after it.


## Mobile lifecycle and background-resume hardening — 2026-11-25

- Added app visibility handling in `src/App.jsx`: when the app/browser is backgrounded, active touch flags are cleared, gameplay is paused, and audio timers/oscillators are stopped.
- When the app returns to the foreground, gameplay resumes. Audio remains subject to the existing mobile autoplay policy and is unlocked by the player's next interaction.
- This avoids continued gameplay/audio in the background and reduces the risk of a stuck joystick/action after an app switch.
- Source commit: `573b53aa7b1c1be52587058b96fec2cb83c10c83`.
- This change has not yet been included in the one final consolidated CI run; no APK has been built.


## Mobile input reset correction — 2026-11-25

- Corrected the blur/visibility touch-reset path to clear `mobileActionQueue` as an array (`length = 0`) rather than calling the unsupported `.clear()` method.
- This prevents a runtime TypeError when the browser window loses focus while the game is active, while still clearing queued mobile actions so no held action remains stuck.
- Source commit: `a1ae5e098b539b4c35c6c9abe4e1717629ca10f8`.
- Consolidated verification remains pending until the approved non-combat development scope is complete; no APK has been built.


## Final user delivery instructions — 2026-11-27

These instructions supersede earlier project-level delivery preferences where they conflict:

- Complete the existing ZERO GAME project against this Master Plan and the latest `main` branch; preserve the established game identity, 50-stage campaign, four heroes, controls, co-op, progression, lives/hearts, bosses, audio, and existing working systems.
- Complete and polish the remaining planned game features, animations, stage presentation, enemy behavior, boss behavior, input reliability, and mobile compatibility. Fix the reported joystick / EXTRA-button freezes and verify the fixes in the integrated runtime.
- EXTRA 1, EXTRA 2, and EXTRA 3 must remain independently usable without cooldowns, countdowns, meters, use counters, or animation locks.
- Fictional, non-realistic arcade visual effects are in scope: stylized fire, energy, glow, lightning, magical projectiles, impact flashes, and signature-move animations. Do not implement real-world weapon operation, realistic weapon-use instruction, or real-world attack replication.
- The 2025-11-25 project safety pause is superseded only for the fictional visual-effect and abstract arcade-game scope described above. It does not authorize realistic real-world weapon mechanics or attack replication.
- Do not provide intermediate progress, line-by-line updates, or unnecessary test reports. Deliver only the final APK and a complete report, or identify a genuine unavoidable blocker.
- Final Android deliverable must be a Release APK, not a Debug APK. Do not claim the game is complete or the APK is ready until source implementation, consolidated automated verification, Android Release build, and artifact verification have actually succeeded.
- Distinguish automated CI/browser verification from physical Android-device testing. Do not claim Redmi Note 8 testing unless it has actually been performed.


## Final completion work — 2026-11-27

The following source changes are committed on `main` and covered by the integrated CI run:

- **Home-screen hero presentation:** Removed triangular crest/marker-like shapes from the four hero preview designs, replacing them with rounded character details. Repositioned all four previews, wrapped each hero description in its own fixed-width area, and separated the co-op controls from the hero descriptions.
- **Hero-selection screen:** Rebalanced the four selection cards, title/description/power/move spacing, and selection buttons so the full card fits the 960×540 game area without clipping.
- **Twelve signature moves:** Added move-specific visual effects for all twelve hero specials. Fire wave, rising, and spin variants use distinct flame silhouettes; Mei's lightning attacks use branching bolt motifs; Volt's storm/roll/throw moves use their own burst, streak, and crescent treatments.
- **Snowball effects:** Added separate visual families for freeze, rolling trail, kick launch, and impact fragments instead of reusing the element particle family for every snowball event.
- **Five boss battles:** Added a dedicated armored Gatekeeper silhouette and differentiated attack sequences, movement speeds, telegraph callouts, and projectile silhouettes for the Gatekeeper, Boxer, Agile Claw fighter, Martial-Arts Master, and Final Warlord. Existing five boss milestone stages remain stages 10, 20, 30, 40, and 50.
- **Music:** Added distinct menu, ten world, five boss, victory, and defeat melodies. Added layered harmony, bass and rhythm accents, and connected menu, boss, stage-clear, and game-over transitions to the corresponding track.
- **Android release pipeline:** Converted the final-only Android workflow from a debug APK to a signed Release APK build. The workflow aligns and signs the release APK, verifies the APK signature, and uploads the `zero-game-release-apk` artifact. It remains manually triggered so no partial APK is produced during development.
- **Regression coverage:** Updated Chromium smoke coverage to assert four clean hero previews, no triangular hero marker artwork, non-overlapping descriptions, and the opening patterns of all five bosses.

### Integrated verification result

- GitHub Actions CI run **45953202448** passed on commit `f98f76d2b146a63afb29a884435f3046fb067ca1`: automated tests, lint, Android configuration validation, web production build, and the Chromium gameplay smoke test.
- The Chromium smoke test is automated browser verification, not physical Android-device verification.
- The final Release APK workflow has been configured but has **not yet been dispatched**. No APK artifact is claimed by this update.
- Physical Android installation, touch alignment, and audio behavior remain unverified on a physical handset.

**Status:** The screenshot/menu, signature-effect, snowball-effect, boss-pattern, music-theme, and release-workflow changes above are implemented. Do not mark the overall project delivered until the remaining agreed acceptance scope is complete and a signed Release APK artifact has been built and verified.


## Final Release APK trigger policy — 2026-11-27

- The Android workflow remains final-only. It supports manual dispatch and one explicit push trigger: adding `ZERO_GAME_FINAL_RELEASE_TRIGGER.md` on `main` after integrated CI has passed.
- Ordinary source pushes never trigger an APK build. The one-time marker is only to start the final signed Release APK after the approved scope and final CI are complete.
- The Release APK is signed with a runner-generated one-time key. Preserve the delivered APK as the final install package; a future update signed with a different key will require uninstalling the old package first.


## Final Release APK delivered — 2026-11-27

- **Release workflow:** GitHub Actions run `45954385742` — successful.
- **Source commit:** `5f5e18990bd5cdccb8f3b27d7fe3f59e8af8cd60`.
- **Artifact:** `zero-game-release-apk`, artifact ID `15178341478`.
- **APK:** `zero-game-release.apk`, 3,620,521 bytes (about 3.45 MiB).
- **SHA-256:** `513c83f7d817b4bb63b328cd226ba76a2a71eb1f750f017520b10b9b6d64d811`.
- Gradle Release build, ZIP alignment, APK signing, `apksigner verify`, and artifact upload all succeeded.
- Automated browser gameplay verification passed on source commit `f98f76d2b146a63afb29a884435f3046fb067ca1` in CI run `45953202448`. The Release workflow also passed its game-data tests, lint, and production web build on the release commit.
- **Physical Android handset test:** not performed by GitHub Actions. Install and play-test on the target handset before treating touch/audio/device compatibility as physically confirmed.
- The APK is signed using a one-time CI-generated signing key. Future updates signed with a different key cannot update this installation in place; uninstalling the old package may be required.

**Delivery status:** Signed Release APK successfully built, signature-verified, uploaded to GitHub Actions, and downloaded for direct delivery.

## User clarification — snowball durability, dedicated boss stages, enemy scale and jump-stomp rules (2026-11-27)

The following gameplay requirements are mandatory and supersede any conflicting first-wall snowball behavior or shared boss-stage flow:

### Snowball kick durability
- A kicked snowball must **not be destroyed by enemy fire/projectile effects**. Enemy fire may visually interact with it, but must not remove it or cancel its travel.
- After the hero kicks a snowball, it must remain active through **2 or 3 wall collisions** (use a deterministic, clearly visible bounce counter), then disappear on the next configured wall impact.
- Wall impacts must reverse horizontal travel with controlled bounce damping and preserve reliable platform/floor collision. The ball must not become trapped or bounce forever.
- Enemy-hit effects and enemy projectiles must not prematurely destroy a kicked snowball.
- Snowball appearance/size/impact strength must reflect the elemental power/strength used to freeze it; keep the relationship readable and consistent rather than using one generic ball for every power.

### Dedicated boss stages
- Boss encounters must take place in their own dedicated stage/arena, separate from the regular enemy stage.
- Do not spawn a boss at the end of a regular enemy wave or append a boss after clearing the normal enemies in that same stage.
- Use explicit, deterministic boss-stage entries and transitions. Preserve the 50-stage campaign structure and the intended boss milestones; regular stages and boss stages must have distinct stage definitions, layouts, entry presentation, enemy rules and completion handling.
- A boss stage must load its boss encounter as the stage's primary encounter, with no preceding regular enemy quota unless specifically authored as part of that dedicated boss stage.

### Enemy size and movement
- Increase the visible size of regular enemies by **20%** from their current baseline, while keeping physics hitboxes aligned with the enlarged visible sprites.
- Correct enemy navigation and movement: enemies must move on the intended platforms, face/approach the player correctly, jump only when their AI state calls for it, and avoid floating, sliding, getting stuck or moving through platform geometry.
- Tune movement speed and acceleration by enemy archetype so the enlarged enemies remain controllable and fair.

### Enemy elemental fire and snowball strength
- The enemy's elemental/fire power must determine the strength tier of the snowball interaction. Keep the visual size, elemental appearance and gameplay impact consistent with that power tier.
- Do not allow enemy fire/projectile hits to destroy a kicked snowball.

### Hero jump-stomp protection
- When the hero successfully jumps onto/stomps an enemy from above, that enemy must pause/stop its movement for the stomp reaction window.
- A valid jump-stomp must not reduce the hero's hearts or consume a campaign chance. The enemy should show a clear, brief hit/stun reaction and then resume or enter its appropriate defeat/freeze state.
- Side collisions and ordinary enemy attacks must retain their normal rules; only the valid top-down jump-stomp interaction receives this protection.

### Acceptance checks
- Kicked snowballs survive enemy fire and complete exactly the configured 2–3 wall bounces before being removed.
- Bosses only appear after loading their own dedicated boss stage; no boss spawns as the final event of a normal enemy stage.
- Regular enemy visuals are exactly 1.20× their prior baseline, with collision bodies aligned to the new dimensions.
- Each enemy archetype has stable, platform-aware movement and correct facing/approach behavior.
- Elemental snowball tiers reflect the applicable power strength and remain consistent through kick/impact.
- A top-down hero jump-stomp stops the enemy briefly and causes no heart/chance loss; ordinary side contact remains unchanged.
- Automated tests cover bounce counts, projectile immunity, dedicated boss-stage routing, enemy scale/movement rules and jump-stomp damage immunity.
- Build a fresh Android APK only after all requested implementation and verification work is complete, following the repository's manual APK workflow policy. Report physical-device verification separately and honestly.


## 12. Fire, treasure, collectibles, and score-collection upgrade (2026-11-27)
- Fire particle effects now use a tenfold particle-count multiplier (capped per burst) to create denser flame tongues, embers, sparks, and impact bursts while retaining the existing elemental attack behavior.
- Treasure chest presentation has a more detailed layered chest, opening animation, elemental reward glow, and a visible elemental symbol for fire, ice, lightning, water, and other powers.
- Score drops are rendered as recognizable artwork rather than text-only colored orbs: strawberry, apple, cake, chicken, diamond, and gold-star collectibles.
- Normal-stage completion and boss defeat both enter the same five-second score-collection window before the victory/next-stage screen. Reward drops remain collectible during this window.
- Implementation is pushed to main. CI run 45959884866 is pending/in progress at the time of this update; do not mark this upgrade verified or release-ready until CI passes and a fresh Android APK is built.


## Particle power progression — 2026-11-27

- Particle visuals now have a collectible progression from **Power 1 through Power 20**.
- Elemental-power treasure rewards advance the particle tier by one level, up to the level-20 cap; the HUD displays the current tier.
- Each tier increases particle density, size, travel speed and lifetime. Fire retains its existing tenfold baseline particle-count boost and scales further across the 20 tiers; other elemental particle families also grow with the tier.
- The progression changes visual particle presentation only. Existing gameplay controls and non-particle systems are left unchanged.
- Source commit: `5ffeb6594ae8c8242be8b3824634894c3b2a19c3`.
- Consolidated CI has not yet been run for this change; do not claim this update verified until the workflow passes.


### Final particle-tier scaling adjustment

- Power 1–20 now scales particle density from 1x to 10x across the tier range, in addition to the existing fire baseline boost.
- Higher tiers also scale particle size, travel speed, and lifetime. Particle counts are capped per burst to avoid unbounded object creation.
- Latest gameplay implementation commit: `48f9bdbe0557190a2152d8c6d6ca3a7ff2937126`.
