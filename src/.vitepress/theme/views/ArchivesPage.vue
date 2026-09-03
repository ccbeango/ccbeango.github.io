<script setup lang="ts">
import { withBase } from "vitepress";
import { formatDate, groupArchives } from "../../data/post-utils";
import { data as posts } from "../../data/posts.data";

const groups = groupArchives(posts);
</script>

<template>
  <main class="mx-auto w-full max-w-content px-page-gutter pt-12 pb-8 sm:px-page-gutter-wide sm:pt-16">
    <header class="mb-10">
      <p class="text-xs font-semibold text-muted-foreground uppercase">
        Timeline
      </p>
      <h1 class="mt-2 text-3xl font-bold sm:text-4xl">
        归档
      </h1>
    </header>
    <div class="space-y-12">
      <section
        v-for="group in groups"
        :key="group.year"
        :aria-labelledby="`year-${group.year}`"
      >
        <h2
          :id="`year-${group.year}`"
          class="mb-4 text-2xl font-bold tabular-nums"
        >
          {{ group.year }}
        </h2>
        <ol class="space-y-4">
          <li
            v-for="post in group.posts"
            :key="post.slug"
            class="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:gap-6"
          >
            <time
              class="w-32 shrink-0 text-sm text-muted-foreground tabular-nums"
              :datetime="post.date"
            >{{ formatDate(post.date) }}</time>
            <a
              class="min-w-0 font-medium wrap-break-word underline decoration-border underline-offset-4 hover:text-primary focus-visible:outline-2 focus-visible:outline-ring"
              :href="withBase(post.url)"
            >{{ post.title }}</a>
          </li>
        </ol>
      </section>
    </div>
  </main>
</template>
