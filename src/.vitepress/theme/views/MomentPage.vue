<script setup lang="ts">
import { LoaderCircle } from "@lucide/vue";
import { withBase } from "vitepress";
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from "vue";
import { data as moments } from "../../data/moments.data";
import { siteConfig } from "../../site.config";
import MomentCard from "../components/MomentCard.vue";
import MomentProfileHeader from "../components/MomentProfileHeader.vue";
import PhotoPreview from "../components/PhotoPreview.vue";

const momentItems = ref([...moments]);
const visibleCount = ref(Math.min(siteConfig.moment.momentBatchSize, momentItems.value.length));
const loadTrigger = ref<HTMLButtonElement>();
const loading = ref(false);
const visibleMoments = computed(() => momentItems.value.slice(0, visibleCount.value));
const hasMore = computed(() => visibleCount.value < momentItems.value.length);
const avatar = computed(() => withBase(siteConfig.moment.avatar));
let observer: IntersectionObserver | undefined;

async function loadMore() {
  if (loading.value || !hasMore.value) return;
  loading.value = true;
  await nextTick();
  visibleCount.value = Math.min(visibleCount.value + siteConfig.moment.momentBatchSize, momentItems.value.length);
  await nextTick();
  loading.value = false;
}

function hashFragment() {
  if (!window.location.hash) return "";
  try {
    return decodeURIComponent(window.location.hash.slice(1));
  } catch {
    return window.location.hash.slice(1);
  }
}

async function revealHashTarget() {
  const fragment = hashFragment();
  const targetIndex = momentItems.value.findIndex((moment) => moment.fragment === fragment);
  if (targetIndex < 0) return;
  visibleCount.value = Math.max(
    visibleCount.value,
    Math.min(
      Math.ceil((targetIndex + 1) / siteConfig.moment.momentBatchSize) * siteConfig.moment.momentBatchSize,
      momentItems.value.length,
    ),
  );
  await nextTick();
  requestAnimationFrame(() => document.getElementById(fragment)?.scrollIntoView());
}

onMounted(() => {
  if ("IntersectionObserver" in window) {
    observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) void loadMore();
      },
      { rootMargin: "240px 0px" },
    );
    if (loadTrigger.value) observer.observe(loadTrigger.value);
  }
  window.addEventListener("hashchange", revealHashTarget);
  void revealHashTarget();
});

onBeforeUnmount(() => {
  observer?.disconnect();
  window.removeEventListener("hashchange", revealHashTarget);
});
</script>

<template>
  <main
    class="mx-auto w-full max-w-content bg-background pb-8 shadow-sm"
    data-moment-page
  >
    <MomentProfileHeader :profile="siteConfig.moment" />
    <section
      class="px-page-gutter sm:px-page-gutter-wide"
      aria-label="动态列表"
    >
      <p
        v-if="momentItems.length === 0"
        class="border-t border-border px-5 py-12 text-center text-sm text-muted-foreground"
        data-moment-empty
      >
        暂无动态
      </p>
      <MomentCard
        v-for="moment in visibleMoments"
        :key="moment.slug"
        :moment="moment"
        :author-name="siteConfig.moment.displayName"
        :avatar="avatar"
        page-path="/moment"
      />
      <div
        v-if="momentItems.length > 0"
        class="flex min-h-control-lg items-center justify-center pt-5 text-sm text-muted-foreground"
        data-moment-load-state
      >
        <button
          v-if="hasMore"
          ref="loadTrigger"
          type="button"
          class="inline-flex min-h-control items-center gap-2 rounded-md px-4 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          :disabled="loading"
          @click="loadMore"
        >
          <LoaderCircle
            v-if="loading"
            class="animate-spinner"
            :size="16"
            aria-hidden="true"
          />
          {{ loading ? "正在加载动态" : "加载更多动态" }}
        </button>
        <p
          v-else
          role="status"
          aria-live="polite"
        >
          已加载全部动态
        </p>
      </div>
    </section>
    <PhotoPreview />
  </main>
</template>
