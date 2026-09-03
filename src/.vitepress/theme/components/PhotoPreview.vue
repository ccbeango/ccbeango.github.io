<script setup lang="ts">
import type { PhotoMetadata } from "../../lib/photo-metadata";
import { Camera, Info, LoaderCircle, Minimize2, X } from "@lucide/vue";
import { onContentUpdated } from "vitepress";
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from "vue";
import { locateAndroidMotionPhoto } from "../../lib/android-motion-photo";
import { loadPhotoMetadata } from "../../lib/photo-metadata";

interface PreviewLivePhoto {
  mode: "android" | "video";
  video?: string;
  androidSource?: string;
}

interface PreviewPhoto {
  source: string;
  alt: string;
  width?: number;
  height?: number;
  livePhoto?: PreviewLivePhoto;
}

type MetadataState = "idle" | "loading" | "ready" | "error";

const dialog = ref<HTMLDialogElement>();
const photoStage = ref<HTMLElement>();
const previewImage = ref<HTMLImageElement>();
const previewVideo = ref<HTMLVideoElement>();
const previewLiveControl = ref<HTMLButtonElement>();
const isMounted = ref(false);
const photo = ref<PreviewPhoto>();
const showInspector = ref(false);
const metadata = ref<PhotoMetadata>();
const metadataState = ref<MetadataState>("idle");
const zoomLevel = ref(1);
const isDragging = ref(false);
const isPreviewLiveLoading = ref(false);
const isPreviewVideoVisible = ref(false);
const previewLiveVideoSource = ref("");
let trigger: HTMLImageElement | undefined;
let documentWasLocked = false;
let panX = 0;
let panY = 0;
let dragStart: { pointerId: number; x: number; y: number; panX: number; panY: number } | undefined;
let previewAndroidBlobUrl: string | undefined;
let previewAndroidRequest: Promise<string> | undefined;
let previewPlaybackAttempt = 0;
let previewMediaObserver: ResizeObserver | undefined;

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(maximum, Math.max(minimum, value));
}

function activeMedia() {
  return isPreviewVideoVisible.value ? previewVideo.value : previewImage.value;
}

function positionLiveControl() {
  const stage = photoStage.value;
  const media = activeMedia();
  const control = previewLiveControl.value;
  if (!stage || !media || !control)
    return;

  const stageBounds = stage.getBoundingClientRect();
  const mediaBounds = media.getBoundingClientRect();
  control.style.left = `${mediaBounds.left - stageBounds.left + 10}px`;
  control.style.top = `${mediaBounds.top - stageBounds.top + 10}px`;
  control.classList.replace("opacity-0", "opacity-100");
}

function scheduleLiveControlPosition() {
  void nextTick(() => requestAnimationFrame(positionLiveControl));
}

function observeActiveMedia() {
  previewMediaObserver?.disconnect();
  const media = activeMedia();
  if (!media)
    return;
  previewMediaObserver ??= new ResizeObserver(() => scheduleLiveControlPosition());
  previewMediaObserver.observe(media);
  scheduleLiveControlPosition();
}

function handlePreviewMediaResize() {
  applyTransform();
  scheduleLiveControlPosition();
}

function clampPan() {
  const stage = photoStage.value;
  const media = activeMedia();
  if (!stage || !media)
    return;
  const maxX = Math.max(0, (media.offsetWidth * zoomLevel.value - stage.clientWidth) / 2);
  const maxY = Math.max(0, (media.offsetHeight * zoomLevel.value - stage.clientHeight) / 2);
  panX = clamp(panX, -maxX, maxX);
  panY = clamp(panY, -maxY, maxY);
}

function applyTransform(transition = "") {
  const media = activeMedia();
  if (!media)
    return;
  if (zoomLevel.value === 1 && panX === 0 && panY === 0) {
    media.style.removeProperty("transform");
    media.style.removeProperty("transition");
    positionLiveControl();
    return;
  }
  media.style.transition = transition;
  media.style.transform = `translate3d(${panX}px, ${panY}px, 0) scale(${zoomLevel.value})`;
  positionLiveControl();
}

function resetZoom() {
  zoomLevel.value = 1;
  panX = 0;
  panY = 0;
  dragStart = undefined;
  isDragging.value = false;
  applyTransform();
}

function handleWheel(event: WheelEvent) {
  const stage = photoStage.value;
  if (!stage || !activeMedia())
    return;
  const bounds = stage.getBoundingClientRect();
  const delta = event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? bounds.height : 1);
  const nextZoom = clamp(zoomLevel.value * Math.exp(-delta * 0.0015), 1, 5);
  if (nextZoom === zoomLevel.value)
    return;
  const pointerX = event.clientX - bounds.left - bounds.width / 2;
  const pointerY = event.clientY - bounds.top - bounds.height / 2;
  const ratio = nextZoom / zoomLevel.value;
  panX = pointerX - (pointerX - panX) * ratio;
  panY = pointerY - (pointerY - panY) * ratio;
  zoomLevel.value = nextZoom < 1.01 ? 1 : nextZoom;
  if (zoomLevel.value === 1) {
    panX = 0;
    panY = 0;
  }
  clampPan();
  applyTransform("transform 90ms ease-out");
}

function handlePointerDown(event: PointerEvent) {
  if (event.pointerType !== "mouse" || event.button !== 0 || zoomLevel.value <= 1)
    return;
  const stage = photoStage.value;
  if (!stage)
    return;
  dragStart = { pointerId: event.pointerId, x: event.clientX, y: event.clientY, panX, panY };
  isDragging.value = true;
  stage.setPointerCapture(event.pointerId);
  event.preventDefault();
}

function handlePointerMove(event: PointerEvent) {
  if (!dragStart || event.pointerId !== dragStart.pointerId)
    return;
  panX = dragStart.panX + event.clientX - dragStart.x;
  panY = dragStart.panY + event.clientY - dragStart.y;
  clampPan();
  applyTransform();
}

function finishDrag(event: PointerEvent) {
  const stage = photoStage.value;
  if (!dragStart || event.pointerId !== dragStart.pointerId || !stage)
    return;
  if (stage.hasPointerCapture(event.pointerId))
    stage.releasePointerCapture(event.pointerId);
  dragStart = undefined;
  isDragging.value = false;
}

const metadataRows = computed(() => {
  const current = metadata.value;
  if (!current)
    return [];
  const rows: Array<{ label: string; value: string }> = [];
  const add = (label: string, value: string | undefined) => {
    if (value)
      rows.push({ label, value });
  };
  add("文件", current.fileName);
  add("尺寸", current.dimensions);
  add("像素", current.megapixels);
  add("拍摄时间", current.capturedAt);
  add("相机", current.camera);
  add("镜头", current.lens);
  add("焦距", current.focalLength);
  add("等效焦距", current.equivalentFocalLength);
  add("光圈", current.aperture);
  add("快门", current.exposureTime);
  add("ISO", current.iso);
  add("曝光补偿", current.exposureBias);
  return rows;
});

function imageFromEvent(event: Event) {
  const target = event.target;
  if (!(target instanceof Element))
    return;
  return target.closest<HTMLImageElement>("img[data-photo-preview]") ?? undefined;
}

async function openPhoto(image: HTMLImageElement) {
  const currentDialog = dialog.value;
  if (!currentDialog)
    return;
  trigger = image;
  photo.value = {
    source: image.currentSrc || image.src,
    alt: image.alt || "照片",
    width: image.naturalWidth || undefined,
    height: image.naturalHeight || undefined,
    livePhoto: image.dataset.photoPreviewLiveMode
      ? {
          mode: image.dataset.photoPreviewLiveMode === "android" ? "android" : "video",
          video: image.dataset.photoPreviewLiveVideo || undefined,
          androidSource: image.dataset.photoPreviewLiveAndroidSource || undefined,
        }
      : undefined,
  };
  isPreviewVideoVisible.value = false;
  previewLiveVideoSource.value = photo.value.livePhoto?.video ?? "";
  showInspector.value = false;
  metadata.value = undefined;
  metadataState.value = "idle";
  resetZoom();
  documentWasLocked = document.documentElement.classList.contains("overflow-hidden");
  document.documentElement.classList.add("overflow-hidden");
  if (!currentDialog.open)
    currentDialog.showModal();
  await nextTick();
  observeActiveMedia();
}

function handleDocumentClick(event: MouseEvent) {
  const image = imageFromEvent(event);
  if (!image || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey)
    return;
  event.preventDefault();
  event.stopPropagation();
  void openPhoto(image);
}

function handleDocumentKeydown(event: KeyboardEvent) {
  if (event.key !== "Enter" && event.key !== " ")
    return;
  const image = imageFromEvent(event);
  if (!image || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey)
    return;
  event.preventDefault();
  event.stopPropagation();
  void openPhoto(image);
}

function restoreDocument() {
  if (!documentWasLocked)
    document.documentElement.classList.remove("overflow-hidden");
  documentWasLocked = false;
}

function stopPreviewVideo() {
  if (!previewVideo.value)
    return;
  previewVideo.value.pause();
  previewVideo.value.currentTime = 0;
}

function releasePreviewAndroidVideo() {
  if (!previewAndroidBlobUrl)
    return;
  URL.revokeObjectURL(previewAndroidBlobUrl);
  previewAndroidBlobUrl = undefined;
  previewLiveVideoSource.value = photo.value?.livePhoto?.video ?? "";
}

async function resolvePreviewAndroidVideo(current: PreviewPhoto) {
  if (previewLiveVideoSource.value)
    return previewLiveVideoSource.value;
  if (previewAndroidRequest)
    return previewAndroidRequest;

  const source = current.livePhoto?.androidSource ?? current.source;
  isPreviewLiveLoading.value = true;
  previewAndroidRequest = (async () => {
    const response = await fetch(source);
    if (!response.ok)
      throw new Error(`Motion Photo 请求失败：${response.status}`);

    const buffer = await response.arrayBuffer();
    const location = locateAndroidMotionPhoto(buffer);
    if (!location)
      throw new Error("未找到 Motion Photo 视频数据");

    const content = new Uint8Array(buffer, location.offset, location.length);
    const objectUrl = URL.createObjectURL(new Blob([content], { type: "video/mp4" }));
    if (photo.value !== current) {
      URL.revokeObjectURL(objectUrl);
      throw new Error("照片预览已关闭");
    }

    previewAndroidBlobUrl = objectUrl;
    previewLiveVideoSource.value = objectUrl;
    return objectUrl;
  })();

  try {
    return await previewAndroidRequest;
  }
  finally {
    previewAndroidRequest = undefined;
    isPreviewLiveLoading.value = false;
  }
}

async function startPreviewPlayback() {
  const current = photo.value;
  const livePhoto = current?.livePhoto;
  if (!current || !livePhoto)
    return;

  const attempt = ++previewPlaybackAttempt;
  try {
    const source = livePhoto.mode === "android"
      ? await resolvePreviewAndroidVideo(current)
      : previewLiveVideoSource.value;
    if (!source || photo.value !== current)
      throw new Error("缺少 Live Photo 视频地址");

    isPreviewVideoVisible.value = true;
    await nextTick();
    if (!previewVideo.value)
      throw new Error("Live Photo 视频元素不可用");
    observeActiveMedia();
    applyTransform();
    await previewVideo.value.play();
  }
  catch {
    if (attempt !== previewPlaybackAttempt || photo.value !== current)
      return;
    stopPreviewVideo();
    isPreviewVideoVisible.value = false;
    if (livePhoto.mode === "android")
      releasePreviewAndroidVideo();
  }
}

function stopPreviewPlayback() {
  previewPlaybackAttempt += 1;
  stopPreviewVideo();
  isPreviewVideoVisible.value = false;
  void nextTick(() => {
    observeActiveMedia();
    applyTransform();
  });
}

function handlePreviewVideoEnded() {
  stopPreviewPlayback();
}

function handleClose() {
  const previousTrigger = trigger;
  trigger = undefined;
  previewPlaybackAttempt += 1;
  previewMediaObserver?.disconnect();
  stopPreviewVideo();
  isPreviewVideoVisible.value = false;
  isPreviewLiveLoading.value = false;
  releasePreviewAndroidVideo();
  showInspector.value = false;
  metadata.value = undefined;
  metadataState.value = "idle";
  resetZoom();
  photo.value = undefined;
  restoreDocument();
  void nextTick(() => {
    if (previousTrigger?.isConnected)
      previousTrigger.focus();
  });
}

function closePreview() {
  if (dialog.value?.open)
    dialog.value.close();
}

function handleBackdropClick(event: MouseEvent) {
  if (event.target === dialog.value)
    closePreview();
}

async function loadInspectorMetadata() {
  const current = photo.value;
  if (!current || metadataState.value !== "idle")
    return;
  metadataState.value = "loading";
  try {
    const result = await loadPhotoMetadata({
      source: current.source,
      width: current.width,
      height: current.height,
    });
    if (photo.value?.source !== current.source)
      return;
    metadata.value = result;
    metadataState.value = "ready";
  }
  catch {
    if (photo.value?.source === current.source)
      metadataState.value = "error";
  }
}

function toggleInspector() {
  showInspector.value = !showInspector.value;
  scheduleLiveControlPosition();
  if (showInspector.value)
    void loadInspectorMetadata();
}

onMounted(() => {
  isMounted.value = true;
  document.addEventListener("click", handleDocumentClick, true);
  document.addEventListener("keydown", handleDocumentKeydown, true);
});

onContentUpdated(closePreview);

onBeforeUnmount(() => {
  document.removeEventListener("click", handleDocumentClick, true);
  document.removeEventListener("keydown", handleDocumentKeydown, true);
  trigger = undefined;
  previewPlaybackAttempt += 1;
  previewMediaObserver?.disconnect();
  stopPreviewVideo();
  releasePreviewAndroidVideo();
  restoreDocument();
});
</script>

<template>
  <Teleport
    v-if="isMounted"
    to="body"
  >
    <dialog
      ref="dialog"
      class="fixed inset-0 m-0 h-dvh max-h-none w-screen max-w-none border-0 bg-overlay p-0 text-overlay-foreground backdrop:bg-transparent"
      aria-label="照片预览"
      @click="handleBackdropClick"
      @close="handleClose"
    >
      <div
        v-if="photo"
        class="grid h-dvh min-h-0 w-full grid-rows-[minmax(0,1fr)] data-[inspector=true]:grid-rows-[minmax(0,1fr)_minmax(12rem,40dvh)] lg:data-[inspector=true]:grid-cols-[minmax(0,1fr)_var(--container-photo-inspector)] lg:data-[inspector=true]:grid-rows-1"
        :data-inspector="showInspector"
      >
        <div
          class="absolute top-3 right-3 z-control flex items-center gap-0.5"
          data-photo-preview-toolbar
        >
          <button
            v-if="zoomLevel > 1"
            class="inline-flex size-control-sm items-center justify-center rounded-md text-overlay-foreground/70 hover:text-overlay-foreground focus-visible:outline-2 focus-visible:outline-ring"
            type="button"
            aria-label="重置照片缩放"
            title="重置缩放"
            @click="resetZoom"
          >
            <Minimize2
              :size="19"
              aria-hidden="true"
            />
          </button>
          <button
            class="inline-flex size-control-sm items-center justify-center rounded-md text-overlay-foreground/70 hover:text-overlay-foreground focus-visible:outline-2 focus-visible:outline-ring"
            type="button"
            :aria-label="showInspector ? '隐藏拍摄信息' : '显示拍摄信息'"
            :title="showInspector ? '隐藏拍摄信息' : '显示拍摄信息'"
            :aria-pressed="showInspector"
            @click="toggleInspector"
          >
            <span
              class="relative size-4.75"
              aria-hidden="true"
              data-photo-inspector-icon
            >
              <Info
                v-if="showInspector"
                class="absolute inset-0 size-4.75 fill-primary text-primary"
                data-photo-inspector-icon-fill
              />
              <Info
                class="absolute inset-0 size-4.75"
                :class="showInspector ? 'text-primary-foreground' : 'text-overlay-foreground/70'"
              />
            </span>
          </button>
          <button
            class="inline-flex size-control-sm items-center justify-center rounded-md text-overlay-foreground/70 hover:text-overlay-foreground focus-visible:outline-2 focus-visible:outline-ring"
            type="button"
            aria-label="关闭照片预览"
            title="关闭"
            @click="closePreview"
          >
            <X
              :size="19"
              aria-hidden="true"
            />
          </button>
        </div>
        <div
          ref="photoStage"
          class="relative flex min-h-0 touch-pan-y items-center justify-center overflow-hidden p-4 pt-18 sm:p-8 sm:pt-20 lg:p-12"
          data-photo-preview-stage
          @dblclick="resetZoom"
          @pointercancel="finishDrag"
          @pointerdown="handlePointerDown"
          @pointermove="handlePointerMove"
          @pointerup="finishDrag"
          @wheel.prevent="handleWheel"
        >
          <video
            v-if="isPreviewVideoVisible"
            ref="previewVideo"
            class="block max-h-full max-w-full origin-center object-contain will-change-transform"
            :class="isDragging ? 'cursor-grabbing' : zoomLevel > 1 ? 'cursor-grab' : 'cursor-zoom-in'"
            :src="previewLiveVideoSource"
            :poster="photo.source"
            playsinline
            preload="metadata"
            @ended="handlePreviewVideoEnded"
            @loadedmetadata="handlePreviewMediaResize"
            @resize="handlePreviewMediaResize"
          />
          <img
            v-else
            ref="previewImage"
            class="block max-h-full max-w-full origin-center object-contain will-change-transform"
            :class="isDragging ? 'cursor-grabbing' : zoomLevel > 1 ? 'cursor-grab' : 'cursor-zoom-in'"
            :src="photo.source"
            :alt="photo.alt"
            @load="() => applyTransform()"
          >
          <button
            v-if="photo.livePhoto"
            ref="previewLiveControl"
            class="absolute z-control inline-flex h-control w-live-control items-center justify-center gap-1 rounded-sm bg-popover/90 px-1 text-live font-bold tracking-live text-popover-foreground opacity-0 shadow-sm backdrop-blur-xs focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:cursor-wait"
            type="button"
            :aria-label="
              isPreviewVideoVisible
                ? '停止 Live Photo'
                : isPreviewLiveLoading
                  ? `正在载入 Live Photo：${photo.alt}`
                  : `播放 Live Photo：${photo.alt}`
            "
            :aria-busy="isPreviewLiveLoading"
            :disabled="isPreviewLiveLoading"
            @click="isPreviewVideoVisible ? stopPreviewPlayback() : startPreviewPlayback()"
          >
            <img
              class="size-7.5 shrink-0"
              :class="isPreviewVideoVisible || isPreviewLiveLoading ? 'animate-live-photo' : ''"
              src="/icons/live-photo.svg"
              alt=""
              aria-hidden="true"
              data-live-photo-mark
            >
            <span>LIVE</span>
          </button>
        </div>

        <aside
          v-if="showInspector"
          class="min-h-0 overflow-y-auto border-t border-overlay-foreground/20 bg-overlay px-6 pt-7 pb-8 text-overlay-foreground backdrop-blur-sm lg:border-t-0 lg:border-l lg:px-7 lg:pt-20"
          aria-label="照片拍摄信息"
          data-photo-preview-inspector
        >
          <div class="flex items-center gap-2">
            <Camera
              class="size-4.5 text-overlay-foreground/70"
              aria-hidden="true"
            />
            <h2 class="m-0 text-base font-medium">
              照片信息
            </h2>
          </div>

          <div
            v-if="metadataState === 'loading'"
            class="mt-8 flex items-center gap-2 text-sm text-overlay-foreground/70"
            role="status"
          >
            <LoaderCircle
              class="size-4 animate-spinner"
              aria-hidden="true"
            />
            正在读取拍摄参数
          </div>
          <div
            v-else-if="metadataState === 'error'"
            class="mt-8 text-sm leading-6 text-overlay-foreground/70"
            role="status"
          >
            没有可读取的拍摄参数
          </div>
          <template v-else-if="metadataState === 'ready' && metadata">
            <p
              v-if="!metadata.hasShootingData"
              class="mt-6 text-sm leading-6 text-overlay-foreground/70"
            >
              没有可读取的拍摄参数
            </p>
            <dl class="mt-6 grid grid-cols-[5rem_minmax(0,1fr)] gap-x-4 gap-y-4 text-sm leading-5">
              <template
                v-for="row in metadataRows"
                :key="row.label"
              >
                <dt class="text-overlay-foreground/60">
                  {{ row.label }}
                </dt>
                <dd class="m-0 min-w-0 wrap-break-word text-overlay-foreground">
                  {{ row.value }}
                </dd>
              </template>
            </dl>
          </template>
        </aside>
      </div>
    </dialog>
  </Teleport>
</template>
