<script setup lang="ts">
import { Search, X } from "@lucide/vue";
import { withBase } from "vitepress";
import { computed, nextTick, ref } from "vue";
import { searchPosts } from "../../data/post-utils";
import { data as posts } from "../../data/posts.data";

const dialog = ref<HTMLDialogElement>();
const input = ref<HTMLInputElement>();
const query = ref("");
const results = computed(() => searchPosts(posts, query.value).slice(0, 8));
let returnFocus: HTMLElement | null = null;

async function open() {
  returnFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  dialog.value?.showModal();
  await nextTick();
  input.value?.focus();
}

const close = () => dialog.value?.close();
function reset() {
  query.value = "";
}
async function handleClose() {
  reset();
  await nextTick();
  const target = returnFocus;
  returnFocus = null;
  window.requestAnimationFrame(() => target?.focus());
}

defineExpose({ open });
</script>

<template>
  <dialog
    ref="dialog"
    class="m-auto w-[min(92vw,var(--container-search))] rounded-md border border-border bg-popover p-0 text-popover-foreground shadow-lg backdrop:bg-overlay"
    aria-labelledby="search-title"
    @close="handleClose"
    @click.self="close"
    @keydown.esc.prevent="close"
  >
    <div class="flex h-[min(76vh,36rem)] flex-col">
      <div class="flex items-center gap-3 border-b border-border px-4">
        <Search
          :size="20"
          class="shrink-0 text-muted-foreground"
          aria-hidden="true"
        />
        <label
          id="search-title"
          for="site-search"
          class="sr-only"
        >
          搜索文章
        </label>
        <input
          id="site-search"
          ref="input"
          v-model="query"
          class="h-field min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-muted-foreground"
          type="search"
          placeholder="搜索标题、摘要或标签"
          autocomplete="off"
        />
        <button
          type="button"
          class="flex size-control-sm shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring"
          aria-label="关闭搜索"
          title="关闭搜索"
          @click="close"
        >
          <X
            :size="19"
            aria-hidden="true"
          />
        </button>
      </div>
      <div class="min-h-0 flex-1 overflow-y-auto p-3">
        <p
          v-if="!query"
          class="px-3 py-10 text-center text-sm text-muted-foreground"
        >
          输入关键词开始搜索
        </p>
        <p
          v-else-if="results.length === 0"
          class="px-3 py-10 text-center text-sm text-muted-foreground"
        >
          没有找到相关文章
        </p>
        <ul
          v-else
          class="space-y-1"
        >
          <li
            v-for="post in results"
            :key="post.slug"
          >
            <a
              class="block rounded-md px-3 py-3 transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-ring"
              :href="withBase(post.url)"
              @click="close"
            >
              <span class="block font-semibold">{{ post.title }}</span>
              <span class="mt-1 line-clamp-2 block text-sm leading-6 text-muted-foreground">{{ post.summary }}</span>
            </a>
          </li>
        </ul>
      </div>
    </div>
  </dialog>
</template>
