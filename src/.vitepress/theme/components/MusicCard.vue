<script setup lang="ts">
import { LoaderCircle, Music2, Pause, Play } from "@lucide/vue";
import { withBase } from "vitepress";
import { computed, onBeforeUnmount, onMounted, ref, shallowRef } from "vue";
import {
  currentMusicTrack,
  formatMusicTime,
  musicCurrentTime,
  musicDuration,
  musicIsLoading,
  musicIsPlaying,
  resolveMotuesTrack,
  seekMusic,
  toggleMusicTrack,
  type MusicTrack,
} from "../music-player";

const props = defineProps<{
  source: string;
  resolver?: "motues" | "motues-details";
  title?: string;
  artist?: string;
  cover?: string;
  coverAlt: string;
}>();

const sourceUrl = computed(() => withBase(props.source));
const coverUrl = computed(() => (props.cover ? withBase(props.cover) : undefined));
const resolvedTrack = shallowRef<MusicTrack>();
const metadataIsLoading = ref(props.resolver === "motues-details");
const metadataHasError = ref(false);
let isUnmounted = false;

const track = computed<MusicTrack | undefined>(() => {
  if (props.resolver === "motues-details") return resolvedTrack.value;
  if (!props.title || !props.artist) return undefined;
  return {
    source: sourceUrl.value,
    resolver: props.resolver,
    title: props.title,
    artist: props.artist,
    cover: coverUrl.value,
    coverAlt: props.coverAlt,
  };
});
const displayTitle = computed(() =>
  metadataHasError.value ? "歌曲信息加载失败" : (track.value?.title ?? "正在加载歌曲信息"),
);
const displaySubtitle = computed(() => {
  if (metadataHasError.value) return "请检查 Motues 地址或服务状态";
  const artist = track.value?.artist ?? "open.motues.top";
  return track.value?.album ? `${artist} · ${track.value.album}` : artist;
});
const displayCover = computed(() => coverUrl.value ?? track.value?.cover);
const displayCoverAlt = computed(() => (coverUrl.value ? props.coverAlt : track.value?.coverAlt ?? "歌曲封面"));
const isCurrent = computed(() => {
  const candidate = track.value;
  const current = currentMusicTrack.value;
  return Boolean(candidate && current && current.source === candidate.source && current.resolver === candidate.resolver);
});
const isPlaying = computed(() => isCurrent.value && musicIsPlaying.value);
const isLoading = computed(() => metadataIsLoading.value || (isCurrent.value && musicIsLoading.value));
const currentTime = computed(() => (isCurrent.value ? musicCurrentTime.value : 0));
const duration = computed(() => (isCurrent.value ? musicDuration.value : 0));

async function loadMetadata() {
  try {
    const resolved = await resolveMotuesTrack(sourceUrl.value);
    if (isUnmounted) return;
    resolvedTrack.value = {
      ...resolved,
      cover: coverUrl.value ?? resolved.cover,
      coverAlt: coverUrl.value ? props.coverAlt : resolved.coverAlt,
    };
  } catch {
    if (!isUnmounted) metadataHasError.value = true;
  } finally {
    if (!isUnmounted) metadataIsLoading.value = false;
  }
}

function handleToggle() {
  if (track.value) void toggleMusicTrack(track.value);
}

function handleSeek(event: Event) {
  if (!isCurrent.value) return;
  seekMusic(Number((event.target as HTMLInputElement).value));
}

onMounted(() => {
  if (props.resolver === "motues-details") void loadMetadata();
});

onBeforeUnmount(() => {
  isUnmounted = true;
});
</script>

<template>
  <figure
    class="not-prose my-8 flex w-full items-center gap-4 rounded-lg border border-border bg-card p-4 text-card-foreground shadow-sm transition-colors hover:border-border-strong"
    data-music-card
    :data-music-resolver="resolver ?? 'direct'"
  >
    <div
      class="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-md bg-muted text-muted-foreground"
    >
      <img
        v-if="displayCover"
        class="size-full object-cover"
        :src="displayCover"
        :alt="displayCoverAlt"
        loading="lazy"
        decoding="async"
      />
      <Music2
        v-else
        class="size-7"
        aria-hidden="true"
      />
    </div>

    <figcaption class="min-w-0 flex-1">
      <strong class="block truncate text-base font-medium">{{ displayTitle }}</strong>
      <span class="mt-0.5 block truncate text-sm text-muted-foreground">{{ displaySubtitle }}</span>
      <div
        class="mt-2 grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 text-xs text-muted-foreground tabular-nums"
      >
        <span>{{ formatMusicTime(currentTime) }}</span>
        <input
          class="h-4 w-full cursor-pointer accent-primary disabled:cursor-default"
          type="range"
          min="0"
          :max="duration || 0"
          step="0.1"
          :value="currentTime"
          :disabled="!isCurrent || !duration"
          :aria-label="`调整《${displayTitle}》的播放进度`"
          @input="handleSeek"
        />
        <span>{{ duration ? formatMusicTime(duration) : "--:--" }}</span>
      </div>
    </figcaption>

    <button
      class="inline-flex size-control shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground transition-colors hover:bg-primary hover:text-primary-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:cursor-wait"
      type="button"
      :aria-label="isPlaying ? `暂停《${displayTitle}》` : `播放《${displayTitle}》`"
      :aria-pressed="isPlaying"
      :disabled="isLoading || metadataHasError || !track"
      @click="handleToggle"
    >
      <LoaderCircle
        v-if="isLoading"
        class="size-5 animate-spinner"
        aria-hidden="true"
      />
      <Pause
        v-else-if="isPlaying"
        class="size-5 fill-current"
        aria-hidden="true"
      />
      <Play
        v-else
        class="size-5 fill-current"
        aria-hidden="true"
      />
    </button>

    <p
      v-if="metadataHasError"
      class="sr-only"
      role="status"
    >
      歌曲信息加载失败，请检查 Motues 地址或服务状态。
    </p>
  </figure>
</template>
