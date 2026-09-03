import type { Locator, Page } from "@playwright/test";
import { expect, test } from "@playwright/test";
import sharp from "sharp";

async function expectNoOverflow(page: Page) {
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow).toBeLessThanOrEqual(1);
}

async function saveNonblankScreenshot(page: Page, path: string) {
  const screenshot = await page.screenshot({ path, fullPage: true });
  const stats = await sharp(screenshot).stats();
  expect(screenshot.byteLength).toBeGreaterThan(10_000);
  expect(Math.max(...stats.channels.map(channel => channel.stdev))).toBeGreaterThan(5);
}

async function hasSemanticColor(locator: Locator, property: string, token: string) {
  return locator.evaluate((element, { property, token }) => {
    const probe = document.createElement("span");
    probe.style.setProperty(property, `var(--color-${token})`);
    element.append(probe);
    const expected = getComputedStyle(probe).getPropertyValue(property);
    probe.remove();
    return getComputedStyle(element).getPropertyValue(property) === expected;
  }, { property, token });
}

async function expectSemanticColor(locator: Locator, property: string, token: string) {
  await expect.poll(() => hasSemanticColor(locator, property, token)).toBe(true);
}

interface LivePhotoProbe {
  fetches: string[];
  videoBlobUrls: string[];
  revokedUrls: string[];
}

async function installLivePhotoProbe(page: Page) {
  await page.addInitScript(() => {
    const probe: LivePhotoProbe = { fetches: [], videoBlobUrls: [], revokedUrls: [] };
    Object.assign(window, { __livePhotoProbe: probe });

    const originalFetch = window.fetch.bind(window);
    window.fetch = (input, init) => {
      const url = typeof input === "string"
        ? input
        : input instanceof URL
          ? input.href
          : input.url;
      probe.fetches.push(url);
      return originalFetch(input, init);
    };

    const originalCreateObjectUrl = URL.createObjectURL.bind(URL);
    URL.createObjectURL = (object) => {
      const url = originalCreateObjectUrl(object);
      if (object instanceof Blob && object.type === "video/mp4")
        probe.videoBlobUrls.push(url);
      return url;
    };

    const originalRevokeObjectUrl = URL.revokeObjectURL.bind(URL);
    URL.revokeObjectURL = (url) => {
      probe.revokedUrls.push(url);
      originalRevokeObjectUrl(url);
    };
  });
}

function readLivePhotoProbe(page: Page) {
  return page.evaluate(() => (
    window as typeof window & { __livePhotoProbe: LivePhotoProbe }
  ).__livePhotoProbe);
}

test.describe("公开页面", () => {
  test("不存在的地址统一使用自定义 404 页面", async ({ page }) => {
    const assertNotFoundPage = async () => {
      await expect(page.getByRole("heading", { level: 1, name: "页面没有找到" })).toBeVisible();
      await expect(page.getByText("这个地址可能已经改变，或者内容尚未发布。")).toBeVisible();
      await expect(page.getByRole("link", { name: "返回文章列表" })).toHaveAttribute("href", "/blog");
    };

    await page.goto("/missing-direct-page");
    await assertNotFoundPage();

    await page.goto("/");
    await page.evaluate(() => {
      const link = document.createElement("a");
      link.href = "/missing-client-page";
      document.body.append(link);
      link.click();
    });
    await expect(page).toHaveURL("/missing-client-page");
    await assertNotFoundPage();
  });

  test("LXGW WenKai Lite 从项目本地加载", async ({ page }) => {
    const fontRequests: string[] = [];
    page.on("request", (request) => {
      if (/lxgwwenkai|\.woff2(?:$|\?)/i.test(request.url()))
        fontRequests.push(request.url());
    });

    await page.goto("/");
    await page.evaluate(() => document.fonts.ready);
    await page.evaluate(async () => {
      await Promise.all([
        document.fonts.load("400 16px \"LXGW WenKai Lite\"", "中文"),
        document.fonts.load("500 16px \"LXGW WenKai Lite\"", "中文"),
      ]);
    });

    const pageOrigin = new URL(page.url()).origin;
    expect(await page.locator("link[rel='stylesheet'][href*='lxgw-wenkai-lite']").count()).toBe(0);
    expect(fontRequests.every(url => new URL(url).origin === pageOrigin)).toBe(true);
    expect(fontRequests.some(url => url.includes("cdn.jsdelivr.net"))).toBe(false);
    expect(fontRequests.some(url => /lxgwwenkailite-regular-subset-\d+\.woff2/.test(url))).toBe(true);
    expect(fontRequests.some(url => /lxgwwenkailite-medium-subset-\d+\.woff2/.test(url))).toBe(true);
    expect(await page.evaluate(() => document.fonts.check("400 16px \"LXGW WenKai Lite\""))).toBe(true);
    expect(await page.evaluate(() => document.fonts.check("500 16px \"LXGW WenKai Lite\""))).toBe(true);

    await page.goto("/blog/guide/markdown-extensions");
    await expect(page.getByRole("heading", { level: 1, name: "使用 Markdown 扩展" })).toBeVisible();
    const weights = await page.evaluate(() => {
      const root = document.querySelector<HTMLElement>(".min-h-screen")!;
      const title = document.querySelector<HTMLElement>("article h1")!;
      const section = document.querySelector<HTMLElement>(".article-content h2")!;
      return {
        synthesis: getComputedStyle(root).fontSynthesisWeight,
        title: getComputedStyle(title).fontWeight,
        section: getComputedStyle(section).fontWeight,
      };
    });
    expect(weights).toEqual({ synthesis: "none", title: "500", section: "500" });
  });

  test("首页、列表、分页、标签和归档可浏览", async ({ page }, testInfo) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1, name: "Bean Blog" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "推荐阅读" })).toBeVisible();
    await expect(page.getByRole("banner").getByRole("link", { name: "GitHub" })).toHaveCount(0);
    await expect(page.getByRole("banner").getByRole("link", { name: "RSS" })).toHaveCount(0);
    await expect(page.getByRole("main").getByRole("link", { name: "GitHub" })).toBeVisible();
    await expect(page.getByRole("main").getByRole("link", { name: "RSS" })).toBeVisible();
    const featuredCount = await page.locator("section[aria-labelledby='featured-title'] > ol > li").count();
    expect(featuredCount).toBeGreaterThan(0);
    expect(featuredCount).toBeLessThanOrEqual(5);
    await expectNoOverflow(page);
    await saveNonblankScreenshot(page, testInfo.outputPath("home.png"));

    if (testInfo.project.name === "desktop") {
      const navigation = page.getByRole("navigation", { name: "主导航" });
      await expect(navigation.getByRole("link", { name: "使用手册" })).toHaveAttribute("href", "/blog/guide/getting-started");
      const browse = navigation.getByText("浏览", { exact: true });
      await browse.focus();
      await page.keyboard.press("Enter");
      await expect(navigation.getByRole("link", { name: "标签" })).toBeVisible();
      await page.getByRole("heading", { level: 1, name: "Bean Blog" }).click();
      await expect(navigation.getByRole("link", { name: "标签" })).toBeHidden();
      await browse.click();
      await expect(navigation.getByRole("link", { name: "标签" })).toBeVisible();
      await page.keyboard.press("Enter");
    }

    await page.goto("/blog");
    await expect(page.getByRole("heading", { level: 1, name: "全部文章" })).toBeVisible();
    await expect(page.getByRole("navigation", { name: "文章分页" }).getByRole("link", { name: /下一页/ })).toHaveAttribute("href", "/blog/page/2");

    await page.goto("/blog/page/2");
    await expect(page.getByRole("navigation", { name: "文章分页" }).getByRole("link", { name: /上一页/ })).toHaveAttribute("href", "/blog");

    await page.goto("/tags");
    await expect(page.getByRole("heading", { level: 1, name: "标签" })).toBeVisible();
    await expect(page.getByRole("main").locator("a[href=\"/tags/vitepress\"]")).toBeVisible();

    await page.goto("/archives");
    await expect(page.getByRole("heading", { level: 1, name: "归档" })).toBeVisible();
    await expect(page.getByRole("heading", { level: 2, name: "2026" })).toBeVisible();
  });

  test("页脚内容与不同页面长度下的位置保持一致", async ({ page }) => {
    await page.goto("/missing-footer-layout");

    const footer = page.getByRole("contentinfo");
    await expect(footer).toContainText("Powered by VitePress");
    await expect(footer.getByRole("link", { name: "VitePress" })).toHaveAttribute("href", "https://vitepress.dev/");
    await expect(footer.getByRole("link", { name: "RSS" })).toHaveCount(0);

    const shortPageLayout = await page.evaluate(() => {
      const footer = document.querySelector<HTMLElement>("footer")!;
      const bounds = footer.getBoundingClientRect();
      return {
        documentBottomGap: document.documentElement.scrollHeight - (bounds.bottom + window.scrollY),
        footerBottom: bounds.bottom,
        position: getComputedStyle(footer).position,
        viewportHeight: window.innerHeight,
      };
    });
    expect(shortPageLayout.position).toBe("static");
    expect(Math.abs(shortPageLayout.documentBottomGap)).toBeLessThanOrEqual(1);
    expect(Math.abs(shortPageLayout.footerBottom - shortPageLayout.viewportHeight)).toBeLessThanOrEqual(1);

    await page.goto("/blog/guide/getting-started");
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    const longPageLayout = await page.getByRole("contentinfo").evaluate((footer) => {
      const bounds = footer.getBoundingClientRect();
      return {
        documentBottomGap: document.documentElement.scrollHeight - (bounds.bottom + window.scrollY),
        position: getComputedStyle(footer).position,
      };
    });
    expect(longPageLayout.position).toBe("static");
    expect(Math.abs(longPageLayout.documentBottomGap)).toBeLessThanOrEqual(1);
    expect(Math.abs(longPageLayout.documentBottomGap - shortPageLayout.documentBottomGap)).toBeLessThanOrEqual(1);
  });
});

test.describe("窄屏文章目录", () => {
  test("滚动后可展开目录并跳转到当前章节", async ({ page }, testInfo) => {
    if (testInfo.project.name === "desktop")
      await page.setViewportSize({ width: 1100, height: 700 });

    await page.goto("/blog/guide/markdown-extensions");

    const toc = page.locator("aside[aria-label=\"文章目录\"]");
    const outline = toc.locator("details");
    const trigger = toc.getByTitle("本文目录");
    const navigation = toc.getByRole("navigation", { name: "本文目录" });
    const target = page.locator("#标题锚点与内部链接");
    const targetLink = toc.locator("nav[aria-label=\"本文目录\"] a[href=\"#标题锚点与内部链接\"]");

    await expect(toc).toBeAttached();
    await expect(trigger).toBeVisible();
    await expect(trigger).toHaveClass(/bg-popover\/90/);
    await expectSemanticColor(trigger, "color", "popover-foreground");
    await expect(outline).not.toHaveAttribute("open", "");
    await expect(navigation).toBeHidden();

    const initialLayout = await page.evaluate(() => {
      const main = document.querySelector<HTMLElement>("main.VPDoc")!;
      const article = document.querySelector<HTMLElement>("main.VPDoc article")!;
      const outline = document.querySelector<HTMLElement>("aside[aria-label=\"文章目录\"]")!;
      const details = outline.querySelector<HTMLElement>("details")!;
      return {
        articleOffset: article.getBoundingClientRect().top - main.getBoundingClientRect().top,
        detailsHeight: details.getBoundingClientRect().height,
        outlineHeight: outline.getBoundingClientRect().height,
        position: getComputedStyle(outline).position,
        top: getComputedStyle(outline).top,
      };
    });
    expect(initialLayout.position).toBe("sticky");
    expect(initialLayout.top).toBe("0px");
    expect(initialLayout.outlineHeight).toBe(0);
    expect(initialLayout.detailsHeight).toBe(0);
    expect(initialLayout.articleOffset).toBeLessThanOrEqual(48);

    await page.evaluate(() => window.scrollTo(0, 900));
    await expect(trigger).toBeInViewport();
    expect(await toc.evaluate(element => element.getBoundingClientRect().top)).toBeCloseTo(0, 0);

    await trigger.click();
    await expect(outline).toHaveAttribute("open", "");
    await expect(navigation).toBeVisible();
    await expectSemanticColor(toc.locator("details > div"), "background-color", "popover");
    await expectSemanticColor(toc.locator("details > div"), "color", "popover-foreground");
    await expect(navigation.locator(".outline-link").first()).toHaveCSS("font-size", "14px");
    await expect(toc.locator("details > div")).toHaveCSS("overflow-y", "auto");
    await expectNoOverflow(page);
    await page.screenshot({ path: testInfo.outputPath("narrow-outline-open.png") });

    await targetLink.click();
    await expect.poll(() => decodeURIComponent(new URL(page.url()).hash)).toBe("#标题锚点与内部链接");
    await expect(target).toBeInViewport();
    await expect(outline).not.toHaveAttribute("open", "");
    await expect(targetLink).toHaveClass(/active/);

    await trigger.click();
    await page.keyboard.press("Escape");
    await expect(outline).not.toHaveAttribute("open", "");
    await expect(trigger).toBeFocused();

    await trigger.click();
    await page.mouse.click(2, 100);
    await expect(outline).not.toHaveAttribute("open", "");

    if (testInfo.project.name === "desktop") {
      await page.setViewportSize({ width: 1440, height: 900 });
      await expect(trigger).toBeHidden();
      await expect(outline).toHaveAttribute("open", "");
      await expect(navigation).toBeVisible();
    }
  });
});

test.describe("系列文章导航", () => {
  test("宽屏显示分组、当前文章并通过客户端路由切换", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/blog/guide/markdown-extensions");

    const sidebar = page.getByRole("complementary", { name: "系列文章" });
    const navigation = sidebar.getByRole("navigation", { name: "系列文章" });
    const current = navigation.getByRole("link", { name: "使用 Markdown 扩展" });
    const next = navigation.getByRole("link", { name: "开始使用 Bean Blog" });

    await expect(sidebar).toBeVisible();
    await expect(sidebar.getByText("专题阅读", { exact: true })).toHaveCount(0);
    await expect(sidebar.getByText("按篇章连续阅读", { exact: true })).toHaveCount(0);
    await expect(sidebar.getByText("系列名称", { exact: true })).toHaveCount(0);
    await expect(sidebar.getByText("正在阅读", { exact: true })).toHaveCount(0);
    await expect(navigation.getByText("入门与配置", { exact: true })).toBeVisible();
    await expect(navigation.getByText("内容写作", { exact: true })).toBeVisible();
    await expect(navigation.getByText("发布与维护", { exact: true })).toBeVisible();
    await expect(navigation.getByText("Bean Blog 使用手册", { exact: true })).toHaveCount(0);
    await expect(navigation.locator("[data-series-name]")).toHaveText([
      "入门与配置",
      "内容写作",
      "发布与维护",
    ]);
    await expect(navigation.locator("[data-series-chapter]")).toHaveCount(0);
    await expect(current).toHaveAttribute("aria-current", "page");
    await expectSemanticColor(current, "background-color", "accent");
    await expectSemanticColor(current.locator("[data-series-title]"), "color", "accent-foreground");
    await expect(navigation.locator("[data-series-title]").first()).toHaveCSS("font-size", "14px");
    const toc = page.getByRole("complementary", { name: "文章目录" });
    await expect(toc).toBeVisible();
    await expect(toc.locator("[data-series-entry]")).toHaveCount(0);

    const layout = await page.evaluate(() => {
      const series = document.querySelector<HTMLElement>("aside[aria-label='系列文章']")!;
      const article = document.querySelector<HTMLElement>("main.VPDoc article")!;
      const seriesBounds = series.getBoundingClientRect();
      const articleBounds = article.getBoundingClientRect();
      return {
        articleCenterDelta: Math.abs(articleBounds.left + articleBounds.width / 2 - window.innerWidth / 2),
        seriesGap: articleBounds.left - seriesBounds.right,
        seriesTop: seriesBounds.top,
        tocTop: document.querySelector<HTMLElement>("aside[aria-label='文章目录']")!.getBoundingClientRect().top,
      };
    });
    expect(layout.articleCenterDelta).toBeLessThanOrEqual(1);
    expect(layout.seriesGap).toBeGreaterThanOrEqual(20);
    expect(layout.seriesTop).toBeGreaterThan(0);
    expect(layout.tocTop).toBeCloseTo(layout.seriesTop, 0);

    await page.evaluate(() => window.scrollTo(0, 320));
    const scrolledSideRailTop = await page.evaluate(() => ({
      series: document.querySelector<HTMLElement>("aside[aria-label='系列文章']")!.getBoundingClientRect().top,
      toc: document.querySelector<HTMLElement>("aside[aria-label='文章目录']")!.getBoundingClientRect().top,
    }));
    expect(scrolledSideRailTop.series).toBeCloseTo(layout.seriesTop, 0);
    expect(scrolledSideRailTop.toc).toBeCloseTo(layout.tocTop, 0);

    await page.evaluate(() => Object.assign(window, { __seriesNavigationMarker: true }));
    await next.click();
    await expect(page).toHaveURL("/blog/guide/getting-started");
    const navigationMarker = await page.evaluate(
      () => (window as typeof window & { __seriesNavigationMarker?: boolean }).__seriesNavigationMarker,
    );
    expect(navigationMarker).toBe(true);
    await expect(next).toHaveAttribute("aria-current", "page");
    await expectSemanticColor(next, "background-color", "accent");
    await expectSemanticColor(next.locator("[data-series-title]"), "color", "accent-foreground");
    await expect(current).not.toHaveAttribute("aria-current", "page");

    await page.goto("/blog/guide/image-layouts");
    await expect(navigation.getByText("内容写作", { exact: true })).toBeVisible();
    await expect(navigation.locator("[data-series-title]")).toHaveText([
      "开始使用 Bean Blog",
      "配置站点信息",
      "创建和组织文章",
      "使用 Markdown 扩展",
      "编排多图布局",
      "使用 Live Photo",
      "部署与发布",
    ]);
    await expect(navigation.getByText("入门与配置", { exact: true })).toBeVisible();

    await page.goto("/blog/guide/draft-preview");
    await expect(page.getByRole("complementary", { name: "系列文章" })).toHaveCount(0);
  });

  test("窄屏图标不占正文高度并可关闭面板", async ({ page }) => {
    await page.setViewportSize({ width: 412, height: 700 });
    await page.goto("/blog/guide/markdown-extensions");

    const sidebar = page.getByRole("complementary", { name: "系列文章" });
    const trigger = sidebar.getByTitle("系列文章");
    const navigation = sidebar.getByRole("navigation", { name: "系列文章" });

    await expect(trigger).toBeVisible();
    await expect(trigger).toHaveClass(/bg-popover\/90/);
    await expectSemanticColor(trigger, "color", "popover-foreground");
    await expect(navigation).toBeHidden();
    expect(await sidebar.evaluate(element => element.getBoundingClientRect().height)).toBe(0);

    await trigger.click();
    await expect(trigger).toHaveAttribute("aria-expanded", "true");
    await expect(navigation).toBeVisible();
    await expectSemanticColor(sidebar.locator("#series-sidebar-navigation"), "background-color", "popover");
    await expectSemanticColor(sidebar.locator("#series-sidebar-navigation"), "color", "popover-foreground");
    await expect(navigation.locator("[data-series-name]")).toHaveText([
      "入门与配置",
      "内容写作",
      "发布与维护",
    ]);
    await expect(navigation.locator("[data-series-chapter]")).toHaveCount(0);
    await expectSemanticColor(navigation.getByRole("link", { name: "使用 Markdown 扩展" }).locator("[data-series-title]"), "color", "accent-foreground");
    await expect(navigation.locator("[data-series-title]").first()).toHaveCSS("font-size", "14px");
    await expect(navigation.getByText("正在阅读", { exact: true })).toHaveCount(0);
    await expect(sidebar.locator("#series-sidebar-navigation")).toHaveCSS("overflow-y", "auto");
    await expectNoOverflow(page);

    await page.keyboard.press("Escape");
    await expect(navigation).toBeHidden();
    await expect(trigger).toBeFocused();

    await trigger.click();
    await page.mouse.click(411, 250);
    await expect(navigation).toBeHidden();
  });
});

test.describe("文章排版", () => {
  test("表格使用正文字号且行内代码不显示反引号", async ({ page }) => {
    await page.goto("/blog/guide/markdown-extensions");
    await expect(page.locator(".article-content")).toBeVisible();

    const paragraph = page.locator(".article-content p").first();
    const table = page.locator(".article-content table");
    const inlineCode = page.locator(".article-content p code").first();
    const fencedCode = page.locator(".article-content pre code").first();

    const [paragraphFontSize, tableFontSize] = await Promise.all([
      paragraph.evaluate(element => getComputedStyle(element).fontSize),
      table.evaluate(element => getComputedStyle(element).fontSize),
    ]);
    expect(tableFontSize).toBe(paragraphFontSize);
    await expectSemanticColor(inlineCode, "background-color", "accent");
    await expectSemanticColor(inlineCode, "color", "accent-foreground");
    expect(await inlineCode.evaluate(element => ({
      after: getComputedStyle(element, "::after").content,
      before: getComputedStyle(element, "::before").content,
    }))).toEqual({ after: "none", before: "none" });
    expect(await hasSemanticColor(fencedCode, "background-color", "accent")).toBe(false);
  });
});

test.describe("文章交互", () => {
  test.skip(({ isMobile }) => isMobile, "宽屏目录行为在 desktop project 验证");

  test("页末 hash 与目录高亮一致且不增加整屏空白", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/blog/guide/markdown-extensions#标题锚点与内部链接");

    const toc = page.getByRole("complementary", { name: "文章目录" });
    const target = page.locator("#标题锚点与内部链接");
    const targetLink = toc.getByRole("link", { name: "标题锚点与内部链接" });
    await expect(target).toBeInViewport();
    await expect(targetLink).toHaveClass(/active/);
    await expect(toc.getByRole("link", { name: "普通图片" })).not.toHaveClass(/active/);

    const layout = await page.evaluate(() => {
      const main = document.querySelector<HTMLElement>("main.VPDoc");
      const article = document.querySelector<HTMLElement>("main.VPDoc article");
      const articleBottom = article!.getBoundingClientRect().bottom + window.scrollY;
      return {
        paddingBottom: Number.parseFloat(getComputedStyle(main!).paddingBottom),
        trailingSpace: document.documentElement.scrollHeight - articleBottom,
      };
    });
    expect(layout.paddingBottom).toBeLessThanOrEqual(64);
    expect(layout.trailingSpace).toBeLessThanOrEqual(192);
  });

  test("增强文章、搜索、主题、目录、复制和回顶", async ({ page, context }, testInfo) => {
    const pageErrors: string[] = [];
    page.on("pageerror", error => pageErrors.push(error.message));
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await page.goto("/blog/guide/markdown-extensions");
    await expect(page.getByRole("heading", { level: 1, name: "使用 Markdown 扩展" })).toBeVisible();
    const toc = page.getByRole("complementary", { name: "文章目录" });
    await expect(toc).toBeVisible();
    await expect(toc.locator(".outline-link.active")).toHaveCount(0);
    await expect(toc.locator(".outline-link").first()).toHaveCSS("font-size", "14px");

    const readingLayout = await page.evaluate(() => {
      const article = document.querySelector<HTMLElement>("main.VPDoc article")!;
      const content = document.querySelector<HTMLElement>(".article-content")!;
      const paragraph = content.querySelector<HTMLElement>("p")!;
      const outline = document.querySelector<HTMLElement>("aside[aria-label=\"文章目录\"]")!;
      const articleBounds = article.getBoundingClientRect();
      const contentBounds = content.getBoundingClientRect();
      const outlineBounds = outline.getBoundingClientRect();
      const paragraphStyle = getComputedStyle(paragraph);
      return {
        centerDelta: Math.abs(articleBounds.left + articleBounds.width / 2 - window.innerWidth / 2),
        contentTop: contentBounds.top,
        fontSize: Number.parseFloat(paragraphStyle.fontSize),
        lineHeight: Number.parseFloat(paragraphStyle.lineHeight),
        outlineGap: outlineBounds.left - articleBounds.right,
      };
    });
    expect(readingLayout.centerDelta).toBeLessThanOrEqual(1);
    expect(readingLayout.contentTop).toBeLessThan(320);
    expect(readingLayout.fontSize).toBeCloseTo(17.6, 1);
    expect(readingLayout.lineHeight).toBeCloseTo(32, 1);
    expect(readingLayout.outlineGap).toBeGreaterThanOrEqual(20);

    const formulas = page.locator("mjx-container");
    await expect(formulas).toHaveCount(2);
    await expect(formulas.first()).toBeVisible();
    const formulaLayout = await formulas.evaluateAll(containers => containers.map((container) => {
      const svg = container.querySelector("svg");
      const bounds = svg?.getBoundingClientRect();
      return {
        hasViewBox: svg?.getAttributeNames().includes("viewBox") ?? false,
        width: bounds?.width ?? 0,
        height: bounds?.height ?? 0,
      };
    }));
    expect(formulaLayout.every(({ hasViewBox }) => hasViewBox)).toBe(true);
    const formulasFit = formulaLayout.every(
      ({ width, height }) => width > 0 && width < 700 && height > 0 && height < 100,
    );
    expect(formulasFit).toBe(true);
    await expectNoOverflow(page);

    const copy = page.getByRole("button", { name: "复制代码" }).first();
    await expect(copy).toBeVisible();
    await copy.focus();
    await page.keyboard.press("Enter");
    await expect.poll(() => page.evaluate(() => navigator.clipboard.readText())).toContain("title: string");

    const mathHeading = page.locator(".article-content h2").filter({ hasText: "数学公式" });
    const headingAnchor = mathHeading.locator(".header-anchor");
    await mathHeading.hover();
    await expect(headingAnchor).toHaveCSS("opacity", "1");
    expect(await headingAnchor.evaluate(anchor => getComputedStyle(anchor, "::before").content)).toContain("#");
    await headingAnchor.focus();
    await page.keyboard.press("Enter");
    await expect.poll(() => page.evaluate(() => decodeURIComponent(location.hash))).toBe("#数学公式");
    const headingTop = await mathHeading.evaluate(heading => heading.getBoundingClientRect().top);
    expect(headingTop).toBeGreaterThanOrEqual(90);
    expect(headingTop).toBeLessThanOrEqual(102);
    const remainingScrollDistance = await page.evaluate(
      () => document.documentElement.scrollHeight - window.innerHeight - window.scrollY,
    );
    expect(remainingScrollDistance).toBeGreaterThan(1);
    await expect(toc.getByRole("link", { name: "数学公式" })).toHaveClass(/active/);

    const predictableUrlLink = toc.getByRole("link", { name: "标题锚点与内部链接" });
    await predictableUrlLink.focus();
    await page.keyboard.press("Enter");
    await expect.poll(() => page.evaluate(() => decodeURIComponent(location.hash))).toBe("#标题锚点与内部链接");
    await expect(predictableUrlLink).toHaveClass(/active/);
    await expect(toc.getByRole("link", { name: "普通图片" })).not.toHaveClass(/active/);

    const articleMainPadding = await page.locator("main.VPDoc").evaluate(main => Number.parseFloat(getComputedStyle(main).paddingBottom));
    expect(articleMainPadding).toBeLessThanOrEqual(64);

    const finalTocLink = toc.getByRole("link", { name: "普通图片" });
    await finalTocLink.focus();
    await page.keyboard.press("Enter");
    await expect.poll(() => page.evaluate(() => decodeURIComponent(location.hash))).toBe("#普通图片");
    await expect(finalTocLink).toHaveClass(/active/);
    expect(await toc.evaluate(element => element.scrollHeight - element.clientHeight)).toBeLessThanOrEqual(1);

    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    const backToTop = page.getByRole("button", { name: "返回顶部" });
    await expect(backToTop).toBeVisible();
    await backToTop.focus();
    await page.keyboard.press("Enter");
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeLessThan(12);

    const searchButton = page.getByRole("button", { name: "搜索文章" });
    await searchButton.focus();
    await page.keyboard.press("Enter");
    const search = page.getByRole("searchbox", { name: "搜索文章" });
    await expect(search).toBeFocused();
    await search.fill("站点配置");
    await expect(page.getByRole("dialog", { name: "搜索文章" }).getByRole("link", { name: /配置站点信息/ })).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(searchButton).toBeFocused();

    const theme = page.getByRole("button", { name: /切换到.*主题/ });
    await theme.focus();
    await page.keyboard.press("Enter");
    await expect(page.locator("html")).toHaveClass(/dark/);
    await expectSemanticColor(page.locator("#app > div"), "background-color", "background");
    await page.reload();
    await expect(page.locator("html")).toHaveClass(/dark/);
    await expectSemanticColor(page.locator("#app > div"), "background-color", "background");
    await saveNonblankScreenshot(page, testInfo.outputPath("article-dark.png"));
    expect(pageErrors).toEqual([]);
  });
});

test.describe("Markdown 图片布局", () => {
  test("六种布局在桌面与移动视口保持顺序和比例", async ({ page }, testInfo) => {
    await page.goto("/blog/guide/image-layouts");
    const grids = page.locator("[data-image-grid]");
    await expect(grids).toHaveCount(6);
    await expectNoOverflow(page);

    for (const mode of ["landscape", "portrait", "r73", "r37", "r64", "r46"]) {
      const grid = page.locator(`[data-image-grid="${mode}"]`);
      await expect(grid).toBeVisible();
      await expect(grid.locator("img").first()).toHaveAttribute("loading", "lazy");
      await expect(grid.locator("img").first()).not.toHaveAttribute("alt", "");
    }

    const r73Items = page.locator("[data-image-grid=\"r73\"] > p");
    const boxes = await r73Items.evaluateAll(items => items.map((item) => {
      const bounds = item.getBoundingClientRect();
      return {
        top: bounds.top,
        right: bounds.right,
        bottom: bounds.bottom,
        width: bounds.width,
        height: bounds.height,
      };
    }));
    const landscapeBoxes = await page.locator("[data-image-grid=\"landscape\"] > p").evaluateAll(items => (
      items.map((item) => {
        const bounds = item.getBoundingClientRect();
        return { top: bounds.top, bottom: bounds.bottom, left: bounds.left, width: bounds.width };
      })
    ));
    expect(landscapeBoxes).toHaveLength(4);

    if (testInfo.project.name === "desktop") {
      expect(boxes[0].width / boxes[1].width).toBeGreaterThan(2);
      expect(Math.abs(boxes[0].height - boxes[1].height)).toBeLessThanOrEqual(2);
      expect(Math.abs(landscapeBoxes[0].top - landscapeBoxes[1].top)).toBeLessThanOrEqual(2);
      expect(Math.abs(landscapeBoxes[2].top - landscapeBoxes[3].top)).toBeLessThanOrEqual(2);
      expect(landscapeBoxes[2].top).toBeGreaterThanOrEqual(landscapeBoxes[0].bottom);
      expect(Math.abs(landscapeBoxes[0].width - landscapeBoxes[2].width)).toBeLessThanOrEqual(2);
    }
    else {
      expect(Math.abs(boxes[0].width - boxes[1].width)).toBeLessThanOrEqual(2);
      expect(boxes[1].top).toBeGreaterThanOrEqual(boxes[0].bottom);
      for (let index = 1; index < landscapeBoxes.length; index += 1) {
        expect(landscapeBoxes[index].top).toBeGreaterThanOrEqual(landscapeBoxes[index - 1].bottom);
      }
    }
  });
});

test.describe("照片预览", () => {
  test("frontmatter 封面渐隐衔接标题并可打开预览", async ({ page }) => {
    await page.goto("/blog/guide/writing-articles");

    const cover = page.getByRole("button", { name: "预览图片：创建和组织文章 封面" });
    await expect(cover).toBeVisible();
    await expect(cover).toHaveAttribute("src", /\/media\/live-photo-sample-poster\.png$/);
    const bounds = await cover.boundingBox();
    expect(bounds).not.toBeNull();
    expect(bounds!.height).toBeLessThanOrEqual(288);
    await expect(cover).toHaveCSS("border-width", "0px");
    await expect(cover).toHaveCSS("border-bottom-left-radius", "0px");
    await expect(cover).toHaveCSS("border-bottom-right-radius", "0px");
    const fade = page.locator("[data-article-cover-fade]");
    await expect(fade).toBeVisible();
    const fadeBackground = await fade.evaluate(element => getComputedStyle(element).backgroundImage);
    expect(fadeBackground).toContain("linear-gradient");
    const titleBounds = await page.getByRole("heading", { level: 1, name: "创建和组织文章" }).boundingBox();
    expect(titleBounds).not.toBeNull();
    expect(titleBounds!.y).toBeLessThan(bounds!.y + bounds!.height);
    expect(titleBounds!.y + titleBounds!.height).toBeGreaterThan(bounds!.y + bounds!.height);

    await cover.click();
    const dialog = page.getByRole("dialog", { name: "照片预览" });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole("img", { name: "创建和组织文章 封面" })).toHaveAttribute("src", /\/media\/live-photo-sample-poster\.png$/);
    await dialog.getByRole("button", { name: "关闭照片预览" }).click();
    await expect(cover).toBeFocused();
  });

  test("普通图片与 image-grid 默认显示纯图并恢复触发点焦点", async ({ page }, testInfo) => {
    await page.goto("/blog/guide/image-layouts");

    await page.getByRole("button", { name: "搜索文章" }).click();
    const searchDialog = page.getByRole("dialog", { name: "搜索文章" });
    await expect(searchDialog).toBeVisible();
    const searchMask = await searchDialog.evaluate(element => getComputedStyle(element, "::backdrop").backgroundColor);
    await page.keyboard.press("Escape");

    const ordinary = page.getByRole("button", { name: "预览图片：海边的横向风景" });
    await ordinary.click();
    const dialog = page.getByRole("dialog", { name: "照片预览" });
    await expect(dialog).toBeVisible();
    await expectSemanticColor(dialog, "background-color", "overlay");
    expect(await dialog.evaluate(element => getComputedStyle(element).backgroundColor)).toBe(searchMask);
    await expectSemanticColor(dialog, "color", "overlay-foreground");
    await expect(dialog).toHaveClass(/backdrop:bg-transparent/);
    await expect(dialog.getByRole("img", { name: "海边的横向风景" })).toBeVisible();
    await expect(dialog.locator("[data-photo-preview-inspector]")).toHaveCount(0);
    await expect(page.locator("html")).toHaveClass(/overflow-hidden/);
    const toolbar = dialog.locator("[data-photo-preview-toolbar]");
    await expect(toolbar).toBeVisible();
    await expect(toolbar).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
    await expect(toolbar).toHaveCSS("border-top-width", "0px");
    await expect(toolbar).toHaveCSS("box-shadow", "none");
    const close = dialog.getByRole("button", { name: "关闭照片预览" });
    await expect(close).toBeVisible();
    await expect(close).toHaveClass(/text-overlay-foreground\/70/);
    if (testInfo.project.name === "desktop") {
      await close.hover();
      await expect(close).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
      await expectSemanticColor(close, "color", "overlay-foreground");
      await page.mouse.move(0, 0);
    }
    const [dialogBounds, toolbarBounds, closeBounds] = await Promise.all([
      dialog.boundingBox(),
      toolbar.boundingBox(),
      close.boundingBox(),
    ]);
    expect(toolbarBounds).not.toBeNull();
    expect(closeBounds).not.toBeNull();
    expect(dialogBounds).not.toBeNull();
    expect(toolbarBounds!.width).toBeLessThanOrEqual(76);
    expect(toolbarBounds!.height).toBeLessThanOrEqual(36);
    expect(closeBounds!.width).toBeLessThanOrEqual(36);
    expect(closeBounds!.height).toBeLessThanOrEqual(36);
    expect(closeBounds!.x + closeBounds!.width).toBeGreaterThanOrEqual(dialogBounds!.x + dialogBounds!.width - 16);

    if (testInfo.project.name === "desktop") {
      const photo = dialog.getByRole("img", { name: "海边的横向风景" });
      const bounds = await photo.boundingBox();
      expect(bounds).not.toBeNull();
      await page.mouse.move(bounds!.x + bounds!.width / 2, bounds!.y + bounds!.height / 2);
      await page.mouse.wheel(0, -720);
      await expect(dialog.getByRole("button", { name: "重置照片缩放" })).toBeVisible();
      const transformAfterZoom = await photo.evaluate(image => image.style.transform);
      expect(transformAfterZoom).toContain("scale(");

      await page.mouse.down();
      await page.mouse.move(bounds!.x + bounds!.width / 2 + 80, bounds!.y + bounds!.height / 2 + 60);
      await page.mouse.up();
      const transformAfterDrag = await photo.evaluate(image => image.style.transform);
      expect(transformAfterDrag).not.toBe(transformAfterZoom);

      await dialog.getByRole("button", { name: "重置照片缩放" }).click();
      await expect(dialog.getByRole("button", { name: "重置照片缩放" })).toHaveCount(0);
      expect(await photo.evaluate(image => image.style.transform)).toBe("");

      await page.mouse.wheel(0, -720);
      await page.mouse.dblclick(bounds!.x + bounds!.width / 2, bounds!.y + bounds!.height / 2);
      expect(await photo.evaluate(image => image.style.transform)).toBe("");
    }

    const inspectorToggle = dialog.getByRole("button", { name: "显示拍摄信息" });
    await expect(inspectorToggle.locator("[data-photo-inspector-icon-fill]")).toHaveCount(0);
    await expect(inspectorToggle.locator("[data-photo-inspector-icon] svg")).toHaveClass(/text-overlay-foreground\/70/);
    await inspectorToggle.click();
    const inspector = dialog.getByRole("complementary", { name: "照片拍摄信息" });
    await expect(inspector).toBeVisible();
    await expectSemanticColor(inspector, "background-color", "overlay");
    await expectSemanticColor(inspector, "color", "overlay-foreground");
    await expect(inspector).not.toHaveCSS("backdrop-filter", "none");
    const activeInspectorToggle = dialog.getByRole("button", { name: "隐藏拍摄信息" });
    await expectSemanticColor(activeInspectorToggle.locator("[data-photo-inspector-icon-fill]"), "fill", "primary");
    await expectSemanticColor(activeInspectorToggle.locator("[data-photo-inspector-icon] svg").last(), "color", "primary-foreground");
    await activeInspectorToggle.click();
    await expect(dialog.locator("[data-photo-preview-inspector]")).toHaveCount(0);

    await page.keyboard.press("Escape");
    await expect(dialog).not.toBeVisible();
    await expect(ordinary).toBeFocused();
    await expect(page.locator("html")).not.toHaveClass(/overflow-hidden/);

    const gridImage = page.getByRole("button", { name: "预览图片：建筑与天空的横向风景" });
    await gridImage.focus();
    await page.keyboard.press("Enter");
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole("img", { name: "建筑与天空的横向风景" })).toHaveAttribute("src", /\/media\/live-photo-sample-poster\.png$/);
    await dialog.getByRole("button", { name: "关闭照片预览" }).click();
    await expect(gridImage).toBeFocused();
    await expectNoOverflow(page);
  });

  test("Live Photo 首帧按需读取真实 EXIF 且详情布局响应视口", async ({ page }, testInfo) => {
    const metadataRequests: string[] = [];
    page.on("request", (request) => {
      if (request.resourceType() === "fetch" && request.url().includes("/live-images/android-motion-photo.jpg"))
        metadataRequests.push(request.url());
    });

    await page.goto("/blog/guide/live-photo");
    const poster = page.getByRole("button", { name: "预览图片：Android Motion Photo 演示" }).first();
    await poster.click();
    const dialog = page.getByRole("dialog", { name: "照片预览" });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole("img", { name: "Android Motion Photo 演示" })).toBeVisible();
    expect(metadataRequests).toHaveLength(0);

    await dialog.getByRole("button", { name: "显示拍摄信息" }).click();
    const inspector = dialog.getByRole("complementary", { name: "照片拍摄信息" });
    await expect(inspector).toBeVisible();
    await expect.poll(() => metadataRequests.length).toBe(1);
    await expect(inspector.getByText("samsung SM-N9860")).toBeVisible();
    await expect(inspector.getByText("2992 × 2992")).toBeVisible();
    await expect(inspector.getByText("f/1.8")).toBeVisible();
    await expect(inspector.getByText("1/50 秒")).toBeVisible();
    await expect(inspector.getByText("200", { exact: true })).toBeVisible();
    await expect(inspector).not.toContainText(/GPS|经度|纬度/);

    const layout = await dialog.evaluate((element) => {
      const stage = element.querySelector<HTMLElement>("[data-photo-preview-stage]")!;
      const details = element.querySelector<HTMLElement>("[data-photo-preview-inspector]")!;
      const stageBounds = stage.getBoundingClientRect();
      const detailsBounds = details.getBoundingClientRect();
      return {
        stageRight: stageBounds.right,
        stageBottom: stageBounds.bottom,
        detailsLeft: detailsBounds.left,
        detailsTop: detailsBounds.top,
        scrollWidth: element.scrollWidth,
        clientWidth: element.clientWidth,
      };
    });
    expect(layout.scrollWidth).toBeLessThanOrEqual(layout.clientWidth);
    if (testInfo.project.name === "desktop")
      expect(layout.detailsLeft).toBeGreaterThanOrEqual(layout.stageRight - 1);
    else
      expect(layout.detailsTop).toBeGreaterThanOrEqual(layout.stageBottom - 1);

    await page.keyboard.press("Escape");
    await expect(dialog).not.toBeVisible();
    await expect(poster).toBeFocused();
    await expect(page.getByRole("button", { name: "播放 Live Photo：Android Motion Photo 演示" }).first()).toBeVisible();
  });

  test("Live Photo 可在照片预览内按需播放并释放 Android Blob", async ({ page }) => {
    await installLivePhotoProbe(page);
    await page.goto("/blog/guide/live-photo");

    const dialog = page.getByRole("dialog", { name: "照片预览" });
    const mp4Poster = page.getByRole("button", { name: "预览图片：独立 MP4 的静态首帧" });
    await mp4Poster.click();
    const mp4Play = dialog.getByRole("button", { name: "播放 Live Photo：独立 MP4 的静态首帧" });
    await mp4Play.click();
    const mp4Video = dialog.locator("video");
    await expect(mp4Video).toBeVisible();
    await expect(mp4Video).not.toHaveAttribute("controls", "");
    await expect.poll(() => mp4Video.evaluate(element => !(element as HTMLVideoElement).paused)).toBe(true);
    await expect.poll(() => dialog.evaluate((element) => {
      const video = element.querySelector("video")?.getBoundingClientRect();
      const control = element.querySelector<HTMLButtonElement>("button[aria-label='停止 Live Photo']")?.getBoundingClientRect();
      return Boolean(video && control
        && control.left >= video.left
        && control.top >= video.top
        && control.right <= video.right
        && control.bottom <= video.bottom);
    })).toBe(true);
    await dialog.getByRole("button", { name: "显示拍摄信息" }).click();
    await expect.poll(() => dialog.evaluate((element) => {
      const video = element.querySelector("video")?.getBoundingClientRect();
      const control = element.querySelector<HTMLButtonElement>("button[aria-label='停止 Live Photo']")?.getBoundingClientRect();
      return Boolean(video && control
        && control.left >= video.left
        && control.top >= video.top
        && control.right <= video.right
        && control.bottom <= video.bottom);
    })).toBe(true);
    await dialog.getByRole("button", { name: "隐藏拍摄信息" }).click();
    await dialog.getByRole("button", { name: "停止 Live Photo" }).click();
    await expect(mp4Video).toHaveCount(0);
    await dialog.getByRole("button", { name: "关闭照片预览" }).click();

    const androidFetchesBeforePlayback = (await readLivePhotoProbe(page)).fetches.filter(
      url => url.includes("/live-images/android-motion-photo.jpg"),
    ).length;
    const androidPoster = page.getByRole("button", { name: "预览图片：Android Motion Photo 演示" }).first();
    await androidPoster.click();
    expect((await readLivePhotoProbe(page)).fetches.filter(url => url.includes("/live-images/android-motion-photo.jpg")))
      .toHaveLength(androidFetchesBeforePlayback);

    const androidPlay = dialog.getByRole("button", { name: "播放 Live Photo：Android Motion Photo 演示" });
    await androidPlay.click();
    const androidVideo = dialog.locator("video");
    await expect(androidVideo).toBeVisible();
    await expect(androidVideo).toHaveAttribute("src", /^blob:/);
    await expect(androidVideo).not.toHaveAttribute("controls", "");
    await expect.poll(() => androidVideo.evaluate(element => !(element as HTMLVideoElement).paused)).toBe(true);

    const firstSource = await androidVideo.getAttribute("src");
    let probe = await readLivePhotoProbe(page);
    expect(probe.fetches.filter(url => url.includes("/live-images/android-motion-photo.jpg")))
      .toHaveLength(androidFetchesBeforePlayback + 1);

    await dialog.getByRole("button", { name: "停止 Live Photo" }).click();
    await expect(androidVideo).toHaveCount(0);
    await androidPlay.click();
    await expect(androidVideo).toHaveAttribute("src", firstSource!);
    probe = await readLivePhotoProbe(page);
    expect(probe.fetches.filter(url => url.includes("/live-images/android-motion-photo.jpg")))
      .toHaveLength(androidFetchesBeforePlayback + 1);

    await dialog.getByRole("button", { name: "关闭照片预览" }).click();
    await expect(dialog).not.toBeVisible();
    await expect.poll(async () => (await readLivePhotoProbe(page)).revokedUrls).toContain(firstSource);
  });
});

test.describe("VitePress Markdown 扩展", () => {
  test("官方容器、代码组、代码行状态与图片懒加载可用", async ({ page }) => {
    const pageErrors: string[] = [];
    page.on("pageerror", error => pageErrors.push(error.message));
    await page.goto("/blog/guide/markdown-extensions");

    for (const type of ["info", "tip", "warning", "danger", "details"]) {
      const current = page.locator(`.article-content .custom-block.${type}:not(.github-alert)`).first();
      await expect(current).toBeVisible();
      await expect(current).toHaveCSS("border-left-width", "4px");
      expect(await current.evaluate(element => getComputedStyle(element).backgroundColor)).not.toBe("rgba(0, 0, 0, 0)");
    }

    const defaultTitles = {
      info: "信息",
      tip: "提示",
      warning: "警告",
      danger: "危险",
    };
    for (const [type, title] of Object.entries(defaultTitles)) {
      await expect(
        page.locator(`.article-content .custom-block.${type}:not(.github-alert)`).first().locator(".custom-block-title"),
      ).toHaveText(title);
    }

    const details = page.locator(".article-content details.custom-block.details").first();
    await expect(details.locator("summary")).toHaveText("详细信息");
    await expect(details.getByText("这是浏览器原生的可展开内容，默认保持收起。")).toBeHidden();
    await details.locator("summary").click();
    await expect(details).toHaveAttribute("open", "");
    await expect(details.getByText("这是浏览器原生的可展开内容，默认保持收起。")).toBeVisible();

    await expect(page.locator(".article-content .custom-block.danger:not(.github-alert)").nth(1).locator(".custom-block-title")).toHaveText("停止");
    await expect(page.locator(".article-content details.custom-block.details").nth(1).locator("summary")).toHaveText("点击查看代码");

    for (const type of ["note", "tip", "important", "warning", "caution"]) {
      const alert = page.locator(`.article-content .github-alert.${type}`);
      await expect(alert).toBeVisible();
      await expect(alert).toHaveCSS("border-left-width", "4px");
    }

    const container = page.locator(".article-content .custom-block.tip:not(.github-alert)").first();

    const group = page.locator(".article-content .vp-code-group");
    const pnpm = group.getByRole("radio", { name: "pnpm", exact: true });
    const npm = group.getByRole("radio", { name: "npm", exact: true });
    const blocks = group.locator(".blocks > div");
    await expect(pnpm).toBeChecked();
    await expect(blocks.nth(0)).toBeVisible();
    await expect(blocks.nth(1)).toBeHidden();

    await group.locator("label[data-title=\"npm\"]").click();
    await expect(npm).toBeChecked();
    await expect(blocks.nth(0)).toBeHidden();
    await expect(blocks.nth(1)).toBeVisible();

    const highlighted = page.locator(".article-content code .line.highlighted").first();
    const focused = page.locator(".article-content .has-focused-lines .line:not(.has-focus)").first();
    const diffAdd = page.locator(".article-content code .line.diff.add");
    const error = page.locator(".article-content code .line.highlighted.error");
    const warning = page.locator(".article-content code .line.highlighted.warning");
    const stateBlock = page.locator(".article-content div[class*='language-']:has(pre.has-focused-lines)");
    await expect(highlighted).toBeVisible();
    await expect(diffAdd).toBeVisible();
    await expect(error).toBeVisible();
    await expect(warning).toBeVisible();
    await expect(focused).toHaveCSS("opacity", "0.7");
    await expect(stateBlock.locator(".line-number")).toHaveText(["1", "2", "3", "4", "5", "6"]);
    expect(await stateBlock.evaluate((element) => {
      const code = element.querySelector("code");
      const lineNumbers = element.querySelector(".line-numbers-wrapper");
      if (!code || !lineNumbers)
        return Number.POSITIVE_INFINITY;
      const codeLineHeight = Number.parseFloat(getComputedStyle(code).lineHeight);
      const lineNumberHeight = Number.parseFloat(getComputedStyle(lineNumbers).lineHeight);
      return Math.abs(codeLineHeight - lineNumberHeight);
    })).toBeLessThanOrEqual(1);
    expect(await diffAdd.evaluate(element => getComputedStyle(element).backgroundColor)).not.toBe("rgba(0, 0, 0, 0)");
    expect(await error.evaluate(element => getComputedStyle(element).backgroundColor)).not.toBe("rgba(0, 0, 0, 0)");
    expect(await warning.evaluate(element => getComputedStyle(element).backgroundColor)).not.toBe("rgba(0, 0, 0, 0)");

    const image = page.getByRole("button", { name: "预览图片：Markdown 图片演示" });
    await expect(image).toHaveAttribute("loading", "lazy");

    const lightContainerBackground = await container.evaluate(element => getComputedStyle(element).backgroundColor);
    await page.getByRole("button", { name: /切换到.*主题/ }).click();
    await expect(page.locator("html")).toHaveClass(/dark/);
    const darkContainerBackground = await container.evaluate(element => getComputedStyle(element).backgroundColor);
    expect(darkContainerBackground).not.toBe("rgba(0, 0, 0, 0)");
    expect(darkContainerBackground).not.toBe(lightContainerBackground);

    await expectNoOverflow(page);
    expect(pageErrors).toEqual([]);
  });
});

test.describe("Live Photo", () => {
  test("左上角标识按需在原位置播放视频", async ({ page }) => {
    const videoRequests: string[] = [];
    page.on("request", (request) => {
      if (request.url().includes("live-photo-sample.mp4"))
        videoRequests.push(request.url());
    });

    await page.goto("/blog/guide/live-photo");
    await expect(page.getByRole("heading", { level: 1, name: "使用 Live Photo" })).toBeVisible();
    const play = page.getByRole("button", { name: "播放 Live Photo：独立 MP4 的静态首帧" });
    await expect(play).toBeVisible();
    await expect(play).toHaveClass(/bg-popover\/90/);
    await expectSemanticColor(play, "color", "popover-foreground");
    await expect(play.locator("[data-live-photo-mark]")).toHaveAttribute("src", /^data:image\/svg\+xml/);
    await expect(play).toContainText("LIVE");
    await expectNoOverflow(page);
    expect(videoRequests).toHaveLength(0);

    await play.click();
    const video = page.locator(".article-content video");
    await expect(video).toBeVisible();
    await expect(video).toHaveAttribute("preload", "metadata");
    await expect(video).not.toHaveAttribute("controls", "");
    await expect.poll(() => videoRequests.length).toBeGreaterThan(0);
    await expect.poll(() => video.evaluate(element => !(element as HTMLVideoElement).paused)).toBe(true);

    const stop = page.getByRole("button", { name: "停止 Live Photo" });
    await expect(stop).toHaveClass(/bg-popover\/90/);
    await expectSemanticColor(stop, "color", "popover-foreground");
    await expect(stop.locator("[data-live-photo-mark]")).toHaveClass(/animate-live-photo/);
    await expect(stop).toContainText("LIVE");

    await stop.click();
    await expect(video).toHaveCount(0);
    await expect(page.getByRole("button", { name: "播放 Live Photo：独立 MP4 的静态首帧" })).toBeVisible();
    await expectNoOverflow(page);
  });

  test("Android 原文件按需解析并复用 Blob", async ({ page }) => {
    await installLivePhotoProbe(page);
    await page.goto("/blog/guide/live-photo");

    const samples = [
      { alt: "Android Motion Photo 演示", source: "/live-images/android-motion-photo.jpg" },
    ];

    await expect(page.locator("[data-live-photo-mode=\"android\"]")).toHaveCount(1);
    expect((await readLivePhotoProbe(page)).fetches).toHaveLength(0);
    expect((await readLivePhotoProbe(page)).videoBlobUrls).toHaveLength(0);

    for (const [index, sample] of samples.entries()) {
      const figure = page.locator("[data-live-photo-mode=\"android\"]").nth(index);
      const play = figure.getByRole("button", { name: `播放 Live Photo：${sample.alt}` });
      await expect(play).toBeVisible();
      await play.click();

      const video = figure.locator("video");
      await expect(video).toBeVisible();
      await expect(video).not.toHaveAttribute("controls", "");
      await expect(video).toHaveAttribute("src", /^blob:/);
      await expect.poll(() => video.evaluate(element => !(element as HTMLVideoElement).paused)).toBe(true);

      const firstSource = await video.getAttribute("src");
      let probe = await readLivePhotoProbe(page);
      expect(probe.fetches.filter(url => url.includes(sample.source))).toHaveLength(1);

      await figure.getByRole("button", { name: "停止 Live Photo" }).click();
      await expect(video).toHaveCount(0);
      await play.click();
      await expect(video).toHaveAttribute("src", firstSource!);
      probe = await readLivePhotoProbe(page);
      expect(probe.fetches.filter(url => url.includes(sample.source))).toHaveLength(1);
      await figure.getByRole("button", { name: "停止 Live Photo" }).click();
    }

    const createdUrls = (await readLivePhotoProbe(page)).videoBlobUrls;
    expect(createdUrls).toHaveLength(1);
    await page.locator("a[href=\"/\"]").first().click();
    await expect(page).toHaveURL("/");
    const revokedUrls = (await readLivePhotoProbe(page)).revokedUrls;
    expect(revokedUrls).toEqual(expect.arrayContaining(createdUrls));
    await expectNoOverflow(page);
  });

  test("Android 解析失败时恢复静态图片", async ({ page }) => {
    await installLivePhotoProbe(page);
    await page.route("**/live-images/android-motion-photo.jpg", async (route) => {
      if (route.request().resourceType() === "fetch") {
        await route.fulfill({
          status: 200,
          contentType: "image/jpeg",
          body: Buffer.from([0xFF, 0xD8, 0xFF, 0xD9]),
        });
        return;
      }
      await route.continue();
    });

    await page.goto("/blog/guide/live-photo");
    const figure = page.locator("[data-live-photo-mode=\"android\"]").first();
    const play = figure.getByRole("button", { name: "播放 Live Photo：Android Motion Photo 演示" });
    await play.click();

    await expect(play).toBeVisible();
    await expect(figure.locator("video")).toHaveCount(0);
    expect((await readLivePhotoProbe(page)).videoBlobUrls).toHaveLength(0);
  });
});

test.describe("移动端与键盘", () => {
  test.skip(({ isMobile }) => !isMobile, "移动导航在 mobile project 验证");

  test("移动导航可展开、Escape 关闭且布局不溢出", async ({ page }, testInfo) => {
    await page.goto("/");
    await expectNoOverflow(page);
    const open = page.getByRole("button", { name: "打开导航" });
    await open.focus();
    await page.keyboard.press("Enter");
    const dialog = page.getByRole("dialog", { name: "移动导航" });
    await expect(dialog).toBeVisible();
    await expect(page.getByRole("button", { name: "关闭导航" })).toBeFocused();
    await expect(dialog.getByRole("link", { name: "使用手册" })).toHaveAttribute("href", "/blog/guide/getting-started");
    await dialog.getByText("浏览", { exact: true }).click();
    await expect(dialog.getByRole("link", { name: "标签" })).toBeVisible();
    await saveNonblankScreenshot(page, testInfo.outputPath("mobile-nav.png"));
    await page.keyboard.press("Escape");
    await expect(dialog).not.toBeVisible();
  });
});
