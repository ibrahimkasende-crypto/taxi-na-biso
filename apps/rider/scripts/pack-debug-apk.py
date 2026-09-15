import os
import shutil
import zipfile

BASE_APK = r"D:\tnb-native-build\_app\outputs\apk\debug\app-debug.apk"
HBC_DIR = r"D:\tnb-js-export\_expo\static\js\android"
EXPORT_ASSETS = r"D:\tnb-js-export\assets"
RIDER_ASSETS = r"D:\taxinabiso\openride-main\apps\rider\assets"
WORK = r"D:\tnb-apk2"
SRC = os.path.join(WORK, "src")
OUT = os.path.join(WORK, "fixed.apk")

os.makedirs(WORK, exist_ok=True)
if os.path.isdir(SRC):
    shutil.rmtree(SRC)
os.makedirs(SRC)

print("extracting")
with zipfile.ZipFile(BASE_APK, "r") as z:
    z.extractall(SRC)

hbc = [f for f in os.listdir(HBC_DIR) if f.endswith(".hbc")][0]
assets_dir = os.path.join(SRC, "assets")
os.makedirs(assets_dir, exist_ok=True)
shutil.copy2(os.path.join(HBC_DIR, hbc), os.path.join(assets_dir, "index.android.bundle"))
shutil.copy2(os.path.join(RIDER_ASSETS, "ikas-profile.jpeg"), os.path.join(assets_dir, "ikas-profile.jpeg"))
shutil.copy2(os.path.join(RIDER_ASSETS, "taxi-car-side.png"), os.path.join(assets_dir, "taxi-car-side.png"))
shutil.copy2(os.path.join(RIDER_ASSETS, "default-client-avatar.png"), os.path.join(assets_dir, "default-client-avatar.png"))
for name in os.listdir(EXPORT_ASSETS):
    src = os.path.join(EXPORT_ASSETS, name)
    dst = os.path.join(assets_dir, name)
    if os.path.isdir(src):
        if os.path.isdir(dst):
            shutil.rmtree(dst)
        shutil.copytree(src, dst)
    else:
        shutil.copy2(src, dst)

densities = ["drawable-mdpi-v4", "drawable-hdpi-v4", "drawable-xhdpi-v4", "drawable-xxhdpi-v4"]
for density in densities:
    folder = os.path.join(SRC, "res", density)
    os.makedirs(folder, exist_ok=True)
    shutil.copy2(os.path.join(RIDER_ASSETS, "ikas-profile.jpeg"), os.path.join(folder, "assets_ikasprofile.jpeg"))
    shutil.copy2(os.path.join(RIDER_ASSETS, "taxi-car-side.png"), os.path.join(folder, "assets_taxicarside.png"))
    shutil.copy2(os.path.join(RIDER_ASSETS, "default-client-avatar.png"), os.path.join(folder, "assets_defaultclientavatar.png"))

meta = os.path.join(SRC, "META-INF")
if os.path.isdir(meta):
    for name in os.listdir(meta):
        if name.endswith((".SF", ".RSA", ".DSA", ".MF")):
            os.remove(os.path.join(meta, name))

print("zipping")
store_ext = {".so", ".arsc"}
count = 0
stored = 0
if os.path.exists(OUT):
    os.remove(OUT)
with zipfile.ZipFile(OUT, "w") as z:
    for root, _dirs, files in os.walk(SRC):
        for name in files:
            path = os.path.join(root, name)
            rel = os.path.relpath(path, SRC).replace(os.sep, "/")
            compress = zipfile.ZIP_STORED if (name == "resources.arsc" or os.path.splitext(name)[1] in store_ext) else zipfile.ZIP_DEFLATED
            if compress == zipfile.ZIP_STORED:
                stored += 1
            z.write(path, rel, compress)
            count += 1
print("entries", count, "stored", stored, "size", os.path.getsize(OUT))
