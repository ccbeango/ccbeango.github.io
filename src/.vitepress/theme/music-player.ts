import { ref, shallowRef } from "vue";

export interface MusicTrack {
  source: string;
  resolver?: "motues";
  title: string;
  artist: string;
  album?: string;
  provider?: string;
  cover?: string;
  coverAlt: string;
}

interface MotuesDetailsPayload {
  id?: unknown;
  name?: unknown;
  artist?: unknown;
  album?: unknown;
  url_id?: unknown;
  source?: unknown;
}

export const currentMusicTrack = shallowRef<MusicTrack>();
export const musicIsPlaying = ref(false);
export const musicIsLoading = ref(false);
export const musicHasError = ref(false);
export const musicCurrentTime = ref(0);
export const musicDuration = ref(0);

let audioElement: HTMLAudioElement | undefined;
let playbackAttempt = 0;
const resolvedSourceCache = new Map<string, string>();
const sourceResolutionRequests = new Map<string, Promise<string>>();
const motuesTrackRequests = new Map<string, Promise<MusicTrack>>();

function trackKey(track: MusicTrack) {
  return `${track.resolver ?? "direct"}:${track.source}`;
}

function isSameTrack(first: MusicTrack | undefined, second: MusicTrack) {
  return first ? trackKey(first) === trackKey(second) : false;
}

function normalizeRemoteSource(source: unknown, message: string) {
  if (typeof source !== "string" || !source.trim()) throw new Error(message);
  const url = new URL(source);
  if (url.protocol !== "http:" && url.protocol !== "https:") throw new Error(message);
  if (url.protocol === "http:" && typeof window !== "undefined" && window.location.protocol === "https:") {
    url.protocol = "https:";
  }
  return url.toString();
}

function createMotuesUrl(source: string, type: "cover" | "url", id: string) {
  const url = new URL(source);
  url.searchParams.set("type", type);
  url.searchParams.set("id", id);
  if (type === "cover") {
    url.searchParams.delete("br");
    url.searchParams.set("size", "300");
  } else {
    url.searchParams.delete("size");
  }
  return url.toString();
}

async function fetchJson(source: string) {
  const response = await fetch(source);
  if (!response.ok) throw new Error(`音乐接口响应 ${response.status}`);
  return response.json() as Promise<Record<string, unknown>>;
}

async function loadMotuesTrack(source: string) {
  const detailsUrl = new URL(source);
  const songId = detailsUrl.searchParams.get("id");
  if (!songId) throw new Error("Motues details 地址缺少歌曲 ID");

  const coverRequest = fetchJson(createMotuesUrl(source, "cover", songId)).catch(() => undefined);
  const details = (await fetchJson(source)) as MotuesDetailsPayload;
  const title = typeof details.name === "string" ? details.name.trim() : "";
  const artists = Array.isArray(details.artist)
    ? details.artist.filter((artist): artist is string => typeof artist === "string" && Boolean(artist.trim()))
    : [];
  const audioId =
    typeof details.url_id === "number" || typeof details.url_id === "string" ? String(details.url_id) : "";
  if (!title || artists.length === 0 || !audioId) throw new Error("Motues details 响应缺少歌曲信息");

  const coverData = await coverRequest;
  let cover: string | undefined;
  try {
    if (coverData?.url) cover = normalizeRemoteSource(coverData.url, "音乐封面接口返回了无效地址");
  } catch {
    cover = undefined;
  }
  const provider = typeof details.source === "string" && details.source.trim() ? details.source.trim() : undefined;
  const audioUrl = new URL(createMotuesUrl(source, "url", audioId));
  if (provider) audioUrl.searchParams.set("server", provider);

  return {
    source: audioUrl.toString(),
    resolver: "motues" as const,
    title,
    artist: artists.join("、"),
    album: typeof details.album === "string" && details.album.trim() ? details.album.trim() : undefined,
    provider,
    cover,
    coverAlt: `${title}的歌曲封面`,
  };
}

export function resolveMotuesTrack(source: string) {
  const pending = motuesTrackRequests.get(source);
  if (pending) return pending;

  const request = loadMotuesTrack(source);
  motuesTrackRequests.set(source, request);
  void request.catch(() => {
    if (motuesTrackRequests.get(source) === request) motuesTrackRequests.delete(source);
  });
  return request;
}

async function resolveMotuesSource(source: string) {
  const cached = resolvedSourceCache.get(source);
  if (cached) return cached;

  const pending = sourceResolutionRequests.get(source);
  if (pending) return pending;

  const request = fetch(source)
    .then(async (response) => {
      if (!response.ok) throw new Error(`音乐解析接口响应 ${response.status}`);
      const data = (await response.json()) as { url?: unknown };
      const resolved = normalizeRemoteSource(data?.url, "音乐解析接口返回了无效地址");
      resolvedSourceCache.set(source, resolved);
      return resolved;
    })
    .finally(() => sourceResolutionRequests.delete(source));
  sourceResolutionRequests.set(source, request);
  return request;
}

function resolveTrackSource(track: MusicTrack) {
  return track.resolver === "motues" ? resolveMotuesSource(track.source) : Promise.resolve(track.source);
}

function resetPlaybackState() {
  musicIsPlaying.value = false;
  musicIsLoading.value = false;
  musicHasError.value = false;
  musicCurrentTime.value = 0;
  musicDuration.value = 0;
}

export function registerMusicAudio(element: HTMLAudioElement) {
  audioElement = element;
  const track = currentMusicTrack.value;
  if (!track) return;
  const resolved = track.resolver ? resolvedSourceCache.get(track.source) : track.source;
  if (resolved && element.src !== resolved) {
    element.src = resolved;
  }
}

export function unregisterMusicAudio(element: HTMLAudioElement) {
  if (audioElement === element) audioElement = undefined;
}

async function loadAndPlayTrack(track: MusicTrack) {
  const attempt = ++playbackAttempt;
  musicIsLoading.value = true;
  musicHasError.value = false;
  try {
    const source = await resolveTrackSource(track);
    if (attempt !== playbackAttempt || !isSameTrack(currentMusicTrack.value, track) || !audioElement) return;
    if (audioElement.src !== source) {
      audioElement.src = source;
      audioElement.load();
    }
    await audioElement.play();
  } catch {
    if (attempt !== playbackAttempt || !isSameTrack(currentMusicTrack.value, track)) return;
    musicIsLoading.value = false;
    musicIsPlaying.value = false;
    musicHasError.value = true;
  }
}

export async function toggleMusicTrack(track: MusicTrack) {
  const isCurrent = isSameTrack(currentMusicTrack.value, track);
  if (!isCurrent) {
    playbackAttempt += 1;
    audioElement?.pause();
    currentMusicTrack.value = track;
    resetPlaybackState();
    await loadAndPlayTrack(track);
    return;
  }

  currentMusicTrack.value = track;
  if (!audioElement) return;
  if (audioElement.paused) await loadAndPlayTrack(track);
  else audioElement.pause();
}

export async function toggleMusicPlayback() {
  const track = currentMusicTrack.value;
  if (!audioElement || !track) return;
  if (audioElement.paused) await loadAndPlayTrack(track);
  else audioElement.pause();
}

export function seekMusic(seconds: number) {
  if (!audioElement || !Number.isFinite(audioElement.duration)) return;
  audioElement.currentTime = Math.min(Math.max(seconds, 0), audioElement.duration);
}

export function closeMusicPlayer() {
  playbackAttempt += 1;
  if (audioElement) {
    audioElement.pause();
    audioElement.removeAttribute("src");
    audioElement.load();
  }
  currentMusicTrack.value = undefined;
  resetPlaybackState();
}

export function handleMusicLoadedMetadata() {
  if (!audioElement) return;
  musicDuration.value = Number.isFinite(audioElement.duration) ? audioElement.duration : 0;
  musicIsLoading.value = false;
}

export function handleMusicTimeUpdate() {
  if (!audioElement) return;
  musicCurrentTime.value = audioElement.currentTime;
}

export function handleMusicPlay() {
  musicIsPlaying.value = true;
  musicIsLoading.value = false;
  musicHasError.value = false;
}

export function handleMusicPause() {
  musicIsPlaying.value = false;
}

export function handleMusicWaiting() {
  musicIsLoading.value = true;
}

export function handleMusicCanPlay() {
  musicIsLoading.value = false;
}

export function handleMusicEnded() {
  musicIsPlaying.value = false;
  musicIsLoading.value = false;
  musicCurrentTime.value = musicDuration.value;
}

export function handleMusicError() {
  musicIsPlaying.value = false;
  musicIsLoading.value = false;
  musicHasError.value = true;
}

export function formatMusicTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const minutes = Math.floor(seconds / 60);
  const remaining = Math.floor(seconds % 60);
  return `${minutes}:${remaining.toString().padStart(2, "0")}`;
}
