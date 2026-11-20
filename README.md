# Dastaan Heroes

## Run the game on Windows

Open PowerShell in `dastaan-heroes`:

```powershell
npm.cmd install
npm.cmd run dev -- --host 0.0.0.0
```

For Wi-Fi co-op, open a second PowerShell window in the same folder:

```powershell
npm.cmd run multiplayer
```

Allow Node.js through Windows Firewall on **Private networks** when prompted. The host PC and both players must be on the same Wi-Fi network.

## Join a two-player Wi-Fi game

1. On the host PC, start the multiplayer server with `npm run multiplayer`.
2. Start the Vite game using the command above.
3. On the host PC, open the game and press **HOST WI-FI**.
4. On the second device, open the game using the host PC's LAN address (or install the APK), then press **JOIN WI-FI**.
5. If asked, enter the host PC's IPv4 address. Find it with `ipconfig` in PowerShell.
6. Both players select a guardian and press Start. Both devices connect to room `DASTAAN`.

The WebSocket relay uses TCP port **3001**. Vite uses port **5173** during browser testing. The co-op relay synchronizes player movement, guardian choice and elemental/super shots. It is an initial LAN co-op build and still needs a real two-device playtest before the shared campaign can be considered fully verified.

## Android APK

The repository has a GitHub Actions workflow at `.github/workflows/dastaan-heroes-android.yml`.

1. Push the latest `main` branch to GitHub.
2. Open the repository's **Actions** tab.
3. Select **Dastaan Heroes Android APK** and open the latest run.
4. When the build completes successfully, download the `dastaan-heroes-debug-apk` artifact.
5. Extract the ZIP and install `app-debug.apk` on Android.

The APK contains the game client. For Wi-Fi co-op, the host PC must still run `npm run multiplayer`; the Android player enters the host PC's LAN IPv4 address when joining. A signed Play Store release build is a separate step and is not included in this debug APK workflow.

## Controls

- Move: A/D or arrow keys; mobile joystick
- Jump: Space / Up / mobile JUMP button
- Double jump: press jump a second time while airborne
- Fire: hold X / mobile FIRE to charge, then release
- Super: Z / mobile SUPER
- Change elemental power: C
