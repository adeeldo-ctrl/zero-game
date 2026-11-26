$ErrorActionPreference = "Stop"

$jdk = 'C:\Users\SMA-HO-ADEEL\Downloads\microsoft-jdk-21.0.12.1-windows-x64\jdk-21.0.12.1+1'

if (!(Test-Path -LiteralPath "${jdk}\bin\java.exe")) {
    throw "JDK 21 executable not found: $jdk"
}

$env:JAVA_HOME = $jdk
$env:PATH = "${jdk}\bin;$env:PATH"

Write-Host "JAVA_HOME: $env:JAVA_HOME"
& "${env:JAVA_HOME}\bin\java.exe" -version

$androidDir = Join-Path $PSScriptRoot 'android'
if (!(Test-Path -LiteralPath "${androidDir}\gradlew.bat")) {
    throw "Gradle wrapper not found: $androidDir"
}

Set-Location -LiteralPath $androidDir

./gradlew.bat --version
if ($LASTEXITCODE -ne 0) { throw "Gradle version check failed" }

./gradlew.bat assembleDebug
if ($LASTEXITCODE -ne 0) { throw "Android APK build failed" }

$apk = Join-Path $androidDir 'app\build\outputs\apk\debug\app-debug.apk'
if (!(Test-Path -LiteralPath $apk)) { throw "APK was not generated" }

$size = (Get-Item $apk).Length
Write-Host "APK SUCCESS: $apk (size: $size bytes)"
