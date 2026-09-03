<script setup lang="ts">
import { ArrowUp } from "@lucide/vue";
import { onBeforeUnmount, onMounted, ref } from "vue";

const visible = ref(false);
function update() {
  visible.value = window.scrollY > 640;
}
const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

onMounted(() => {
  update();
  window.addEventListener("scroll", update, { passive: true });
});
onBeforeUnmount(() => window.removeEventListener("scroll", update));
</script>

<template>
  <button
    type="button"
    class="fixed right-page-gutter bottom-page-gutter z-control flex size-control-lg items-center justify-center rounded-md border border-border bg-card text-muted-foreground shadow-md transition-[opacity,transform] hover:border-primary hover:text-primary focus-visible:outline-2 focus-visible:outline-ring"
    :class="visible ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-3 opacity-0'"
    aria-label="返回顶部"
    title="返回顶部"
    :tabindex="visible ? 0 : -1"
    @click="scrollToTop"
  >
    <ArrowUp
      :size="19"
      aria-hidden="true"
    />
  </button>
</template>
