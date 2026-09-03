<script setup lang="ts">
import { Content, useData } from "vitepress";
import { computed } from "vue";
import GlobalMusicPlayer from "./components/GlobalMusicPlayer.vue";
import SiteFooter from "./components/SiteFooter.vue";
import SiteHeader from "./components/SiteHeader.vue";
import MomentHeader from "./components/MomentHeader.vue";
import ArchivesPage from "./views/ArchivesPage.vue";
import ArticlePage from "./views/ArticlePage.vue";
import BlogPage from "./views/BlogPage.vue";
import HomePage from "./views/HomePage.vue";
import MomentPage from "./views/MomentPage.vue";
import NotFoundPage from "./views/NotFoundPage.vue";
import TagPage from "./views/TagPage.vue";
import TagsPage from "./views/TagsPage.vue";
import {
  registerWatchers,
  useSidebarControl,
} from "./vitepress-default-theme";

const { frontmatter, page } = useData();
const layout = computed(() => page.value.isNotFound ? "not-found" : frontmatter.value.layout ?? "doc");
const { close: closeSidebar } = useSidebarControl();

registerWatchers({ closeSidebar });
</script>

<template>
  <div
    class="flex min-h-screen flex-col font-sans text-foreground antialiased transition-colors [font-synthesis-weight:none] dark:theme-dark"
    :class="layout === 'moment' ? 'bg-muted' : 'bg-background'"
  >
    <MomentHeader v-if="layout === 'moment'" />
    <SiteHeader v-else />
    <div class="flex-1">
      <HomePage v-if="layout === 'home'" />
      <BlogPage v-else-if="layout === 'blog'" />
      <MomentPage v-else-if="layout === 'moment'" />
      <TagsPage v-else-if="layout === 'tags'" />
      <TagPage v-else-if="layout === 'tag'" />
      <ArchivesPage v-else-if="layout === 'archives'" />
      <ArticlePage v-else-if="layout === 'article'" />
      <NotFoundPage v-else-if="layout === 'not-found'" />
      <main
        v-else
        class="mx-auto w-full max-w-content px-page-gutter py-10 sm:px-page-gutter-wide"
      >
        <Content />
      </main>
    </div>
    <SiteFooter />
    <GlobalMusicPlayer />
  </div>
</template>
