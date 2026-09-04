<script setup lang="ts">
import { LibraryBig } from "@lucide/vue";
import { onMounted, onUnmounted, ref } from "vue";
import {
  useLayout,
  useSidebarControl,
} from "../vitepress-default-theme";
import SeriesSidebarItem from "./SeriesSidebarItem.vue";

const { close, isOpen, toggle } = useSidebarControl();
const { hasSidebar, sidebarGroups } = useLayout();
const container = ref<HTMLElement>();

function handleDocumentPointerDown(event: PointerEvent) {
  if (isOpen.value && !container.value?.contains(event.target as Node))
    close();
}

onMounted(() => document.addEventListener("pointerdown", handleDocumentPointerDown));
onUnmounted(() => document.removeEventListener("pointerdown", handleDocumentPointerDown));
</script>

<template>
  <aside
    v-if="hasSidebar"
    ref="container"
    class="sticky top-0 z-control col-start-1 row-start-1 h-0 xl:top-side-rail-top xl:mt-12 xl:h-auto xl:w-56 xl:self-start xl:justify-self-end"
    aria-label="系列文章"
  >
    <button
      type="button"
      class="absolute top-2 left-0 flex size-control items-center justify-center rounded-md bg-popover/90 text-popover-foreground backdrop-blur-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-2 focus-visible:outline-ring xl:hidden"
      title="系列文章"
      :aria-expanded="isOpen"
      aria-controls="series-sidebar-navigation"
      @click="toggle"
    >
      <span class="sr-only">系列文章</span>
      <LibraryBig
        :size="20"
        aria-hidden="true"
      />
    </button>
    <div
      id="series-sidebar-navigation"
      class="absolute top-14 left-0 max-h-[calc(100vh-var(--spacing-header))] w-[min(var(--container-side-panel),calc(100vw-2.5rem))] overflow-y-auto rounded-md border border-border bg-popover p-4 text-popover-foreground shadow-md xl:static xl:block xl:max-h-[calc(100vh-var(--spacing-side-rail-viewport))] xl:w-auto xl:overflow-y-auto xl:border-0 xl:bg-transparent xl:p-0 xl:shadow-none"
      :class="isOpen ? 'block' : 'hidden xl:block'"
    >
      <nav aria-label="系列文章">
        <ul class="space-y-5">
          <SeriesSidebarItem
            v-for="(group, index) in sidebarGroups"
            :key="`${group.text ?? 'series'}-${index}`"
            :item="group"
            @navigate="close"
          />
        </ul>
      </nav>
    </div>
  </aside>
</template>
