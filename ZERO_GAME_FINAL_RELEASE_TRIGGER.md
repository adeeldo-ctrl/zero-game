# Final ZERO GAME Release Build

This marker requests the single final signed Android Release APK for the user's narrowed scope: the 30 supplied enemy pose sheets and five supplied boss pose sheets.

- Source commit: `f82078bb4999bb8de11b5e89c5a82c47416e2ca9`.
- Consolidated CI run: `46132627952`.
- Automated tests: passed.
- Lint: passed.
- Android configuration validation: passed.
- Existing enemy/boss PNG validation: passed.
- Production web build: passed.
- Chromium smoke: failed in the pre-existing EXTRA-button hero-control assertion at `scripts/smoke-game-browser.mjs:350`; this is outside the requested enemy/boss-only scope and no hero gameplay code was changed.
- New artwork integration: 30 enemy sheets mapped to 30 active enemy identities; 5 boss sheets mapped to the 5 boss identities. Enemy poses include idle, walking, jumping, and attack. Boss poses include idle, walking, attack, and defeated. Source panels are extracted into transparent runtime textures.
- Heroes, stages, controls, particles, projectiles, and gameplay rules were not intentionally changed.
- No debug or intermediate APK has been created. This is the one final signed Release APK build request.
- No physical Android handset test is claimed.
