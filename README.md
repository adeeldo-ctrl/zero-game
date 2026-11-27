# ZERO GAME

A 50-stage fixed-arena action platformer with four original playable heroes, special moves and five boss encounters.

## Run on Windows

Open PowerShell in the project folder:

```powershell
npm.cmd install
npm.cmd run dev -- --host 0.0.0.0
```

For two-player Wi-Fi co-op, start the relay on the host PC in a second PowerShell window before either player connects:

```powershell
npm.cmd run multiplayer
```

Both devices must be on the same trusted Wi-Fi network. On the host PC, choose HOST WI-FI; on the second device, choose JOIN WI-FI and enter the host PC's LAN IPv4 address. Both clients join the ZERO room, which allows two players. Allow Node.js through Windows Firewall on Private networks if prompted.

## Gameplay preserved

- 50-stage action-platformer campaign and fixed single-screen arenas.
- Existing left/right movement, jump, double-jump and charged Fire/Energy projectile.
- Existing Super attack and elemental power selection.
- Existing Wi-Fi co-op relay (still requires real two-device playtesting).

## Heroes and special moves

The four original playable heroes are:

- Ryo — balanced ember warrior: Ember Wave, Guardian Rise, Ember Cyclone Kick.
- Kairo — blazing rush warrior: Flare Wave, Flare Uppercut, Inferno Spin Kick.
- Mei — lightning sky dancer: Flash Kick Barrage, Skywheel Kick, Thunder Orb.
- Volt — wildstorm electric guardian: Storm Burst, Thunder Roll, Wild Fang Toss.

The three on-screen EXTRA buttons are independent and always map to the selected hero's matching signature move:
- EXTRA 1: the selected hero's first special move.
- EXTRA 2: the selected hero's second special move.
- EXTRA 3: the selected hero's third special move.

All twelve signature moves are implemented through distinct wave, uppercut, spin, rapid-strike, electric-burst, rolling-charge or throw effects. All three special buttons have unlimited use: no cooldown, countdown, power meter or limited-use counter. Existing movement, jump, double-jump, charged Fire attack, Super attack, elemental selection, stage progression and co-op systems remain in place.

Enemies use original arcade-fighter archetypes, including masked claw acrobats, boxing bruisers, military chargers, heavy grapplers and electric wild fighters. Their grounded AI includes chaser, runner, jumper, guard and charger behaviors. The five dedicated boss encounters are Arena Gatekeeper, Iron Comet, Gale Talon, Suncrest Master and Void Sovereign.

## Controls

- Move: A/D or arrow keys; mobile joystick
- Jump: Space / Up / mobile JUMP
- Double jump: press jump again while airborne
- Fire: hold X / mobile FIRE to charge, then release
- Existing Super: Z / mobile SUPER
- Change elemental power: C
- EXTRA 1 / EXTRA 2 / EXTRA 3: keys 1 / 2 / 3 or the three mobile buttons above the right-side action row

## Final Android Release APK

The Android workflow produces the signed **Release APK** and is intentionally separate from ordinary development. Do not build a debug/intermediate APK while development is in progress.

After all approved development is complete and the consolidated CI checks pass:

1. Open the repository's Actions tab.
2. Select **ZERO GAME Android APK** and use **Run workflow**.
3. Wait for the signed Release workflow to complete successfully.
4. Download the `zero-game-release-apk` artifact.
5. Install `zero-game-release.apk` on an Android device.

The workflow verifies APK alignment and signature before uploading the artifact. Automated browser checks do not replace physical Android-device testing. For Wi-Fi co-op, the host PC runs `npm run multiplayer`; the Android player joins using the host PC's LAN IPv4 address. The relay uses TCP port 3001.

## Build the web game locally

```powershell
npm.cmd ci
npm.cmd run lint
npm.cmd test
npm.cmd run build
```

These commands verify and build the web game only. They do not create an Android APK. Android Release assembly remains reserved for the final manual workflow after development and consolidated verification are complete.

## Accessibility and mobile use

- Play in landscape orientation; the game canvas is designed to occupy the full device viewport.
- Keyboard controls are available alongside the on-screen mobile controls: move with A/D or the arrow keys, jump with Space/Up, fire with X, Super with Z, and select an elemental power with C.
- On mobile, use the left virtual joystick for movement and the right-side buttons for Jump, Fire, Super and the three EXTRA actions. The touch overlay supports simultaneous pointer input.
- Music and sound effects can be adjusted independently using the in-game MUSIC and SFX controls. Keyboard shortcuts M and N toggle the corresponding audio channels.
- Audio starts after the first player interaction to comply with mobile browser/WebView audio restrictions.
- The current game uses animated visual effects and does not yet expose a dedicated reduced-motion setting or screen-reader navigation mode; these are known accessibility limitations rather than supported features.

