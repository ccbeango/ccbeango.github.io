const METADATA_TAGS = [
  "Make",
  "Model",
  "LensModel",
  "DateTimeOriginal",
  "CreateDate",
  "FocalLength",
  "FocalLengthIn35mmFormat",
  "FNumber",
  "ExposureTime",
  "ISO",
  "ExposureBiasValue",
  "ImageWidth",
  "ImageHeight",
  "ExifImageWidth",
  "ExifImageHeight",
] as const;

type ExifRecord = Record<string, unknown>;

export interface PhotoMetadataInput {
  source: string;
  width?: number;
  height?: number;
}

export interface PhotoMetadata {
  fileName: string;
  dimensions?: string;
  megapixels?: string;
  capturedAt?: string;
  camera?: string;
  lens?: string;
  focalLength?: string;
  equivalentFocalLength?: string;
  aperture?: string;
  exposureTime?: string;
  iso?: string;
  exposureBias?: string;
  hasShootingData: boolean;
}

const metadataCache = new Map<string, Promise<PhotoMetadata>>();

function numberValue(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

function stringValue(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function formatNumber(value: number, maximumFractionDigits = 1) {
  return new Intl.NumberFormat("zh-CN", { maximumFractionDigits }).format(value);
}

export function formatExposureTime(value: number | undefined) {
  if (!value || value <= 0) return undefined;
  if (value < 1) {
    const denominator = 1 / value;
    const rounded = Math.round(denominator);
    const display = Math.abs(denominator - rounded) < 0.05 ? String(rounded) : formatNumber(denominator);
    return `1/${display} 秒`;
  }
  return `${formatNumber(value, 2)} 秒`;
}

function formatCapturedAt(value: unknown) {
  const date =
    value instanceof Date
      ? value
      : typeof value === "string" || typeof value === "number"
        ? new Date(value)
        : undefined;
  if (!date || Number.isNaN(date.getTime())) return undefined;
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(date);
}

export function fileNameFromUrl(source: string) {
  let pathname = source;
  try {
    pathname = new URL(source, "https://local.invalid").pathname;
  } catch {
    pathname = source.split(/[?#]/, 1)[0];
  }
  const name = pathname.split("/").filter(Boolean).at(-1) ?? "图片";
  try {
    return decodeURIComponent(name);
  } catch {
    return name;
  }
}

function joinCamera(make: string | undefined, model: string | undefined) {
  if (!make) return model;
  if (!model) return make;
  if (model.toLocaleLowerCase().includes(make.toLocaleLowerCase())) return model;
  return `${make} ${model}`;
}

export function formatPhotoMetadata(record: ExifRecord | undefined, input: PhotoMetadataInput): PhotoMetadata {
  const width = numberValue(record?.ExifImageWidth) ?? numberValue(record?.ImageWidth) ?? input.width;
  const height = numberValue(record?.ExifImageHeight) ?? numberValue(record?.ImageHeight) ?? input.height;
  const make = stringValue(record?.Make);
  const model = stringValue(record?.Model);
  const focalLength = numberValue(record?.FocalLength);
  const equivalentFocalLength = numberValue(record?.FocalLengthIn35mmFormat);
  const aperture = numberValue(record?.FNumber);
  const iso = numberValue(record?.ISO);
  const exposureBias = numberValue(record?.ExposureBiasValue);
  const capturedAt = formatCapturedAt(record?.DateTimeOriginal ?? record?.CreateDate);
  const lens = stringValue(record?.LensModel);
  const camera = joinCamera(make, model);
  const hasShootingData = Boolean(
    capturedAt ||
    camera ||
    lens ||
    focalLength ||
    equivalentFocalLength ||
    aperture ||
    formatExposureTime(numberValue(record?.ExposureTime)) ||
    iso ||
    exposureBias !== undefined,
  );

  return {
    fileName: fileNameFromUrl(input.source),
    dimensions: width && height ? `${width} × ${height}` : undefined,
    megapixels: width && height ? `${formatNumber((width * height) / 1_000_000)} MP` : undefined,
    capturedAt,
    camera,
    lens,
    focalLength: focalLength ? `${formatNumber(focalLength, 2)} mm` : undefined,
    equivalentFocalLength: equivalentFocalLength ? `${formatNumber(equivalentFocalLength, 2)} mm` : undefined,
    aperture: aperture ? `f/${formatNumber(aperture, 2)}` : undefined,
    exposureTime: formatExposureTime(numberValue(record?.ExposureTime)),
    iso: iso ? formatNumber(iso, 0) : undefined,
    exposureBias:
      exposureBias !== undefined ? `${exposureBias > 0 ? "+" : ""}${formatNumber(exposureBias, 2)} EV` : undefined,
    hasShootingData,
  };
}

async function readPhotoMetadata(input: PhotoMetadataInput) {
  const response = await fetch(input.source);
  if (!response.ok) throw new Error(`照片请求失败：${response.status}`);
  const buffer = await response.arrayBuffer();
  const { parse } = await import("exifr");
  const record = (await parse(buffer, {
    pick: [...METADATA_TAGS],
    gps: false,
    ifd1: false,
    xmp: false,
    icc: false,
    iptc: false,
    jfif: false,
    ihdr: false,
    makerNote: false,
    userComment: false,
  })) as ExifRecord | undefined;
  return formatPhotoMetadata(record, input);
}

export function loadPhotoMetadata(input: PhotoMetadataInput) {
  const cached = metadataCache.get(input.source);
  if (cached) return cached;
  const request = readPhotoMetadata(input).catch((error) => {
    metadataCache.delete(input.source);
    throw error;
  });
  metadataCache.set(input.source, request);
  return request;
}

export function clearPhotoMetadataCache() {
  metadataCache.clear();
}
