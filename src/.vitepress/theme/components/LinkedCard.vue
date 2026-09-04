<script setup lang="ts">
import { ArrowUpRight } from "@lucide/vue";
import { withBase } from "vitepress";
import { computed } from "vue";

const props = defineProps<{ href: string; title: string; description?: string }>();
const resolvedHref = computed(() => (/^(?:[a-z]+:)?\/\//i.test(props.href) ? props.href : withBase(props.href)));
</script>

<template>
  <a
    class="not-prose my-6 flex items-center justify-between gap-4 rounded-md border border-border bg-card p-4 text-card-foreground no-underline transition-colors hover:border-primary focus-visible:outline-2 focus-visible:outline-ring"
    :href="resolvedHref"
  >
    <span>
      <strong class="block">{{ title }}</strong>
      <span
        v-if="description"
        class="mt-1 block text-sm text-muted-foreground"
      >
        {{ description }}
      </span>
    </span>
    <ArrowUpRight
      :size="19"
      class="shrink-0 text-primary"
      aria-hidden="true"
    />
  </a>
</template>
