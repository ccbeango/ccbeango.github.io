import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { locateAndroidMotionPhoto } from "../../src/.vitepress/lib/android-motion-photo.ts";

const encoder = new TextEncoder();

function join(...parts: Uint8Array[]) {
  const output = new Uint8Array(parts.reduce((total, part) => total + part.length, 0));
  let offset = 0;
  for (const part of parts) {
    output.set(part, offset);
    offset += part.length;
  }
  return output;
}

function jpegWith(metadata: string, media = new Uint8Array()) {
  return join(
    new Uint8Array([0xFF, 0xD8]),
    encoder.encode(metadata),
    new Uint8Array([0xFF, 0xD9]),
    media,
  );
}

describe("android Motion Photo locator", () => {
  it("finds the final ftyp atom in the demo fixture and keeps its trailer", async () => {
    const fixture = await readFile(resolve("src/public/live-images/android-motion-photo.jpg"));

    expect(locateAndroidMotionPhoto(fixture)).toEqual({
      offset: 1_857_778,
      length: 4_021_423,
      source: "ftyp-scan",
    });
  });

  it.each(["MediaDataOffset", "MicroVideoOffset"])(
    "falls back to the legacy %s metadata",
    (attribute) => {
      const media = encoder.encode("legacy-video");
      const fixture = jpegWith(`<rdf:Description GCamera:${attribute}="${media.length}"/>`, media);

      expect(locateAndroidMotionPhoto(fixture)).toEqual({
        offset: fixture.length - media.length,
        length: media.length,
        source: "legacy-offset",
      });
    },
  );

  it("rejects an ordinary JPEG", () => {
    expect(locateAndroidMotionPhoto(new Uint8Array([0xFF, 0xD8, 0xFF, 0xD9]))).toBeNull();
  });

  it.each([
    ["too short", new Uint8Array([0, 0, 0, 8])],
    ["out of bounds", new Uint8Array([0xFF, 0xFF, 0xFF, 0xFF])],
  ])("ignores an ftyp atom with a %s length", (_case, size) => {
    const fixture = jpegWith("", join(size, encoder.encode("ftyp"), encoder.encode("not-video")));
    expect(locateAndroidMotionPhoto(fixture)).toBeNull();
  });

  it("rejects an out-of-bounds legacy offset", () => {
    const fixture = jpegWith("<rdf:Description GCamera:MicroVideoOffset=\"999999\"/>");
    expect(locateAndroidMotionPhoto(fixture)).toBeNull();
  });
});
