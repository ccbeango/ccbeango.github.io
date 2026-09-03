<script setup lang="ts">
import { ArrowLeft } from "@lucide/vue";
import { withBase } from "vitepress";
import { onBeforeUnmount, onMounted, ref } from "vue";
import ThemeSwitcher from "./ThemeSwitcher.vue";

const scrolled = ref(false);

function updateScrollState() {
  scrolled.value = window.scrollY > 48;
}

onMounted(() => {
  updateScrollState();
  window.addEventListener("scroll", updateScrollState, { passive: true });
});

onBeforeUnmount(() => window.removeEventListener("scroll", updateScrollState));
</script>

<template>
  <header
    class="fixed inset-x-0 top-0 z-navigation mx-auto w-full max-w-content transition-[background-color,color,box-shadow,backdrop-filter]"
    :class="
      scrolled
        ? 'bg-background/80 text-foreground shadow-sm backdrop-blur-lg'
        : 'bg-transparent text-overlay-foreground'
    "
    data-moment-header
    :data-scrolled="scrolled"
  >
    <div class="relative flex h-13 w-full items-center justify-between px-page-gutter sm:px-page-gutter-wide">
      <a
        class="flex size-control items-center justify-center rounded-md transition-colors hover:bg-overlay/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        :href="withBase('/')"
        aria-label="返回首页"
        title="返回首页"
      >
        <ArrowLeft
          :size="21"
          aria-hidden="true"
        />
      </a>
      <span
        class="pointer-events-none absolute inset-x-16 truncate text-center text-sm font-semibold transition-opacity"
        :class="scrolled ? 'opacity-100' : 'opacity-0'"
        aria-hidden="true"
      >
        动态
      </span>
      <div class="[&_button]:text-inherit">
        <ThemeSwitcher />
      </div>
    </div>
  </header>
</template>
