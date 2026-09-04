<script setup lang="ts">
import { withBase } from "vitepress";
import { collectTags } from "../../data/post-utils";
import { data as posts } from "../../data/posts.data";

const tags = collectTags(posts);
</script>

<template>
  <main class="mx-auto w-full max-w-content px-page-gutter pt-12 pb-8 sm:px-page-gutter-wide sm:pt-16">
    <header class="mb-10">
      <p class="text-xs font-semibold text-muted-foreground uppercase">Topics</p>
      <h1 class="mt-2 text-3xl font-bold sm:text-4xl">标签</h1>
    </header>
    <ul
      v-if="tags.length"
      class="grid grid-cols-1 gap-x-8 gap-y-2 sm:grid-cols-2"
    >
      <li
        v-for="tag in tags"
        :key="tag.slug"
      >
        <a
          class="focus-visible:outline-inset flex min-h-14 items-center justify-between gap-4 rounded-md px-3 py-3 hover:bg-accent hover:text-accent-foreground focus-visible:outline-2 focus-visible:outline-ring"
          :href="withBase(`/tags/${tag.slug}`)"
        >
          <span class="font-semibold"># {{ tag.name }}</span>
          <span class="text-sm text-muted-foreground tabular-nums">{{ tag.count }}</span>
        </a>
      </li>
    </ul>
    <p
      v-else
      class="px-5 py-10 text-center text-sm text-muted-foreground"
    >
      暂无标签
    </p>
  </main>
</template>
