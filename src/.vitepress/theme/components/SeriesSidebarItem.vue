<script setup lang="ts">
import type { DefaultTheme } from "vitepress";
import { ChevronRight } from "@lucide/vue";
import { withBase } from "vitepress";
import { computed } from "vue";
import { useSidebarItemControl } from "../vitepress-default-theme";

const props = defineProps<{
  item: DefaultTheme.SidebarItem;
}>();

const emit = defineEmits<{
  navigate: [];
}>();

const {
  collapsed,
  collapsible,
  hasChildren,
  isActiveLink,
  toggle,
} = useSidebarItemControl(computed(() => props.item));
</script>

<template>
  <li>
    <div class="flex items-start gap-1">
      <a
        v-if="item.link"
        data-series-entry
        class="flex min-w-0 flex-1 items-start rounded-md px-2 py-1.5 transition-colors focus-visible:outline-2 focus-visible:outline-ring"
        :class="isActiveLink ? 'bg-accent text-accent-foreground ring-1 ring-ring/15' : 'text-foreground hover:bg-muted'"
        :href="withBase(item.link)"
        :aria-current="isActiveLink ? 'page' : undefined"
        @click="emit('navigate')"
      >
        <span
          data-series-title
          class="min-w-0 flex-1 text-sm leading-5 font-medium"
          :class="isActiveLink ? 'font-semibold' : ''"
        >
          {{ item.text }}
        </span>
      </a>
      <button
        v-else-if="item.text && hasChildren && collapsible"
        type="button"
        class="flex min-w-0 flex-1 items-start justify-between gap-2 rounded-md px-2 py-1.5 text-left text-foreground transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-ring"
        :aria-expanded="!collapsed"
        @click="toggle"
      >
        <span
          data-series-name
          class="min-w-0 text-label font-semibold"
        >{{ item.text }}</span>
        <ChevronRight
          :size="16"
          class="mt-1 shrink-0 transition-transform"
          :class="collapsed ? '' : 'rotate-90'"
          aria-hidden="true"
        />
      </button>
      <p
        v-else-if="item.text"
        data-series-name
        class="min-w-0 flex-1 px-2 py-1.5 text-label font-semibold text-foreground"
      >
        {{ item.text }}
      </p>
      <button
        v-if="collapsible && hasChildren && item.link"
        type="button"
        class="flex size-8 shrink-0 items-center justify-center rounded-sm text-muted-foreground transition-colors hover:text-primary focus-visible:outline-2 focus-visible:outline-ring"
        :aria-label="collapsed ? `展开${item.text ?? '分组'}` : `收起${item.text ?? '分组'}`"
        :aria-expanded="!collapsed"
        @click="toggle"
      >
        <ChevronRight
          :size="16"
          :class="collapsed ? '' : 'rotate-90'"
          aria-hidden="true"
        />
      </button>
    </div>
    <ol
      v-if="hasChildren"
      :class="collapsed ? 'hidden' : 'mt-1 space-y-1'"
    >
      <SeriesSidebarItem
        v-for="child in item.items"
        :key="`${child.text ?? ''}-${child.link ?? ''}`"
        :item="child"
        @navigate="emit('navigate')"
      />
    </ol>
  </li>
</template>
