@echo off
setlocal

echo ZERO GAME Android APK builds are final-only.
echo Debug and intermediate APK generation is intentionally disabled.
echo.
echo Complete development and the consolidated CI verification first.
echo Then use the repository's manual "ZERO GAME Android APK" workflow
echo to generate the signed Release APK.
echo.
echo This legacy local build script will not build or sync an APK.
exit /b 1
