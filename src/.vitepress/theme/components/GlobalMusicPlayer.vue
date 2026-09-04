<script setup lang="ts">
import { LoaderCircle, Pause, Play, X } from "@lucide/vue";
import { onBeforeUnmount, onMounted, ref } from "vue";
import {
  closeMusicPlayer,
  currentMusicTrack,
  handleMusicCanPlay,
  handleMusicEnded,
  handleMusicError,
  handleMusicLoadedMetadata,
  handleMusicPause,
  handleMusicPlay,
  handleMusicTimeUpdate,
  handleMusicWaiting,
  musicHasError,
  musicIsLoading,
  musicIsPlaying,
  registerMusicAudio,
  toggleMusicPlayback,
  unregisterMusicAudio,
} from "../music-player";

const VIEWPORT_GAP = 12;
const CLOSE_BUTTON_OUTSET = 8;
const KEYBOARD_STEP = 16;

const audioElement = ref<HTMLAudioElement>();
const playerElement = ref<HTMLElement>();
let dragState: { pointerId: number; offsetX: number; offsetY: number } | undefined;
let hasCustomPosition = false;

function positionPlayer(left: number, top: number) {
  const player = playerElement.value;
  if (!player) return;

  const bounds = player.getBoundingClientRect();
  player.style.right = "auto";
  player.style.bottom = "auto";

  const maxLeft = Math.max(
    VIEWPORT_GAP,
    window.innerWidth - bounds.width - VIEWPORT_GAP - CLOSE_BUTTON_OUTSET,
  );
  const maxTop = Math.max(VIEWPORT_GAP, window.innerHeight - bounds.height - VIEWPORT_GAP);
  player.style.left = `${Math.min(Math.max(left, VIEWPORT_GAP), maxLeft)}px`;
  player.style.top = `${Math.min(Math.max(top, VIEWPORT_GAP), maxTop)}px`;
  hasCustomPosition = true;
}

function handlePointerDown(event: PointerEvent) {
  if (event.pointerType === "mouse" && event.button !== 0) return;
  if (event.target instanceof Element && event.target.closest("button")) return;
  const player = playerElement.value;
  if (!player) return;
  const bounds = player.getBoundingClientRect();
  dragState = {
    pointerId: event.pointerId,
    offsetX: event.clientX - bounds.left,
    offsetY: event.clientY - bounds.top,
  };
  (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
  event.preventDefault();
}

function handlePointerMove(event: PointerEvent) {
  if (!dragState || dragState.pointerId !== event.pointerId) return;
  positionPlayer(event.clientX - dragState.offsetX, event.clientY - dragState.offsetY);
}

function handlePointerUp(event: PointerEvent) {
  if (!dragState || dragState.pointerId !== event.pointerId) return;
  const handle = event.currentTarget as HTMLElement;
  if (handle.hasPointerCapture(event.pointerId)) handle.releasePointerCapture(event.pointerId);
  dragState = undefined;
}

function handleDragKeydown(event: KeyboardEvent) {
  const offsets: Record<string, [number, number]> = {
    ArrowUp: [0, -KEYBOARD_STEP],
    ArrowRight: [KEYBOARD_STEP, 0],
    ArrowDown: [0, KEYBOARD_STEP],
    ArrowLeft: [-KEYBOARD_STEP, 0],
  };
  const offset = offsets[event.key];
  const player = playerElement.value;
  if (!offset || !player) return;
  event.preventDefault();
  const bounds = player.getBoundingClientRect();
  positionPlayer(bounds.left + offset[0], bounds.top + offset[1]);
}

function handleResize() {
  const player = playerElement.value;
  if (!player || !hasCustomPosition) return;
  const bounds = player.getBoundingClientRect();
  positionPlayer(bounds.left, bounds.top);
}

onMounted(() => {
  if (audioElement.value) registerMusicAudio(audioElement.value);
  window.addEventListener("resize", handleResize);
});

onBeforeUnmount(() => {
  if (audioElement.value) unregisterMusicAudio(audioElement.value);
  window.removeEventListener("resize", handleResize);
});
</script>

<template>
  <audio
    ref="audioElement"
    class="hidden"
    preload="metadata"
    data-music-audio
    @loadedmetadata="handleMusicLoadedMetadata"
    @timeupdate="handleMusicTimeUpdate"
    @play="handleMusicPlay"
    @pause="handleMusicPause"
    @waiting="handleMusicWaiting"
    @canplay="handleMusicCanPlay"
    @ended="handleMusicEnded"
    @error="handleMusicError"
  />

  <aside
    v-if="currentMusicTrack"
    ref="playerElement"
    class="group fixed top-3 left-3 z-player size-20 cursor-grab touch-none rounded-lg text-popover-foreground select-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring active:cursor-grabbing sm:top-6 sm:left-6"
    tabindex="0"
    :aria-label="`全局音乐播放器：《${currentMusicTrack.title}》。拖动播放器或使用方向键移动`"
    :title="`${currentMusicTrack.title} - ${currentMusicTrack.artist}`"
    :data-playing="musicIsPlaying"
    data-global-music-player
    @pointerdown="handlePointerDown"
    @pointermove="handlePointerMove"
    @pointerup="handlePointerUp"
    @pointercancel="handlePointerUp"
    @keydown.self="handleDragKeydown"
  >
    <div class="absolute inset-0 overflow-hidden rounded-lg border border-border bg-popover shadow-lg">
      <img
        v-if="currentMusicTrack.cover"
        class="pointer-events-none absolute inset-0 size-full scale-125 object-cover opacity-80 blur-xs saturate-125"
        :src="currentMusicTrack.cover"
        alt=""
        draggable="false"
        aria-hidden="true"
      />
      <div class="pointer-events-none absolute inset-0 bg-linear-to-b from-overlay/5 via-overlay/20 to-overlay/75" />
      <div
        class="pointer-events-none absolute inset-0 bg-linear-to-br from-overlay-foreground/20 via-transparent to-overlay/20"
      />

      <div class="relative flex size-full items-center justify-center">
        <div
          class="relative size-18 animate-music-record rounded-full bg-code-background shadow-md music-record-paused group-data-[playing=true]:music-record-running motion-reduce:animate-none"
          data-music-record
        >
          <span class="absolute inset-1 rounded-full border border-code-border/70" />
          <span class="absolute inset-2 rounded-full border border-code-muted-foreground/25" />
          <span class="absolute inset-3 rounded-full border border-code-border/60" />

          <div
            class="absolute inset-0 m-auto size-11 overflow-hidden rounded-full border border-code-border bg-code-card"
          >
            <img
              v-if="currentMusicTrack.cover"
              class="pointer-events-none size-full object-cover"
              :src="currentMusicTrack.cover"
              :alt="currentMusicTrack.coverAlt"
              draggable="false"
            />
          </div>
        </div>

        <button
          class="absolute inset-0 z-10 m-auto inline-flex size-8 items-center justify-center rounded-full text-overlay-foreground/80 transition-colors hover:text-overlay-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:cursor-wait"
          type="button"
          :aria-label="musicIsPlaying ? `暂停《${currentMusicTrack.title}》` : `播放《${currentMusicTrack.title}》`"
          :aria-pressed="musicIsPlaying"
          :disabled="musicIsLoading"
          @click="toggleMusicPlayback"
        >
          <LoaderCircle
            v-if="musicIsLoading"
            class="size-5 animate-spinner"
            aria-hidden="true"
          />
          <Pause
            v-else-if="musicIsPlaying"
            class="size-5 fill-current opacity-100 transition-opacity [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-focus-within:opacity-100 [@media(hover:hover)]:group-hover:opacity-100"
            data-music-pause-icon
            aria-hidden="true"
          />
          <Play
            v-else
            class="size-5 fill-current"
            aria-hidden="true"
          />
        </button>
      </div>
    </div>

    <button
      class="group/close absolute -top-3 -right-3 z-20 inline-flex size-6 items-center justify-center rounded-full text-muted-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      type="button"
      aria-label="关闭音乐播放器"
      @click="closeMusicPlayer"
    >
      <span
        class="inline-flex size-4 items-center justify-center rounded-full border border-border bg-popover shadow-sm transition-colors group-hover/close:bg-accent group-hover/close:text-accent-foreground"
        data-music-close-indicator
      >
        <X
          class="size-3"
          aria-hidden="true"
        />
      </span>
    </button>

    <p
      v-if="musicHasError"
      class="sr-only"
      role="status"
    >
      音频无法播放，请检查远程地址或服务器访问策略。
    </p>
  </aside>
</template>
