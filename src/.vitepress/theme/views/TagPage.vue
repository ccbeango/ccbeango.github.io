<script setup lang="ts">
import { useData } from "vitepress";
import { computed } from "vue";
import { tagSlug } from "../../data/post-utils";
import { data as posts } from "../../data/posts.data";
import PostList from "../components/PostList.vue";

const { params } = useData();
const slug = computed(() => String(params.value?.tag ?? ""));
const tagName = computed(() => String(params.value?.tagName ?? decodeURIComponent(slug.value)));
const taggedPosts = computed(() => posts.filter(post => post.tags.some(tag => tagSlug(tag) === slug.value)));
</script>

<template>
  <main class="mx-auto w-full max-w-content px-page-gutter pt-12 pb-8 sm:px-page-gutter-wide sm:pt-16">
    <header class="mb-10">
      <p class="text-xs font-semibold text-muted-foreground uppercase">Topic</p>
      <h1 class="mt-2 text-3xl font-bold wrap-break-word sm:text-4xl"># {{ tagName }}</h1>
      <p class="mt-4 text-muted-foreground">{{ taggedPosts.length }} 篇文章</p>
    </header>
    <PostList
      :posts="taggedPosts"
      empty-text="该标签下暂无文章"
    />
  </main>
</template>
