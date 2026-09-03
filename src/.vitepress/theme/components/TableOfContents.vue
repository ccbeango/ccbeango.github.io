<script setup lang="ts">
import type { DefaultTheme } from "vitepress/theme";
import { List } from "@lucide/vue";
import { onContentUpdated, useRoute } from "vitepress";
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from "vue";
import { getHeaders, useActiveAnchor } from "../vitepress-default-theme";

const headers = ref<DefaultTheme.OutlineItem[]>([]);
const outline = ref<HTMLDetailsElement>();
const trigger = ref<HTMLElement>();
const container = ref<HTMLElement>();
const marker = ref<HTMLElement>();
const route = useRoute();
const hashSyncTick = ref(0);
const outlineItems = computed(() => headers.value.flatMap(header => [
  header,
  ...(header.children ?? []),
]));
let hashSyncPending = false;
let hashSyncTimer: number | undefined;
let wideViewport: MediaQueryList | undefined;

useActiveAnchor(container, marker);

function syncActiveHash() {
  hashSyncPending = false;
  if (hashSyncTimer !== undefined)
    window.clearTimeout(hashSyncTimer);
  if (!route.hash)
    return;
  hashSyncTick.value += 1;
}

function armHashSync() {
  hashSyncPending = Boolean(route.hash);
  if (!hashSyncPending)
    return;
  if (hashSyncTimer !== undefined)
    window.clearTimeout(hashSyncTimer);
  hashSyncTimer = window.setTimeout(syncActiveHash, 250);
}

function syncAfterAnchorScroll() {
  if (!hashSyncPending)
    return;
  if (hashSyncTimer !== undefined)
    window.clearTimeout(hashSyncTimer);
  hashSyncTimer = window.setTimeout(syncActiveHash, 140);
}

function isHashTargetVisible() {
  if (!route.hash)
    return false;
  const target = document.getElementById(route.hash.slice(1));
  if (!target)
    return false;
  const bounds = target.getBoundingClientRect();
  return bounds.bottom > 0 && bounds.top < window.innerHeight;
}

function syncAfterFontLoad() {
  if (isHashTargetVisible())
    armHashSync();
}

function syncOutlineMode(event: MediaQueryList | MediaQueryListEvent) {
  if (outline.value)
    outline.value.open = event.matches;
}

function closeNarrowOutline(restoreFocus = false) {
  if (wideViewport?.matches || !outline.value?.open)
    return;
  outline.value.open = false;
  if (restoreFocus)
    window.requestAnimationFrame(() => trigger.value?.focus());
}

function handleDocumentPointerDown(event: PointerEvent) {
  if (outline.value?.open && !outline.value.contains(event.target as Node))
    closeNarrowOutline();
}

function handleDocumentKeydown(event: KeyboardEvent) {
  if (event.key === "Escape")
    closeNarrowOutline(true);
}

function handleOutlineToggle() {
  if (outline.value?.open && !wideViewport?.matches)
    window.requestAnimationFrame(() => window.dispatchEvent(new Event("scroll")));
}

function handleOutlineClick(event: MouseEvent) {
  if ((event.target as Element).closest("a.outline-link"))
    closeNarrowOutline();
}

watch(() => route.hash, () => {
  armHashSync();
  closeNarrowOutline();
}, { flush: "sync" });
watch(() => route.path, () => closeNarrowOutline());

onMounted(() => {
  wideViewport = window.matchMedia("(min-width: 80rem)");
  syncOutlineMode(wideViewport);
  wideViewport.addEventListener("change", syncOutlineMode);
  window.addEventListener("scroll", syncAfterAnchorScroll);
  document.addEventListener("pointerdown", handleDocumentPointerDown);
  document.addEventListener("keydown", handleDocumentKeydown);
  document.fonts.addEventListener("loadingdone", syncAfterFontLoad);
  armHashSync();
  void document.fonts.ready.then(syncAfterFontLoad);
});

onUnmounted(() => {
  wideViewport?.removeEventListener("change", syncOutlineMode);
  window.removeEventListener("scroll", syncAfterAnchorScroll);
  document.removeEventListener("pointerdown", handleDocumentPointerDown);
  document.removeEventListener("keydown", handleDocumentKeydown);
  document.fonts.removeEventListener("loadingdone", syncAfterFontLoad);
  if (hashSyncTimer !== undefined)
    window.clearTimeout(hashSyncTimer);
});

onContentUpdated(async () => {
  closeNarrowOutline();
  await nextTick();
  headers.value = getHeaders([2, 3]);
  await nextTick();
  armHashSync();
});
</script>

<template>
  <aside
    :class="headers.length ? 'sticky top-0 z-navigation h-0 xl:top-side-rail-top xl:col-start-3 xl:row-start-1 xl:mt-12 xl:h-auto xl:w-44 xl:self-start' : 'hidden'"
    aria-label="文章目录"
  >
    <details
      ref="outline"
      class="relative h-0 xl:h-auto"
      @toggle="handleOutlineToggle"
    >
      <summary
        ref="trigger"
        class="absolute top-2 right-0 flex size-control cursor-pointer list-none items-center justify-center rounded-md bg-popover/90 text-popover-foreground backdrop-blur-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-2 focus-visible:outline-ring xl:hidden [&::-webkit-details-marker]:hidden"
        title="本文目录"
      >
        <span class="sr-only">本文目录</span>
        <List
          :size="20"
          aria-hidden="true"
        />
      </summary>
      <div
        class="absolute top-14 right-0 left-0 max-h-[calc(100vh-var(--spacing-header))] overflow-y-auto rounded-md border border-border bg-popover p-4 text-popover-foreground shadow-md sm:right-0 sm:left-auto sm:w-80 xl:static xl:max-h-[calc(100vh-var(--spacing-side-rail-viewport))] xl:w-auto xl:overflow-y-auto xl:border-0 xl:bg-transparent xl:p-0 xl:shadow-none"
      >
        <p class="hidden items-center gap-2 text-xs font-medium text-muted-foreground xl:flex">
          <List
            :size="15"
            aria-hidden="true"
          /> 本文目录
        </p>
        <nav
          ref="container"
          :data-hash-sync="hashSyncTick"
          class="relative pl-2 text-sm xl:mt-3 [&_.outline-link.active]:font-medium [&_.outline-link.active]:text-primary"
          aria-label="本文目录"
          @click="handleOutlineClick"
        >
          <div
            ref="marker"
            class="absolute top-8.25 -left-px -mt-8 h-4.5 w-0.5 rounded-sm bg-primary opacity-0 transition-[top,opacity]"
            aria-hidden="true"
          />
          <ol class="space-y-1">
            <li
              v-for="header in outlineItems"
              :key="header.link"
              :class="header.level === 3 ? 'pl-3' : ''"
            >
              <a
                class="outline-link block rounded-sm px-1.5 py-1 leading-5 text-muted-foreground transition-colors hover:text-primary focus-visible:outline-2 focus-visible:outline-ring"
                :href="header.link"
                :title="header.title"
              >{{ header.title }}</a>
            </li>
          </ol>
        </nav>
      </div>
    </details>
  </aside>
</template>
