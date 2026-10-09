import { cp, mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { isAbsolute, join, relative, resolve } from "node:path";
import { expect, test } from "@playwright/test";
import { createServer } from "vitepress";
import { siteConfig } from "../../src/.vitepress/site.config.ts";

test("命名头像选择、默认回退与配置重载支持子路径和远程地址", async ({ page }) => {
  test.setTimeout(120_000);
  const parent = resolve(".codex");
  await mkdir(parent, { recursive: true });
  const directory = await mkdtemp(join(parent, "moment-avatar-"));
  const root = join(directory, "src");
  const remote = "https://images.example.com/avatar.svg";
  const svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><rect width="40" height="40"/></svg>';
  await page.route(remote, (route) => route.fulfill({ contentType: "image/svg+xml", body: svg }));
  await cp(resolve("src"), root, {
    recursive: true,
    filter: (file) => !/(?:^|[\\/])(?:cache|dist|\.temp)(?:[\\/]|$)/.test(file),
  });
  const configPath = join(root, ".vitepress/site.config.ts");
  await writeFile(join(root, ".vitepress/site-config-original.ts"), await readFile(configPath, "utf8"));
  const setAvatars = async (local: string, avatar?: string) =>
    writeFile(
      configPath,
      [
        'export * from "./site-config-original.ts";',
        'import { siteConfig as original, resolveMomentConfig } from "./site-config-original.ts";',
        "export const siteConfig = { ...original,",
        'site: { ...original.site, base: "/avatar-test/" },',
        `moment: resolveMomentConfig({ covers: ["/avatar-fixture/site.svg"], avatar: ${JSON.stringify(avatar)}, avatars: { daily: ${JSON.stringify(local)}, travel: ${JSON.stringify(remote)} }, momentBatchSize: 10 }, original.author, original.site.favicon.svg),`,
        "giscus: null };",
      ].join("\n"),
    );
  await setAvatars("/avatar-fixture/local.svg", "/avatar-fixture/site.svg");
  await mkdir(join(root, "public/avatar-fixture"), { recursive: true });
  for (const name of ["site", "local", "alternate"])
    await writeFile(join(root, `public/avatar-fixture/${name}.svg`), svg);
  await mkdir(join(root, "moments/avatar-fixture"), { recursive: true });
  for (const [name, avatar] of [
    ["local", "daily"],
    ["remote", "travel"],
    ["default", undefined],
  ]) {
    await writeFile(
      join(root, `moments/avatar-fixture/${name}.md`),
      [
        "---",
        "date: 2099-01-01",
        "pinned: true",
        ...(avatar ? [`avatar: ${avatar}`] : []),
        "---",
        `头像测试 ${name}`,
      ].join("\n"),
    );
  }
  let port = 0;
  const restart = async () => {
    await server.close();
    server = await createServer(root, { host: "127.0.0.1", port, strictPort: true }, restart);
    await server.listen();
  };
  let server = await createServer(root, { host: "127.0.0.1", port }, restart);
  await server.listen();
  const address = server.httpServer?.address();
  if (!address || typeof address === "string") throw new Error("测试服务未提供端口");
  port = address.port;
  try {
    const avatar = (name: string) => page.locator(`#moment-avatar-fixture-${name} > img`);
    const profile = page.locator("[data-moment-profile-avatar]");
    await page.goto(`http://127.0.0.1:${port}/avatar-test/moment`);
    await expect(profile).toHaveAttribute("src", "/avatar-test/avatar-fixture/site.svg");
    await expect(avatar("default")).toHaveAttribute("src", "/avatar-test/avatar-fixture/site.svg");
    await expect(avatar("local")).toHaveAttribute("src", "/avatar-test/avatar-fixture/local.svg");
    await expect(avatar("remote")).toHaveAttribute("src", remote);
    for (const image of [profile, avatar("default"), avatar("local"), avatar("remote")]) {
      await image.scrollIntoViewIfNeeded();
      await expect
        .poll(() => image.evaluate((element) => (element as HTMLImageElement).naturalWidth))
        .toBeGreaterThan(0);
    }
    await setAvatars("/avatar-fixture/alternate.svg");
    const fallback = `/avatar-test${siteConfig.site.favicon.svg}`;
    await expect(profile).toHaveAttribute("src", fallback, { timeout: 30_000 });
    await expect(avatar("default")).toHaveAttribute("src", fallback);
    await expect(avatar("local")).toHaveAttribute("src", "/avatar-test/avatar-fixture/alternate.svg", {
      timeout: 30_000,
    });
    await expect(avatar("remote")).toHaveAttribute("src", remote);
    await page.reload();
    await expect(profile).toHaveAttribute("src", fallback);
    await expect(avatar("local")).toHaveAttribute("src", "/avatar-test/avatar-fixture/alternate.svg");
  } finally {
    await page.goto("about:blank");
    await server.close();
    const child = relative(parent, directory);
    if (!child || child.startsWith("..") || isAbsolute(child)) throw new Error("测试目录越界");
    await rm(directory, { recursive: true, force: true });
  }
});
