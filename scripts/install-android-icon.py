from pathlib import Path
import xml.etree.ElementTree as ET

root = Path("android")
res = root / "app" / "src" / "main" / "res"
manifest = root / "app" / "src" / "main" / "AndroidManifest.xml"
if not manifest.exists():
    raise SystemExit("AndroidManifest.xml was not found")

for source, target in [
    ("android-res/drawable/zero_game_foreground.xml", res / "drawable" / "zero_game_foreground.xml"),
    ("android-res/mipmap-anydpi-v26/ic_launcher.xml", res / "mipmap-anydpi-v26" / "ic_launcher.xml"),
    ("android-res/mipmap-anydpi/ic_launcher.xml", res / "mipmap-anydpi" / "ic_launcher.xml"),
]:
    destination = Path(target)
    destination.parent.mkdir(parents=True, exist_ok=True)
    destination.write_text(Path(source).read_text(encoding="utf-8"), encoding="utf-8")

ET.register_namespace("android", "http://schemas.android.com/apk/res/android")
tree = ET.parse(manifest)
android = "{http://schemas.android.com/apk/res/android}"
application = tree.getroot().find("application")
if application is None:
    raise SystemExit("Android application element was not found")
application.set(android + "icon", "@mipmap/ic_launcher")
application.set(android + "roundIcon", "@mipmap/ic_launcher")
tree.write(manifest, encoding="utf-8", xml_declaration=True)
print("ZERO GAME adaptive and legacy launcher icons installed.")
