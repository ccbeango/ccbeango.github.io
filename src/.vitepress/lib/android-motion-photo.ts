export interface MotionPhotoLocation {
  offset: number;
  length: number;
  source: "ftyp-scan" | "legacy-offset";
}

const ASCII = new TextDecoder("latin1");
const LEGACY_OFFSET_PATTERN = /(?:[\w.-]+:)?(?:MediaDataOffset|MicroVideoOffset)\s*=\s*(["'])(\d+)\1/gi;
const MIN_FTYP_ATOM_LENGTH = 16;

function toBytes(input: ArrayBuffer | Uint8Array) {
  return input instanceof Uint8Array ? input : new Uint8Array(input);
}

function readUint32(bytes: Uint8Array, offset: number) {
  return (
    bytes[offset] * 0x1000000
    + bytes[offset + 1] * 0x10000
    + bytes[offset + 2] * 0x100
    + bytes[offset + 3]
  );
}

function locateFromFtyp(bytes: Uint8Array): MotionPhotoLocation | null {
  for (let index = bytes.length - 4; index >= 4; index -= 1) {
    if (
      bytes[index] !== 0x66
      || bytes[index + 1] !== 0x74
      || bytes[index + 2] !== 0x79
      || bytes[index + 3] !== 0x70
    ) {
      continue;
    }

    const offset = index - 4;
    const atomLength = readUint32(bytes, offset);
    if (
      atomLength >= MIN_FTYP_ATOM_LENGTH
      && offset + atomLength <= bytes.length
    ) {
      return { offset, length: bytes.length - offset, source: "ftyp-scan" };
    }
  }
  return null;
}

function locateFromLegacyOffset(bytes: Uint8Array): MotionPhotoLocation | null {
  const metadata = ASCII.decode(bytes);
  for (const match of metadata.matchAll(LEGACY_OFFSET_PATTERN)) {
    const length = Number(match[2]);
    const offset = bytes.length - length;
    if (
      Number.isSafeInteger(length)
      && length > 0
      && offset >= 2
      && offset < bytes.length
    ) {
      return { offset, length, source: "legacy-offset" };
    }
  }
  return null;
}

export function locateAndroidMotionPhoto(
  input: ArrayBuffer | Uint8Array,
): MotionPhotoLocation | null {
  const bytes = toBytes(input);
  if (bytes.length < 4 || bytes[0] !== 0xFF || bytes[1] !== 0xD8)
    return null;

  return locateFromFtyp(bytes) ?? locateFromLegacyOffset(bytes);
}
