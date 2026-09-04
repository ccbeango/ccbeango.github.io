<script setup lang="ts">
import type { PostData } from "../../data/post-types";
import { withBase } from "vitepress";
import { formatDate, tagSlug } from "../../data/post-utils";

defineProps<{ posts: PostData[]; emptyText?: string }>();
</script>

<template>
  <p
    v-if="posts.length === 0"
    class="px-5 py-10 text-center text-sm text-muted-foreground"
  >
    {{ emptyText ?? "暂无文章" }}
  </p>
  <ol
    v-else
    class="space-y-10"
  >
    <li
      v-for="post in posts"
      :key="post.slug"
    >
      <article>
        <div class="flex flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6">
          <h2 class="min-w-0 text-lg leading-copy font-semibold sm:text-xl">
            <a
              class="rounded-sm underline decoration-border underline-offset-4 transition-colors hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
              :href="withBase(post.url)"
            >
              {{ post.title }}
            </a>
          </h2>
          <p class="shrink-0 text-sm text-muted-foreground tabular-nums">
            {{ formatDate(post.date) }} · {{ post.wordCount }} 字
          </p>
        </div>
        <p
          v-if="post.summary"
          class="mt-2 line-clamp-2 max-w-3xl leading-copy text-muted-foreground"
        >
          {{ post.summary }}
        </p>
        <div
          v-if="post.tags.length"
          class="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-sm text-muted-foreground"
        >
          <a
            v-for="tag in post.tags"
            :key="tag"
            class="rounded-sm hover:text-primary focus-visible:outline-2 focus-visible:outline-ring"
            :href="withBase(`/tags/${tagSlug(tag)}`)"
          >
            #{{ tag }}
          </a>
        </div>
      </article>
    </li>
  </ol>
</template>
