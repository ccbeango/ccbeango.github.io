<script setup lang="ts">
import { ArrowLeft, ArrowRight } from "@lucide/vue";
import { withBase } from "vitepress";

const props = defineProps<{ page: number; pageCount: number }>();
const pageHref = (page: number) => (page === 1 ? "/blog" : `/blog/page/${page}`);
</script>

<template>
  <nav
    v-if="pageCount > 1"
    class="mt-12 flex items-center justify-between"
    aria-label="文章分页"
  >
    <a
      v-if="page > 1"
      class="inline-flex h-control items-center gap-2 rounded-md border border-border px-3 text-sm font-medium hover:border-primary hover:text-primary focus-visible:outline-2 focus-visible:outline-ring"
      :href="withBase(pageHref(props.page - 1))"
    >
      <ArrowLeft
        :size="17"
        aria-hidden="true"
      />
      上一页
    </a>
    <span
      v-else
      class="h-control w-24"
      aria-hidden="true"
    />
    <span class="text-sm text-muted-foreground tabular-nums">{{ page }} / {{ pageCount }}</span>
    <a
      v-if="page < pageCount"
      class="inline-flex h-control items-center gap-2 rounded-md border border-border px-3 text-sm font-medium hover:border-primary hover:text-primary focus-visible:outline-2 focus-visible:outline-ring"
      :href="withBase(pageHref(props.page + 1))"
    >
      下一页
      <ArrowRight
        :size="17"
        aria-hidden="true"
      />
    </a>
    <span
      v-else
      class="h-control w-24"
      aria-hidden="true"
    />
  </nav>
</template>
