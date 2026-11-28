# Final ZERO GAME Release Build

This marker requests the single final signed Android Release APK after integrating the complete supplied character artwork already present in the repository.

- Source commit: `bf2dd777115f41089f9f6f694ede1e3f1bb10bef`.
- Four supplied hero sheets: integrated from `new heros orignal/hero (1).jpg` through `hero (4).jpg`, mapped to Ryo, Kairo, Mei and Volt. Each sheet's idle, walking, jumping, attacking and sitting panel is extracted to a transparent runtime pose texture and used by the hero visual state system.
- Thirty supplied enemy sheets: retained and integrated from `new enemy/`, with idle, walking, jumping and attack poses.
- Five supplied boss sheets: retained and integrated from `bosses/`, with idle, walking, attack and defeated poses.
- Existing stages, controls, particles, projectiles and campaign rules were not intentionally changed.
- Consolidated CI run: `46146086302` — success on source commit `37d98d0db7a587d500cd162140d23cc637b9bc6d`. Automated tests, lint, Android configuration, enemy/boss PNG validation, production web build, and Chromium campaign gameplay smoke all passed.
- No physical Android handset test is claimed.
- Build only the single signed Release APK. Do not create debug, intermediate or additional APKs.
