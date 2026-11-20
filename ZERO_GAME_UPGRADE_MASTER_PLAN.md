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
