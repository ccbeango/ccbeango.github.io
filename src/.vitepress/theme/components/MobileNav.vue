<script setup lang="ts">
import { Menu, X } from "@lucide/vue";
import { useRoute } from "vitepress";
import { nextTick, ref, watch } from "vue";
import { siteConfig } from "../../site.config";
import MobileNavigationItems from "./MobileNavigationItems.vue";

const dialog = ref<HTMLDialogElement>();
const closeButton = ref<HTMLButtonElement>();
const route = useRoute();

async function open() {
  dialog.value?.showModal();
  await nextTick();
  closeButton.value?.focus();
}
const close = () => dialog.value?.close();
watch(() => route.path, close);
</script>

<template>
  <button
    type="button"
    class="flex size-control shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground focus-visible:outline-2 focus-visible:outline-ring md:hidden"
    aria-label="打开导航"
    title="打开导航"
    @click="open"
  >
    <Menu
      :size="22"
      aria-hidden="true"
    />
  </button>
  <dialog
    ref="dialog"
    class="m-0 h-dvh max-h-none w-[min(var(--container-navigation),86vw)] max-w-none border-0 bg-popover p-0 text-popover-foreground shadow-lg backdrop:bg-overlay"
    aria-label="移动导航"
  >
    <div class="flex h-full flex-col p-5">
      <div class="flex items-center justify-between">
        <span class="font-bold">{{ siteConfig.site.name }}</span>
        <button
          ref="closeButton"
          type="button"
          class="flex size-control items-center justify-center rounded-md text-muted-foreground hover:bg-muted focus-visible:outline-2 focus-visible:outline-ring"
          aria-label="关闭导航"
          title="关闭导航"
          @click="close"
        >
          <X
            :size="20"
            aria-hidden="true"
          />
        </button>
      </div>
      <nav
        class="mt-8 flex-1 overflow-y-auto"
        aria-label="移动端主导航"
      >
        <MobileNavigationItems :items="siteConfig.navigation" />
      </nav>
    </div>
  </dialog>
</template>
