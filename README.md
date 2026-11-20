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

The four original hero designs now follow distinct Street Fighter-inspired archetypes:

- Ryo — Ryu-inspired balanced martial artist.
- Ken — Ken-inspired flame martial artist.
- Chun-Li — agile lightning kicker with rapid kicks and aerial techniques.
- Blanka — wild electric fighter with rolling attacks and grapples.

The three on-screen EXTRA buttons are independent:
- EXTRA 1: Ryo Hadouken-style energy wave; Ken flame energy wave; Chun-Li Lightning Legs; Blanka Electric Thunder.
- EXTRA 2: Ryo rising dragon uppercut; Ken flame uppercut; Chun-Li Spinning Bird Kick; Blanka Rolling Attack.
- EXTRA 3: Ryo spinning hurricane kick; Ken blazing spin kick; Chun-Li Kikoken energy wave; Blanka Wild Fang throw.

All three special buttons have unlimited use: no cooldown, countdown, power meter or limited-use counter. Their effects physically knock enemies back, launch them, or throw them according to the move. Bosses take balanced damage and resist normal throws.

Enemies use original archetypes inspired by other Street Fighter-style fighters, including masked claw acrobats, boxing bruisers, military chargers, heavy grapplers and electric wild fighters. Their AI includes chaser, runner, jumper, flyer, guard and charger behaviors. Boss encounters are themed around the Tiger Emperor, Crimson Claw, Iron Champion and Psycho Warlord archetypes.

## Controls

- Move: A/D or arrow keys; mobile joystick
- Jump: Space / Up / mobile JUMP
- Double jump: press jump again while airborne
- Fire: hold X / mobile FIRE to charge, then release
- Existing Super: Z / mobile SUPER
- Change elemental power: C
- EXTRA 1 / EXTRA 2 / EXTRA 3: keys 1 / 2 / 3 or the three mobile buttons above the right-side action row

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