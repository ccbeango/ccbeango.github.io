import { expect, test } from "@playwright/test";
import { siteConfig } from "../../src/.vitepress/site.config.ts";

test.describe("博客核心页面", () => {
  test("首页、列表和聚合路由可用", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1, name: siteConfig.site.title })).toBeVisible();

    for (const social of siteConfig.homeSocials) {
      await expect(page.getByRole("link", { name: social.label })).toBeVisible();
    }

    await page.goto("/blog");
    await expect(page.locator("main h1")).toBeVisible();

    const pagination = page.getByRole("navigation", { name: "文章分页" });
    if (await pagination.count()) {
      const next = pagination.getByRole("link", { name: /下一页/ });
      await expect(next).toBeVisible();
      const href = await next.getAttribute("href");
      if (!href) throw new Error("下一页链接缺少 href");
      await page.goto(href);
      await expect(page.locator("main h1")).toBeVisible();
    }

    await page.goto("/tags");
    await expect(page.locator("main h1")).toBeVisible();
    await page.goto("/archives");
    await expect(page.locator("main h1")).toBeVisible();
  });

  test("不存在的路由显示站内 404 页面", async ({ page }) => {
    await page.goto("/not-found-test");
    await expect(page.locator("main h1")).toBeVisible();
    await expect(page.locator("main a[href='/blog']")).toBeVisible();
  });
});
