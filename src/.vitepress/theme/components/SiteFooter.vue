<script setup lang="ts">
import { siteConfig } from "../../site.config";
</script>

<template>
  <footer
    class="mx-auto mt-16 flex w-full max-w-content items-center justify-between px-page-gutter py-8 text-sm text-muted-foreground sm:px-page-gutter-wide"
  >
    <span>© {{ new Date().getFullYear() }} {{ siteConfig.author.name }}</span>
    <span>
      Powered by
      <a
        class="rounded-sm underline decoration-border underline-offset-4 transition-colors hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
        href="https://vitepress.dev/"
        target="_blank"
        rel="noreferrer"
      >
        VitePress
      </a>
    </span>
  </footer>
</template>
