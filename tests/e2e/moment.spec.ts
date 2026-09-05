import { expect, test } from "@playwright/test";

test.describe("动态页面", () => {
  test("展示已发布动态及其媒体", async ({ page }) => {
    await page.goto("/moment");

    const profile = page.locator("[data-moment-profile]");
    const header = page.locator("[data-moment-header]");
    const cards = page.locator("[data-moment-card]");
    await expect(profile).toBeVisible();
    await expect(header).toBeVisible();
    await expect(page.getByRole("heading", { level: 1, name: "CcBean" })).toBeVisible();
    await expect(profile.locator("[data-moment-cover]")).toHaveAttribute("src", /^https:\/\//);
    await expect(profile.locator("[data-moment-profile-avatar]")).toHaveAttribute("src", "/favicon.svg");
    await expect(cards).not.toHaveCount(0);

    const firstCard = cards.first();
    await expect(firstCard).toHaveAttribute("id", /^moment-/);
    await expect(firstCard.locator("[data-moment-gallery] img").first()).toHaveAttribute("src", /^https:\/\//);
    await expect(page.locator("[data-moment-load-state]")).toBeVisible();

    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(1);
  });
});
