#!/usr/bin/env python
import argparse
import hashlib
import json
import os
import shutil
import tempfile
import urllib.request
from concurrent.futures import ProcessPoolExecutor
from pathlib import Path

from fontTools.subset import main as subset_font


PACKAGE_DIR = Path(__file__).resolve().parent.parent
SOURCE_PATH = PACKAGE_DIR / "source.json"
UNICODE_PATH = PACKAGE_DIR / "unicode.json"
FAMILY = "LXGW WenKai Lite"
RELEASE_API = "https://api.github.com/repos/lxgw/LxgwWenKai-Lite/releases/latest"
ASSETS = {
    "LXGWWenKaiLite-Regular.ttf": 400,
    "LXGWWenKaiLite-Medium.ttf": 500,
}


def request_json(url):
    request = urllib.request.Request(url, headers={"Accept": "application/vnd.github+json", "User-Agent": "bean-blog-font-updater"})
    with urllib.request.urlopen(request) as response:
        return json.load(response)


def latest_source():
    release = request_json(RELEASE_API)
    release_assets = {asset["name"]: asset for asset in release["assets"]}
    assets = []
    for name, weight in ASSETS.items():
        asset = release_assets.get(name)
        if not asset:
            raise RuntimeError(f"Latest release is missing {name}")
        digest = asset.get("digest", "")
        if not digest.startswith("sha256:"):
            raise RuntimeError(f"Latest release does not provide a SHA256 digest for {name}")
        assets.append({
            "name": name,
            "weight": weight,
            "size": asset["size"],
            "sha256": digest.removeprefix("sha256:"),
            "url": asset["browser_download_url"],
        })
    current = json.loads(SOURCE_PATH.read_text(encoding="utf-8"))
    return {
        "repository": "lxgw/LxgwWenKai-Lite",
        "tag": release["tag_name"],
        "publishedAt": release["published_at"],
        "releaseUrl": release["html_url"],
        "assets": assets,
        "unicodeData": current["unicodeData"],
    }


def download(asset, directory):
    target = directory / asset["name"]
    request = urllib.request.Request(asset["url"], headers={"User-Agent": "bean-blog-font-updater"})
    digest = hashlib.sha256()
    size = 0
    with urllib.request.urlopen(request) as response, target.open("wb") as output:
        while chunk := response.read(1024 * 1024):
            output.write(chunk)
            digest.update(chunk)
            size += len(chunk)
    if size != asset["size"]:
        raise RuntimeError(f"Size mismatch for {asset['name']}: expected {asset['size']}, got {size}")
    if digest.hexdigest() != asset["sha256"]:
        raise RuntimeError(f"SHA256 mismatch for {asset['name']}")
    return target


def subset(task):
    source, output, unicodes = task
    subset_font([
        str(source),
        f"--output-file={output}",
        "--flavor=woff2",
        f"--unicodes={unicodes}",
        "--passthrough-tables",
    ])


def package_version(tag):
    parts = tag.removeprefix("v").split(".")
    return ".".join([*parts, *(["0"] * (3 - len(parts)))])


def build(source):
    unicode_ranges = json.loads(UNICODE_PATH.read_text(encoding="utf-8"))
    with tempfile.TemporaryDirectory(prefix="lxgw-wenkai-lite-") as temp_name:
        temp = Path(temp_name)
        output_dir = temp / "files"
        output_dir.mkdir()
        tasks = []
        css = []
        for asset in source["assets"]:
            font = download(asset, temp)
            style = "regular" if asset["weight"] == 400 else "medium"
            for part, unicodes in unicode_ranges.items():
                subset_id = part.removeprefix("[").removesuffix("]")
                filename = f"lxgwwenkailite-{style}-subset-{subset_id}.woff2"
                tasks.append((font, output_dir / filename, unicodes))
                css.extend([
                    f"/* {FAMILY} {style.title()} [{subset_id}] */\n",
                    "@font-face {\n",
                    f"  font-family: '{FAMILY}';\n",
                    "  font-style: normal;\n",
                    f"  font-weight: {asset['weight']};\n",
                    "  font-display: swap;\n",
                    f"  src: url('./files/{filename}') format('woff2');\n",
                    f"  unicode-range: {unicodes};\n",
                    "}\n",
                ])
        workers = min(4, os.cpu_count() or 1)
        with ProcessPoolExecutor(max_workers=workers) as pool:
            list(pool.map(subset, tasks))
        css_path = temp / "index.css"
        css_path.write_text("".join(css), encoding="utf-8", newline="\n")

        package_files = PACKAGE_DIR / "files"
        if package_files.exists():
            shutil.rmtree(package_files)
        shutil.move(output_dir, package_files)
        shutil.move(css_path, PACKAGE_DIR / "index.css")

    SOURCE_PATH.write_text(json.dumps(source, ensure_ascii=False, indent=2) + "\n", encoding="utf-8", newline="\n")
    (PACKAGE_DIR / "VERSION").write_text(source["tag"] + "\n", encoding="utf-8", newline="\n")
    package_path = PACKAGE_DIR / "package.json"
    package = json.loads(package_path.read_text(encoding="utf-8"))
    package["version"] = package_version(source["tag"])
    package_path.write_text(json.dumps(package, ensure_ascii=False, indent=2) + "\n", encoding="utf-8", newline="\n")
    print(f"Generated {len(source['assets']) * len(unicode_ranges)} WOFF2 subsets for {source['tag']}")


def main():
    parser = argparse.ArgumentParser(description="Generate LXGW WenKai Lite webfont subsets")
    parser.add_argument("--latest", action="store_true", help="discover and package the latest stable GitHub release")
    args = parser.parse_args()
    source = latest_source() if args.latest else json.loads(SOURCE_PATH.read_text(encoding="utf-8"))
    build(source)


if __name__ == "__main__":
    main()
