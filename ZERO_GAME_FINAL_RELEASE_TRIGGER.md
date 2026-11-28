# Final ZERO GAME Release Build — Approved

This marker requests the **single final signed Android Release APK**. Do not create debug, preview, or intermediate APKs.

## Verified implementation

- Verified implementation commit: `7b2273cf88f047873ea48d72781bf5282fb26d99`.
- Consolidated CI run: `46153199756` — success.
- Automated tests: 64 passed, 0 failed.
- Lint: passed.
- Android configuration validation: passed.
- Original artwork validation: 32 unique regular-enemy PNG mappings and five separate boss PNGs passed.
- Production web build: passed.
- Chromium gameplay smoke: passed for token start/Continue, hero idle/walk/run/jump, live weighted enemy rigs, each boss signature animation on its milestone stage, all 50 stage restarts, and mobile-input regression checks.
- Performance work: region-scoped enemy rigs, current-stage backdrop loading, inactive region rig-cache/atlas cleanup, and removal of invisible competing boss animation loops.
- Physical Android handset testing has **not** been performed and must not be claimed.

## Build instruction

Build only one signed Android **Release** APK from the current `main` branch. The commits after the verified implementation commit contain release documentation and this trigger marker only; no game source changes were made after CI passed.

After the workflow finishes, verify the run succeeded, confirm the APK artifact exists, and record the artifact's exact download URL and SHA-256. Do not create another APK.
