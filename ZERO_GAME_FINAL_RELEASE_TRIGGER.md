# Final ZERO GAME Release Build

This one-time marker requests the **single final signed Android Release APK** from the verified PNG-only source. This update is the final-delivery trigger; it is not a development build.

- Verified source commit: `e1abe450e680b07e9d187bdea7146b9635b7052a`
- Consolidated CI run: `46120644824` — success.
- Verification included: 59 automated tests, lint, Android configuration validation, 32 unique original enemy PNGs and five separate boss PNGs, production Vite build, Rigby2D 0.6.1 checksum verification, all 37 rig exports/weighted meshes/required clips, enemy locomotion bone movement, Gatekeeper signature torso motion, hero-selection layout checks, 50-stage campaign/mobile gameplay smoke, boss/stage progression, multitouch controls and no uncaught browser runtime errors.
- Artwork scope: 32 distinct original enemy PNGs and five separate original boss PNGs. No vector enemy/boss character replacements.
- Animation honesty: the original PNG artwork is driven by generated weighted-mesh rigs and Phaser runtime clips. This is not claimed as separately painted frame-by-frame limb animation or motion capture.
- The release workflow performs Android packaging, signing, signature verification and artifact upload only; it does not rerun the test suite.

Build exactly one signed Release APK. Do not create debug or intermediate APKs.