import json
import re
import shutil
import subprocess
import sys
import tempfile
import xml.etree.ElementTree as ET
from pathlib import Path

root = Path(__file__).resolve().parents[1]
config = json.loads((root / "capacitor.config.json").read_text(encoding="utf-8"))
assert config.get("appId") == "com.zerogame.arcade", "Android package id changed"
assert config.get("appName") == "ZERO GAME", "Android app name changed"
assert config.get("webDir") == "dist", "Capacitor webDir must remain dist"

# Guard every legacy local path against accidentally producing an interim APK.
package = json.loads((root / "package.json").read_text(encoding="utf-8"))
assert "android:apk" not in package.get("scripts", {}), "Remove the legacy debug APK npm shortcut"
for legacy_script in ("build-android.bat", "set-java-and-build.ps1"):
    legacy_content = (root / legacy_script).read_text(encoding="utf-8")
    assert "assembleDebug" not in legacy_content, f"{legacy_script} must not build a debug APK"
    assert "final-only" in legacy_content.lower(), f"{legacy_script} must explain the final-only APK policy"

readme = (root / "README.md").read_text(encoding="utf-8")
assert "zero-game-release-apk" in readme and "zero-game-release.apk" in readme
assert "zero-game-debug-apk" not in readme and "app-debug.apk" not in readme, (
    "README must document only the final signed Release APK"
)

foreground = root / "android-res/drawable/zero_game_foreground.xml"
adaptive = root / "android-res/mipmap-anydpi-v26/ic_launcher.xml"
legacy = root / "android-res/mipmap-anydpi/ic_launcher.xml"
for path in (foreground, adaptive, legacy):
    assert path.is_file(), f"Missing launcher icon resource: {path.relative_to(root)}"
    ET.parse(path)

adaptive_root = ET.parse(adaptive).getroot()
assert adaptive_root.tag == "adaptive-icon", "Android 8+ adaptive launcher icon is missing"
adaptive_tags = {child.tag for child in adaptive_root}
assert {"background", "foreground"}.issubset(adaptive_tags), "Adaptive icon needs foreground and background layers"

icon_installer = (root / "scripts/install-android-icon.py").read_text(encoding="utf-8")
for source in ("zero_game_foreground.xml", "mipmap-anydpi-v26", "mipmap-anydpi"):
    assert source in icon_installer, f"Icon installer does not install {source}"

workflow_dir = root / ".github/workflows"
apk_workflow = workflow_dir / "zero-game-android.yml"
content = apk_workflow.read_text(encoding="utf-8")
trigger_block = re.search(r"(?ms)^on:\s*\n((?:[ \t]+.*\n)*)", content)
assert trigger_block and re.search(r"(?m)^  workflow_dispatch:\s*$", trigger_block.group(1)), (
    "The Android APK workflow must be manually dispatchable"
)
assert not re.search(r"(?m)^  workflow_run:", trigger_block.group(1)), (
    "APK builds must not start automatically after CI"
)
assert not re.search(r"(?m)^  pull_request:", trigger_block.group(1)), (
    "Pull requests must not trigger Android APK builds"
)
assert re.search(r"(?ms)^  push:\s*\n(?:[ \t]+.*\n)*", trigger_block.group(1)), (
    "The final APK workflow must support the one-time release marker"
)
assert "ZERO_GAME_FINAL_RELEASE_TRIGGER.md" in trigger_block.group(1), (
    "Only the explicit final-release marker may trigger an APK build on push"
)
assert "github.event_name == 'workflow_dispatch' || github.event_name == 'push'" in content, (
    "The APK job must run only for a manual dispatch or explicit final-release marker"
)
assert "FINAL_RELEASE_APPROVED: true" in content, (
    "The Android workflow must enforce the explicit final-only release approval gate"
)
assert "workflow_run" not in content, (
    "The APK workflow must not depend on automatic workflow-run events"
)
assert "assembleRelease" in content and "apksigner" in content and "zero-game-release-apk" in content and "upload-artifact@v4" in content
assert "npm test" in content and "npm run lint" in content and "npm run build" in content
assert "scripts/validate-android-config.py" in content and "scripts/smoke-game-browser.mjs" in content, (
    "Final Android workflow must run the complete consolidated verification before APK assembly"
)
assert "screenOrientation" in content, "Android launcher must be locked to landscape"
assert "android.permission.INTERNET" in content, "Android co-op networking needs Internet permission"
assert "usesCleartextTraffic" in content, "Android local Wi-Fi WebSocket access is not configured"
for flag in ("SYSTEM_UI_FLAG_IMMERSIVE_STICKY", "SYSTEM_UI_FLAG_HIDE_NAVIGATION", "SYSTEM_UI_FLAG_FULLSCREEN"):
    assert flag in content, f"Android immersive full-screen mode is missing {flag}"
assert not (workflow_dir / "android-apk.yml").exists(), "Remove the redundant legacy APK workflow"

ci = (workflow_dir / "zero-game-ci.yml").read_text(encoding="utf-8")
ci_trigger = re.search(r"(?ms)^on:\s*\n((?:[ \t]+.*\n)*)", ci)
assert ci_trigger and re.search(r"(?m)^  workflow_dispatch:\s*$", ci_trigger.group(1)), (
    "Consolidated verification must be manually dispatchable after development"
)
assert not re.search(r"(?m)^  push:", ci_trigger.group(1)), (
    "Development pushes must not start repeated full verification runs"
)
assert not re.search(r"(?m)^  pull_request:", ci_trigger.group(1)), (
    "Pull requests must not start the final delivery pipeline"
)
assert "npm test" in ci and "npm run lint" in ci and "npm run build" in ci
assert "assembleDebug" not in ci and "upload-artifact" not in ci, (
    "Continuous checks must never build or upload an APK"
)

# Run the real icon installer against an isolated mock Capacitor manifest.
with tempfile.TemporaryDirectory(prefix="zero-game-android-check-") as temporary:
    temp_root = Path(temporary)
    shutil.copytree(root / "android-res", temp_root / "android-res")
    mock_manifest = temp_root / "android/app/src/main/AndroidManifest.xml"
    mock_manifest.parent.mkdir(parents=True, exist_ok=True)
    mock_manifest.write_text(
        '<manifest xmlns:android="http://schemas.android.com/apk/res/android">'
        '<application /></manifest>',
        encoding="utf-8",
    )
    subprocess.run(
        [sys.executable, str(root / "scripts/install-android-icon.py")],
        cwd=temp_root,
        check=True,
        capture_output=True,
        text=True,
    )
    installed_tree = ET.parse(mock_manifest)
    installed_app = installed_tree.getroot().find("application")
    android = "{http://schemas.android.com/apk/res/android}"
    assert installed_app.get(android + "icon") == "@mipmap/ic_launcher"
    assert installed_app.get(android + "roundIcon") == "@mipmap/ic_launcher"
    for relative in (
        "android/app/src/main/res/drawable/zero_game_foreground.xml",
        "android/app/src/main/res/mipmap-anydpi-v26/ic_launcher.xml",
        "android/app/src/main/res/mipmap-anydpi/ic_launcher.xml",
    ):
        assert (temp_root / relative).is_file(), f"Icon installer missed {relative}"

print("Android package, launcher icon installation, CI-gated final APK build, and consolidated delivery policy validated.")
