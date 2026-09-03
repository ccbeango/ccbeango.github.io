<script setup lang="ts">
import { nextTick, onBeforeUnmount, ref } from "vue";
import { locateAndroidMotionPhoto } from "../../lib/android-motion-photo";

const props = defineProps<{
  poster: string;
  video?: string;
  mode?: "android";
  androidSource?: string;
  alt: string;
}>();

const video = ref<HTMLVideoElement>();
const isVideoVisible = ref(false);
const isLoading = ref(false);
const resolvedVideoSource = ref(props.video ?? "");
let androidBlobUrl: string | undefined;
let androidRequest: Promise<string> | undefined;
let isUnmounted = false;
let playbackAttempt = 0;

function stopVideo() {
  if (!video.value)
    return;
  video.value.pause();
  video.value.currentTime = 0;
}

function releaseAndroidVideo() {
  if (!androidBlobUrl)
    return;
  URL.revokeObjectURL(androidBlobUrl);
  androidBlobUrl = undefined;
  resolvedVideoSource.value = "";
}

async function resolveAndroidVideo() {
  if (resolvedVideoSource.value)
    return resolvedVideoSource.value;
  if (androidRequest)
    return androidRequest;

  isLoading.value = true;
  androidRequest = (async () => {
    const response = await fetch(props.androidSource ?? props.poster);
    if (!response.ok)
      throw new Error(`Motion Photo 请求失败：${response.status}`);

    const buffer = await response.arrayBuffer();
    const location = locateAndroidMotionPhoto(buffer);
    if (!location)
      throw new Error("未找到 Motion Photo 视频数据");

    const content = new Uint8Array(buffer, location.offset, location.length);
    const objectUrl = URL.createObjectURL(new Blob([content], { type: "video/mp4" }));
    if (isUnmounted) {
      URL.revokeObjectURL(objectUrl);
      throw new Error("Live Photo 组件已卸载");
    }

    androidBlobUrl = objectUrl;
    resolvedVideoSource.value = objectUrl;
    return objectUrl;
  })();

  try {
    return await androidRequest;
  }
  finally {
    androidRequest = undefined;
    isLoading.value = false;
  }
}

async function startPlayback() {
  const attempt = ++playbackAttempt;
  try {
    const source = props.mode === "android"
      ? await resolveAndroidVideo()
      : resolvedVideoSource.value;
    if (!source || isUnmounted)
      throw new Error("缺少 Live Photo 视频地址");

    isVideoVisible.value = true;
    await nextTick();
    if (!video.value)
      throw new Error("Live Photo 视频元素不可用");
    await video.value.play();
  }
  catch {
    if (attempt !== playbackAttempt || isUnmounted)
      return;
    stopVideo();
    isVideoVisible.value = false;
    if (props.mode === "android")
      releaseAndroidVideo();
  }
}

function handleEnded() {
  playbackAttempt += 1;
  stopVideo();
  isVideoVisible.value = false;
}

function stopPlayback() {
  playbackAttempt += 1;
  stopVideo();
  isVideoVisible.value = false;
}

onBeforeUnmount(() => {
  isUnmounted = true;
  playbackAttempt += 1;
  stopVideo();
  releaseAndroidVideo();
});
</script>

<template>
  <figure
    class="not-prose relative my-8 w-full overflow-hidden rounded-md bg-muted"
    :data-live-photo-mode="props.mode ?? 'video'"
  >
    <template v-if="isVideoVisible">
      <video
        ref="video"
        class="block h-auto w-full object-contain"
        :src="resolvedVideoSource"
        :poster="props.poster"
        playsinline
        preload="metadata"
        @ended="handleEnded"
      />
      <button
        class="absolute top-2.5 left-2.5 inline-flex h-control w-live-control items-center justify-center gap-1 rounded-sm bg-popover/90 px-1 text-live font-bold tracking-live text-popover-foreground shadow-sm backdrop-blur-xs focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        type="button"
        aria-label="停止 Live Photo"
        @click="stopPlayback"
      >
        <img
          class="size-7.5 shrink-0 animate-live-photo"
          src="/icons/live-photo.svg"
          alt=""
          aria-hidden="true"
          data-live-photo-mark
        >
        <span>LIVE</span>
      </button>
    </template>
    <template v-else>
      <img
        class="block h-auto w-full cursor-zoom-in object-cover focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
        :src="props.poster"
        :alt="props.alt"
        :aria-label="`预览图片：${props.alt}`"
        data-photo-preview
        :data-photo-preview-live-mode="props.mode ?? 'video'"
        :data-photo-preview-live-video="props.video"
        :data-photo-preview-live-android-source="props.androidSource ?? props.poster"
        loading="lazy"
        decoding="async"
        role="button"
        tabindex="0"
      >
      <button
        class="absolute top-2.5 left-2.5 inline-flex h-control w-live-control items-center justify-center gap-1 rounded-sm bg-popover/90 px-1 text-live font-bold tracking-live text-popover-foreground shadow-sm backdrop-blur-xs focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:cursor-wait"
        type="button"
        :aria-label="isLoading ? `正在载入 Live Photo：${props.alt}` : `播放 Live Photo：${props.alt}`"
        :aria-busy="isLoading"
        :disabled="isLoading"
        @click="startPlayback"
      >
        <img
          v-if="isLoading"
          class="size-7.5 shrink-0 animate-live-photo"
          src="/icons/live-photo.svg"
          alt=""
          aria-hidden="true"
          data-live-photo-mark
          data-live-photo-loading
        >
        <img
          v-else
          class="size-7.5 shrink-0"
          src="/icons/live-photo.svg"
          alt=""
          aria-hidden="true"
          data-live-photo-mark
        >
        <span>LIVE</span>
      </button>
    </template>
  </figure>
</template>
