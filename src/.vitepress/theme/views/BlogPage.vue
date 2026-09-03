<script setup lang="ts">
import { useData } from "vitepress";
import { computed } from "vue";
import { paginatePosts } from "../../data/post-utils";
import { data as posts } from "../../data/posts.data";
import { siteConfig } from "../../site.config";
import PaginationNav from "../components/PaginationNav.vue";
import PostList from "../components/PostList.vue";

const { params } = useData();
const page = computed(() => Number(params.value?.page ?? 1));
const pagination = computed(() => paginatePosts(posts, page.value, siteConfig.site.postsPerPage));
</script>

<template>
  <main class="mx-auto w-full max-w-content px-page-gutter pt-12 pb-8 sm:px-page-gutter-wide sm:pt-16">
    <header class="mb-10">
      <p class="text-xs font-semibold text-muted-foreground uppercase">Writing</p>
      <h1 class="mt-2 text-3xl font-bold sm:text-4xl">全部文章</h1>
      <p class="mt-4 leading-copy text-muted-foreground">共 {{ posts.length }} 篇，按发布时间从新到旧排列。</p>
    </header>
    <PostList :posts="pagination.items" />
    <PaginationNav
      :page="pagination.page"
      :page-count="pagination.pageCount"
    />
  </main>
</template>
