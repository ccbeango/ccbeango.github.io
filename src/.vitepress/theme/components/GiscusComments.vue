<script setup lang="ts">
import { useData } from "vitepress";
import { computed, defineAsyncComponent, onBeforeUnmount, onMounted, ref } from "vue";
import { isGiscusConfigured, siteConfig } from "../../site.config";

const Giscus = defineAsyncComponent(() => import("@giscus/vue"));
const container = ref<HTMLElement>();
const ready = ref(false);
const { isDark } = useData();
const config = isGiscusConfigured(siteConfig.giscus) ? siteConfig.giscus : null;
let observer: IntersectionObserver | undefined;
const theme = computed(() => isDark.value ? "dark" : "light");

onMounted(() => {
  observer = new IntersectionObserver((entries) => {
    if (entries.some(entry => entry.isIntersecting)) {
      ready.value = true;
      observer?.disconnect();
    }
  }, { rootMargin: "240px" });
  if (container.value)
    observer.observe(container.value);
});

onBeforeUnmount(() => {
  observer?.disconnect();
});
</script>

<template>
  <section
    v-if="config"
    ref="container"
    class="mt-14 pt-8"
    aria-label="评论"
  >
    <ClientOnly>
      <Giscus
        v-if="ready"
        :repo="config.repo"
        :repo-id="config.repoId"
        :category="config.category"
        :category-id="config.categoryId"
        :mapping="config.mapping"
        strict="0"
        :reactions-enabled="config.reactionsEnabled"
        emit-metadata="0"
        :input-position="config.inputPosition"
        :theme="theme"
        :lang="config.lang"
        loading="lazy"
      />
    </ClientOnly>
  </section>
</template>
