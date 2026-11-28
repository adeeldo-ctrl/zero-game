# ZERO GAME — Final Delivery Report

**Status:** One final signed Android Release APK was built and uploaded successfully.

## Source and release

- Hero/artwork source commit: `bf2dd777115f41089f9f6f694ede1e3f1bb10bef`
- Final release trigger commit: `c63f68278f0849f986f514b87bf75c0a4957c132`
- Consolidated CI run: [46133978123](https://github.com/adeeldo-ctrl/zero-game/actions/runs/46133978123)
- Final Android Release APK run: [46134151330](https://github.com/adeeldo-ctrl/zero-game/actions/runs/46134151330) — success
- GitHub artifact: `zero-game-release-apk` (ID `15259485145`)
- APK file: `zero-game-release.apk`
- APK size: 16,364,890 bytes
- APK SHA-256: `bd3153e95f09d44ec26f5504adb4d713ffc9f54306880bfb96348519e8ea9c0e`

## Supplied character artwork integrated

- Four hero sheets from `new heros orignal/` are now used for Ryo, Kairo, Mei and Volt.
- Hero pose panels are extracted into transparent runtime textures and mapped to idle, walking, jumping, attacking and sitting states. Gameplay landing, turning and special/victory states are mapped to the corresponding supplied poses.
- Thirty supplied enemy sheets from `new enemy/` are integrated for the first 30 enemy archetypes, with idle, walking, jumping and attack poses.
- Five supplied boss sheets from `bosses/` are integrated for all five boss identities, with idle, walking, attack and defeated poses.
- The two remaining enemy archetypes retain their existing approved artwork because the supplied pack contains 30 enemy sheets while the active roster contains 32 enemy archetypes.
- These sheets provide one authored image per named pose, so the runtime switches between supplied pose panels; this is not skeletal or motion-capture animation.

## Verification and known limitation

- Automated tests passed.
- ESLint passed.
- Android configuration validation passed.
- Existing enemy/boss artwork validation passed.
- Production web build passed.
- Chromium gameplay smoke reached the EXTRA-button interaction assertion at `scripts/smoke-game-browser.mjs:350` and timed out. The same assertion had failed on the prior enemy/boss-only source before this hero-artwork change; the hero-art integration did not intentionally modify controls. This failure is recorded rather than reported as a pass.
- Android Release APK assembly, alignment, signing and artifact upload passed.
- No physical Android handset test is claimed.

## Preserved scope

- Stages, controls, particles, projectiles and campaign rules were not intentionally changed.
- No debug or intermediate APK was created; only the final signed Release APK was produced.

## Signing note

The release workflow generated a one-time signing key and did not retain the private keystore. This APK is signed and installable, but a future update built with a different signing key may require uninstalling this APK before installing the update.
