<script setup lang="ts">
import type { MomentImage } from "../../data/moment-types";
import { withBase } from "vitepress";
import { computed } from "vue";

const props = defineProps<{ images: MomentImage[] }>();
const isSingle = computed(() => props.images.length === 1);
const firstImage = computed(() => props.images[0]);
const columns = computed(() => (props.images.length === 2 || props.images.length === 4 ? 2 : 3));
</script>

<template>
  <div
    v-if="images.length"
    class="mt-3"
    :data-moment-gallery="images.length"
    data-photo-preview-scope
  >
    <img
      v-if="isSingle && firstImage"
      class="max-h-96 max-w-full cursor-zoom-in rounded-md object-contain focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
      :src="withBase(firstImage.src)"
      :alt="firstImage.alt"
      :aria-label="`预览图片：${firstImage.alt}`"
      loading="lazy"
      decoding="async"
      data-photo-preview
      role="button"
      tabindex="0"
    />
    <div
      v-else
      class="grid gap-1"
      :class="columns === 2 ? 'max-w-sm grid-cols-2' : 'max-w-md grid-cols-3'"
    >
      <img
        v-for="(image, index) in images"
        :key="`${image.src}-${index}`"
        class="aspect-square w-full cursor-zoom-in rounded-sm object-cover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        :src="withBase(image.src)"
        :alt="image.alt"
        :aria-label="`预览图片：${image.alt}`"
        width="240"
        height="240"
        loading="lazy"
        decoding="async"
        data-photo-preview
        role="button"
        tabindex="0"
      />
    </div>
  </div>
</template>
