<script setup lang="ts">
import { withBase } from "vitepress";
import { computed } from "vue";

const props = defineProps<{
  source: string;
  poster?: string;
  title: string;
}>();

const sourceUrl = computed(() => withBase(props.source));
const posterUrl = computed(() => (props.poster ? withBase(props.poster) : undefined));
</script>

<template>
  <figure
    class="not-prose my-8 w-full"
    data-video-player
  >
    <video
      class="block h-auto w-full rounded-md bg-muted object-contain"
      :src="sourceUrl"
      :poster="posterUrl"
      :aria-label="title"
      controls
      playsinline
      preload="metadata"
    >
      <p>
        当前浏览器无法播放该视频。
        <a :href="sourceUrl">下载视频</a>
      </p>
    </video>
  </figure>
</template>
