import json
import re
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
for workflow in (workflow_dir / "zero-game-android.yml", workflow_dir / "android-apk.yml"):
    content = workflow.read_text(encoding="utf-8")
    trigger_block = re.search(r"(?ms)^on:\s*\n((?:[ \t]+.*\n)*)", content)
    assert trigger_block and re.search(r"(?m)^  workflow_dispatch:\s*$", trigger_block.group(1)), (
        f"{workflow.name} must be manually dispatched"
    )
    assert not re.search(r"(?m)^  (?:push|pull_request):", trigger_block.group(1)), (
        f"{workflow.name} must not build APKs on pushes or pull requests"
    )

ci = (workflow_dir / "zero-game-ci.yml").read_text(encoding="utf-8")
assert "npm test" in ci and "npm run lint" in ci and "npm run build" in ci
assert "assembleDebug" not in ci and "upload-artifact" not in ci, (
    "Continuous checks must never build or upload an APK"
)

print("Android package, launcher icon resources, and manual-only APK workflow policy validated.")
