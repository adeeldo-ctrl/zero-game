# Final ZERO GAME Release Build

This one-time marker requests the signed Android Release APK after the integrated source verification passed on commit `f98f76d2b146a63afb29a884435f3046fb067ca1` (GitHub Actions run `45953202448`).

No ordinary development commit should trigger an APK build.

Signing retry: use the PKCS12 keystore password for the private key password as required by the runner's keytool format.


Final particle tier update release request: 2026-11-27. Include source commit `48f9bdbe0557190a2152d8c6d6ca3a7ff2937126` and the subsequent master-plan documentation commit in the release build.


Latest elemental particle and power-ball release request: 2026-11-27. Include source commit `1825c8747f20103974788c29add038fad72edffe`, which passed integrated CI run `45972123344` including automated tests, lint, web build, and Chromium campaign smoke test.


Latest gameplay correction release request: 2026-11-27. Include source commit `8f808ae0d9343cc1fa6a9585ff9846806eed6afc`, which passed integrated CI run `45974674667` including all 35 automated tests, lint, Android configuration validation, web build, and Chromium campaign smoke test. This update includes the selected-element snowball silhouettes, first-wall-impact cleanup, playable five-second score collection, and reduced particle/tween load.


Latest lightweight elemental particle redesign release request: 2026-11-27. Include source commit `1a27c65cf7fa096895d9599c34af21e928fb1fd1`, which passed integrated CI run `45977867744` (tests, lint, Android configuration validation, web build, and Chromium campaign smoke test). Build the signed Android APK from this exact verified commit.

2026-11-27 — Build request for commit 95843ac29f77dc32b5e7a9c81300aca18eb2cea4: include distinct element projectile silhouettes and restore joystick movement during the 5-second stage-point collection window. Produce the signed Android release APK after the repository CI checks pass.


2026-11-27 — Final premium elemental visual release request. Build the signed Android APK from verified source commit `4dadf1f18a84e92d700848f58df0564c557d4245`. Integrated CI run `45988716523` completed successfully, including automated tests, lint, Android configuration validation, web build, and Chromium campaign smoke test. This commit includes distinct elemental rolling motion profiles for all ten powers alongside the preceding premium projectile, ball, trail, and impact artwork updates.


2026-11-27 — Premium world, weather, hero, enemy and boss visual pass. Build signed Android APK from verified source commit 41b12e8884f44e549efe26b6df7dd8ea8e3fdaaf after CI run 45993784330 passed. This is a fresh release candidate; previous APK does not contain these updates.


Final single-player Android Release APK request — 2026-11-27. Build from verified source commit `d9617dabf52475376503e26256959994e75cdcd7` plus release approval commit `65819854974ba1ed91f7827a3dc9ebda2a004c09`. Wi-Fi co-op has been removed. Consolidated CI run `46015298241` passed tests, lint, Android configuration validation, web build and Chromium 50-stage/mobile smoke checks.


Re-run release request — 2026-11-27: use the Ubuntu 24.04 runner pinned in `.github/workflows/zero-game-android.yml`; the previous ubuntu-latest image resolved to unsupported Ubuntu 26.04 for Playwright 1.56.1. Final approval remains true; all source verification already passed.


Selected-hero action identity correction release request — 2026-11-27. Build the signed Android Release APK from source commit b6107a29fa7fb4b047f9d0c2b3f59c768df8fbdc plus the release-trigger commit. Consolidated CI run 46017936491 passed (39 automated tests, lint, Android configuration validation, web build, and Chromium campaign/mobile smoke test). The action-state renderer now keeps the selected hero's own sprite visible instead of exposing the shared legacy rig.


2026-11-27 — Final release request for latest verified gameplay corrections. Build the signed Android Release APK from source commit `55cb8c65a9d811f93f413f058190990228b1ba4a`. Consolidated CI run `46031502743` completed successfully: automated tests, lint, Android configuration validation, web build, and Chromium campaign smoke test all passed. This version includes corrected hero-selection artwork, five unique boss IDs/sprite-sheet mappings at stages 10/20/30/40/50, upward stage transitions, separated platforms, and reduced hero ground-dust effect.
