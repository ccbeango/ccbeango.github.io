# Bean Blog

基于 VitePress 2、Vue 3、TypeScript 与 Tailwind CSS 4 的静态中文博客。公开文章统一使用 `/blog/<nested-slug>`，完整使用说明也作为 `/blog/guide/*` 系列文章在博客中发布。

## 环境要求

- Node.js 22.12 或更高版本，当前验证环境为 Node.js 24
- pnpm 11.24.0
- VitePress 精确锁定为 `2.0.0-alpha.19`。npm 当前没有 stable `2.0.0`，升级前必须重新执行完整检查

## 本地使用

```powershell
pnpm install --frozen-lockfile
pnpm dev
```

开发服务器默认访问 `http://localhost:5173`。生产构建必须提供 canonical site URL：

```powershell
$env:SITE_URL='https://blog.example.com'
pnpm build
pnpm preview
```

本地验证当前 GitHub Pages 根站点时，不需要手动设置环境变量：

```powershell
pnpm build:local
pnpm preview
```

常用命令：

| 命令 | 用途 |
| --- | --- |
| `pnpm dev` | 启动 VitePress 开发环境，允许预览草稿 |
| `pnpm build` | 生成生产静态站点到 `src/.vitepress/dist` |
| `pnpm build:local` | 使用 `https://username.github.io/` 示例根站点配置执行本地构建 |
| `pnpm preview` | 预览最近一次生产构建 |
| `pnpm lint` | 使用 ESLint 检查代码规范与格式 |
| `pnpm lint:fix` | 自动修复 ESLint 可修复问题 |
| `pnpm format` | 使用 ESLint 统一格式化项目文件 |
| `pnpm font:check` | 校验本地字体子包的版本、字重、CSS 与 WOFF2 清单 |
| `pnpm font:update` | 从官方 latest release 更新并重新生成字体子包 |
| `pnpm typecheck` | 检查 TypeScript 与 Vue 类型 |
| `pnpm test` | 执行内容模型单元测试 |
| `pnpm test:e2e` | 执行桌面与移动 Playwright 测试 |
| `pnpm audit:styles` | 检查 Tailwind authored styles 边界 |
| `pnpm verify:build` | 检查路由、元数据、feed 和草稿排除 |
| `pnpm check` | 执行资产生成与全部自动化检查 |

## 目录结构

```text
packages/
  lxgw-wenkai-lite-webfont/ # 可独立更新的本地字体子包
src/
  .vitepress/
    build/          # robots、manifest 与 feed 生成
    data/           # frontmatter 契约和文章转换
    theme/          # 自定义 Layout、views、components 与 Tailwind 入口
    config.ts       # VitePress 配置与 head hooks
    site.config.ts  # 站点身份和第三方集成
  posts/            # Markdown 文章来源，不直接生成 /posts 路由
    guide/           # 博客内使用手册，同时作为功能测试内容
  public/           # favicon、OG 图和文章静态资源
  blog/             # /blog 与 dynamic routes
  tags/             # 标签 routes
  archives/         # 归档 route
scripts/            # 资产、样式和静态产物检查
tests/              # Vitest 与 Playwright
```

## 使用手册

使用说明位于 `src/posts/guide`，运行开发服务后可从顶部“使用手册”进入。源码入口如下：

| 手册 | 内容 |
| --- | --- |
| [开始使用](src/posts/guide/getting-started.md) | 环境、安装、开发服务、目录与命令 |
| [站点配置](src/posts/guide/site-configuration.md) | 站点身份、导航、社交入口、域名、资源与 Giscus |
| [文章写作](src/posts/guide/writing-articles.md) | 路由、frontmatter、草稿、精选、系列与资源 |
| [Markdown 扩展](src/posts/guide/markdown-extensions.md) | GFM、公式、代码、容器、Alerts 与 Code Groups |
| [图片布局](src/posts/guide/image-layouts.md) | 多图 block、四张宫格、全屏预览、拍摄参数与输入约束 |
| [Live Photo](src/posts/guide/live-photo.md) | Android Motion Photo、独立 MP4、首帧预览与降级行为 |
| [部署发布](src/posts/guide/deployment.md) | 环境变量、托管平台与发布检查 |

这些文章既是用户文档，也是浏览器集成测试的真实内容。修改语法示例、标题或路径时，需要同步对应测试。

## 开发约束

- UI 以 Tailwind CSS 4 工具类和主题令牌为主；仅 `ArticlePage.vue` 使用一个 `<style scoped>`，通过标准 CSS Nesting 适配 VitePress 生成的 Markdown DOM
- scoped Markdown 适配层必须复用设计令牌；其他 Vue `<style>`、额外 CSS、CSS Modules、CSS-in-JS 和内联 `style` 仍被禁止
- CSS Nesting 由现有 Tailwind CSS 4 + Vite 构建链处理，不增加 nesting 插件或额外 PostCSS 配置
- Tailwind 默认色板已关闭；颜色使用 `background` / `foreground`、`card` / `card-foreground` 等语义配对，值统一为 `oklab()`
- 字体、字号与行高、字距、间距、布局尺寸、控件尺寸、圆角、容器、断点、层级、阴影、模糊、媒体比例和动效均在 `tailwind.css` 中集中管理
- 暗色值由根节点 `dark:theme-dark` 覆盖同名 token；组件不建立另一套暗色变量，也不重复书写相同语义的 `dark:` class
- 新 token 必须表达可复用的尺度或稳定语义并有实际消费者；视口计算、动态 grid track 和内容相关边界可以保留 arbitrary value
- 自定义主题复用 VitePress 的标题锚点、router、代码复制、appearance、目录和 sidebar 基础行为
- 不使用 Prettier；`pnpm format`、VS Code 保存修复和 `Alt+Shift+F` 统一使用 ESLint Flat Config
- `.editorconfig`、`.gitattributes` 和 VS Code 统一使用 LF，并保证文件末尾换行
- JS、TS 与 Vue 代码限制为 120 字符；Vue 多属性标签由 ESLint 自动整理为每行一个属性
- Vue 模板由 ESLint 自动规范 canonical class，并按照 Tailwind 官方 class order 排序
- 本地字体升级方式见 [`packages/lxgw-wenkai-lite-webfont/README.md`](packages/lxgw-wenkai-lite-webfont/README.md)

提交前至少执行 `pnpm lint`、`pnpm typecheck`、`pnpm test` 和 `pnpm audit:styles`。完整发布检查使用 `pnpm check`。
