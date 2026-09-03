<script setup lang="ts">
import { ArrowLeft } from "@lucide/vue";
import { withBase } from "vitepress";
</script>

<template>
  <main
    class="mx-auto flex min-h-[60vh] w-full max-w-content flex-col justify-center px-page-gutter py-16 sm:px-page-gutter-wide"
  >
    <p class="font-mono text-sm text-primary">
      404
    </p>
    <h1 class="mt-3 text-3xl font-bold sm:text-4xl">
      页面没有找到
    </h1>
    <p class="mt-4 max-w-xl leading-copy text-muted-foreground">
      这个地址可能已经改变，或者内容尚未发布。
    </p>
    <a
      class="mt-8 inline-flex h-control w-fit items-center gap-2 rounded-md border border-border px-3 text-sm font-medium hover:border-primary hover:text-primary focus-visible:outline-2 focus-visible:outline-ring"
      :href="withBase('/blog')"
    >
      <ArrowLeft
        :size="17"
        aria-hidden="true"
      /> 返回文章列表
    </a>
  </main>
</template>
