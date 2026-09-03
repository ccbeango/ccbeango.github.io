<script setup lang="ts">
import { Search } from "@lucide/vue";
import { useRoute, withBase } from "vitepress";
import { computed, ref } from "vue";
import { siteConfig } from "../../site.config";
import DesktopNavigation from "./DesktopNavigation.vue";
import MobileNav from "./MobileNav.vue";
import SearchDialog from "./SearchDialog.vue";
import ThemeSwitcher from "./ThemeSwitcher.vue";

const route = useRoute();
const searchDialog = ref<InstanceType<typeof SearchDialog>>();
const articleRoute = computed(() =>
  route.path.startsWith("/blog/") && !route.path.startsWith("/blog/page/"),
);
</script>

<template>
  <header class="px-4 pt-3 sm:px-6">
    <div
      class="mx-auto flex h-header items-center gap-2 transition-[max-width] duration-slow"
      :class="articleRoute ? 'max-w-article' : 'max-w-content'"
    >
      <MobileNav />
      <a
        class="mr-auto flex min-w-0 items-center gap-3 rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
        :href="withBase('/')"
        title="首页"
      >
        <img
          class="size-10 shrink-0 rounded-md"
          :src="withBase(siteConfig.site.logo)"
          alt=""
          width="40"
          height="40"
        />
        <span class="hidden truncate font-bold sm:block">{{ siteConfig.site.name }}</span>
      </a>
      <nav
        class="hidden md:block"
        aria-label="主导航"
      >
        <DesktopNavigation :items="siteConfig.navigation" />
      </nav>
      <div class="ml-2 flex items-center gap-0.5">
        <button
          type="button"
          class="flex size-control items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground focus-visible:outline-2 focus-visible:outline-ring"
          aria-label="搜索文章"
          title="搜索文章"
          @click="searchDialog?.open()"
        >
          <Search
            :size="19"
            aria-hidden="true"
          />
        </button>
        <ThemeSwitcher />
      </div>
    </div>
    <SearchDialog ref="searchDialog" />
  </header>
</template>
