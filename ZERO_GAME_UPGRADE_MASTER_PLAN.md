# ZERO GAME — Upgrade Master Plan

**Repository:** adeeldo-ctrl/zero-game  
**Branch:** main  
**Baseline:** Current approved APK / latest main build (2026-11-20).  
**Project rule:** Keep the existing ZERO GAME project and gameplay identity. These are upgrades to the same game, not a replacement or a new game.

### Named enemy identity silhouettes and animation accents (2026-11-27)
- Added enemy-name-specific visual identities for masked/ninja assassins, tiger-strike rivals, rapid/whirlwind runners, flame-fist scouts, iron/stone sentinels, and psychic guards.
- New face masks, tiger markings, speed fins, flame crests/wrist wraps, plated chest insignia, and psychic orbit accents are attached to the existing enemy visual container and receive restrained per-frame motion.
- These are additional procedural Phaser vector details, not newly authored sprite sheets. Enemy physics, AI, movement speeds, hitboxes, collision sizes, damage, and combat timing are unchanged.
- Source commit: `b38eca94fcaac4ee01f1caf2ca695f44c8490d43`.
- No tests/builds were run; consolidated verification and Android APK remain on hold until all development scope is complete.

### Element-matched boss volley and landing effects (2026-11-27)
- Boss projectile fills and outlines now use the boss's selected elemental palette instead of the boss body tint/white outline, while retaining each boss style's projectile silhouette, spread, speed, and phase count.
- Boss landing shockwaves now use a matching elemental core and expanding outline ring.
- No boss attack timing, projectile physics, damage, collision, or phase behavior was changed.
- Source commit: `3d950a5d189941f1857bde1f6f79d435e10582ce`.
- No tests/builds were run; final consolidated verification and APK remain deferred until development is complete.

### Enemy AI-state pose animation (2026-11-27)
- Added clear visual anticipation poses for runner/charger enemies, forward-leaning dash poses, guarded bracing poses, and airborne tuck poses for jumpers.
- The poses reuse the existing visual rig and update per frame; enemy state transitions, AI decisions, velocities, physics, hitboxes, damage, and attack timing are unchanged.
- Source commit: `28b9c6413a094e676863ac5a60e71de0289becd3`.
- No tests/builds were run; final consolidated verification and Android APK remain deferred until development is complete.

### Animated stage landmark lighting (2026-11-27)
- All five stage-variant landmark compositions now receive a slow, restrained alpha-light pulse; the fifth/final variant also has a rotating, softly pulsing star accent.
- The effect sits in the distant landmark layer behind gameplay and does not alter stage geometry, platform visibility, collisions, or controls.
- Source commit: `213a3c8c97dcfbf7ee7c3a19e7efa34b029e5784`.
- No tests/builds were run; final consolidated verification and Android APK remain deferred until development is complete.

### Weather-specific stage color grading (2026-11-27)
- Added a subtle, slowly breathing color wash for rain, snow/blizzard, sand/sandstorm, ashfall, embers/eruption, aurora, starfall/cosmic night, crystal, ocean bubbles, wind/clouds, sunset, petals, and moonlit variants.
- The wash sits behind the gameplay layer and above distant scenery, complementing each stage's existing weather particles and sky treatment without changing platform visibility or gameplay.
- Source commit: `6325be309dc3a458569694f96e08c7c5662870d3`.
- No tests/builds were run; final consolidated verification and Android APK remain deferred until development is complete.

### Elemental boss entrance portal (2026-11-27)
- Replaced the shared red entrance flash with an expanding three-layer portal/rune effect using each boss's element palette.
- Boss spawn position, physics drop, entrance timing, camera shake, combat, and boss phase behavior are unchanged.
- Source commit: `86426731dc1d2f288853b39ac199a2b0ef17dd08`.
- No tests/builds were run; final consolidated verification and Android APK remain deferred until development is complete.

### Element-matched boss phase transitions (2026-11-27)
- Boss phase-change flashes now use the boss's elemental fill and edge palette rather than a shared boss-body tint and white outline.
- Phase thresholds, health, damage, camera shake, and combat timing are unchanged.
- Source commit: `555b8d360bd09b4656b356bfb71ad4a4ef0556ef`.
- No tests/builds were run; final consolidated verification and Android APK remain deferred until development is complete.

### Elemental rolling-ball defeat finish (2026-11-27)
- Added a distinct element-colored impact particle burst and expanding ring when a kicked enemy ball completes its rolling lifecycle.
- The existing one-time defeat guard, stage quota counting, reward, score, and ball/enemy cleanup behavior are preserved.
- Source commit: `3a5efc133b9362aa4f4d9bb436b3430b8c7f2d5f`.
- No tests/builds were run; final consolidated verification and Android APK remain deferred until development is complete.

### Elemental boss defeat finale (2026-11-27)
- Added a boss-element particle burst with a large expanding star/ring effect when the boss is defeated, complementing the existing boss visual collapse and reward shower.
- Boss health, defeat timing, score, reward drops, stage transition, and combat logic are unchanged.
- Source commit: `77cfacad77d8970a00c8aedc4cb6c5170d422af8`.
- No tests/builds were run; final consolidated verification and Android APK remain deferred until development is complete.

### Candy Orchard scenery consistency correction (2026-11-27)
- Replaced the leftover cactus/desert foreground props in Candy Orchard with pastel sugar hills, striped candy-cane pillars, lollipop blooms, and colorful candy stones.
- The correction is decorative only; stage platforms, layout, collision, gameplay, and controls are unchanged.
- Source commit: `c30313105835cd9489ca5a7a9171e93dd9f246b8`.
- No tests/builds were run; final consolidated verification and Android APK remain deferred until development is complete.

### Weather-responsive arena floor accents (2026-11-27)
- Rain stages now show soft puddle reflections; snow/blizzard stages receive small frost drifts and crystals; sand/sandstorm stages get low drifting dust; ash/ember stages get restrained ground-level ember glows.
- These are low-count, background-only animated decorations below the playable characters and do not affect platforms, collision, or movement.
- Source commit: `917c1b8a5bd871a54c377064233787d2afc42c30`.
- No tests/builds were run; final consolidated verification and Android APK remain deferred until development is complete.

### Boss elemental fist and aura palette (2026-11-27)
- Boss fists and surrounding aura now inherit the boss's elemental color and edge highlights, while boxer gloves retain their darker glove material with element-colored trim.
- Boss body identity, style-specific armor, AI, attack patterns, and combat values are unchanged.
- Source commit: `2db94319a9f5b3a4ffa08a28c1f87bc47ffd71dc`.
- No tests/builds were run; final consolidated verification and Android APK remain deferred until development is complete.

### Campaign smoke-check platform-count alignment (2026-11-27)
- Corrected the Chromium campaign sweep assertion to match the current stage contract: six elevated authored platforms plus the permanent floor (seven static bodies total).
- The prior smoke failure was a stale expectation of four elevated platforms; game-data tests already require six authored elevated platforms per stage. No stage layout or gameplay code changed.
- Source/test commit: `d85738625c41e7060b09527ca6621f5cf2ebd89c`.
- This is a source-level test alignment only; no consolidated verification or APK build was run.

### Hero special-move rig visibility correction (2026-11-27)
- Corrected the hero visual handoff so EXTRA/special moves temporarily show the articulated full-body rig while hiding the authored idle/movement sprite sheet. The previous implementation drove arm/leg poses on hidden rig parts, so the unique move choreography was not visible during gameplay.
- The selected hero's costume palette is applied to the special-move rig; the authored sprite sheet returns automatically after the move and continues to drive idle/walk/jump/turn/landing states.
- Special move damage, hit timing, unlimited immediate reuse, movement physics, and control mapping are unchanged.
- Source commit: `1a2e07754e0c670a462d7454c4ec33ccf6b8752f`.
- No tests/builds were run; consolidated verification and final Android APK remain deferred until all development is complete.

### Background audio resume completion (2026-11-27)
- When a player makes the first sound-producing interaction after returning from the background, the audio context now resumes and the currently selected menu/world/boss/victory/defeat music track is scheduled again.
- Added a regression assertion covering the suspended-to-running context and music scheduler restart after the first resumed interaction.
- Source commit: `f90a60f72c66c43410b23bddf092804522c66f99`; regression test commit: `e5c708ebd0db59e37bdf7caa45d64c92f3f3e38b`.
- No tests/builds were run; consolidated verification and Android APK remain deferred until all development is complete.

### Hero selection card readability and preview cleanup (2026-11-27)
- Reworked all four selection cards into a clearer vertical hierarchy with separate hero title, readable character description, super-power label, three special-move names, and a dedicated selection action.
- The selection preview now uses the articulated costume rig instead of the animation sheet, avoiding stray sheet-frame marker artifacts above the characters; in-game movement continues to use the authored hero spritesheets.
- Card spacing and fixed text regions were adjusted to prevent the previous title/description/move overlap.
- Source commit: `fb17af0c2bd00aa2f99e3079c4762f4e21eddaa1`.
- No tests/builds were run; final consolidated verification and APK remain deferred until all development is complete.

### Distinct boss entrance and defeat sequences (2026-11-27)
- Added style-specific entrance accents for the Gatekeeper, boxing champion, agile claw acrobat, martial-arts master, and final warlord: ground shock rings, inward glove beats, spinning talon stars, rising-sun rays, and eclipse/orbit treatment respectively.
- Added matching boss-style defeat finale motifs while retaining the shared elemental reward/impact core.
- The five boss encounters remain on the existing fixed campaign milestones; attack selection, health, damage, telegraph windows, physics and phase progression are unchanged.
- Source commit: `958776606f17105423d5a879b54696bc2664263a`.
- No tests/builds were run; final integrated verification and Android APK remain deferred until development is complete.

### Deterministic stage-specific enemy spawn lanes (2026-11-27)
- Added a fixed spawn-position list to each of the 50 stage definitions; each normal stage has its own deterministic, sorted spawn lanes within the arena's safe horizontal bounds.
- Enemy spawn logic now consumes the stage definition rather than reusing the same evenly spaced line for every stage. Boss-only stages retain zero regular enemy spawn positions.
- Added automated data assertions for spawn count, bounds, ordering, duplicate positions, and distinct stage patterns.
- Source commits: `2ddca2ac21dab49461d279f693ec6eb158da7850`, `79350bbd7df273f7dfd2b5bb422003ee0e4911ed`, `e58127afa0f96c8c7d5a5913c8076c058c1ec5b1`.
- No tests/builds were run; consolidated verification and final Android APK remain deferred until all development is complete.

### Final-only Android build guard and mobile lifecycle hardening (2026-11-27)
- Updated the README to describe only the signed Release APK workflow and web-only local build commands.
- Removed the legacy `android:apk` debug shortcut from package scripts; disabled both legacy local APK scripts so they cannot create debug/intermediate APKs.
- Extended Android static validation to reject reintroduced debug build shortcuts and stale debug-APK README instructions.
- On app background, native touch ownership, joystick state, queued EXTRA actions, held jump, and held attack are now cleared together. Added Chromium smoke coverage for background/resume while multiple touch identifiers are still held, then starting a fresh joystick touch after resume.
- Audio now resumes the selected music track on the first player sound interaction after returning from background; a focused lifecycle regression test was added.
- Corrected the campaign smoke test's stale platform count: each arena contains six elevated platforms plus the continuous floor (seven static bodies). The game-data tests already assert six authored elevated platforms.
- Commits: README `c178c700eb1dcb1adca9190bcd8529f51742306f`; package debug shortcut removal `036caa57481e548cebe721dfa9d8fff4af89b44d`; local build guards `9404dfd4a95a5c5d6684000d9c4f5623bac83f89`, `8210c675401d503c3b486a210681e4eaa1ef2d20`; platform smoke alignment `d85738625c41e7060b09527ca6621f5cf2ebd89c`; audio resume `f90a60f72c66c43410b23bddf092804522c66f99` and test `e5c708ebd0db59e37bdf7caa45d64c92f3f3e38b`; mobile background cleanup `e4e70e679295446962c6c2526000ba526cec3960` and smoke coverage `6715d1c7bda749899e3c121535967a3b29935232`; Android policy validator `436b50bb379518ee0bc0e7f3e3101f7b89b07dd6`.
- No consolidated verification was run and no APK was built. The only authorized APK build remains the signed Release workflow after all development is complete and final CI passes.

### Visible hero attack and hit-reaction animation handoff (2026-11-27)
- Extended the articulated costume-rig handoff to normal charged attacks, punch/kick combo beats, and damage reactions, not only EXTRA signature moves.
- The authored sprite sheet remains active for idle, walk, jump, turn, and landing; the rig is visible only while a move or hit reaction needs articulated limb poses, then returns cleanly to the sprite sheet.
- Added a timed directional hit-reaction pose that works with the existing temporary damage flash and knockback.
- Source commit: `4efbfc6187da559602c7b5131a7a3a8f65c37592`.
- No tests/builds were run; final consolidated verification and Android APK remain deferred until all development is complete.

### Campaign finale and mobile background input completion (2026-11-27)
- The 50-stage ending now offers explicit PLAY AGAIN and CHANGE HERO actions instead of ending on static victory text.
- Added a browser smoke assertion that both finale actions are present and interactive.
- Combined with the mobile lifecycle work above, backgrounding now releases captured touch ownership and queued input; a fresh joystick touch can be accepted after resume.
- Source commit: `aff7b7e2bdde4dc9b4741d8f683c3c24a50dbe24`; smoke coverage commit: `27602e14acbfc774a033fc879f4d60e84594347f`.
- No tests/builds were run; consolidated verification and Android Release APK remain deferred until development is complete.

### Hero-specific costume accessories in articulated action poses (2026-11-27)
- The articulated rig now carries each hero's own visible costume accents during normal attacks, hit reactions, and all three EXTRA moves; accessories are created once with the visual and switched with the rig rather than being left floating over the authored sprite.
- The authored hero spritesheet remains the normal idle/walk/jump/turn/land presentation. The rig and its costume details are hidden again when the action ends.
- Source commit: `7dd9edc4f8f18a9f1da7efdc6359ade04538eb85`.
- No tests/builds were run; final integrated verification and APK remain deferred until development is complete.

### Hidden-control pointer ownership cleanup (2026-11-27)
- Hiding the mobile controls overlay now notifies the React touch bridge to clear its captured pointer identifiers, in addition to resetting the Phaser-side joystick/action state.
- This covers stage/menu transitions where the browser may not deliver a final pointerup/touchend after the overlay is hidden.
- Added Chromium smoke coverage that hides the overlay while joystick and EXTRA are held, restores it, and confirms a fresh joystick pointer works.
- Source commit: `1abf17c11ce227495e15c29d4907b9e26f2673c2`; smoke test commit: `0408b2a77b5714047d967b197d8e90eaab54f005`.
- No tests/builds were run; consolidated verification and Android Release APK remain deferred until development is complete.

### Ten-element enemy identity and snowball strength tiers (2026-11-27)
- Normal campaign stages now rotate enemy elemental identity through all ten elements rather than only six.
- Added a deterministic snowball strength-tier rule that combines enemy class, elemental affinity and campaign progression; the resulting tier is capped and continues to drive the ball's visible size and its existing boss-impact strength.
- Added focused rule coverage for elemental/class/progression combinations and campaign data coverage requiring all ten elements to appear.
- Source commits: `5c31dd8989e1255b0cfd3d27e77e028c7fe04dfa`, `1041c969290de65235278f449b719fc6d9d2ed73`, `eb164a721826883e53d6552a77cd6c21057958ff`; tests: `4b898bef8b8e9dd34028db6216ac35281af062cd`, `bb0e0a05cc252e9cd7cc05ac1e1f92454201d564`.
- No tests/builds were run; final consolidated verification and Android Release APK remain deferred until all development is complete.

### Enemy elemental identity visuals (2026-11-27)
- Regular enemy visual rigs now display a clear element-specific glyph and pulsing halo from their assigned element, covering Fire, Ice, Lightning, Water, Nature, Wind, Earth, Light, Shadow and Plasma.
- The element marker is part of the existing visual container and is stored with its animation parts; it does not alter enemy movement, hitboxes, AI, or attack behavior.
- Added campaign smoke coverage requiring each live enemy's visible element marker to match its assigned stage element.
- Source commit: `9b0c071d6b5b16d2e60a9cdeccb88dc5630270ec`; smoke coverage commit: `7f0ef91c5f5c3652bdfeeb9db821e9a1ccf08ef2`.
- No tests/builds were run; final consolidated verification and Android Release APK remain deferred until development is complete.

### Audio output mixing polish (2026-11-27)
- Added a shared master gain stage with a conservative output level and an optional dynamics compressor when the Web Audio implementation supports it.
- The fallback remains compatible with WebViews that do not expose a compressor node; individual track, SFX, mute and volume controls remain unchanged.
- Source commit: `7fa41f91dbfaf15073b4c9c84597c81878309c6c`.
- No tests/builds were run; consolidated verification and Android Release APK remain deferred until development is complete.

### Keyboard and touch release on background/overlay transitions (2026-11-27)
- The app now resets held Phaser keyboard keys as well as touch flags when the WebView backgrounds or loses focus.
- The Chromium smoke harness now simulates a held keyboard direction during backgrounding and asserts it is released together with joystick and action-button state.
- Source commit: `20e795f38af66d1e4a76041d5e46f6dc0a837548`; smoke test commit: `9ca5ea989f294cad530aadf417ed5375ec3e51f8`.
- No tests/builds were run; final consolidated verification and Android Release APK remain deferred until all development is complete.

### Audio resume and single-track lifecycle correction (2026-11-27)
- The first audio interaction after the app returns from the background now resumes the selected music track even when SFX are muted; the previous code could resume the audio context for a sound but leave the music scheduler stopped.
- Removed unused parallel menu/gameplay/world music loops so the active track scheduler remains the single source of playback and cannot accidentally layer duplicate loops.
- Added an automated regression test that stops audio, mutes SFX, resumes via a player interaction, and verifies that music notes and scheduling restart.
- Source commits: `88334a4ced3ac33ab87db7a5f879560507dcb2a3`, `cd0d61ca79e4d6dd8f52f7c03a12a1a0269f2e20`.
- No tests/builds were run; final consolidated verification and Android APK remain deferred until all development is complete.

### Selected hero is applied to the live campaign character (2026-11-27)
- Fixed the hero-selection handoff so choosing Kairo, Mei, or Volt updates the actual gameplay hero sprite, palette, and articulated costume accessories before the campaign begins; previously the preview changed while the live scene could retain the initially loaded hero.
- The selected hero persists through the existing campaign storage and stage-transition flow. Movement, physics, controls, and special move rules are unchanged.
- Source commit: `942d3df3e2c77173292ac1b7000e3f31a6d8550a`.
- No tests/builds were run; final consolidated verification and Android APK remain deferred until development is complete.

### Wi-Fi co-op identity and movement sync hardening (2026-11-27)
- Renamed the default co-op room from the legacy DASTAAN label to ZERO and updated the setup guide with host/join steps.
- The relay now limits WebSocket payload size, rejects duplicate joins and invalid hero/state messages, bounds remote player coordinates, applies a small per-socket message interval, and safely handles socket/server errors.
- Player IDs now reuse the vacant slot after a disconnect, avoiding duplicate player identities when the host or guest leaves and reconnects.
- Remote player movement now interpolates toward received positions and mirrors the remote hero's idle/walk/jump state instead of snapping on every packet.
- Commits: server validation `36ad838e638062e9598eb7d062e1ad46e09d210c`; room identity `2a2b29c5e9ffd33f14bb95a9633c6d68fcaae8f3`; movement state validation `e41ffd34b1465b529ac316b98c5393ad8fa9369d`; remote interpolation `ec5d406859108b96b9dc1767e9cc13d0aab99383`; reconnect player-slot fix `27d2b78daf9544c9c79db81b9e6a5b23e52b1e85`; README `3aa2015b5140fba40b4af32830aac2f7aa4c6cd4`.
- No tests/builds were run; co-op still requires real two-device playtesting. Consolidated verification and Android Release APK remain deferred until all development is complete.

### Selected hero sprite texture synchronization (2026-11-27)
- Corrected the force-rig costume handoff to update the underlying hero spritesheet texture and hero identity metadata at the same time as rebuilding costume accessories. This ensures the live campaign hero remains the one selected on the card when the articulated rig is hidden again.
- Source commit: `22dc18b3fe89ec4701c17efb07d3c0c5d2d36574`.
- No tests/builds were run; consolidated verification and Android APK remain deferred until all development is complete.

### Android local Wi-Fi co-op configuration (2026-11-27)
- The final Android workflow now explicitly ensures the INTERNET permission and configures cleartext access for the existing local Wi-Fi WebSocket relay.
- The Android configuration validator checks that both settings remain present in the generated release manifest workflow.
- Workflow commit: `b5ab0159dc663e2f05129ba09dc79013eea62f5f`; validator commit: `e52385a23c1cb2b0cbe550b5f4177891fb094b67`.
- No Android build or device test was run. Co-op still needs two-device verification on a trusted local network.

### Persistent co-op session across campaign transitions (2026-11-27)
- The Wi-Fi WebSocket connection now survives Phaser scene shutdown/restart between campaign stages; audio still suspends on each shutdown and resumes when the next stage starts.
- The socket is closed only when the scene is finally destroyed, with the final-destroy cleanup registered once for the scene lifetime.
- Unexpected socket closure now clears the remote interpolation target and fades the remote avatar to its disconnected state.
- Added Chromium smoke coverage with a mock socket to assert that a real stage restart does not close the co-op connection.
- Source commits: `ff66a1537682f45328112eb498c59a08a4b45e1a`, `dc19d82ff959e860974a79f54aebb0cd6b0c4650`, `4258c7500a0d98f3aaa4764b2a5ed9b317cf69b9`; smoke coverage: `86e904e6c3c8f7b676ebad1286ba158592c70164`.
- No tests/builds were run; two-device co-op testing remains pending. Final consolidated verification and Android Release APK remain deferred until development is complete.

### Remote co-op hero identity restoration (2026-11-27)
- Co-op state packets now carry the selected hero identity alongside position, facing and locomotion state.
- When a campaign stage restarts and the remote visual is recreated, it restores the peer's chosen hero automatically and interpolates toward the latest received position.
- Added Chromium smoke coverage for hero restoration, facing and position interpolation.
- Source commit: `553a7ff79eeb55bf86f39bc9ee3a9f940a3c70b5`; smoke coverage: `c262a65920f4c7f248c0ed1204eeff939e0f562c`.
- No tests/builds were run; final consolidated verification and Android Release APK remain deferred until development is complete.

### Original ten-world SVG backdrop artwork (2026-11-27)
- Added ten original layered SVG background assets for Emerald Kingdom, Candy Orchard, Frozen Peaks, Golden Desert, Moonlit Forest, Crystal Caves, Coral Coast, Sky Islands, Volcano Valley and Starfall Citadel.
- The Phaser scene preloads the artwork and layers the matching world backdrop behind its existing world-specific skyline, atmosphere, landmarks and foreground scenery.
- The campaign smoke harness now checks that each of the ten worlds loads its corresponding dedicated backdrop texture.
- Asset commits: `048511d7151bcc0d059981914c12fd23120b400f`, `d2ee972a88411ee6b95f7c2a2b172e1bd324edc4`, `376c96c7863af66a60e501a0a4bba49c47ddcac3`, `f51eee4fe7275ecaefbb94a4690b10eeb291d6c6`, `63c84528174d967f59a8275dc275a528b0ac9f77`, `728661888634db9e6717fb1e8c34ea8d32e4916c`, `8e224db6c2c2d7b29d853250c1d31bd9a53718a1`, `841a3f1afdd340c9186e1cb71eda11c62ecdd700`, `0e4040b6c28560ab6e73cd2b6b38d49be22c9f21`, `cf2494b302897123f74321ccbdaeb6274861ee9c`; integration `e87f5654fdb35af405128cd641d1123278647baa`, backdrop reference `6678131470d75a4dab79a9ae904e8f2c1e1f2d60`, smoke coverage `e3e229b697769d3737c7abfcc6942afc57658345`.
- No build or tests were run; final consolidated verification and Android Release APK remain deferred until all development is complete.

### Final-only release gate and single consolidated verification (2026-11-27)
- Added an explicit `FINAL_RELEASE_APPROVED: false` lock to the delivery record. The Android Release workflow now exits before installing/building anything unless that exact flag is changed to `true` after development is complete.
- Continuous Checks no longer run automatically on every development push; they are manually dispatchable.
- The final Android workflow now performs the consolidated test, lint, Android configuration validation, web build and Chromium campaign/mobile smoke pass before Android project sync and Release APK assembly.
- Updated the Android configuration validator and README to enforce/document the single final verification path.
- Commits: lock `<see current delivery-lock revision>`; Android release gate `<see workflow revision>`; manual-only CI `d408b5858051c18e90869fbe3f1be73e44c36401`; CI validator `5815bc21f35567cb68729d6e0be8c52ed6d8a5c9`; consolidated release verification `6ca637711ecd702dca288a7b1a2d69ead7efdeb6`; README `246f93b00815d246c20f49f75c24f2bea88958e8`; release validator `d25c62c2ae18e133daf5ccb098ada7498713a244`.
- No verification or APK build was run. The release flag remains false until all development is complete.

### Reduced-motion accessibility support (2026-11-27)
- The game now reads the device's `prefers-reduced-motion` setting and suppresses looping decorative stage/weather/landmark tweens when reduction is requested.
- One-shot gameplay cues, input, and stage transitions remain available; only ambient loops are skipped.
- README accessibility notes updated.
- Source commit: `241abfe9cb1d68bd11cd43c2f3cc87b9e6d9c05c`; README commit: `e2eed3d4ecd151798c66e979a214648d5e5cb5fb`.
- No tests/builds were run; final consolidated verification remains deferred until development is complete.

### Reduced-motion browser coverage (2026-11-27)
- The Chromium smoke suite now opens a separate browser context with `prefers-reduced-motion: reduce`, verifies the scene detects it, and confirms looping ambient tweens are skipped.
- Smoke test commit: `032d87dd6baa4d072b844eef9fd6f805d405e82e`.
- No tests/builds were run; the new check is reserved for the single consolidated final verification.

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

### Background composition scope correction (2026-11-27)
- Reused the single world-index declaration across the far-sky and lower-ground layers after combining both world-aware compositions into `createBackground()`.
- Source commit: `a65fc0075c77e35181250e103e7bce13201d90f1`.
- This was a source-level correction; no tests/builds were run.

### World and stage identity in HUD (2026-11-27)
- The HUD's secondary title now identifies the selected hero, current world, and zero-padded stage number together, so the player can recognize the current campaign region during play.
- No HUD control positions, score/health fields, or gameplay behavior were changed.
- Source commit: `1d2f3f645a2798d0674d9a318e1a08c152c6b94a`.
- No tests/builds were run during this implementation step.

### World-specific distant skyline pass (2026-11-27)
- Replaced the remaining shared snow-capped mountain backdrop with ten world-aware distant silhouettes: forest canopy, candy hills, ice peaks, desert dunes, crystal spires, ocean swells, floating sky islands, volcanic ridges, and cosmic citadel forms.
- The near-hill layer remains subtle and sits behind the world landmarks and gameplay.
- Source commit: `6f4d5970eb51c77c4bf5cd772aede9334340f68b`.
- No tests/builds were run during this implementation step.

### Remove legacy clear-sky layer duplication (2026-11-27)
- Removed the older always-present sun/moon and six white-cloud layer from the base background. Those duplicated the newer stage atmosphere and could show clear-sky imagery underneath rain, snow, and storm variants.
- The stage atmosphere is now the single owner of celestial bodies and cloud banks; world landmarks and mountains remain in the background.
- Source commit: `b6c4a50a0cd3df5d622976418366a84ea0f29869`.
- No tests/builds were run during this implementation step.

### Severe-weather sky treatment (2026-11-27)
- Rain, shimmer-rain, blizzard, sandstorm, ashfall, and starfall variants now use moving overcast cloud banks and hide the clear-weather sun/moon orb.
- Clear, sunset, moonlit, aurora, and starlight variants retain their existing celestial treatment. Weather particles and the existing brief storm-flash effect remain separate.
- This is background-only; platform visibility, gameplay layers, collision, and controls are unchanged.
- Source commit: `dc2b7f96c1958cbcc001d6a8e9badef1f447d363`.
- No tests/builds were run during this implementation step.

### Boss armor follow-through animation (2026-11-27)
- Added restrained movement to the existing boss cape, crown gem, chest inset, armor ridges, and cheek markings, coordinated with the existing idle/breathing loop.
- The animation reuses registered boss display objects; attack poses, hitboxes, physics, timing, damage, and phase transitions remain unchanged.
- Source commit: `7dff41fab744533c84653a8c4e31745112673149`.
- No tests/builds were run during this implementation step.

### World-matched arena floor dressing (2026-11-27)
- Replaced the same grass-and-flower lower trim across every arena with world-aware details: forest grass/fireflies, candy orchard sweets, ice shards, desert stones, crystal growths, coral/sea grass, sky-island cloud tufts, volcano embers/obsidian, and cosmic rune-like ground accents.
- Decoration stays behind gameplay actors and does not change platforms, floor collision, stage layout, or enemy/player logic.
- Source commit: `a2bca91175f02e2561926f9db5616b00d551b90d`.
- No tests/builds were run during this implementation step.

### Enemy class silhouette follow-up (2026-11-27)
- Agile/fast enemies now use a lighter aerodynamic crest/fin silhouette; heavy enemies use a broader plated profile with a jaw guard; special enemies receive a floating rune crown and arcane guard arc.
- Crest and guard details receive subtle motion in the existing visual animation loop. Enemy physics, AI, movement speeds, collision sizes, damage, and combat logic are unchanged.
- Source commit: `afc3f47a47c4f9c8455a8c5b423b58acb0b767c0`.
- These remain Phaser procedural/vector visuals, not dedicated authored sprite sheets. No tests/builds were run during this implementation step.

### Gatekeeper boss pose follow-up (2026-11-27)
- Added a dedicated low, braced anticipation pose and compact ground-pulse slam pose for the Gatekeeper/grappler boss style; it no longer falls through to generic boss posing for these states.
- Boss timing, movement, attack selection, damage, hitboxes, and phase progression are unchanged.
- Source commit: `5ec8b77e9df62dfcd9a98e8b97b9cf938513bcb1`.
- No tests or builds were run during this implementation step.

### Enemy accessory animation follow-up (2026-11-27)
- Added subtle per-frame motion to forehead gems, waist sashes, fast-enemy scarves, back spikes, and heavy-enemy knee guards, coordinated with each enemy's existing stride.
- Animation is presentation-only; enemy AI, movement speed, physics, collision, hitboxes, and damage remain unchanged.
- Source commit: `bf5b3b1f29c716f291cffccb19752dafbf5e1968`.
- No consolidated verification or Android APK build was run; the final-build hold remains in force.

### Enemy visual identity follow-up (2026-11-27)
- Added named-family elemental chest glyphs and softly pulsing matching halo accents for fire, ice, lightning, water, nature, wind, earth, crystal, light, shadow, and plasma themed enemies where their configured names identify the theme.
- Kept AI, movement, collision bodies, hitboxes, damage, and spawn logic unchanged.
- Source commit: `d78bde3b7ea4d6becea61b24d1842c809050ae94`.
- This is a procedural visual enhancement, not a claim that dedicated hand-painted enemy sprite sheets have been completed.
- No consolidated verification or Android APK build was run; the final-build hold remains in force.

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
- [ ] Enemies no longer float unintentionally; each archetype uses stable platform-aware movement and readable state poses.
- [ ] Original menu, ten world, five boss, victory and defeat music tracks plus distinct gameplay/UI sound effects work with independent volume/mute controls and background/resume lifecycle.
- [ ] All 50 stages are fixed, distinct, deterministic, and distributed across ten themed worlds.
- [ ] Every arena has six elevated authored platforms plus the continuous floor; all routes are reachable and playable.
- [ ] Premium world scenery, stage-variant landmarks, weather, and atmospheric effects remain readable behind gameplay.
- [ ] Snowball freeze/roll/close-range kick mechanic works reliably, survives three wall bounces, and resolves on the fourth impact.
- [ ] EXTRA 1, EXTRA 2, and EXTRA 3 each damage enemies, have distinct signature effects, and remain immediately reusable.
- [ ] All five boss encounters are distinct, playable and reachable on stages 10, 20, 30, 40 and 50, with three attack families and final-warlord phases.
- [ ] Four hero spritesheets, hero selection, locomotion, landing, turning, signature effects and campaign persistence work without input regressions.
- [ ] Original ZERO GAME icon is applied to Android launcher and app branding.
- [ ] One consolidated automated verification pass passes, followed by a signed Android Release APK build and artifact verification.
- [ ] Physical-device verification status is reported honestly and separately from browser automation.


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

## Elemental particle identities and power-shaped snowballs — 2026-11-27

- Reworked the ten elemental particle families so each has a recognizable silhouette, not only a palette change:
  - Fire: flame tongues and embers.
  - Ice: six-armed snowflakes with branch details.
  - Lightning: jagged bolt fragments.
  - Water: tapered falling droplets.
  - Nature: leaf particles with visible veins.
  - Wind: curved, rotating air ribbons.
  - Earth: angular rock shards.
  - Light: radiant starbursts.
  - Shadow: crescent-like dark fragments with contrasting rims.
  - Plasma: glowing energy orbs.
- Preserved the Power 1–20 particle progression, including its density, scale, speed, lifetime scaling and fire's tenfold base count.
- Rebuilt the frozen enemy's elemental ball appearance around its selected element. Wind now forms a spiral/twister silhouette; water has a liquid droplet body; ice has a real six-armed snowflake core; fire, lightning, nature, earth, light, shadow and plasma each have their own visual construction.
- Added element-specific kicked-ball movement presentation: distinct launch speeds, rotation response, scale/bobbing, trails and impact bursts. Wind uses a fast, lifting twister-like motion and curved air trails; water flows forward with a liquid wobble and splash droplets; lightning accelerates with sharp electrical streaks; earth moves heavier with rock fragments; remaining elements retain their own signatures.
- Existing freeze/kick targeting and rolling-ball collision rules remain in place; these changes are visual/movement presentation for fictional arcade gameplay, not real-world weapon mechanics.
- Source commit: `66ae063a7390075fd23b4454c18a2f8e9b1fac4e`.
- Consolidated CI must pass before this upgrade is marked verified. A fresh signed Release APK is a separate final delivery step; physical Android testing must be reported separately.


## User-reported gameplay corrections — 2026-11-27

- **Element selection:** The frozen enemy's elemental ball now derives from the projectile's actual selected power, rather than the enemy's independent/random tint. This corrects the case where selecting Wind or another power still produced a blue-looking ball.
- **Distinct ball silhouettes:** Reworked all ten ball designs to use recognizable non-spherical silhouettes (twister funnel, water drop/crystal, flame, ice crystal, lightning bolt, leaf, rock shard, star, shadow crescent, and plasma shard). Ball scale is bounded so high particle-power tiers do not inflate every form into a large orb.
- **Ball lifecycle:** Further projectiles cannot pop or destroy an already frozen/rolling elemental ball. A kicked ball now ends on its first wall impact, with an impact burst and the carrier's score/reward/defeat bookkeeping. The previous time-based expiry was removed.
- **Stage score collection:** Removed the upward hero exit animation. The five-second collection window now leaves the hero in the arena, keeps mobile controls enabled, resumes physics, and allows the player to move/jump through remaining point rewards before the victory screen.
- **Performance:** Capped per-event particle creation (fire 240 maximum; other elements 120 maximum), reduced trail particle bursts and slowed trail emission cadence to reduce Phaser object/tween churn on mobile.
- **Automated coverage:** Updated the snowball rules test to assert that the first wall impact ends the kicked ball. The updated source still requires the new CI run and a fresh Android APK before being called release-ready; physical-device frame-rate verification remains pending.


## Kicked elemental-ball wall durability correction — 2026-11-27

- The latest user requirement supersedes the earlier first-wall-impact cleanup rule: a kicked elemental ball must remain active through **three** wall collisions, reverse direction with controlled damping after each, and finish on the **fourth** wall impact.
- The rolling-ball motion rule now uses three completed bounces as its default and only resolves the carrier after the next impact. Element-specific speed, visual motion, impact effects, and score/reward bookkeeping remain unchanged.
- Added focused regression coverage for all three surviving bounces, direction reversals, damping, and fourth-impact cleanup.
- This is an implementation update only; the consolidated project verification remains reserved until all approved development is complete. No Android APK build is to be started before that final verification.


## Six-tier platform routes across the full campaign — 2026-11-27

- Expanded every one of the 50 stage arenas from four to six horizontal platforms, including dedicated boss arenas.
- Each normal stage's added middle ledge is anchored to its authored lower platform, while the upper route follows that stage's authored high platform. Boss arenas receive matching side and upper routes without losing their broad central fighting floor.
- The new ledges remain within the arena bounds and within the existing reachable vertical-step envelope. The campaign data test now checks six platforms per stage and the expanded vertical range, while retaining all 50 unique authored base layouts.
- This development change does not trigger an Android APK build. The one consolidated verification and Release APK remain reserved for the end of all approved work.


## Authored four-hero sprite animation integration — 2026-11-27

- Integrated the repository's four authored transparent pixel-art hero sprite sheets (Ryo, Kairo, Mei, Volt) into the Phaser scene instead of showing the procedural vector mannequin as the visible player character.
- Added cached sprite-sheet loading and per-hero idle, walk, jump, landing, turn, and signature-power-up animation definitions from the existing 210×212 frame layout.
- Main gameplay, home-screen previews, hero selection, and remote co-op hero visuals now select the matching authored character artwork. Existing physics bodies, touch controls, movement logic, special-effect timing, and the legacy pose rig remain unchanged.
- This development change does not trigger an Android APK build. Consolidated verification remains deferred until all approved development is complete.


### Hero turn transition polish — 2026-11-27

- Added a short authored turn-frame transition when a grounded hero changes movement direction, then returns smoothly to the appropriate idle or walk loop.
- The landing, jump, movement, and signature-power-up animation states retain priority and continue using the existing game physics and input path.


## Strict APK hold reaffirmed by user — 2026-11-27

- The user explicitly requires **100% completion of the approved game scope before any APK build**. Do not trigger the Android workflow, create a debug/release APK, or deliver an earlier artifact during development.
- A release workflow had already been triggered before this clarification and completed; that artifact is an interim build from an earlier source snapshot and must not be represented or delivered as the final game.
- Continue implementation in the repository, preserve the existing gameplay and mobile controls, and defer the one consolidated verification until all development is complete. Only after that verification passes may the final signed Android Release APK be built.
- Keep chat free of incremental work logs and unnecessary test reports. Deliver the final APK and complete report, or state a genuine blocker.


## Platform collision-width alignment correction — 2026-11-27

- Corrected platform sprite scaling to use the actual 180-pixel source texture width. Previously the authored width was divided by 100, making visible/colliding platform bodies 1.8× wider than their stage definitions.
- Platform visual width and static physics body width now match each authored stage width, including the newly added six-platform layouts.
- Added focused rule coverage for representative widths and invalid input. Verification remains deferred to the final consolidated pass.


## Element-matched boss attack telegraphs — 2026-11-27

- Reworked the boss attack warning from a single generic red ellipse into a layered arena marker with a pulsing ground core, bright outer ring, and elemental rune.
- Telegraph colors now match the active boss element (fire, earth, wind, ice, lightning, shadow, light, water, nature, or plasma), while the existing attack timing, damage, movement, and collision behavior remain unchanged.
- The warning marker is clamped inside the arena so it remains visible near either screen edge. The effect is one short-lived container per boss attack to keep mobile rendering overhead controlled.
- No APK build or intermediate release was triggered.


## Enemy locomotion and armor animation polish — 2026-11-27

- Extended enemy animation rigs to include their body, chest armor, glowing chest sigil, and headband alongside the existing arms and legs.
- Movement now adds a restrained body compression/rebound, armor follow-through, and a subtle sigil pulse. Runner and charger families receive a stronger stride response, while guard enemies retain a steadier body profile.
- Existing enemy AI states, speeds, collision boxes, attack windows, and mobile controls are unchanged. Effects reuse existing enemy parts and add no per-frame display objects.
- No APK build was triggered.


## Boss idle animation and armor response polish — 2026-11-27

- Extended the boss animation registry to include chest emblem, shoulder armor, belt gem, headband, and orbiting elemental accents.
- Bosses now have a restrained breathing loop, chest-emblem energy pulse, subtle armor follow-through, and alternating orbit accents while moving or waiting between attacks.
- Existing attack-state poses still override the base arm/leg poses, and the same boss physics, attack timings, hitboxes, damage, and phase transitions are preserved.
- Animation updates reuse existing display objects; no additional per-frame particles or objects are created. No APK build was triggered.


## Elemental boss-hit impact feedback — 2026-11-27

- Replaced the generic yellow boss-hit circle with a compact three-layer impact burst: an element-coloured star core, an expanding energy ring, and a brief white contact flash.
- Impact palette follows each boss's assigned element across all ten element types, while boss damage, hit timing, score awards, knockback, and phase logic remain unchanged.
- The effect uses one short-lived container per confirmed boss hit and does not add persistent emitters. No APK build was triggered.


## Enemy armour and face-detail animation pass — 2026-11-27

- Added layered shoulder guards, forearm cuffs, cheek markings, and small eye highlights to the existing fast, heavy, and special enemy designs.
- Shoulder guards and cuffs now respond subtly to stride; eye highlights have a restrained alternating shimmer.
- All added pieces are registered with the existing enemy visual container and animation parts; no AI, collision, damage, movement speed, or input behavior was changed.
- The additions reuse the existing per-enemy visual update and create no per-frame display objects. No APK build was triggered.


## Animated distant sky layers — 2026-11-27

- Added three restrained, layered cloud banks to selected clear, sunset, moonlit, and cloudy weather variants.
- Cloud tint and opacity adapt for day/night conditions; slow horizontal drift adds sky movement while keeping the playfield readable.
- Clouds are created once per stage and reuse a small fixed set of shapes; gameplay physics, stage layouts, weather particles, and controls are unchanged. No APK build was triggered.


## Aurora sky treatment — 2026-11-27

- Added three soft, layered aurora ribbons to aurora, cosmic-night, and starlight variants, using a restrained teal/violet palette and slow vertical breathing.
- The ribbons sit behind gameplay and reuse a single Graphics object per stage; no changes to player visibility, stage collision, or game rules. No APK build was triggered.


## Premium stage scenery expansion — 2026-11-27

- Added a dedicated world-specific foreground-detail layer across all ten worlds: forest roots/ferns/mushrooms; desert cacti and dune stones; ice shelves and icicles; sandstone columns and torch bowls; jungle palm fronds/vines; faceted crystal geodes; ocean coral/sea grass/pearls; sky-island cloud trim and banners; volcanic obsidian/magma seams; and cosmic observatory rings/star nodes.
- Details are placed along the outer margins and lower frame to avoid obscuring the playable arena, platforms, enemies, or hero.
- Stage-variant landmark composition remains layered with the new world-specific foreground art.
- Commits: `f625934a885a5e08fa531409234dd6d80bfbbff5` (initial scenery layer), `97ca54b24e3e3b05ab0203712e932b212d4a475d` (drawing-call correction).
- **Verification:** Not run; development remains in progress. No APK was built.


## Elemental boss visual upgrade — 2026-11-27

- Expanded the in-game boss composite with a layered back cape, shaped chest plate and inset, shoulder armor ridges, cheek markings, and a crown gem.
- Added a dedicated trim/dark/glow palette for all ten elements (fire, ice, lightning, water, nature, wind, earth, light, shadow, plasma), so boss armor accents coordinate with its elemental identity.
- Kept boss movement, attack patterns, health, hitboxes, damage, and phase logic unchanged. Existing idle/attack animation and elemental telegraphs remain in place.
- Commits: `c40098c76923187953e7b1a0466b8aa47b9a74e8` and `f7a5e02c2cf870e360c1fba3afc88505df62e50c`.
- **Verification:** Not run; development remains in progress. No APK was built.


## Enemy class costume detail pass — 2026-11-27

- Added layered back armor, twin back spikes, a forehead crest gem, and a waist sash to the shared enemy visual rig.
- Fast enemies receive a trailing scarf accent; heavy enemies receive reinforced knee guards. The additions are class-gated so the silhouettes communicate enemy roles at a glance.
- Registered the new parts with the existing visual parts data so animation updates can address them without adding new per-frame display objects.
- Existing enemy AI, physics, collision, health, damage, and movement values were not changed.
- Commit: `9502c149394d53aa0418b15552ce0f2e471bfc7c`.
- **Verification:** Not run; development remains in progress. No APK was built.


## 2026-11-27 — CI lint correction
- Fixed the ESLint `no-useless-assignment` failure in `src/App.jsx` by removing the redundant initial `null` assignment for `classCrest`; every enemy-class branch assigns its visual crest before it is used.
- Source commit: `5e847bda3ab9a6a86fd333df9e87d53ec99feb62`.
- The previous CI run's automated tests passed; lint failed on this redundant assignment. No APK was built. Full consolidated verification remains deferred until development scope is complete.

- Continued enemy animation polish: class-specific jaw/rune guard movement, boot rotation synchronized with the stride, and subtle shadow compression while running. Visual-only; enemy AI, movement speed, collision, hitboxes and damage are unchanged. Source commit: `c63fb941004abf8afe77fbd88bb902a5a38f4e84`.

- Boss idle animation polish: cape sway now reflects agile/final boss style, ground shadow subtly responds to movement, feet follow leg rotation, and boxing bosses have restrained alternating glove pulses. Boss attack timing, hitboxes, damage, AI, and phase progression are unchanged. Source commit: `e894d59ddfe773295373da0c92949df871b497a0`.

- Added five lightweight animated ambient glints to Moonlit Forest, Crystal Caves, Volcano Valley, and Starfall Citadel setpieces. Each uses a world-matched tint and restrained pulse/drift, stays behind gameplay actors, and avoids the central floor/platform collision areas. Source commit: `19f101173d5aeaab3c251dfde36a6a5c30f70788`.
