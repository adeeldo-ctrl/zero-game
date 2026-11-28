# Final ZERO GAME Release Build — Approved

This marker requests the **single final signed Android Release APK**. Do not create debug, preview, or intermediate APKs.

## Latest verified implementation

- Latest implementation commit: `fbd5261939ecaf02c4e51922cd8a55d419d63e69`.
- Latest consolidated CI run: `46166516132` — **success**.
- CI job: `Test and validate game` — success.
- Completed steps: automated tests, lint, Android configuration validation (without APK build), 32 unique enemy PNG/five boss PNG validation, production web build, and Chromium campaign gameplay smoke.
- Visual correction: each hero animation is explicitly bound to its selected hero sheet, the collision-only legacy hero remains hidden, and legacy vector parts are kept hidden during animation.
- Hero sprite scale increased from 0.54 to 0.72 for readable gameplay and selection previews.
- Enemy rig scale is no longer multiplied twice: the rig keeps its authored scale and the outer visual applies the regular-enemy scale once.
- Existing original PNG hero, enemy and boss artwork and the existing campaign/control systems are preserved.
- Physical Android handset testing has **not** been performed and must not be claimed.

## Build instruction

Build only one signed Android **Release** APK from the verified `main` source. After the workflow finishes, verify the run succeeded, confirm the APK artifact exists, and record its exact artifact link and SHA-256. Do not create another APK.
