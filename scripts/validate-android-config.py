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
assert trigger_block and re.search(r"(?m)^  workflow_run:\s*$", trigger_block.group(1)), (
    "The Android APK workflow must be triggered by the completed final verification workflow"
)
assert "ZERO GAME Continuous Checks" in trigger_block.group(1), (
    "The APK workflow must wait for ZERO GAME Continuous Checks"
)
assert not re.search(r"(?m)^  push:", trigger_block.group(1)), (
    "Source pushes must not directly trigger Android APK builds"
)
assert not re.search(r"(?m)^  pull_request:", trigger_block.group(1)), (
    "Pull requests must not trigger Android APK builds"
)
assert "workflow_run.conclusion == 'success'" in content, (
    "The Android APK must build only after successful integrated verification"
)
assert "workflow_run.head_sha" in content, (
    "The APK must be built from the exact verified source commit"
)
assert "assembleDebug" in content and "upload-artifact@v4" in content
assert "screenOrientation" in content, "Android launcher must be locked to landscape"
for flag in ("SYSTEM_UI_FLAG_IMMERSIVE_STICKY", "SYSTEM_UI_FLAG_HIDE_NAVIGATION", "SYSTEM_UI_FLAG_FULLSCREEN"):
    assert flag in content, f"Android immersive full-screen mode is missing {flag}"
assert not (workflow_dir / "android-apk.yml").exists(), "Remove the redundant legacy APK workflow"

ci = (workflow_dir / "zero-game-ci.yml").read_text(encoding="utf-8")
ci_trigger = re.search(r"(?ms)^on:\s*\n((?:[ \t]+.*\n)*)", ci)
assert ci_trigger and re.search(r"(?m)^  push:\s*$", ci_trigger.group(1)), (
    "Integrated verification must be manually dispatchable"
)
assert re.search(r"(?m)^      - main\s*$", ci_trigger.group(1)), (
    "Integrated verification must run only for the final main-branch commit"
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
