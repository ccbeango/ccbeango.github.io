import { readFile } from "node:fs/promises";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  clearPhotoMetadataCache,
  fileNameFromUrl,
  formatExposureTime,
  formatPhotoMetadata,
  loadPhotoMetadata,
} from "../../src/.vitepress/lib/photo-metadata.ts";

beforeEach(() => clearPhotoMetadataCache());

afterEach(() => vi.unstubAllGlobals());

describe("photo metadata", () => {
  it("formats dimensions and common shooting parameters without exposing GPS", () => {
    const metadata = formatPhotoMetadata(
      {
        Make: "samsung",
        Model: "SM-N9860",
        LensModel: "Main Camera",
        DateTimeOriginal: new Date("2026-09-02T02:25:11.000Z"),
        FocalLength: 7,
        FocalLengthIn35mmFormat: 25,
        FNumber: 1.8,
        ExposureTime: 0.02,
        ISO: 200,
        ExposureBiasValue: 0.3,
        ExifImageWidth: 2992,
        ExifImageHeight: 2992,
        latitude: 30.1,
        longitude: 104.1,
      },
      { source: "/live-images/photo%201.jpg" },
    );

    expect(metadata).toMatchObject({
      fileName: "photo 1.jpg",
      dimensions: "2992 × 2992",
      megapixels: "9 MP",
      camera: "samsung SM-N9860",
      lens: "Main Camera",
      focalLength: "7 mm",
      equivalentFocalLength: "25 mm",
      aperture: "f/1.8",
      exposureTime: "1/50 秒",
      iso: "200",
      exposureBias: "+0.3 EV",
      hasShootingData: true,
    });
    expect(metadata).not.toHaveProperty("latitude");
    expect(metadata).not.toHaveProperty("longitude");
  });

  it("uses display dimensions when EXIF is absent", () => {
    expect(
      formatPhotoMetadata(undefined, {
        source: "/images/plain.png?width=800",
        width: 800,
        height: 600,
      }),
    ).toEqual({
      fileName: "plain.png",
      dimensions: "800 × 600",
      megapixels: "0.5 MP",
      capturedAt: undefined,
      camera: undefined,
      lens: undefined,
      focalLength: undefined,
      equivalentFocalLength: undefined,
      aperture: undefined,
      exposureTime: undefined,
      iso: undefined,
      exposureBias: undefined,
      hasShootingData: false,
    });
  });

  it("formats exposure boundaries and malformed file names", () => {
    expect(formatExposureTime(0.01)).toBe("1/100 秒");
    expect(formatExposureTime(1.5)).toBe("1.5 秒");
    expect(formatExposureTime(undefined)).toBeUndefined();
    expect(fileNameFromUrl("/images/%E0%A4%A.jpg")).toBe("%E0%A4%A.jpg");
  });

  it("parses and caches a real Android Motion Photo without GPS fields", async () => {
    const sample = await readFile("src/public/live-images/android-motion-photo.jpg");
    const fetchMock = vi.fn(async () => new Response(sample));
    vi.stubGlobal("fetch", fetchMock);

    const input = { source: "https://example.test/live-images/android-motion-photo.jpg" };
    const first = await loadPhotoMetadata(input);
    const second = await loadPhotoMetadata(input);

    expect(first).toMatchObject({
      fileName: "android-motion-photo.jpg",
      dimensions: "2992 × 2992",
      camera: "samsung SM-N9860",
      aperture: "f/1.8",
      exposureTime: "1/50 秒",
      iso: "200",
      hasShootingData: true,
    });
    expect(second).toBe(first);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(first).not.toHaveProperty("latitude");
    expect(first).not.toHaveProperty("longitude");
  });
});
