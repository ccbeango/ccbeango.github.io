## ADDED Requirements

### Requirement: 站点一致的朋友圈页面骨架

`/moment` MUST NOT 渲染 Bean Blog 的全局 Header，SHALL 使用 52px 高、覆盖个人封面顶部且宽度与中央内容一致的 Moment 专用固定 Header，并保留 Bean Blog 的 Footer 和 appearance 状态。专用 Header SHALL 提供返回首页命令、滚动后可见的“动态”标题和现有主题切换控件；滚动状态 SHALL 使用半透明语义背景与磨砂模糊，MUST NOT 使用贯穿 viewport 的边框分隔。页面 SHALL 在每次进入时从配置列表随机选择一张个人封面，并在现有内容容器内提供 Icefox 式个人封面、右下方昵称、越过封面下沿的方形头像、右对齐签名和窄幅单列动态流。页面 SHALL 使用 `muted` 语义面层区分两侧画布、使用 `background` 语义面层承载中央封面与信息流，并 MUST 使用现有 LXGW WenKai Lite、Tailwind CSS 4 utility、语义设计令牌、响应式 gutter 与明暗模式，不得复制参考主题的品牌、素材、PHP、Bulma 类或硬编码色板。

#### Scenario: 桌面访问动态页

- **WHEN** 访问者在桌面 viewport 打开 `/moment`
- **THEN** 页面使用与中央内容等宽、覆盖封面的专用 Header，在页脚之前显示受现有内容宽度约束的个人封面和单列动态流，中央内容面与两侧画布有克制对比，且字体、颜色和控件与博客其他页面一致

#### Scenario: 移动端访问动态页

- **WHEN** 访问者在移动 viewport 打开 `/moment`
- **THEN** 封面、个人信息和动态流使用扣除现有页面 gutter 后的可用宽度，文字、头像、图片和操作控件不重叠且页面没有水平滚动

#### Scenario: 切换明暗模式

- **WHEN** 访问者在动态页切换 appearance
- **THEN** 两侧画布、中央内容面、个人区、动态、分隔线、popover 和文本使用现有同名语义令牌同步切换，并保持足够对比度

#### Scenario: 滚动专用 Header

- **WHEN** 访问者从封面顶部向下滚动
- **THEN** 专用 Header 从透明覆盖状态切换为半透明语义背景与磨砂模糊，显示“动态”标题且不出现硬边框，返回首页和主题控件保持可用且内容不发生布局偏移

### Requirement: 动态卡片信息层级

每条动态 SHALL 使用左侧固定头像列和右侧弹性正文列，并 SHALL 显示作者名、可选草稿或置顶标识、短 Markdown 正文、可选图库、日期、地点与标签。列表 SHALL 使用分隔线而非浮动卡片或嵌套卡片组织内容；作者与地点使用现有强调语义，正文使用前景色，日期和辅助信息使用弱化语义。

#### Scenario: 显示完整动态

- **WHEN** 一条已发布动态包含正文、图片、地点和标签
- **THEN** 页面按头像、作者、正文、图库和底部元信息的顺序显示全部内容，并保持 Icefox 式紧凑间距

#### Scenario: 显示仅图片动态

- **WHEN** 一条动态没有正文但包含图片
- **THEN** 卡片省略空正文区域并正常显示作者、图库和底部元信息

#### Scenario: 显示空状态

- **WHEN** 当前环境没有可显示的动态
- **THEN** `/moment` 在个人区之后显示简洁的“暂无动态”状态，并且不渲染分页控件

### Requirement: 短文本展开与收起

动态正文 SHALL 默认最多显示六行。系统 SHALL 根据渲染后的实际溢出情况决定是否显示“全文”控件，MUST NOT 为未溢出的正文显示无效控件；展开与收起 SHALL 保持卡片宽度稳定并通过 `aria-expanded` 暴露状态。

#### Scenario: 展开溢出正文

- **WHEN** 动态正文渲染后超过六行且访问者激活“全文”
- **THEN** 页面显示完整正文、将控件变为“收起”并把 `aria-expanded` 设为 `true`

#### Scenario: 收起正文

- **WHEN** 已展开动态的访问者激活“收起”
- **THEN** 正文恢复六行限制且控件状态同步恢复

#### Scenario: 短正文无需控件

- **WHEN** 动态正文未超过六行
- **THEN** 页面完整显示正文且不显示展开或收起控件

### Requirement: 响应式动态图库

动态图库 SHALL 支持一至九张图片。单图 SHALL 在受限最大宽高内保留固有比例；二图和四图 SHALL 使用两列；三图及五至九图 SHALL 使用三列正方形缩略图。缩略图 MUST 使用固定比例或尺寸避免加载时布局偏移，并 SHALL 使用懒加载和 `object-cover` 形成 Icefox 式宫格。

#### Scenario: 显示单张图片

- **WHEN** 动态声明一张横图或竖图
- **THEN** 页面在卡片正文列内按图片固有比例受限展示，不将其强制裁剪成正方形

#### Scenario: 显示二图与四图

- **WHEN** 动态声明两张或四张图片
- **THEN** 页面使用紧凑两列正方形宫格并保持源顺序

#### Scenario: 显示其他多图数量

- **WHEN** 动态声明三张或五至九张图片
- **THEN** 页面使用紧凑三列正方形宫格并保持源顺序

### Requirement: 复用照片预览

个人动态图片 SHALL 复用现有 `PhotoPreview` dialog、遮罩、键盘入口、焦点恢复、缩放、拖动和明暗模式行为，不得引入第二套 lightbox。图片来源和预览来源 MUST 正确应用站点 base path，并 SHALL 使用动态模型中由正文图片或兼容 frontmatter 提供的 `alt` 生成替代文本与预览名称。

#### Scenario: 指针打开图片

- **WHEN** 访问者点击动态宫格中的图片
- **THEN** 现有照片预览打开对应原图，并提供既有关闭、缩放、拖动和焦点恢复行为

#### Scenario: 键盘打开图片

- **WHEN** 键盘用户聚焦动态图片并按 Enter 或 Space
- **THEN** 现有照片预览打开对应原图，图片具有来自 `alt` 的可访问名称

#### Scenario: 使用子路径部署

- **WHEN** 站点通过非根 `SITE_BASE` 部署
- **THEN** 动态头像、封面、缩略图和预览原图均从正确的 base 路径加载

### Requirement: 真实操作与稳定分享

每条动态 SHALL 使用 Lucide `Ellipsis` 图标提供 Icefox 式紧凑操作入口，首版菜单 MUST 只包含真实可用的“复制链接”命令。系统 MUST NOT 显示虚假的全站点赞、点赞计数或信息流内逐条评论；复制成功或失败 SHALL 提供非仅颜色的可感知反馈，popover SHALL 支持键盘打开、关闭和焦点管理。

#### Scenario: 复制动态链接

- **WHEN** 访问者打开动态操作菜单并激活“复制链接”
- **THEN** 系统复制包含当前站点、`/moment` 路径和稳定 fragment 的链接，并显示可感知的成功反馈

#### Scenario: Clipboard API 不可用

- **WHEN** 浏览器不支持 Clipboard API 或写入被拒绝
- **THEN** 系统执行兼容回退或显示明确失败反馈，且页面其他功能继续可用

#### Scenario: 关闭操作菜单

- **WHEN** 访问者按 Escape、激活菜单外区域或在菜单中完成命令
- **THEN** popover 关闭并将焦点恢复到该动态的操作按钮

### Requirement: 朋友圈时间显示

动态日期 SHALL 参考 Hugo-Theme-Amigo 的朋友圈时间层级：当天显示二十四小时制 `HH:mm`，昨天显示“昨天”，过去七个日历日内显示中文星期，今年内更早显示“月日”，其他年份显示“年月日”。日期 SHALL 使用浏览器当前时刻更新显示，且 `time` 元素 MUST 保留机器可读的完整 `datetime` 和可感知的精确时间提示。

#### Scenario: 显示近期动态时间

- **WHEN** 动态发布时间分别位于当天、昨天或过去七个日历日内
- **THEN** 页面分别显示 `HH:mm`、“昨天”或对应中文星期，并可获取完整发布时间

#### Scenario: 显示较早动态时间

- **WHEN** 动态发布时间早于过去七个日历日
- **THEN** 同年日期显示“月日”，跨年日期显示“年月日”

### Requirement: 导航、滚动加载与文档

站点主导航 SHALL 提供名称为“动态”的 `/moment` 入口，Moment 专用 Header SHALL 提供返回首页入口。动态滚动加载 SHALL 提供可感知状态和可聚焦的手动回退，并保持 `/blog` 分页原行为。正式使用手册 SHALL 说明动态文件位置、frontmatter、正文末尾图片语法及旧字段兼容边界、图片资源、Markdown 范围、草稿、置顶、每批数量、滚动加载、朋友圈时间、稳定链接和首版互动边界。

#### Scenario: 从全站导航进入动态页

- **WHEN** 访问者激活主导航中的“动态”
- **THEN** 客户端导航到应用了站点 base path 的 `/moment`

#### Scenario: 从动态页返回首页

- **WHEN** 访问者激活 Moment 专用 Header 的返回首页命令
- **THEN** 客户端导航到应用了站点 base path 的 `/`

#### Scenario: 作者查阅写作手册

- **WHEN** 作者需要新增或发布短动态
- **THEN** 正式手册提供与实现和测试一致的完整语法、资源路径和发布规则
