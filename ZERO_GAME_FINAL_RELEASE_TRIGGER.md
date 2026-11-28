# Final ZERO GAME Release Build

This one-time marker requests the **single final signed Android Release APK** from the verified PNG-only source.

- Verified source commit: `85244abf2e37a733351b277c7de21c53b621cbdc`
- Consolidated CI run: `46115179078` — passed.
- Verification included: 59 automated tests, lint, Android configuration, 32-unique-enemy / five-separate-boss PNG validation, Vite build, and Chromium campaign/mobile smoke test.
- Artwork scope: 32 different original enemy PNGs and five separate original boss PNGs. No vector enemy/boss artwork or generated vector character sheets.
- Animation: original PNGs receive role- and boss-state-specific Phaser runtime motion; no fabricated hand-drawn frame sheets are claimed.
- Release workflow is limited to web build, Android packaging, signing, signature verification and uploading the final APK. It does not repeat the already-passed test suite.

Build exactly one signed Release APK. Do not create debug or intermediate APKs.
