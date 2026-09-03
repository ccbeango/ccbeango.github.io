<script setup lang="ts">
import { ArrowRight } from "@lucide/vue";
import { withBase } from "vitepress";
import { getFeaturedPosts } from "../../data/post-utils";
import { data as posts } from "../../data/posts.data";
import { siteConfig } from "../../site.config";
import PostList from "../components/PostList.vue";

const featuredPosts = getFeaturedPosts(posts, siteConfig.site.featuredPostsLimit);
const href = (value: string) => /^(?:[a-z]+:)?\/\//i.test(value) ? value : withBase(value);
</script>

<template>
  <main class="mx-auto w-full max-w-content px-page-gutter pt-12 pb-8 sm:px-page-gutter-wide sm:pt-20">
    <section aria-labelledby="home-title">
      <p class="text-sm font-semibold text-primary">
        {{ siteConfig.author.name }}
      </p>
      <h1
        id="home-title"
        class="mt-3 text-4xl leading-tight font-bold sm:text-5xl"
      >
        {{ siteConfig.site.title }}
      </h1>
      <p class="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
        {{ siteConfig.author.bio }}
      </p>
      <div
        v-if="siteConfig.homeSocials.length"
        class="mt-7 flex flex-wrap gap-x-5 gap-y-3 text-sm font-medium"
      >
        <a
          v-for="social in siteConfig.homeSocials"
          :key="social.label"
          class="rounded-sm underline decoration-border underline-offset-4 hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
          :href="href(social.href)"
          :target="social.href.startsWith('http') ? '_blank' : undefined"
          :rel="social.href.startsWith('http') ? 'noreferrer' : undefined"
        >
          {{ social.label }}
        </a>
      </div>
    </section>

    <section
      class="mt-16 sm:mt-20"
      aria-labelledby="featured-title"
    >
      <div class="mb-7 flex items-end justify-between gap-4">
        <div>
          <p class="text-xs font-semibold text-muted-foreground uppercase">Featured</p>
          <h2
            id="featured-title"
            class="mt-1 text-2xl font-bold"
          >
            推荐阅读
          </h2>
        </div>
        <a
          class="inline-flex h-control shrink-0 items-center gap-2 rounded-md px-2 text-sm font-medium text-primary focus-visible:outline-2 focus-visible:outline-ring"
          :href="withBase('/blog')"
        >
          全部文章
          <ArrowRight
            :size="17"
            aria-hidden="true"
          />
        </a>
      </div>
      <PostList
        :posts="featuredPosts"
        empty-text="尚未设置推荐文章"
      />
    </section>
  </main>
</template>
