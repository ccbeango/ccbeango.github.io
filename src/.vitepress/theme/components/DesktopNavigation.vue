<script setup lang="ts">
import type { NavItem } from "../../site.config";
import { ChevronDown } from "@lucide/vue";
import { useRoute, withBase } from "vitepress";
import { onMounted, onUnmounted, ref, watch } from "vue";

const props = withDefaults(defineProps<{ items: NavItem[]; level?: number }>(), { level: 0 });
const container = ref<HTMLUListElement>();
const route = useRoute();
const href = (value: string) => /^(?:[a-z]+:)?\/\//i.test(value) ? value : withBase(value);

function closeDropdowns(target?: Node) {
  if (props.level !== 0)
    return;
  for (const details of container.value?.querySelectorAll<HTMLDetailsElement>("details[open]") ?? []) {
    if (!target || !details.contains(target))
      details.open = false;
  }
}

function handleDocumentPointerDown(event: PointerEvent) {
  if (event.target instanceof Node)
    closeDropdowns(event.target);
}

watch(() => route.path, () => closeDropdowns());

onMounted(() => {
  if (props.level === 0)
    document.addEventListener("pointerdown", handleDocumentPointerDown);
});

onUnmounted(() => {
  if (props.level === 0)
    document.removeEventListener("pointerdown", handleDocumentPointerDown);
});
</script>

<template>
  <ul
    ref="container"
    :class="level === 0 ? 'flex items-center gap-1' : 'space-y-1'"
  >
    <li
      v-for="item in items"
      :key="item.title"
    >
      <a
        v-if="item.href"
        :class="level === 0 ? 'block rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground focus-visible:outline-2 focus-visible:outline-ring' : 'block rounded-sm px-3 py-2 text-sm hover:bg-muted focus-visible:outline-2 focus-visible:outline-ring'"
        :href="href(item.href)"
      >{{ item.title }}</a>
      <details
        v-else
        class="group relative"
      >
        <summary
          :class="level === 0 ? 'flex cursor-pointer list-none items-center gap-1 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground focus-visible:outline-2 focus-visible:outline-ring' : 'flex cursor-pointer list-none items-center justify-between rounded-sm px-3 py-2 text-sm hover:bg-muted focus-visible:outline-2 focus-visible:outline-ring'"
        >
          {{ item.title }}
          <ChevronDown
            :size="14"
            class="transition-transform group-open:rotate-180"
            aria-hidden="true"
          />
        </summary>
        <div
          :class="level === 0 ? 'absolute left-1/2 z-navigation mt-2 w-40 -translate-x-1/2 rounded-md border border-border bg-popover p-1.5 text-popover-foreground shadow-md' : 'absolute top-0 left-full z-navigation ml-1 w-40 rounded-md border border-border bg-popover p-1.5 text-popover-foreground shadow-md'"
        >
          <DesktopNavigation
            :items="item.children ?? []"
            :level="level + 1"
          />
        </div>
      </details>
    </li>
  </ul>
</template>
