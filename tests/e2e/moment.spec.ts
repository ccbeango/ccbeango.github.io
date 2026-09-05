import { expect, test } from "@playwright/test";
import { siteConfig } from "../../src/.vitepress/site.config.ts";

test.describe("动态页面", () => {
  test("展示个人区以及已发布动态或空状态", async ({ page }) => {
    await page.goto("/moment");

    const profile = page.locator("[data-moment-profile]");
    const cards = page.locator("[data-moment-card]");
    const empty = page.locator("[data-moment-empty]");
    await expect(profile).toBeVisible();
    await expect(page.getByRole("heading", { level: 1, name: siteConfig.moment.displayName })).toBeVisible();
    await expect(profile.locator("[data-moment-cover]")).toBeVisible();
    await expect(profile.locator("[data-moment-profile-avatar]")).toBeVisible();

    if (await cards.count()) {
      await expect(cards.first()).toHaveAttribute("id", /^moment-/);
    } else {
      await expect(empty).toBeVisible();
    }

    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(1);
  });
});
