<script setup lang="ts">
import type { NavItem } from "../../site.config";
import { ChevronDown } from "@lucide/vue";
import { withBase } from "vitepress";

withDefaults(defineProps<{ items: NavItem[]; nested?: boolean }>(), { nested: false });
const href = (value: string) => /^(?:[a-z]+:)?\/\//i.test(value) ? value : withBase(value);
</script>

<template>
  <ul :class="nested ? 'ml-3 pl-3' : 'space-y-2'">
    <li
      v-for="item in items"
      :key="item.title"
    >
      <a
        v-if="item.href"
        :class="nested ? 'block rounded-md px-3 py-2.5 text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring' : 'block rounded-md px-3 py-3 text-lg font-semibold hover:bg-muted focus-visible:outline-2 focus-visible:outline-ring'"
        :href="href(item.href)"
      >{{ item.title }}</a>
      <details
        v-else
        class="group"
      >
        <summary
          :class="nested ? 'flex cursor-pointer list-none items-center justify-between rounded-md px-3 py-2.5 text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring' : 'flex cursor-pointer list-none items-center justify-between rounded-md px-3 py-3 text-lg font-semibold hover:bg-muted focus-visible:outline-2 focus-visible:outline-ring'"
        >
          {{ item.title }}
          <ChevronDown
            :size="18"
            class="transition-transform group-open:rotate-180"
            aria-hidden="true"
          />
        </summary>
        <MobileNavigationItems
          :items="item.children ?? []"
          nested
        />
      </details>
    </li>
  </ul>
</template>
