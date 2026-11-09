#!/usr/bin/env python3
"""
Photo enhancement pipeline for the Crazy Cakes Galaxy site.

  python3 scripts/enhance-photos.py

Reads the client's untouched photos from   src/assets/_originals/
Writes graded, sharpened WebP files to    src/assets/cakes/   (+ public/hero-cake.webp)

What it does (it never repaints or replaces a cake — only corrects the capture):
  • levels   – gentle black/white point stretch (percentile based, 60 % strength)
  • exposure – limited gamma toward a pleasant mid-tone, never more than ±15 %
  • white balance – estimated from near-neutral highlights only, clamped to ±6 %
  • contrast – soft S-curve, then +8 % saturation for food-photography richness
  • denoise  – only for small, compressed source images (removes JPEG blocking)
  • sharpen  – unsharp mask scaled to the image size
When the client supplies higher-resolution originals, drop them into _originals/
with the same file names and re-run this script.
"""
import glob, os, sys
import numpy as np, cv2

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "src/assets/_originals")
DST = os.path.join(ROOT, "src/assets/cakes")
MAXDIM = 1800

def luminance(a):
    return a[..., 0] * 0.2126 + a[..., 1] * 0.7152 + a[..., 2] * 0.0722

def grade(rgb, alpha=None, name=""):
    a = rgb.astype(np.float32) / 255.0
    mask = (alpha > 16) if alpha is not None else np.ones(a.shape[:2], bool)
    L = luminance(a)
    Lm = L[mask]

    # white balance from near-neutral highlights
    hi = Lm > np.percentile(Lm, 96)
    px = a[mask][hi]
    sat = (px.max(1) - px.min(1)) / (px.max(1) + 1e-4)
    px = px[sat < 0.18]
    if len(px) > 200:
        m = px.mean(0)
        g = m.mean() / (m + 1e-4)
        g = np.clip(1 + (g - 1) * 0.6, 0.94, 1.06)
        a = np.clip(a * g, 0, 1)

    # levels (60 % strength)
    L = luminance(a); Lm = L[mask]
    lo, hi_ = np.percentile(Lm, 0.4), np.percentile(Lm, 99.6)
    if hi_ - lo > 0.2:
        stretched = np.clip((a - lo) / (hi_ - lo), 0, 1)
        a = a * 0.4 + stretched * 0.6

    # exposure
    mean = luminance(a)[mask].mean()
    target = 0.46
    gamma = np.clip(np.log(target) / np.log(max(mean, 0.05)), 0.85, 1.15)
    a = np.power(a, gamma ** 0.7)

    # soft S-curve
    s = a * a * (3 - 2 * a)
    a = a * 0.75 + s * 0.25

    # saturation +8 %
    hsv = cv2.cvtColor((a * 255).astype(np.uint8), cv2.COLOR_RGB2HSV).astype(np.float32)
    hsv[..., 1] = np.clip(hsv[..., 1] * 1.08, 0, 255)
    out = cv2.cvtColor(hsv.astype(np.uint8), cv2.COLOR_HSV2RGB)
    return out

def process(path):
    name = os.path.splitext(os.path.basename(path))[0]
    im = cv2.imread(path, cv2.IMREAD_UNCHANGED)
    alpha = None
    if im.shape[2] == 4:
        alpha = im[..., 3]; rgb = cv2.cvtColor(im[..., :3], cv2.COLOR_BGR2RGB)
    else:
        rgb = cv2.cvtColor(im, cv2.COLOR_BGR2RGB)
    h, w = rgb.shape[:2]
    small = w < 1000

    if small:  # compressed thumbnails: clean block noise before sharpening
        rgb = cv2.fastNlMeansDenoisingColored(rgb, None, 3, 3, 5, 15)

    if max(h, w) > MAXDIM:
        k = MAXDIM / max(h, w)
        rgb = cv2.resize(rgb, (int(w * k), int(h * k)), interpolation=cv2.INTER_AREA)
        if alpha is not None:
            alpha = cv2.resize(alpha, (rgb.shape[1], rgb.shape[0]), interpolation=cv2.INTER_AREA)
        h, w = rgb.shape[:2]

    rgb = grade(rgb, alpha, name)

    sigma = 0.9 if small else (1.3 if w < 1500 else 1.7)
    amount = 0.55 if small else 0.7
    blur = cv2.GaussianBlur(rgb, (0, 0), sigma)
    rgb = cv2.addWeighted(rgb, 1 + amount, blur, -amount, 0)

    out = rgb if alpha is None else np.dstack([rgb, alpha])
    pil_arr = out
    from PIL import Image
    img = Image.fromarray(pil_arr)
    dst = os.path.join(DST, name + ".webp")
    img.save(dst, "WEBP", quality=88, method=6, exact=alpha is not None)
    print(f"{name:32s} {w}x{h}  {os.path.getsize(dst)//1024:>5} KB")
    return img, name

def main():
    os.makedirs(DST, exist_ok=True)
    for p in sorted(glob.glob(os.path.join(SRC, "*"))):
        if os.path.basename(p).startswith("hero-cake"):
            continue
        if p.lower().endswith((".jpg", ".jpeg", ".png")):
            img, name = process(p)
            if name == "chocolate-drip-cutout":
                # high-res texture for the 3D hero (kept under /public so the canvas can load it by URL)
                hero = img.copy(); hero.thumbnail((1400, 1400))
                hero.save(os.path.join(ROOT, "public/hero-cake.webp"), "WEBP", quality=90, method=6, exact=True)
                print("public/hero-cake.webp", hero.size)

if __name__ == "__main__":
    main()
