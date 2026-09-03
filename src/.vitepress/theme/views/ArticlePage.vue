<script setup lang="ts">
import type { PostData } from "../../data/post-types";
import { Content, onContentUpdated, useData, withBase } from "vitepress";
import { computed, nextTick } from "vue";
import { formatDate, tagSlug } from "../../data/post-utils";
import BackToTop from "../components/BackToTop.vue";
import GiscusComments from "../components/GiscusComments.vue";
import PhotoPreview from "../components/PhotoPreview.vue";
import SeriesSidebar from "../components/SeriesSidebar.vue";
import TableOfContents from "../components/TableOfContents.vue";

const { params } = useData();
const post = computed(() => JSON.parse(String(params.value?.post ?? "{}")) as PostData);

async function enhanceArticleContent() {
  await nextTick();
  document.querySelectorAll<SVGSVGElement>(".article-content mjx-container svg[viewbox]").forEach((svg) => {
    const viewBox = svg.getAttribute("viewbox");
    if (!viewBox)
      return;
    svg.setAttribute("viewBox", viewBox);
    svg.removeAttribute("viewbox");
  });
}

onContentUpdated(enhanceArticleContent);
</script>

<template>
  <main
    class="VPDoc mx-auto w-full max-w-layout px-page-gutter sm:px-6"
    data-photo-preview-scope
  >
    <div class="xl:grid xl:grid-cols-[minmax(0,1fr)_minmax(0,52rem)_minmax(10rem,1fr)] xl:gap-6">
      <SeriesSidebar />
      <TableOfContents />
      <article class="mx-auto w-full max-w-article min-w-0 pt-9 sm:pt-12 xl:col-start-2 xl:row-start-1">
        <div
          v-if="post.cover"
          class="relative"
          data-article-cover-wrap
        >
          <img
            class="aspect-cover max-h-72 w-full cursor-zoom-in rounded-t-md object-cover focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
            :src="withBase(post.cover)"
            :alt="`${post.title} 封面`"
            :aria-label="`预览图片：${post.title} 封面`"
            data-article-cover
            data-photo-preview
            role="button"
            tabindex="0"
          />
          <span
            class="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-linear-to-b from-transparent to-background"
            aria-hidden="true"
            data-article-cover-fade
          />
        </div>
        <header
          class="relative z-content mb-9 px-12 data-cover:-mt-6 xl:px-0"
          :data-cover="post.cover ? '' : undefined"
        >
          <p
            v-if="post.draft"
            class="mb-4 inline-flex rounded-sm bg-warning/15 px-2 py-1 text-xs font-semibold text-warning-foreground"
          >
            草稿预览
          </p>
          <h1 class="text-article-title font-bold wrap-break-word">
            {{ post.title }}
          </h1>
          <p class="mt-5 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
            <time
              class="whitespace-nowrap"
              :datetime="post.date"
            >
              {{ formatDate(post.date) }}
            </time>
            <span class="inline-flex items-center gap-2 whitespace-nowrap">
              <span aria-hidden="true">·</span>
              {{ post.wordCount }} 字
            </span>
            <span
              v-if="post.updated"
              class="inline-flex items-center gap-2 whitespace-nowrap"
            >
              <span aria-hidden="true">·</span>
              更新于 {{ formatDate(post.updated) }}
            </span>
            <span
              v-if="post.readingTime"
              class="inline-flex items-center gap-2 whitespace-nowrap"
            >
              <span aria-hidden="true">·</span>
              约 {{ post.readingTime }} 分钟
            </span>
          </p>
        </header>
        <div class="article-content prose">
          <Content />
        </div>
        <footer
          v-if="post.tags?.length"
          class="mt-14 flex flex-wrap items-baseline gap-x-4 gap-y-2 text-sm text-muted-foreground"
        >
          <span class="font-medium">标签</span>
          <a
            v-for="tag in post.tags"
            :key="tag"
            class="rounded-sm underline decoration-border underline-offset-4 transition-colors hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
            :href="withBase(`/tags/${tagSlug(tag)}`)"
          >
            #{{ tag }}
          </a>
        </footer>
        <GiscusComments />
      </article>
    </div>
    <BackToTop />
    <PhotoPreview />
  </main>
</template>

<style scoped>
.article-content {
  max-width: none;
  overflow-wrap: break-word;
  --tw-prose-body: var(--color-foreground);
  --tw-prose-headings: var(--color-foreground);
  --tw-prose-lead: var(--color-muted-foreground);
  --tw-prose-links: var(--color-foreground);
  --tw-prose-bold: var(--color-foreground);
  --tw-prose-counters: var(--color-muted-foreground);
  --tw-prose-bullets: var(--color-border-strong);
  --tw-prose-hr: var(--color-border);
  --tw-prose-quotes: var(--color-foreground);
  --tw-prose-quote-borders: var(--color-primary);
  --tw-prose-captions: var(--color-muted-foreground);
  --tw-prose-kbd: var(--color-foreground);
  --tw-prose-kbd-shadows: var(--color-border);
  --tw-prose-code: var(--color-foreground);
  --tw-prose-pre-code: var(--color-code-foreground);
  --tw-prose-pre-bg: var(--color-code-background);
  --tw-prose-th-borders: var(--color-border-strong);
  --tw-prose-td-borders: var(--color-border);

  & :deep(h1),
  & :deep(h2),
  & :deep(h3),
  & :deep(h4),
  & :deep(th) {
    scroll-margin-top: calc(var(--spacing) * 24);
  }

  & :deep(h2) {
    position: relative;
    margin-top: calc(var(--spacing) * 12);
    margin-bottom: calc(var(--spacing) * 7);
    font-size: var(--text-article-section);
    font-weight: var(--font-weight-semibold);
    line-height: var(--text-article-section--line-height);
  }

  & :deep(h3) {
    position: relative;
    margin-top: calc(var(--spacing) * 10);
    margin-bottom: calc(var(--spacing) * 5);
    font-size: var(--text-article-subsection);
    font-weight: var(--font-weight-semibold);
    line-height: var(--text-article-subsection--line-height);
  }

  & :deep(p),
  & :deep(li) {
    font-size: var(--text-article-body);
    line-height: var(--text-article-body--line-height);
  }

  & :deep(a) {
    text-underline-offset: calc(var(--spacing) * 1);
  }

  & :deep(a:not(.header-anchor):hover) {
    color: var(--color-primary);
  }

  & :deep(blockquote) {
    border-color: var(--color-primary);
  }

  & :deep(img) {
    border-radius: var(--radius-md);
  }

  & :deep(table) {
    display: block;
    max-width: 100%;
    overflow-x: auto;
    font-size: var(--text-article-body);
    line-height: var(--text-article-body--line-height);
  }

  & :deep(pre) {
    position: relative;
    max-width: 100%;
    overflow-x: auto;
  }

  & :deep(mjx-container) {
    max-width: 100%;
    overflow-x: auto;
  }

  & :deep(.custom-block) {
    margin-block: calc(var(--spacing) * 6);
    padding: calc(var(--spacing) * 4) calc(var(--spacing) * 5);
    border-left-width: calc(var(--spacing) * 1);
    border-radius: var(--radius-md);
    font-size: var(--text-callout);
    line-height: var(--text-callout--line-height);
  }

  & :deep(.custom-block p) {
    margin-block: calc(var(--spacing) * 2);
    font-size: var(--text-callout);
    line-height: var(--text-callout--line-height);
  }

  & :deep(.custom-block-title) {
    margin-block: 0;
    color: currentcolor;
    font-weight: var(--font-weight-semibold);
  }

  & :deep(.custom-block.info),
  & :deep(.custom-block.details) {
    border-color: var(--color-border-strong);
    background-color: var(--color-muted);
  }

  & :deep(.custom-block.note) {
    border-color: var(--color-info);
    background-color: color-mix(in oklab, var(--color-info) 10%, var(--color-transparent));
  }

  & :deep(.custom-block.tip) {
    border-color: var(--color-success);
    background-color: color-mix(in oklab, var(--color-success) 10%, var(--color-transparent));
  }

  & :deep(.custom-block.important) {
    border-color: var(--color-important);
    background-color: color-mix(in oklab, var(--color-important) 10%, var(--color-transparent));
  }

  & :deep(.custom-block.warning) {
    border-color: var(--color-warning);
    background-color: color-mix(in oklab, var(--color-warning) 10%, var(--color-transparent));
  }

  & :deep(.custom-block.danger) {
    border-color: var(--color-destructive);
    background-color: color-mix(in oklab, var(--color-destructive) 10%, var(--color-transparent));
  }

  & :deep(.custom-block.caution) {
    border-color: var(--color-caution);
    background-color: color-mix(in oklab, var(--color-caution) 10%, var(--color-transparent));
  }

  & :deep(.custom-block.details summary) {
    cursor: pointer;
    font-weight: var(--font-weight-semibold);
    user-select: none;
  }

  & :deep(.header-anchor) {
    position: absolute;
    top: 0;
    left: calc(var(--spacing) * -5);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: calc(var(--spacing) * 5);
    height: 100%;
    color: var(--color-border-strong);
    font-weight: var(--font-weight-normal);
    text-decoration: none;
    opacity: 1;
    transition-property: color, opacity;
    transition-duration: var(--default-transition-duration);
    transition-timing-function: var(--default-transition-timing-function);
  }

  & :deep(.header-anchor)::before {
    content: "#";
  }

  & :deep(.header-anchor:focus-visible) {
    color: var(--color-primary);
    opacity: 1;
  }

  & :deep(.vp-code-group) {
    margin-block: calc(var(--spacing) * 6);
    overflow: hidden;
    border-radius: var(--radius-md);
    background-color: var(--color-code-background);
  }

  & :deep(.vp-code-group .blocks > div[class*="language-"]) {
    display: none;
    margin-block: 0;
    border-radius: 0;
  }

  & :deep(.vp-code-group .blocks > div[class*="language-"].active) {
    display: block;
  }

  & :deep(.vp-code-group .tabs) {
    display: flex;
    min-height: calc(var(--spacing) * 12);
    padding-inline: calc(var(--spacing) * 2);
    overflow-x: auto;
    border-bottom: 1px solid var(--color-code-border);
    background-color: var(--color-code-card);
  }

  & :deep(.vp-code-group .tabs input) {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    white-space: nowrap;
    border-width: 0;
    clip: rect(0, 0, 0, 0);
  }

  & :deep(.vp-code-group .tabs label) {
    position: relative;
    padding: calc(var(--spacing) * 3) calc(var(--spacing) * 4);
    color: var(--color-code-muted-foreground);
    font-size: var(--text-sm);
    font-weight: var(--font-weight-medium);
    line-height: var(--text-sm--line-height);
    white-space: nowrap;
    cursor: pointer;
    border-bottom: 2px solid var(--color-transparent);
    transition-property: color, background-color, border-color, text-decoration-color, fill, stroke;
    transition-duration: var(--default-transition-duration);
    transition-timing-function: var(--default-transition-timing-function);
  }

  & :deep(.vp-code-group .tabs label:hover) {
    color: var(--color-code-foreground);
  }

  & :deep(.vp-code-group .tabs input:checked + label) {
    color: var(--color-code-foreground);
    border-color: var(--color-code-accent);
  }

  & :deep(.vp-code-group .tabs input:focus-visible + label) {
    outline: 2px solid var(--color-code-accent);
    outline-offset: calc(var(--spacing) * -1);
  }

  & :deep(:not(pre) > code) {
    padding: calc(var(--spacing) * 0.5) calc(var(--spacing) * 1.5);
    color: var(--color-accent-foreground);
    background-color: var(--color-accent);
    border-radius: var(--radius-sm);
  }

  & :deep(:not(pre) > code)::before,
  & :deep(:not(pre) > code)::after {
    content: none;
  }

  & :deep(div[class*="language-"]) {
    position: relative;
    max-width: 100%;
    margin-block: calc(var(--spacing) * 6);
    overflow: hidden;
    border-radius: var(--radius-md);
    background-color: var(--color-code-background);
  }

  & :deep(div[class*="language-"] .lang) {
    position: absolute;
    top: calc(var(--spacing) * 4);
    left: calc(var(--spacing) * 4);
    z-index: var(--z-index-content);
    color: var(--color-code-muted-foreground);
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    line-height: var(--text-xs--line-height);
  }

  & :deep(div[class*="language-"] .copy) {
    position: absolute;
    top: calc(var(--spacing) * 3);
    right: calc(var(--spacing) * 3);
    z-index: var(--z-index-content);
    width: calc(var(--spacing) * 16);
    height: calc(var(--spacing) * 8);
    color: var(--color-code-card-foreground);
    font-size: var(--text-xs);
    font-weight: var(--font-weight-medium);
    line-height: var(--text-xs--line-height);
    background-color: var(--color-code-card);
    border: 1px solid var(--color-code-border);
    border-radius: var(--radius-md);
  }

  & :deep(div[class*="language-"] .copy)::before {
    content: attr(title);
  }

  & :deep(div[class*="language-"] .copy.copied)::before {
    content: attr(data-copied);
  }

  & :deep(div[class*="language-"] .copy:hover) {
    color: var(--color-code-accent);
    border-color: var(--color-code-accent);
  }

  & :deep(div[class*="language-"] .copy:focus-visible) {
    outline: 2px solid var(--color-code-accent);
  }

  & :deep(div[class*="language-"] .line-numbers-wrapper) {
    position: absolute;
    top: calc(var(--spacing) * 14);
    bottom: 0;
    left: 0;
    width: calc(var(--spacing) * 10);
    color: color-mix(in oklab, var(--color-code-muted-foreground) 75%, var(--color-transparent));
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    line-height: var(--leading-code);
    text-align: center;
    border-right: 1px solid var(--color-code-border);
  }

  & :deep(div[class*="language-"] code) {
    line-height: var(--leading-code);
  }

  & :deep(div[class*="language-"] pre) {
    padding-top: calc(var(--spacing) * 14);
    padding-bottom: calc(var(--spacing) * 4);
    padding-left: calc(var(--spacing) * 14);
    margin: 0;
    border-radius: 0;
  }

  & :deep(code .line) {
    display: inline-block;
    min-width: 100%;
  }

  & :deep(code .line.diff) {
    position: relative;
    transition-property: color, background-color, border-color, text-decoration-color, fill, stroke;
    transition-duration: var(--default-transition-duration);
    transition-timing-function: var(--default-transition-timing-function);
  }

  & :deep(code .line.diff)::before {
    position: absolute;
    left: calc(var(--spacing) * -5);
    font-weight: var(--font-weight-semibold);
  }

  & :deep(code .line.diff.add) {
    background-color: var(--color-code-inserted);
  }

  & :deep(code .line.diff.add)::before {
    color: var(--color-code-inserted-foreground);
    content: "+";
  }

  & :deep(code .line.diff.remove) {
    background-color: var(--color-code-deleted);
  }

  & :deep(code .line.diff.remove)::before {
    color: var(--color-code-deleted-foreground);
    content: "-";
  }

  & :deep(code .line.highlighted) {
    background-color: var(--color-code-highlight);
  }

  & :deep(code .line.highlighted.error) {
    background-color: var(--color-code-error);
  }

  & :deep(code .line.highlighted.warning) {
    background-color: var(--color-code-warning);
  }

  & :deep(.has-focused-lines .line:not(.has-focus)) {
    filter: blur(var(--blur-code));
    opacity: 0.7;
    transition-property: filter, opacity;
    transition-duration: var(--default-transition-duration);
    transition-timing-function: var(--default-transition-timing-function);
  }

  & :deep(div[class*="language-"]:hover .has-focused-lines .line:not(.has-focus)) {
    filter: none;
    opacity: 1;
  }

  @media (min-width: 48rem) {
    & :deep(.header-anchor) {
      opacity: 0;
    }

    & :deep(h2:hover .header-anchor),
    & :deep(h3:hover .header-anchor) {
      color: var(--color-primary);
      opacity: 1;
    }
  }
}
</style>
