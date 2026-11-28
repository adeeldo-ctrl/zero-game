# Final ZERO GAME Release Build — Approved

This marker requests the **single final signed Android Release APK**. Do not create debug, preview, or intermediate APKs.

## Latest verified implementation

- Latest implementation commit: `52eb2af563eecc794ed9f29c2615f56e163a870c`.
- Latest consolidated CI run: `46154796388` — **success**.
- CI job: `Test and validate game` — success.
- Completed steps: automated tests, lint, Android configuration validation (without APK build), 32 unique enemy PNG/five boss PNG validation, production web build, and Chromium campaign gameplay smoke.
- Earlier full gameplay acceptance run: `46153199756` — success, 64 tests passed; token/Continue, hero idle/walk/run/jump, live enemy rigs, five boss signature animations, 50-stage campaign/restart, and mobile-input smoke all passed.
- Latest visual adjustments: selected-hero animation stays on its own authored sheet; hero scale is balanced at 0.54; regular enemy visual scale is 0.68.
- Physical Android handset testing has **not** been performed and must not be claimed.

## Build instruction

Build only one signed Android **Release** APK from the current `main` branch. The latest CI run validates source commit `52eb2af563eecc794ed9f29c2615f56e163a870c`; this marker update is release-only documentation and does not change game source.

After the workflow finishes, verify the run succeeded, confirm the APK artifact exists, and record the artifact's exact download URL and SHA-256. Do not create another APK.
