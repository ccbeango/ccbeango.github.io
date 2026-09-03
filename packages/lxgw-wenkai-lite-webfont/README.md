# LXGW WenKai Lite Webfont

这是 `bean-blog` 的本地 workspace 字体包。包内字体来自
[`lxgw/LxgwWenKai-Lite`](https://github.com/lxgw/LxgwWenKai-Lite)，Unicode 分片方式参考
[`chawyehsu/lxgw-wenkai-webfont`](https://github.com/chawyehsu/lxgw-wenkai-webfont)。

当前固定官方 `v1.522`：

- `LXGWWenKaiLite-Regular.ttf` -> `font-weight: 400`
- `LXGWWenKaiLite-Medium.ttf` -> `font-weight: 500`

官方不再提供 Bold，Medium 不会被错误标记为 `700`；页面需要 `600` 或 `700` 时由浏览器使用可用字重合成。

博客通过以下包入口直接引用生成后的 CSS：

```ts
import "@bean-blog/lxgw-wenkai-lite-webfont";
```

## 更新字体

生成脚本需要 Python 3.10+ 和固定版本的 FontTools：

```shell
python -m pip install -r packages/lxgw-wenkai-lite-webfont/requirements.txt
pnpm font:update
pnpm font:check
```

`font:update` 从 GitHub latest release API 读取最新稳定版，只接受非 Mono 的 Regular 与 Medium，按 API 提供的文件大小和 SHA256 校验下载内容，再更新 `source.json`、`VERSION`、package version、`index.css` 与 `files/*.woff2`。原始 TTF 仅存在于临时目录，不进入仓库。

`unicode.json` 固定到 `source.json` 记录的参考仓库 revision。除非明确要调整分片策略，升级字体时不应同时替换它。

字体文件遵循 [SIL Open Font License 1.1](./OFL.txt)；固定使用的 `unicode.json` 保留参考项目的 [MIT License](./UNICODE-LICENSE)。
