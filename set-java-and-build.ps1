$ErrorActionPreference = "Stop"

Write-Host "ZERO GAME Android APK builds are final-only." -ForegroundColor Yellow
Write-Host "Debug and intermediate APK generation is intentionally disabled."
Write-Host ""
Write-Host "Complete development and consolidated CI verification first."
Write-Host 'Then use the repository manual "ZERO GAME Android APK" workflow'
Write-Host "to generate the signed Release APK."
Write-Host ""
throw "Legacy local APK build script disabled by the final-only delivery policy."
