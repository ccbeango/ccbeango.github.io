import type { Locator, Page } from "@playwright/test";
import { expect, test } from "@playwright/test";
import sharp from "sharp";

const useDevServer = process.env.PLAYWRIGHT_USE_DEV_SERVER === "true";

async function expectNoOverflow(page: Page) {
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow).toBeLessThanOrEqual(1);
}

async function saveNonblankScreenshot(page: Page, path: string) {
  const lazyImages = page.locator('img[loading="lazy"]');
  for (let index = 0; index < (await lazyImages.count()); index += 1) {
    const image = lazyImages.nth(index);
    await image.scrollIntoViewIfNeeded();
    await expect
      .poll(() =>
        image.evaluate((element) => {
          const photo = element as HTMLImageElement;
          return photo.complete && photo.naturalWidth > 0;
        }),
      )
      .toBe(true);
  }
  await page.evaluate(() => window.scrollTo(0, 0));
  const screenshot = await page.screenshot({ path, fullPage: true });
  const stats = await sharp(screenshot).stats();
  expect(screenshot.byteLength).toBeGreaterThan(10_000);
  expect(Math.max(...stats.channels.map((channel) => channel.stdev))).toBeGreaterThan(5);
}

async function expectSemanticColor(locator: Locator, property: string, token: string) {
  await expect
    .poll(() =>
      locator.evaluate(
        (element, values) => {
          const probe = document.createElement("span");
          probe.style.setProperty(values.property, `var(--color-${values.token})`);
          element.append(probe);
          const expected = getComputedStyle(probe).getPropertyValue(values.property);
          probe.remove();
          return getComputedStyle(element).getPropertyValue(values.property) === expected;
        },
        { property, token },
      ),
    )
    .toBe(true);
}

async function openMobileNavigationIfNeeded(page: Page, projectName: string) {
  if (projectName === "mobile") await page.getByRole("button", { name: "打开导航" }).click();
}

test.describe("动态页面", () => {
  test("从全站导航进入并保持响应式布局与明暗主题", async ({ page }, testInfo) => {
    await page.addInitScript(() => {
      Object.defineProperty(Math, "random", { configurable: true, value: () => 0.99 });
    });
    await page.goto("/");
    await openMobileNavigationIfNeeded(page, testInfo.project.name);
    const navigation = page.getByRole("navigation", {
      name: testInfo.project.name === "mobile" ? "移动端主导航" : "主导航",
    });
    await navigation.getByRole("link", { name: "动态" }).click();
    await expect(page).toHaveURL(/\/moment\/?$/);

    const main = page.locator("[data-moment-page]");
    const profile = page.locator("[data-moment-profile]");
    const cover = page.locator("[data-moment-cover]");
    const profileAvatar = page.locator("[data-moment-profile-avatar]");
    await expect(page.getByRole("heading", { level: 1, name: "Bean" })).toBeVisible();
    const momentHeader = page.locator("[data-moment-header]");
    await expect(momentHeader).toBeVisible();
    await expect(momentHeader).toHaveAttribute("data-scrolled", "false");
    await expect(momentHeader).toHaveCSS("height", "52px");
    await expect(page.getByRole("link", { name: "返回首页" })).toHaveAttribute("href", "/");
    await expect(page.getByRole("button", { name: "搜索文章" })).toHaveCount(0);
    await expect(cover).toBeVisible();
    await expect(cover).toHaveAttribute("src", /\/media\/live-photo-sample-poster\.png$/);
    await expect(profileAvatar).toBeVisible();
    await expect(page.getByRole("contentinfo")).toBeVisible();
    await expect(page.locator("[data-moment-card]")).toHaveCount(4);
    await expect(page.getByText("置顶", { exact: true })).toBeVisible();
    await expect(page.getByText("草稿", { exact: true })).toHaveCount(useDevServer ? 1 : 0);
    await expect(page.getByText(/点赞|评论/)).toHaveCount(0);
    const publishedTime = page.locator("#moment-2026-early-autumn time");
    await expect(publishedTime).toHaveAttribute("datetime", /2026-09-04T(?:08:10:00(?:\.000)?\+08:00|00:10:00\.000Z)/);
    await expect(publishedTime).toHaveAttribute("title", "2026年9月4日 08:10");

    const overlap = await profile.evaluate((element) => {
      const coverBounds = element.querySelector<HTMLElement>("[data-moment-cover]")!.getBoundingClientRect();
      const avatarBounds = element.querySelector<HTMLElement>("[data-moment-profile-avatar]")!.getBoundingClientRect();
      return {
        overlapsCoverEdge: avatarBounds.top < coverBounds.bottom && avatarBounds.bottom > coverBounds.bottom,
        alignedRight: Math.abs(avatarBounds.right - coverBounds.right) < 24,
      };
    });
    expect(overlap).toEqual({ overlapsCoverEdge: true, alignedRight: true });
    await expectNoOverflow(page);
    await expectSemanticColor(page.locator(".min-h-screen").first(), "color", "foreground");
    await page.evaluate(() => window.scrollTo(0, 500));
    await expect(momentHeader).toHaveAttribute("data-scrolled", "true");
    const headerPresentation = await momentHeader.evaluate((element) => {
      const headerBounds = element.getBoundingClientRect();
      const coverBounds = document.querySelector<HTMLElement>("[data-moment-cover]")!.getBoundingClientRect();
      const styles = getComputedStyle(element);
      return {
        widthDifference: Math.abs(headerBounds.width - coverBounds.width),
        borderWidth: styles.borderBottomWidth,
        backdropFilter: styles.backdropFilter,
      };
    });
    expect(headerPresentation.widthDifference).toBeLessThanOrEqual(1);
    expect(headerPresentation.borderWidth).toBe("0px");
    expect(headerPresentation.backdropFilter).not.toBe("none");
    await page.evaluate(() => window.scrollTo(0, 0));
    await expect(momentHeader).toHaveAttribute("data-scrolled", "false");
    await saveNonblankScreenshot(page, testInfo.outputPath("moment-light.png"));

    await page.getByRole("button", { name: "切换到深色主题" }).click();
    await expect(page.locator("html")).toHaveClass(/dark/);
    await expectSemanticColor(page.locator(".min-h-screen").first(), "background-color", "muted");
    await expectSemanticColor(main, "background-color", "background");
    await expectSemanticColor(main, "color", "foreground");
    await saveNonblankScreenshot(page, testInfo.outputPath("moment-dark.png"));
  });

  test("滚动加载覆盖全部图库分支并保持单一页面元数据", async ({ page }) => {
    await page.goto("/moment");
    await expect(page.locator("[data-moment-card]")).toHaveCount(4);
    await expect(page.getByRole("navigation", { name: "动态分页" })).toHaveCount(0);
    if (!useDevServer) {
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", /\/moment\/?$/);
    }

    const loadMore = page.getByRole("button", { name: "加载更多动态" });
    await loadMore.scrollIntoViewIfNeeded();
    await expect.poll(() => page.locator("[data-moment-card]").count()).toBeGreaterThanOrEqual(8);
    await expect
      .poll(async () => {
        await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
        return page.locator("[data-moment-card]").count();
      })
      .toBe(useDevServer ? 13 : 12);
    await expect(page.getByRole("status", { name: "" }).filter({ hasText: "已加载全部动态" })).toBeVisible();
    await expect(page).toHaveURL(/\/moment\/?$/);

    const galleryCounts = new Set<number>();
    const fragments = new Set<string>();

    for (const id of await page.locator("[data-moment-card]").evaluateAll((cards) => cards.map((card) => card.id))) {
      expect(fragments.has(id)).toBe(false);
      fragments.add(id);
    }
    for (const count of await page
      .locator("[data-moment-gallery]")
      .evaluateAll((galleries) => galleries.map((gallery) => Number(gallery.getAttribute("data-moment-gallery"))))) {
      galleryCounts.add(count);
    }

    const images = page.locator("[data-moment-gallery] img");
    for (let index = 0; index < (await images.count()); index += 1) {
      const image = images.nth(index);
      await expect(image).toHaveAttribute("loading", "lazy");
      await expect(image).toHaveAttribute("alt", /\S+/);
      await expect(image).toHaveAttribute("src", "/media/live-photo-sample-poster.png");
    }

    for (const count of [2, 4]) {
      const gallery = page.locator(`[data-moment-gallery="${count}"]`);
      const columnCount = await gallery
        .locator("div")
        .evaluate((element) => getComputedStyle(element).gridTemplateColumns.split(" ").length);
      expect(columnCount).toBe(2);
    }
    for (const count of [3, 5, 9]) {
      const gallery = page.locator(`[data-moment-gallery="${count}"]`);
      const columnCount = await gallery
        .locator("div")
        .evaluate((element) => getComputedStyle(element).gridTemplateColumns.split(" ").length);
      expect(columnCount).toBe(3);
      const firstImage = gallery.locator("img").first();
      const bounds = await firstImage.boundingBox();
      expect(Math.abs((bounds?.width ?? 0) - (bounds?.height ?? 0))).toBeLessThanOrEqual(1);
    }

    expect([...galleryCounts].sort((a, b) => a - b)).toEqual([1, 2, 3, 4, 5, 9]);
    expect(fragments.size).toBeGreaterThanOrEqual(8);
  });

  test("分别渲染文章引用、音乐、视频和 Live Photo 动态，并保留视频动态图库", async ({ page }) => {
    await page.goto("/moment#moment-2026-shared-reading");
    const linkCard = page.locator("#moment-2026-shared-reading");
    await expect(linkCard).toBeVisible();
    await expect(linkCard.getByRole("link", { name: "使用 Markdown 扩展" })).toHaveAttribute(
      "href",
      "/blog/guide/markdown-extensions",
    );

    await page.goto("/moment#moment-2026-night-music");
    const musicCard = page.locator("#moment-2026-night-music");
    await expect(musicCard).toBeVisible();
    await expect(musicCard.locator(".moment-content")).not.toHaveClass(/moment-content-collapsed/);
    const music = musicCard.locator("[data-music-card]");
    await expect(music).toBeVisible();
    await expect(music).toHaveAttribute("data-music-resolver", "motues-details");

    await page.goto("/moment#moment-2026-coast-video");
    const videoCard = page.locator("#moment-2026-coast-video");
    await expect(videoCard).toBeVisible();
    await expect(videoCard.locator(".moment-content")).not.toHaveClass(/moment-content-collapsed/);
    const video = videoCard.locator("[data-video-player] video");
    await expect(video).toBeVisible();
    await expect(video).toHaveAttribute("src", "/media/live-photo-sample.mp4");
    await expect(video).toHaveAttribute("poster", "/media/live-photo-sample-poster.png");
    await expect(video).toHaveAttribute("controls", "");

    await page.goto("/moment#moment-2026-riverside-live-photo");
    const livePhotoCard = page.locator("#moment-2026-riverside-live-photo");
    await expect(livePhotoCard).toBeVisible();
    await expect(livePhotoCard.locator(".moment-content")).not.toHaveClass(/moment-content-collapsed/);
    const livePhoto = livePhotoCard.locator('[data-live-photo-mode="video"]');
    await expect(livePhoto).toBeVisible();
    await expect(livePhoto.getByRole("button", { name: "播放 Live Photo：江边傍晚的动态照片" })).toBeVisible();
    await expect(livePhoto.locator('img[alt="江边傍晚的动态照片"]')).toHaveAttribute(
      "src",
      "/media/live-photo-sample-poster.png",
    );

    const gallery = videoCard.locator('[data-moment-gallery="1"]');
    await expect(gallery.locator('img[alt="今晚留在桌面上的一张照片"]')).toHaveAttribute(
      "src",
      "/media/live-photo-sample-poster.png",
    );
    await expectNoOverflow(page);
  });

  test("深链揭示较后动态、展开溢出正文并正确显示空状态", async ({ page }) => {
    await page.goto("/moment#moment-2026-long-note");
    await expect(page).toHaveURL(/\/moment\/?#moment-2026-long-note$/);

    const longCard = page.locator("[data-moment-card]", { hasText: "今晚整理了一下最近的工作节奏。" });
    await expect(longCard).toBeVisible();
    const toggle = longCard.getByRole("button", { name: "全文" });
    const content = longCard.locator(".moment-content");
    await expect(toggle).toHaveAttribute("aria-expanded", "false");
    const collapsedHeight = await content.evaluate((element) => element.clientHeight);
    await toggle.click();
    await expect(longCard.getByRole("button", { name: "收起" })).toHaveAttribute("aria-expanded", "true");
    expect(await content.evaluate((element) => element.clientHeight)).toBeGreaterThan(collapsedHeight);
    await longCard.getByRole("button", { name: "收起" }).click();
    await expect(toggle).toHaveAttribute("aria-expanded", "false");

    await page.goto("/moment");
    if (!useDevServer) {
      await expect(page.locator("[data-moment-empty]")).toHaveCount(0);
      return;
    }
    await page.locator("[data-moment-page]").evaluate((element) => {
      interface MomentPageInstance {
        setupState: {
          momentItems: unknown[];
        };
        update: () => void;
      }
      const component = (element as HTMLElement & { __vueParentComponent?: MomentPageInstance }).__vueParentComponent;
      if (!component) throw new Error("MomentPage Vue instance not found");
      component.setupState.momentItems.splice(0);
      component.update();
    });
    await expect(page.locator("[data-moment-empty]")).toHaveText("暂无动态");
    await expect(page.locator("[data-moment-card]")).toHaveCount(0);
    await expect(page.locator("[data-moment-load-state]")).toHaveCount(0);
  });

  test("复用照片预览并提供可访问的复制链接操作", async ({ page }) => {
    await page.addInitScript(() => {
      const state = { clipboard: "", fallback: "" };
      Object.assign(window, { __momentActionState: state });
      Object.defineProperty(navigator, "clipboard", {
        configurable: true,
        value: { writeText: async (value: string) => (state.clipboard = value) },
      });
      Object.defineProperty(document, "execCommand", {
        configurable: true,
        value: (command: string) => {
          if (command !== "copy") return false;
          state.fallback = (document.activeElement as HTMLTextAreaElement | null)?.value ?? "";
          return true;
        },
      });
    });
    await page.goto("/moment");

    const previewTrigger = page.locator('img[data-photo-preview][alt="江边傍晚的光影"]');
    await previewTrigger.focus();
    await page.keyboard.press("Enter");
    const dialog = page.getByRole("dialog", { name: "照片预览" });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole("img", { name: "江边傍晚的光影" })).toBeVisible();
    await dialog.locator("[data-photo-preview-stage]").hover();
    await page.mouse.wheel(0, -700);
    await expect(dialog.getByRole("button", { name: "重置照片缩放" })).toBeVisible();
    await dialog.getByRole("button", { name: "关闭照片预览" }).click();
    await expect(dialog).toBeHidden();
    await expect(previewTrigger).toBeFocused();
    await previewTrigger.click();
    await expect(dialog).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(previewTrigger).toBeFocused();

    const trigger = page.getByRole("button", { name: /Bean在2026年9月4日 08:10发布的动态操作/ });
    await trigger.focus();
    await page.keyboard.press("Enter");
    const copyCommand = page.getByRole("menuitem", { name: "复制链接" });
    await expect(copyCommand).toBeFocused();
    await page.keyboard.press("Escape");
    await expect(copyCommand).toBeHidden();
    await expect(trigger).toBeFocused();

    await trigger.click();
    await copyCommand.click();
    await expect(page.getByRole("status").filter({ hasText: "链接已复制" })).toBeVisible();
    const copied = await page.evaluate(
      () =>
        (window as typeof window & { __momentActionState: { clipboard: string; fallback: string } }).__momentActionState
          .clipboard,
    );
    expect(new URL(copied).pathname).toBe("/moment");
    expect(new URL(copied).hash).toBe("#moment-2026-early-autumn");
    await page.goto(copied);
    await expect(page.locator("#moment-2026-early-autumn")).toBeVisible();

    const directTrigger = page.getByRole("button", { name: /Bean在2026年9月4日 08:10发布的动态操作/ });
    await directTrigger.click();
    await page.getByRole("heading", { level: 1, name: "Bean" }).click();
    await expect(page.getByRole("menuitem", { name: "复制链接" })).toHaveCount(0);

    await page.evaluate(() => Object.defineProperty(navigator, "clipboard", { configurable: true, value: undefined }));
    await directTrigger.click();
    await page.getByRole("menuitem", { name: "复制链接" }).click();
    const fallback = await page.evaluate(
      () =>
        (window as typeof window & { __momentActionState: { clipboard: string; fallback: string } }).__momentActionState
          .fallback,
    );
    expect(new URL(fallback).hash).toBe("#moment-2026-early-autumn");
  });

  test("照片预览只在当前动态的图库内翻页", async ({ page }) => {
    await page.goto("/moment#moment-2026-city-three");

    const card = page.locator("#moment-2026-city-three");
    const gallery = card.locator("[data-moment-gallery]");
    await expect(gallery).toHaveAttribute("data-photo-preview-scope", "");
    await expect(gallery.locator("img[data-photo-preview]")).toHaveCount(3);

    await card.getByRole("button", { name: "预览图片：城市漫步照片一" }).click();
    const dialog = page.getByRole("dialog", { name: "照片预览" });
    await expect(dialog.locator("[data-photo-preview-stage]")).toHaveCSS("user-select", "none");
    await expect(dialog.locator("[data-photo-preview-position]")).toHaveText("第 1 张，共 3 张：城市漫步照片一");
    await expect(dialog.getByRole("button", { name: "上一张照片" })).toHaveCount(0);

    await dialog.getByRole("button", { name: "下一张照片" }).click();
    await expect(dialog.locator("[data-photo-preview-position]")).toHaveText("第 2 张，共 3 张：城市漫步照片二");
    await expect(dialog.getByRole("img", { name: "城市漫步照片二" })).toBeVisible();

    await page.keyboard.press("ArrowRight");
    await expect(dialog.locator("[data-photo-preview-position]")).toHaveText("第 3 张，共 3 张：城市漫步照片三");
    await expect(dialog.getByRole("button", { name: "下一张照片" })).toHaveCount(0);
  });
});
