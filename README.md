# ZERO GAME

A 50-stage fixed-arena action platformer with four original playable heroes, special moves and five boss encounters.

## Run on Windows

Open PowerShell in the project folder:

```powershell
npm.cmd install
npm.cmd run dev -- --host 0.0.0.0
```

For existing two-player Wi-Fi co-op, open a second PowerShell window:

```powershell
npm.cmd run multiplayer
```

The host PC and both players must be on the same trusted Wi-Fi network. Allow Node.js through Windows Firewall on Private networks if prompted.

## Gameplay preserved

- 50-stage action-platformer campaign and fixed single-screen arenas.
- Existing left/right movement, jump, double-jump and charged Fire/Energy projectile.
- Existing Super attack and elemental power selection.
- Existing Wi-Fi co-op relay (still requires real two-device playtesting).

## Heroes and special moves

Choose one of four original heroes with different fighting-style inspirations:

- Ryo — balanced wave fighter.
- Kairo — aggressive flame-rush fighter.
- Mei — agile lightning-kick fighter.
- Volt — electric wild fighter.

Three additional special buttons are available on the left side of the mobile controls. Each press randomly selects one of the selected hero's special moves. Special moves have unlimited use: no cooldown, countdown, power meter or limited-use counter.

Special move impacts can launch, throw or push nearby enemies with visible knockback and falling reactions. Bosses resist being thrown and instead receive balanced special-hit damage.

## Controls

- Move: A/D or arrow keys; mobile joystick
- Jump: Space / Up / mobile JUMP
- Double jump: press jump again while airborne
- Fire: hold X / mobile FIRE to charge, then release
- Existing Super: Z / mobile SUPER
- Change elemental power: C
- Dedicated unlimited Street Throw: T / mobile THROW (works when a normal enemy is close and in front).
- Special move buttons: 1, 2, 3 / mobile S1, S2, S3 (unlimited use; no cooldown or usage countdown).

## Android debug APK

The GitHub Actions workflow `.github/workflows/zero-game-android.yml` builds a debug APK on pushes and can also be started manually from the Actions tab.

1. Open the repository's Actions tab.
2. Select **ZERO GAME Android APK**.
3. Open a successful workflow run.
4. Download the `zero-game-debug-apk` artifact ZIP.
5. Extract it and install `app-debug.apk` on an Android device.

The APK is a debug build for testing, not a Play Store-signed release. For Wi-Fi co-op, the host PC still runs `npm run multiplayer`; the Android player joins using the host PC's LAN IPv4 address. The relay uses TCP port 3001.

## Build locally

```powershell
npm.cmd install
npm.cmd run lint
npm.cmd run build
npx cap add android
npx cap sync android
```

Then open the Android project in Android Studio or build the debug APK using the Gradle wrapper.