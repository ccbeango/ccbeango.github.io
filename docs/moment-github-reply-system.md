# Moment 接入 GitHub 回复系统方案

> 记录日期：2026-09-04  
> 当前状态：方案探索稿，尚未创建 OpenSpec change，尚未进入实现  
> 适用范围：Bean Blog 的 `/moment` 信息流  
> 核心结论：以 GitHub Discussions 保存回复数据，以 GitHub App 表示登录用户，以 Cloudflare Worker 提供鉴权和受控 API，评论界面由当前 Vue 3 与 Tailwind CSS 主题自行实现。

## 1. 背景

当前 `/moment` 是一个静态生成的短动态信息流。每条 Moment 来源于 `src/moments/**/*.md`，在同一个 `/moment` 页面中以稳定 fragment 定位，不生成单条动态详情路由。现有实现支持短 Markdown、图片、地点、标签、置顶、草稿、滚动分批展示和复制链接，但不提供逐条回复。

项目已经安装并封装了 `@giscus/vue`，长文章页面可以在配置完整时挂载 Giscus。不过，Giscus 的评论界面运行在跨域 iframe 中，父页面无法读取 iframe 内的评论正文，也不能把评论列表重新渲染成 Moment 原生样式。Giscus 的公开消息接口主要用于传递主题、Discussion 映射等配置，不是完整的评论 CRUD API。

因此，本方案不把 Giscus iframe 嵌入每条 Moment，而是复用它背后的核心思路：

- GitHub Discussions 是回复数据和审核后台。
- GitHub 账号是评论者身份。
- GitHub GraphQL API 提供读取、发表和指定对象回复能力。
- 当前博客自行实现回复列表和输入界面。
- 一个轻量 Serverless API 负责隐藏密钥、完成 GitHub 授权并约束 API 能力。

## 2. 目标

本方案期望最终具备以下能力：

- 每条已发布 Moment 可以绑定一个独立 GitHub Discussion。
- 未登录访客可以查看回复数量、顶层回复和针对回复的答复。
- 访客可以使用自己的 GitHub 账号登录。
- 登录访客可以发表顶层回复。
- 登录访客可以选择某一条回复并针对该作者答复。
- 新回复在 GitHub Discussions 中显示真实 GitHub 作者，而不是统一显示为博客维护者。
- 回复列表使用当前 Moment 页面自己的 Vue、Tailwind CSS 4、语义颜色、明暗模式和响应式设计，不受第三方 iframe 样式限制。
- 回复数据、锁定、删除和人工审核继续由 GitHub 承担，不在博客仓库中复制一份评论数据库。
- Moment 信息流继续静态生成，回复能力失败时不影响正文和图片浏览。

## 3. 非目标

首版不计划实现以下能力：

- 匿名回复或游客昵称回复。
- 自建账号、密码、邮箱验证和找回密码体系。
- 独立保存一份与 GitHub Discussions 同步的完整回复数据库。
- 无限深度的论坛式树状楼层。
- WebSocket、SSE 或严格实时推送。
- 在浏览器中保存站点维护者 PAT、GitHub App 私钥或 OAuth client secret。
- 允许访客通过本站接口创建任意 Discussion、Issue 或修改仓库内容。
- 首版同时实现编辑、删除、Reaction、举报、订阅通知和管理后台。
- 使用回复内容参与 VitePress 构建期搜索、Feed、sitemap 或静态 SEO 正文。

这些能力可以在核心读取、登录、发表和回复稳定后，通过独立需求继续评估。

## 4. 方案比较

| 方案                            | 数据来源           | 自定义界面         | 指定对象回复         | 身份与发布               | 判断                                 |
| ------------------------------- | ------------------ | ------------------ | -------------------- | ------------------------ | ------------------------------------ |
| 直接使用 Giscus                 | GitHub Discussions | 受跨域 iframe 限制 | 支持                 | Giscus 托管              | 上线最快，但不满足 Moment 原生界面   |
| Fork 并自托管 Giscus            | GitHub Discussions | 可以修改其内部界面 | 支持                 | 需要维护完整 Giscus 服务 | 可行，但维护面明显大于当前需求       |
| Gitalk                          | GitHub Issues      | 有一定自由度       | Issue 评论模型偏扁平 | GitHub OAuth             | 技术模型和依赖偏旧，不建议新建于其上 |
| Utterances                      | GitHub Issues      | 受跨域 iframe 限制 | 能力有限             | Utterances 托管          | 不适合自定义信息流回复               |
| `github-discussions-fetcher`    | GitHub Discussions | 只提供数据         | 只读                 | 不包含完整登录与发布     | 可参考查询，不能直接作为完整方案     |
| `@octokit/graphql` + 自建薄 API | GitHub Discussions | 完全由本站控制     | 原生支持 `replyToId` | GitHub App + Worker      | 最符合目标，推荐                     |

当前没有发现一个成熟、持续维护，并同时覆盖 Vue 3、自定义 UI、Discussions 读取、GitHub 登录、发表以及指定评论回复的一站式公开库。自行实现的重点不是重写 GitHub，而是补齐一层很薄的站点专用适配。

## 5. 总体架构

```text
┌──────────────────────────────────────────────────────┐
│ GitHub Pages                                         │
│                                                      │
│ /moment                                              │
│ ├─ 构建期 Moment 正文与图片                          │
│ ├─ Vue 回复列表                                      │
│ ├─ GitHub 登录入口                                   │
│ └─ 发表、回复和刷新状态                              │
└─────────────────────────┬────────────────────────────┘
                          │ HTTPS JSON API
                          ▼
┌──────────────────────────────────────────────────────┐
│ Cloudflare Worker                                    │
│                                                      │
│ ├─ GitHub OAuth / GitHub App 回调                    │
│ ├─ 登录会话与 CSRF 防护                              │
│ ├─ 仓库、分类和 Discussion 白名单                    │
│ ├─ 输入校验、限流和错误归一化                        │
│ ├─ GitHub App installation token 管理                │
│ ├─ GitHub 用户令牌管理                               │
│ └─ GraphQL 查询、Mutation 和短时缓存                 │
└─────────────────────────┬────────────────────────────┘
                          │ GitHub GraphQL API
                          ▼
┌──────────────────────────────────────────────────────┐
│ GitHub                                               │
│                                                      │
│ Repository                                           │
│ └─ Discussions Category: Moments                     │
│    ├─ Discussion #42 ← moment-a.md                   │
│    ├─ Discussion #43 ← moment-b.md                   │
│    └─ Discussion #44 ← moment-c.md                   │
└──────────────────────────────────────────────────────┘
```

这里仍然存在服务端代码，但不需要购买和维护长期运行的传统服务器。Worker 按请求执行，没有进程、操作系统和端口需要维护。

## 6. 各层职责

### 6.1 VitePress 与 Vue 前端

前端负责：

- 根据 Moment 的稳定 slug 和 `discussionNumber` 请求对应回复。
- 展示回复数量、加载状态、空状态和失败状态。
- 展示 GitHub 用户头像、用户名、正文、时间和回复关系。
- 管理展开、收起、回复目标、输入内容和提交状态。
- 在提交成功后把服务端返回的新回复合并到当前列表。
- 复用 Moment 页面现有语义令牌、明暗模式和响应式规则。
- 在 Worker 不可用时仅禁用回复功能，不影响静态 Moment 正文。

前端不得：

- 包含 GitHub App 私钥、client secret 或站点 PAT。
- 直接接受任意仓库、分类或 Discussion ID 并代用户调用 GitHub。
- 把 GitHub 用户 access token 写入可被普通 JavaScript 读取的持久存储。
- 把评论 HTML 当作完全可信的站点模板执行。

### 6.2 Cloudflare Worker

Worker 是 Backend for Frontend，负责：

- 把公开的站点 API 转换为 GitHub GraphQL 请求。
- 为未登录读取请求使用 GitHub App installation token。
- 完成 GitHub 登录授权码到用户 access token 的交换。
- 为已登录发表请求使用对应用户身份，而不是维护者身份。
- 校验 OAuth `state`、会话、来源、CSRF、正文长度和回复目标。
- 把 API 限制在固定仓库、固定 Discussions 分类和已登记 Moment。
- 统一 GitHub 错误，不向浏览器泄露令牌或内部请求细节。
- 对匿名读取进行短时缓存，降低 GitHub API 压力。
- 对发表接口进行按用户、会话或来源的频率限制。

### 6.3 GitHub Discussions

GitHub 负责：

- 持久保存 Discussion、评论和回复。
- 保存评论作者、头像、时间、编辑记录和 Reaction。
- 提供 GitHub 原生 Markdown 渲染结果。
- 执行 GitHub 账号权限、封禁和平台级滥用控制。
- 提供维护者审核、锁定、编辑、删除和最小化内容的后台。
- 保留直接在 GitHub 查看和参与 Discussion 的入口。

## 7. 为什么不能只用静态前端

完全省略 Worker 会遇到以下问题：

1. GitHub GraphQL API 需要鉴权令牌，即使读取公开 Discussions 也不能把站点令牌公开在前端包中。
2. GitHub OAuth 授权码交换需要安全保存 client secret，不能在浏览器执行。
3. 如果把维护者 PAT 写进前端，任何访客都能提取并滥用，所有回复也会错误地显示为维护者发表。
4. 浏览器直接持有访客 GitHub token 会扩大 XSS、第三方脚本和持久化存储泄漏的影响。
5. 没有服务端约束时，前端参数可能被篡改，用于访问或操作超出 Moment 范围的资源。

不使用自建服务端的可行替代只有继续使用 Giscus，因为这些工作由 Giscus 的服务端完成。构建期抓取只能生成评论快照，无法提供即时发表。

## 8. GitHub 资源设计

### 8.1 仓库要求

用于保存回复的 GitHub 仓库需要：

- 开启 Discussions。
- 创建一个专用分类，例如 `Moments`。
- 安装本站 GitHub App。
- GitHub App 至少具有 Discussions 读取和写入权限，以及必要的只读元数据权限。
- 分类尽量只用于 Moment，便于白名单校验、审核和后续迁移。

回复仓库可以是博客源码仓库，也可以是专门的公开仓库。独立仓库可以减少源码仓库通知和权限耦合；同仓库则配置更少。此选择不影响前端模型。

### 8.2 一条 Moment 对应一个 Discussion

推荐在 Moment frontmatter 中保存稳定的 Discussion number：

```yaml
---
date: 2026-09-04T15:30:00+08:00
location: 上海
discussionNumber: 42
---

今天完成了 Moment 页面。
```

`discussionNumber` 适合作者维护和排查。Worker 调用 GraphQL 后可以取得真正用于 Mutation 的 Discussion node ID，并做短时缓存。

不建议只使用标题或 `/moment#fragment` 模糊搜索 Discussion：

- Moment 标题可能为空或修改。
- slug 和路由以后可能迁移。
- 标题可能重复。
- 搜索结果可能受到大小写、前缀或 GitHub 索引延迟影响。

稳定 fragment 仍用于浏览器分享和定位，`discussionNumber` 专门负责外部回复资源映射，两者职责不同。

### 8.3 Discussion 创建策略

首版推荐由作者预先创建 Discussion，再把 number 写入 Moment frontmatter。原因是：

- 运行时首次回复自动创建后，Worker 无法自然地把 number 写回 Markdown 并提交仓库。
- 并发首次回复可能重复创建 Discussion。
- 预创建允许作者确认标题、分类和初始正文。
- 没有绑定 Discussion 的 Moment 可以明确显示“回复暂未开放”。

后续可以增加作者侧 CLI：创建 Discussion、取得 number、更新 frontmatter，然后由作者正常提交。CLI 属于内容发布工具，不应放在访客请求链路中。

### 8.4 Discussion 内容建议

Discussion 标题可以使用稳定且便于人工识别的形式：

```text
[Moment] 2026-09-04 / 2026/early-autumn
```

Discussion 正文可以包含：

- Moment 原始链接。
- Moment 发布时间。
- 一段简短文本快照。
- “回复请遵守本站交流规则”等说明。

Discussion 正文不是 Moment 的权威来源。Moment 正文仍以仓库 Markdown 为准，避免形成双向同步问题。

## 9. GitHub 评论与回复模型

GitHub Discussions GraphQL 中的 `DiscussionComment` 可提供：

- `id`
- `author`
- `body`、`bodyText`、`bodyHTML`
- `createdAt`、`updatedAt`、`lastEditedAt`
- `replies`
- `replyTo`
- `reactions` 或 `reactionGroups`
- 当前用户是否可以更新、删除等权限状态

发表顶层评论与回复可以共用 `addDiscussionComment`：

```graphql
mutation AddDiscussionComment(
  $discussionId: ID!
  $body: String!
  $replyToId: ID
) {
  addDiscussionComment(
    input: {
      discussionId: $discussionId
      body: $body
      replyToId: $replyToId
    }
  ) {
    comment {
      id
      body
      bodyHTML
      createdAt
    }
  }
}
```

- `replyToId` 为空时，发表顶层评论。
- `replyToId` 指向某条评论时，发表针对该评论的回复。
- 前端应保留 `replyTo` 关系，以便显示“李四 回复 张三”。

首版视觉上建议采用朋友圈式两层结构，而不是尝试无限缩进：

```text
张三：图片很好看
李四 回复 张三：我也喜欢第二张
作者 回复 李四：那张是在江边拍的
```

即使 API 返回更具体的回复目标，界面也可以把所有答复保持在同一回复区域，通过“回复某人”表达关系。这样更适合窄幅 Moment 卡片，也避免深层缩进压缩正文。

## 10. GitHub App 与登录流程

### 10.1 为什么推荐 GitHub App

与传统 OAuth App 相比，GitHub App 可以围绕已安装仓库申请更细的权限。目标是只申请 Discussions 相关能力，避免要求访客授权宽泛的仓库访问范围。

不得使用维护者 PAT 代替访客身份发表。那会导致：

- 所有内容都显示为维护者发表。
- PAT 泄漏时影响范围过大。
- 无法可靠判断真实作者。
- GitHub 自身的用户审核和归属价值被削弱。

### 10.2 未登录读取

```text
浏览器请求回复
      │
      ▼
Worker 检查缓存
      │ 未命中
      ▼
Worker 生成 GitHub App JWT
      │
      ▼
换取 installation token
      │
      ▼
查询指定 Discussion
      │
      ▼
裁剪字段、缓存并返回
```

installation token 应在 Worker 内缓存到接近过期前，不要为每次评论读取都重新创建。

### 10.3 用户登录

```text
用户点击“使用 GitHub 登录”
      │
      ▼
Worker 创建随机 state 并跳转 GitHub
      │
      ▼
用户查看权限并授权 GitHub App
      │
      ▼
GitHub 回调 Worker
      │
      ▼
Worker 校验 state，用 code 换取用户 token
      │
      ▼
Worker 建立安全会话并跳回原 Moment fragment
```

登录开始时应保存返回地址，但只允许返回本站路径和已知 fragment，避免开放重定向漏洞。

### 10.4 会话保存

可选方式如下：

| 方式                                        | 优点                               | 缺点                       | 建议             |
| ------------------------------------------- | ---------------------------------- | -------------------------- | ---------------- |
| 加密 `HttpOnly` Cookie 保存令牌             | 无需 KV，部署简单                  | 撤销、刷新和密钥轮换较麻烦 | 可用于验证性原型 |
| Cookie 只保存随机 session ID，令牌保存在 KV | 可撤销、可设置 TTL、便于刷新和注销 | 增加少量 KV 读写           | 推荐正式版本     |

正式版本 Cookie 至少应使用 `HttpOnly`、`Secure` 和合适的 `SameSite` 策略。所有改变状态的请求还需要来源校验和 CSRF 防护，不能只依赖 Cookie 属性。

### 10.5 GitHub Pages 与跨站 Cookie

如果博客位于 `ccbeango.github.io`，而 API 位于 `*.workers.dev`，两者属于不同站点。依赖跨站 Cookie 会受到浏览器第三方 Cookie 策略影响。

更稳妥的正式部署是使用同一可注册域名：

```text
blog.example.com      → GitHub Pages
comments.example.com  → Cloudflare Worker
```

这样可以使用同站 Cookie 语义，同时仍需正确配置 CORS。若继续只使用 `github.io` 和 `workers.dev`，应在技术验证阶段专门测试 Safari、Firefox 和 Chrome 的登录回调与凭据请求，必要时改用短期、不落盘的前端会话令牌方案。后者安全设计更复杂，不应默认采用。

## 11. API 草案

API 应面向 Moment 业务，而不是公开一个通用 GitHub GraphQL 代理。

### 11.1 会话接口

```text
GET  /api/auth/github?returnTo=/moment#moment-...
GET  /api/auth/github/callback
GET  /api/session
POST /api/logout
```

`GET /api/session` 只返回前端需要的信息，例如：

```json
{
  "authenticated": true,
  "viewer": {
    "login": "octocat",
    "name": "The Octocat",
    "avatarUrl": "https://avatars.githubusercontent.com/...",
    "profileUrl": "https://github.com/octocat"
  }
}
```

不得返回 GitHub access token、refresh token 或内部 session ID。

### 11.2 回复读取接口

```text
GET /api/moments/:slug/comments?cursor=<cursor>
```

建议响应：

```json
{
  "discussion": {
    "number": 42,
    "url": "https://github.com/owner/repo/discussions/42",
    "locked": false,
    "totalCount": 12
  },
  "comments": [
    {
      "id": "DC_kw...",
      "author": {
        "login": "octocat",
        "avatarUrl": "https://avatars.githubusercontent.com/...",
        "profileUrl": "https://github.com/octocat"
      },
      "body": "写得很好。",
      "bodyHtml": "<p>写得很好。</p>",
      "createdAt": "2026-09-04T08:00:00Z",
      "updatedAt": "2026-09-04T08:00:00Z",
      "replyTo": null,
      "replies": []
    }
  ],
  "pageInfo": {
    "hasNextPage": false,
    "endCursor": null
  }
}
```

Worker 应自行根据 slug 解析允许的 Discussion，不应让客户端自由提交 `owner`、`repo` 或 `categoryId`。

### 11.3 发表接口

```text
POST /api/moments/:slug/comments
Content-Type: application/json
```

顶层评论：

```json
{
  "body": "写得很好。"
}
```

回复指定评论：

```json
{
  "body": "我也这样觉得。",
  "replyToId": "DC_kw..."
}
```

Worker 必须验证：

- 用户已经登录。
- body 去除首尾空白后非空且不超过约定长度。
- slug 对应已登记且已发布的 Moment。
- Discussion 位于固定仓库和固定分类。
- Discussion 没有锁定。
- `replyToId` 确实属于当前 Discussion。
- 请求通过 CSRF、Origin 和频率限制检查。

服务端成功后直接返回 GitHub 创建的规范化评论对象。前端使用返回对象更新界面，不应先伪造一个永久本地 ID。

### 11.4 评论数量批量接口

Moment 列表可能一次展示多条动态。不得为每个可见卡片立即发起一个完整评论查询。可以提供：

```text
POST /api/moments/comment-counts
```

请求只包含当前已揭示 Moment 的 slug，Worker 返回计数映射：

```json
{
  "counts": {
    "2026/early-autumn": 12,
    "2026/riverside-light": 3
  }
}
```

数量可以批量查询并缓存；完整正文只在用户展开某条回复区时加载。

## 12. 前端交互建议

### 12.1 默认状态

每条 Moment 底部操作区增加回复入口：

- 有数据时显示回复数量。
- 未加载完成时提供不造成布局跳动的稳定占位。
- `discussionNumber` 未配置时不请求 API，可隐藏入口或显示“回复未开放”。
- Discussion 已锁定时允许阅读，但输入区显示“回复已关闭”。

为了避免信息流过长，首版建议默认收起回复正文，只展示数量。用户点击后在当前 Moment 内展开，不跳转详情页。

### 12.2 展开回复

展开后按以下顺序显示：

1. 已有顶层评论及其回复。
2. “查看更多回复”分页入口或滚动哨兵。
3. 未登录时的 GitHub 登录入口。
4. 已登录时的输入框和提交按钮。
5. “在 GitHub 查看”链接，作为透明的数据来源和故障回退。

回复列表分页不应阻塞 Moment 信息流自身的滚动加载。组件必须避免展开后自动抢夺页面焦点或让底部 Moment 哨兵连续误触发。

### 12.3 针对某人回复

用户选择“回复”后，输入区明确显示目标：

```text
回复 @octocat                          [取消]
┌──────────────────────────────────────────┐
│ 写下回复……                               │
└──────────────────────────────────────────┘
```

取消后清除 `replyToId`。提交成功后，新回复插入对应顶层评论的回复区域，并清空正文与回复目标。

是否自动在正文前写入 `@username` 应谨慎处理。GitHub 的 `replyToId` 已经保存关系；若希望产生 GitHub mention 通知，可以显式加入 `@username`，但这会改变实际评论正文并可能产生额外通知。首版建议只使用原生回复关系，不自动修改用户正文，确认通知行为后再决定。

### 12.4 提交状态

提交过程需要：

- 禁止重复提交。
- 显示明确的进行中状态。
- 错误时保留用户输入。
- 会话过期时提示重新登录，不静默丢失内容。
- GitHub 限流时提供可重试提示，不无限自动重试。
- 成功后使用 API 返回值更新列表和计数。

### 12.5 时间显示

回复可以沿用 Moment 已有的中文相对时间风格，但应保留标准 `datetime` 和完整时间提示。相对时间需要在客户端定时或重新获得焦点时更新，避免页面长时间打开后显示过期的“刚刚”。

### 12.6 无障碍

回复组件至少需要：

- 展开按钮使用 `aria-expanded` 和稳定关联区域。
- 头像使用合适替代文本，纯装饰头像可避免重复朗读。
- 回复按钮的无障碍名称包含目标用户名。
- 回复目标变化时通过可感知状态告知辅助技术。
- 提交错误使用非仅颜色的文本反馈。
- 加载更多后保持合理焦点，不把键盘用户强制移到列表末尾。
- 所有按钮复用 Lucide 图标和现有焦点样式。

## 13. 评论正文渲染与安全

推荐返回 GitHub 已渲染的 `bodyHTML`，从而保持 GitHub Markdown、链接和代码的表现一致。但回复是外部用户输入，即使 GitHub 已执行平台级过滤，本站仍应把它视为不可信内容。

可选策略：

1. 使用 `bodyHTML`，在前端通过成熟 HTML sanitizer 再做一次允许列表过滤，然后以受限排版作用域渲染。
2. 只返回 `body`，在本站使用受控 Markdown parser 渲染并禁止原始 HTML。

第一种更接近 GitHub 显示结果，第二种控制更严格但可能与 GitHub 产生语法差异。不要用正则清洗 HTML，也不要允许评论中的 HTML、class 或 style 影响 Moment 页面外部。

所有外部链接应设置安全的 `rel`，图片、视频和超大内容需要限制，避免评论成为页面性能或追踪入口。首版可以只支持文本、链接、强调、列表、引用和行内代码，不渲染评论中的外部图片。

## 14. 缓存、分页和刷新

### 14.1 GitHub API 限制

GitHub GraphQL 使用查询点数和速率限制。Worker 应读取 GitHub 返回的 rate-limit 信息并记录可观测日志，在接近限制时优先保护发表请求。

### 14.2 缓存建议

- 匿名评论数量可以缓存 30 至 120 秒。
- 已展开的匿名评论第一页可以短时缓存。
- 当前用户权限字段不能错误地与匿名缓存混用。
- 发表成功后，当前浏览器立即合并返回对象，不需要等待公共缓存失效。
- 可以在 Mutation 后清除已知缓存；无法全局立即失效时，接受短暂最终一致性。
- installation token 缓存到过期前几分钟再刷新。

Cloudflare Cache API 可以承担公开 GET 缓存。KV 更适合会话、限流计数或跨节点状态，不必把每一份评论正文长期复制到 KV。

### 14.3 分页

评论和回复都必须按 GitHub GraphQL cursor 分页，不能假设一条 Moment 永远只有少量回复。首版可以设置较小的第一页，例如 10 至 20 条顶层评论，并按需加载更多。

回复区域建议优先完整展示少量答复；当单个顶层评论答复很多时，再显示“查看其余回复”。服务端应限制单次 GraphQL 节点数和查询复杂度。

### 14.4 非实时更新

GitHub Discussions 不为本站提供直接的浏览器实时推送。首版采用以下策略即可：

- 用户展开时获取最新列表。
- 页面重新获得焦点且缓存已过期时刷新。
- 用户主动点击刷新。
- 必要时只对已展开区域进行 60 至 120 秒低频轮询。

不建议一开始引入 WebSocket 或 Durable Objects，它们会显著增加复杂度，而个人博客回复不需要聊天级实时性。

## 15. 安全边界

Worker 至少需要落实以下约束：

- 密钥只存储在 Cloudflare secrets，不进入仓库、构建变量输出或浏览器。
- CORS 只允许正式博客 origin 和明确的本地开发 origin。
- 携带 Cookie 的响应不能使用通配符 `Access-Control-Allow-Origin: *`。
- 所有状态变更验证 `Origin`、CSRF token 和登录会话。
- OAuth `state` 随机、短期、一次性使用。
- `returnTo` 只接受本站相对路径。
- 用户 access token 和 refresh token 加密保存并设置 TTL。
- GitHub App 权限遵循最小权限原则。
- 只允许固定仓库、固定 category 和已登记 Discussion。
- 服务端重新校验 `replyToId` 的归属，不能相信前端。
- 评论长度、请求体大小、Content-Type 和请求频率都有上限。
- 日志不得记录 access token、Cookie、完整授权码或私密请求头。
- GraphQL 查询由服务端预定义，不接受浏览器上传任意 query。
- API 错误返回公共错误码，不直接透传 GitHub 内部响应和堆栈。

GitHub 登录可以提高滥用成本，但不能替代限流和审核。维护者仍需要准备锁定 Discussion、删除内容、屏蔽用户或暂时关闭本站发表入口的操作流程。

## 16. 隐私与用户提示

回复功能会把内容和身份交给 GitHub。正式界面或站点隐私说明应明确：

- 回复需要 GitHub 账号。
- 回复会公开保存到指定 GitHub Discussion。
- GitHub 会依据其条款处理账号、请求和内容数据。
- 用户头像和资料链接来自 GitHub。
- 删除本站 Cookie 不等于删除 GitHub 上已经发表的回复。
- 删除或修改内容需要通过 GitHub 能力或联系维护者处理。

Worker 日志保留时间和会话存储策略也应在实施时明确，避免收集不必要的用户信息。

## 17. 免费额度与成本预估

根据 2026-09-04 查阅的 Cloudflare 官方价格说明，Workers Free Plan 包含：

- Worker 请求 100,000 次/天。
- 每次调用 10 ms CPU 时间。
- Workers KV 读取 100,000 次/天。
- Workers KV 写入、删除和 list 各 1,000 次/天。
- KV 存储 1 GB。
- Worker 数据传输不另收出口带宽费用。

免费额度不是任意规模永久免费。达到 Free Plan 日限制后，对应操作通常会失败；Workers Paid 当前最低为每个账户每月 5 美元。价格将来可能变化，实现或上线前应重新查看：

- [Cloudflare Workers Pricing](https://developers.cloudflare.com/workers/platform/pricing/)
- [Cloudflare Workers KV Pricing](https://developers.cloudflare.com/kv/platform/pricing/)

个人博客通常远低于上述额度。真正需要控制的是请求放大：若一次显示 20 条 Moment 就立即发出 20 个评论请求，5,000 次页面访问便可能达到 100,000 次 Worker 请求。批量获取数量、展开后再加载正文和短时缓存可以避免这一问题。

GitHub App 注册和 GitHub API 通常不按调用收费，但受到 API rate limit 和 GraphQL 查询点数限制。自定义域名本身可能存在域名注册费用，这不属于 Worker 使用费。

## 18. 配置与密钥草案

Worker 可能需要以下部署配置，最终名称以实现时的 OpenSpec 和代码为准：

```text
BLOG_ORIGIN
GITHUB_APP_ID
GITHUB_APP_CLIENT_ID
GITHUB_APP_CLIENT_SECRET
GITHUB_APP_PRIVATE_KEY
GITHUB_INSTALLATION_ID
GITHUB_OWNER
GITHUB_REPO
GITHUB_DISCUSSION_CATEGORY_ID
SESSION_SECRET
```

普通非敏感配置可以进入 Worker 配置文件；client secret、private key 和 session secret 必须使用 Cloudflare secret 管理。

博客业务配置可能增加公开 API 地址和功能开关：

```ts
momentComments: {
  enabled: true,
  apiBaseUrl: "https://comments.example.com",
}
```

`discussionNumber` 属于每条 Moment 的内容映射，适合进入 frontmatter；仓库 ID、category ID、私钥和令牌不属于 Moment 内容。

## 19. 故障与降级

回复是增强能力，不应成为 Moment 正文的硬依赖。

| 故障                     | 页面行为                                                |
| ------------------------ | ------------------------------------------------------- |
| Worker 无法访问          | Moment 正常展示，回复区显示暂时不可用和 GitHub 直达链接 |
| GitHub API 超时          | 保留已加载回复，允许用户手动重试                        |
| GitHub 限流              | 停止自动轮询，提示稍后重试，优先保留发表能力            |
| 用户会话过期             | 保留输入，要求重新登录后再次提交                        |
| Discussion 锁定          | 继续显示历史回复，隐藏或禁用输入                        |
| Moment 未配置 Discussion | 不请求 API，显示未开放或隐藏回复入口                    |
| Discussion 被删除        | 返回稳定的未找到状态，不影响整个信息流                  |
| GitHub HTML 渲染失败     | 回退为纯文本正文，不直接显示未经处理的 HTML             |

## 20. 可观测性

Worker 应记录不包含敏感数据的结构化信息：

- 请求类型和结果状态。
- GitHub API 延迟。
- 缓存命中率。
- GraphQL rate limit 剩余额度。
- OAuth 成功、失败与 state 校验失败数量。
- 发表成功、失败、被限流和 Discussion 锁定数量。
- 按错误类别聚合的异常，不记录完整评论正文。

应准备一个简单的健康检查接口，只检查 Worker 自身配置，不在每次探测时消耗 GitHub API 配额或泄露仓库信息。

## 21. 测试与验收建议

正式实施时应覆盖：

### 21.1 数据与构建期

- `discussionNumber` 缺省、有效、无效和重复映射。
- 草稿 Moment 不进入生产公开映射。
- slug、fragment 和 Discussion number 的职责保持独立。
- 未开启回复功能时不改变当前 Moment 数据和页面行为。

### 21.2 Worker 单元与契约

- OAuth state 创建、过期、重放和不匹配。
- session 创建、刷新、注销和过期。
- 仓库、分类、slug、Discussion 和 `replyToId` 白名单。
- GraphQL cursor 分页和错误归一化。
- GitHub 401、403、404、锁定和 rate limit 响应。
- 评论正文长度、空白、请求体大小和非法 JSON。
- CORS、Origin、CSRF 和 Cookie 属性。
- 日志不包含任何令牌。

### 21.3 Vue 组件

- 无回复、有回复、多页回复和大量子回复。
- 未登录、登录中、已登录和会话失效。
- 选择回复目标、取消、成功和失败后保留正文。
- Discussion 锁定、删除、未配置和 API 离线。
- 明暗模式、窄屏、长用户名、长链接和长单词。
- 键盘操作、焦点顺序、状态播报和 reduced motion。

### 21.4 浏览器验收

- GitHub 登录完整重定向流程。
- 评论确实以当前访客 GitHub 身份出现在 Discussion。
- `replyToId` 确实建立正确回复关系。
- GitHub Pages 与 Worker 跨域请求和 Cookie 行为。
- Chrome、Firefox 和 Safari 的登录与登出。
- Moment 无限滚动与评论展开互不干扰。
- Worker 故障时静态 Moment 仍可完整阅读。

## 22. 分阶段实施建议

### 阶段 0：技术验证

- 创建测试 GitHub App、测试 Discussion 分类和单个 Discussion。
- 用 Worker 完成匿名读取一条 Discussion。
- 完成一次真实 GitHub 登录并以用户身份发表测试回复。
- 验证回复指定评论、token 刷新和退出登录。
- 验证正式域名方案以及浏览器 Cookie 行为。

这一阶段应优先证明身份和权限链路，不先投入完整界面。

### 阶段 1：只读回复

- 为 Moment 增加 `discussionNumber` 内容字段。
- 增加评论数量批量接口和评论分页接口。
- 在 Moment 卡片中实现只读回复列表、加载状态和 GitHub 直达链接。
- 建立匿名缓存、错误降级和基础可观测性。

只读能力可以先上线，验证实际访问量和 UI 密度。

### 阶段 2：登录、发表和针对回复

- 接入 GitHub App 登录、会话和注销。
- 实现顶层评论发表。
- 实现 `replyToId`、回复目标和取消回复。
- 增加 CSRF、限流、输入校验和锁定状态。
- 处理提交成功后的本地更新和缓存一致性。

### 阶段 3：体验与审核完善

- 完善相对时间、分页、刷新策略和移动端交互。
- 增加评论正文安全渲染和内容限制。
- 建立审核、封禁、锁定和故障处理说明。
- 根据真实使用决定是否增加 Reaction、编辑或删除入口。

## 23. 回滚与可迁移性

回复系统应通过独立配置开关启用。关闭开关后：

- `/moment` 恢复为当前纯静态信息流。
- Moment Markdown 中的 `discussionNumber` 可以保留，不影响正文构建。
- GitHub Discussions 中已有数据继续存在并可直接访问。
- Worker 可以独立停止部署，不影响 GitHub Pages。

由于数据存放在标准 GitHub Discussions 中，未来可以：

- 回退到 Giscus 展示同一批 Discussion。
- 更换 Worker 为 Vercel、Netlify 或其他 Function。
- 更换前端组件而不迁移回复正文。
- 通过 GitHub API 导出数据并迁往其他评论系统。

## 24. 已确定的设计倾向

- 使用 GitHub Discussions，不使用 GitHub Issues 作为新回复系统的数据模型。
- 不尝试从 Giscus iframe 抓取评论正文。
- 使用 `@octokit/graphql` 或等价的 GitHub GraphQL 客户端，不依赖不完整的第三方评论组件。
- 需要服务端能力，但优先使用 Cloudflare Worker，不维护传统服务器。
- 评论数据只保存于 GitHub；KV 只保存会话、限流或缓存等辅助状态。
- 使用 GitHub App 用户身份发表，不公开维护者 PAT。
- 每条 Moment 显式绑定 `discussionNumber`。
- 首版预创建 Discussion，不在访客首次评论时自动创建。
- 完整评论按展开懒加载，计数按当前 Moment 批量加载。
- 界面采用朋友圈式紧凑回复关系，不做无限层级缩进。
- 回复功能失败时，静态 Moment 必须可继续阅读。
- 该能力应创建独立 OpenSpec change，不扩大当前 `add-moment-feed`。

## 25. 实施前仍需确认的问题

- 回复仓库使用博客源码仓库还是独立公开仓库。
- 正式博客是否使用自定义域名，从而为 Worker 提供同站子域名。
- 回复区默认全部收起，还是自动展开少量最新回复。
- 首版是否只支持纯文本与基础 Markdown，是否允许评论图片。
- 首版是否包含 Reaction、用户编辑和用户删除。
- Discussion 由作者手工创建，还是同时开发作者 CLI。
- 评论排序使用 GitHub 默认顺序，还是提供最新优先选项。
- 登录会话采用 KV，还是先用加密 Cookie 完成技术验证。
- 是否为长文章继续保留独立 Giscus，并与 Moment 自建系统并存。
- 站点需要展示怎样的交流规则、隐私说明和 GitHub 数据提示。

## 26. 后续 OpenSpec 建议

当准备进入实现时，应新建独立 change，例如：

```text
add-github-moment-replies
```

该 change 至少应拆分以下 capability：

- `moment-discussion-mapping`：Moment 与 Discussion 的构建期映射和校验。
- `moment-reply-reading`：计数、列表、分页、缓存和降级。
- `github-comment-auth`：GitHub App 登录、会话、注销和安全边界。
- `moment-reply-writing`：顶层评论、指定回复、输入校验和错误状态。
- `moment-reply-experience`：Moment 内展开、响应式、明暗模式和无障碍。
- `comment-service-operations`：部署配置、密钥、监控、限流和审核流程。

Proposal 需要明确这是新的动态能力，不修改长文章 Giscus 的现有行为；Design 需要固定身份流、Discussion 映射、跨域 Cookie 和失败降级；Tasks 应先安排阶段 0 的权限链路验证，再进入完整 UI 开发。
