<script setup lang="ts">
import { Moon, Sun } from "@lucide/vue";
import { useData } from "vitepress";
import { computed } from "vue";

const { isDark } = useData();
const label = computed(() => isDark.value ? "切换到浅色主题" : "切换到深色主题");
function toggle() {
  isDark.value = !isDark.value;
}
</script>

<template>
  <button
    type="button"
    class="flex size-control shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
    :aria-label="label"
    :title="label"
    @click="toggle"
  >
    <Sun
      v-if="isDark"
      :size="19"
      aria-hidden="true"
    />
    <Moon
      v-else
      :size="19"
      aria-hidden="true"
    />
  </button>
</template>
