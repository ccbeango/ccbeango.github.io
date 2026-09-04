<script setup lang="ts">
/* eslint-disable vue/no-v-html -- Dynamic HTML is rendered at build time from repository-owned Markdown. */
import type { MomentData, MomentRichMedia } from "../../data/moment-types";
import { Pin } from "@lucide/vue";
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { formatMomentDateTime, formatMomentTime } from "../../data/moment-utils";
import { formatDate } from "../../data/post-utils";
import MomentActions from "./MomentActions.vue";
import MomentGallery from "./MomentGallery.vue";
import LinkedCard from "./LinkedCard.vue";
import LivePhoto from "./LivePhoto.vue";
import MusicCard from "./MusicCard.vue";
import VideoPlayer from "./VideoPlayer.vue";

const props = defineProps<{
  moment: MomentData;
  authorName: string;
  avatar: string;
  pagePath: string;
}>();
const content = ref<HTMLElement>();
const expanded = ref(false);
const needsToggle = ref(false);
const hasPlayableMedia = ref(false);
const currentTime = ref<Date>();
const displayedTime = computed(() =>
  currentTime.value ? formatMomentTime(props.moment.date, currentTime.value) : formatDate(props.moment.date),
);
const exactTime = computed(() => formatMomentDateTime(props.moment.date));
type MomentContentBlock = { type: "html"; html: string } | { type: "media"; media: MomentRichMedia };
const contentBlocks = computed<MomentContentBlock[]>(() => {
  const mediaByMarker = new Map(props.moment.media.map((media) => [media.marker, media]));
  const blocks: MomentContentBlock[] = [];
  const markerPattern = /<!--(bean-moment-rich-media-\d+)-->/g;
  let cursor = 0;

  for (const match of props.moment.html.matchAll(markerPattern)) {
    const html = props.moment.html.slice(cursor, match.index);
    if (html) blocks.push({ type: "html", html });
    const media = mediaByMarker.get(match[1]);
    if (media) blocks.push({ type: "media", media });
    cursor = (match.index ?? 0) + match[0].length;
  }
  const html = props.moment.html.slice(cursor);
  if (html) blocks.push({ type: "html", html });
  return blocks;
});
let observer: ResizeObserver | undefined;

function measureOverflow() {
  const element = content.value;
  if (!element || expanded.value || hasPlayableMedia.value) return;
  element.classList.remove("moment-content-collapsed");
  const fullHeight = element.scrollHeight;
  element.classList.add("moment-content-collapsed");
  needsToggle.value = fullHeight > element.clientHeight + 1;
}

async function resetAndMeasure() {
  expanded.value = false;
  await nextTick();
  hasPlayableMedia.value = Boolean(
    content.value?.querySelector("[data-music-card], [data-video-player], [data-live-photo-mode]"),
  );
  requestAnimationFrame(measureOverflow);
}

function toggleExpanded() {
  expanded.value = !expanded.value;
  if (!expanded.value) void nextTick(measureOverflow);
}

watch(() => props.moment.html, resetAndMeasure);

onMounted(() => {
  currentTime.value = new Date();
  observer = new ResizeObserver(measureOverflow);
  if (content.value) observer.observe(content.value);
  void resetAndMeasure();
});

onBeforeUnmount(() => observer?.disconnect());
</script>

<template>
  <article
    :id="moment.fragment"
    class="grid scroll-mt-header grid-cols-[2.75rem_minmax(0,1fr)] gap-3 border-b border-border py-5 first:pt-2 last:border-b-0"
    data-moment-card
  >
    <img
      class="size-11 rounded-md bg-muted object-cover"
      :src="avatar"
      :alt="`${authorName}的头像`"
      width="44"
      height="44"
      loading="lazy"
    />
    <div class="min-w-0">
      <div class="flex min-h-6 flex-wrap items-center gap-2">
        <h2 class="text-label font-semibold text-primary">
          {{ authorName }}
        </h2>
        <span
          v-if="moment.pinned"
          class="inline-flex items-center gap-1 rounded-sm bg-primary/10 px-1.5 py-0.5 text-xs font-medium text-primary"
        >
          <Pin
            :size="12"
            aria-hidden="true"
          />
          置顶
        </span>
        <span
          v-if="moment.draft"
          class="rounded-sm bg-warning/15 px-1.5 py-0.5 text-xs font-medium text-warning-foreground"
        >
          草稿
        </span>
      </div>
      <div
        v-if="contentBlocks.length"
        :id="`${moment.fragment}-content`"
        ref="content"
        class="moment-content mt-1 leading-copy text-foreground"
        :class="{ 'moment-content-collapsed': !expanded && !hasPlayableMedia }"
      >
        <template
          v-for="(block, index) in contentBlocks"
          :key="block.type === 'html' ? `${index}-${block.html}` : block.media.marker"
        >
          <div
            v-if="block.type === 'html'"
            v-html="block.html"
          />
          <LinkedCard
            v-else-if="block.media.type === 'link-card'"
            :href="block.media.href"
            :title="block.media.title"
            :description="block.media.description"
          />
          <MusicCard
            v-else-if="block.media.type === 'music'"
            :source="block.media.source"
            :resolver="block.media.resolver"
            :title="block.media.title"
            :artist="block.media.artist"
            :cover="block.media.cover"
            :cover-alt="block.media.coverAlt"
          />
          <LivePhoto
            v-else-if="block.media.type === 'live-photo'"
            :poster="block.media.poster"
            :video="block.media.video"
            :mode="block.media.mode"
            :android-source="block.media.androidSource"
            :alt="block.media.alt"
          />
          <VideoPlayer
            v-else
            :source="block.media.source"
            :poster="block.media.poster"
            :title="block.media.title"
          />
        </template>
      </div>
      <button
        v-if="needsToggle"
        class="mt-1 rounded-sm text-sm font-medium text-primary hover:underline focus-visible:outline-2 focus-visible:outline-ring"
        type="button"
        :aria-expanded="expanded"
        :aria-controls="`${moment.fragment}-content`"
        @click="toggleExpanded"
      >
        {{ expanded ? "收起" : "全文" }}
      </button>
      <MomentGallery :images="moment.images" />
      <footer class="mt-3 flex min-h-8 flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
        <time
          :datetime="moment.date"
          :title="exactTime"
          :aria-label="exactTime"
        >
          {{ displayedTime }}
        </time>
        <span v-if="moment.location">{{ moment.location }}</span>
        <span
          v-for="tag in moment.tags"
          :key="tag"
          class="text-primary"
        >
          #{{ tag }}
        </span>
        <MomentActions
          :href="`${pagePath}#${moment.fragment}`"
          :label="`${authorName}在${exactTime}发布的动态`"
        />
      </footer>
    </div>
  </article>
</template>

<style scoped>
.moment-content {
  overflow-wrap: anywhere;
}

.moment-content-collapsed {
  max-height: 6lh;
  overflow: hidden;
}

.moment-content :deep(p),
.moment-content :deep(ul),
.moment-content :deep(ol) {
  margin-block: 0 calc(var(--spacing) * 2);
}

.moment-content :deep(p:last-child),
.moment-content :deep(ul:last-child),
.moment-content :deep(ol:last-child) {
  margin-bottom: 0;
}

.moment-content :deep(ul),
.moment-content :deep(ol) {
  padding-left: calc(var(--spacing) * 5);
}

.moment-content :deep(ul) {
  list-style-type: disc;
}

.moment-content :deep(ol) {
  list-style-type: decimal;
}

.moment-content :deep(a) {
  color: var(--color-primary);
  text-decoration: underline;
  text-underline-offset: calc(var(--spacing) * 1);
}

.moment-content :deep([data-music-card]),
.moment-content :deep([data-video-player]),
.moment-content :deep([data-live-photo-mode]) {
  margin-block: calc(var(--spacing) * 3);
}
</style>
