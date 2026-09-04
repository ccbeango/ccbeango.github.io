<script setup lang="ts">
import type { MomentConfig } from "../../site.config";
import { withBase } from "vitepress";
import { onMounted, ref } from "vue";

const props = defineProps<{ profile: MomentConfig }>();
const cover = ref(props.profile.covers[0] ?? "");

onMounted(() => {
  const index = Math.floor(Math.random() * props.profile.covers.length);
  cover.value = props.profile.covers[index] ?? props.profile.covers[0] ?? "";
});
</script>

<template>
  <header
    class="pb-10"
    data-moment-profile
  >
    <div class="relative">
      <img
        class="aspect-wide w-full object-cover"
        :src="withBase(cover)"
        :alt="`${profile.displayName}的动态封面`"
        width="768"
        height="512"
        fetchpriority="high"
        data-moment-cover
      />
      <h1 class="absolute right-28 bottom-5 max-w-80 truncate text-xl font-bold text-overlay-foreground drop-shadow-md">
        {{ profile.displayName }}
      </h1>
      <img
        class="absolute right-5 -bottom-8 size-20 rounded-lg border-4 border-background bg-card object-cover shadow-md"
        :src="withBase(profile.avatar)"
        :alt="`${profile.displayName}的头像`"
        width="80"
        height="80"
        data-moment-profile-avatar
      />
    </div>
    <p class="mt-10 pr-5 text-right text-sm leading-copy text-muted-foreground">
      {{ profile.signature }}
    </p>
  </header>
</template>
