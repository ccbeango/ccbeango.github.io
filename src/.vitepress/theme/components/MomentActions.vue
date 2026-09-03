<script setup lang="ts">
import { Copy, Ellipsis } from "@lucide/vue";
import { withBase } from "vitepress";
import { nextTick, onBeforeUnmount, onMounted, ref } from "vue";

const props = defineProps<{ href: string; label: string }>();
const container = ref<HTMLElement>();
const trigger = ref<HTMLButtonElement>();
const menuItem = ref<HTMLButtonElement>();
const isOpen = ref(false);
const feedback = ref("");
let feedbackTimer: ReturnType<typeof setTimeout> | undefined;

function close(restoreFocus = false) {
  isOpen.value = false;
  if (restoreFocus) trigger.value?.focus();
}

async function toggle() {
  if (isOpen.value) {
    close();
    return;
  }
  isOpen.value = true;
  await nextTick();
  menuItem.value?.focus();
}

function fallbackCopy(value: string) {
  const textarea = document.createElement("textarea");
  textarea.value = value;
  textarea.setAttribute("readonly", "");
  textarea.className = "fixed size-px -translate-x-full opacity-0";
  document.body.append(textarea);
  textarea.select();
  const copied = document.execCommand("copy");
  textarea.remove();
  if (!copied) throw new Error("copy failed");
}

async function copyLink() {
  const link = new URL(withBase(props.href), window.location.origin).toString();
  try {
    if (navigator.clipboard?.writeText) await navigator.clipboard.writeText(link);
    else fallbackCopy(link);
    feedback.value = "链接已复制";
  } catch {
    feedback.value = "复制失败";
  }
  if (feedbackTimer) clearTimeout(feedbackTimer);
  feedbackTimer = setTimeout(() => (feedback.value = ""), 2400);
  close(true);
}

function handlePointerDown(event: PointerEvent) {
  if (isOpen.value && event.target instanceof Node && !container.value?.contains(event.target)) close(true);
}

function handleKeydown(event: KeyboardEvent) {
  if (isOpen.value && event.key === "Escape") {
    event.preventDefault();
    close(true);
  }
}

onMounted(() => {
  document.addEventListener("pointerdown", handlePointerDown);
  document.addEventListener("keydown", handleKeydown);
});

onBeforeUnmount(() => {
  document.removeEventListener("pointerdown", handlePointerDown);
  document.removeEventListener("keydown", handleKeydown);
  if (feedbackTimer) clearTimeout(feedbackTimer);
});
</script>

<template>
  <div
    ref="container"
    class="relative ml-auto flex min-h-8 items-center gap-2"
  >
    <span
      class="min-w-16 text-right text-xs text-muted-foreground"
      role="status"
      aria-live="polite"
    >
      {{ feedback }}
    </span>
    <button
      ref="trigger"
      class="flex size-8 items-center justify-center rounded-md bg-muted text-primary hover:bg-accent hover:text-accent-foreground focus-visible:outline-2 focus-visible:outline-ring"
      type="button"
      :aria-label="`${label}操作`"
      :aria-expanded="isOpen"
      aria-haspopup="menu"
      @click="toggle"
    >
      <Ellipsis
        :size="18"
        aria-hidden="true"
      />
    </button>
    <div
      v-if="isOpen"
      class="absolute right-0 bottom-10 z-control min-w-32 rounded-md border border-border bg-popover p-1 text-popover-foreground shadow-md"
      role="menu"
    >
      <button
        ref="menuItem"
        class="flex w-full items-center gap-2 rounded-sm px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground focus-visible:outline-2 focus-visible:outline-ring"
        type="button"
        role="menuitem"
        @click="copyLink"
      >
        <Copy
          :size="16"
          aria-hidden="true"
        />
        复制链接
      </button>
    </div>
  </div>
</template>
