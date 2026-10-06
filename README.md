# 水哥 AI · Shuige AI

面向企业客户的技术服务落地页（中英双语），托管在 GitHub Pages：
**https://shuimei.github.io/shuige-ai/**

## 技术选型

纯 HTML + **Tailwind CSS v4**（CSS-first 配置）+ **1.7 KB 的渐进增强脚本**。

没有用 Astro / Next / Vite SPA。原因：决定页面性能的是**发到浏览器的 JS 量**，而不是有没有构建步骤。同样经过静态构建的 Next.js 站点在真实用户指标上明显落后于零 JS 的方案，而单页营销站并不需要框架提供的路由或状态管理。代价只有一个：Tailwind 需要一个 CSS 编译步骤，由 GitHub Actions 承担。

### 动效策略：能用 CSS 就不写 JS

视觉动效全部由 CSS 实现，**不消耗主线程**：

| 效果 | 实现 | JS |
|---|---|---|
| 首屏蓝绿极光晕染 | 三层 `radial-gradient` + `transform` 补间动画（走合成器，不触发重排） | 无 |
| 蓝图网格背景 | `linear-gradient` 网格 + `mask-image` 径向淡出 | 无 |
| 标题渐变流动 | `background-clip: text` + `background-position` 动画 | 无 |
| 二维码卡片光环绕行 | `conic-gradient` + `@property --ring-angle`（不注册属性无法插值，会跳变） | 无 |
| 技术栈跑马灯 | `transform: translateX(-50%)` 无限循环，列表复制一份保证无缝 | 无 |
| 卡片悬停抬升 / 辉光 | `transition` + `box-shadow` | 无 |
| 按钮渐变滑动 | `background-position` 过渡 | 无 |
| 滚动进场 | `IntersectionObserver` | **1.7 KB** |

`assets/app.js` 做两件事：滚动进场（IntersectionObserver）和滚动后给吸顶导航加阴影。两者都是**渐进增强**：

- 没有 JS、JS 被拦截或加载失败时，**页面完整可读**、所有链接可用。进场动画由 `<html class="js">` 门控，这个类由内联脚本添加；脚本没跑，类就不存在，所有区块直接可见。
- 脚本加载了但初始化失败（被拦截、截断、语法错误）时，内联脚本里 2.5 秒的兜底定时器会移除 `js` 类，页面重新完整显示——**不会留下一片 opacity:0 的空白**。
- 系统开启"减少动态效果"（`prefers-reduced-motion`）时，所有动画关闭、内容直接呈现。

**没有任何外部资源请求** —— 不加载 Google Fonts、不加载 CDN 脚本、技术栈标签是纯文字。目标客户在大陆，任何境外静态资源都可能拖慢甚至阻塞首屏。字体走系统字体栈（含 PingFang SC / 微软雅黑 / Noto Sans CJK 回退）。

## 目录结构

```
.
├── index.html                中文首页（源文件）
├── en/index.html             英文页（源文件）
├── 404.html                  自包含 404 页（样式内联，脚本运行时推导站点根路径）
├── robots.txt / sitemap.xml
├── assets/
│   ├── wechat-qr.png         微信二维码（已裁成纯二维码，含 4 模块静默区；已重新着色为蓝绿）
│   ├── app.js                渐进增强脚本（1.7 KB，滚动进场 + 导航阴影）
│   └── favicon.svg           蓝→青绿渐变图标
├── src/input.css             Tailwind 入口：@theme 设计令牌、@property、关键帧、组件类
├── scripts/
│   ├── copy-static.mjs       把静态文件复制进 dist/
│   └── serve.mjs             本地预览服务器（可模拟子路径部署）
└── .github/workflows/deploy.yml
```

## 本地开发

```bash
npm install

# 构建到 dist/
npm run build

# 起本地预览，模拟真实子路径 https://shuimei.github.io/shuige-ai/
npm run preview          # → http://localhost:4173/shuige-ai/

# 改样式时开监听
npm run dev
```

`npm run preview` 会在前缀不匹配时返回 404，和线上行为一致 —— 这样写错的绝对路径（`/assets/...`）本地就会暴露，而不是等部署后才发现。

## 部署

推送到 `main` 即自动部署。`Settings → Pages → Source` 必须选 **GitHub Actions**（不是 Deploy from a branch）。

工作流用官方四个 action，版本按 2026-10 实时核实的为准：

| Action | 版本 |
|---|---|
| `actions/checkout` | v7 |
| `actions/setup-node` | v7 |
| `actions/configure-pages` | v6 |
| `actions/upload-pages-artifact` | v5 |
| `actions/deploy-pages` | v5 |

> 注意：GitHub 官方文档里的示例仍写着 v4/v5/v6，已经落后于实际发布版本。升级前请用
> `gh api repos/actions/<name>/releases/latest --jq .tag_name` 重新核实。

权限最小化：顶层只有 `contents: read`，`pages: write` 和 `id-token: write` 仅在 deploy job 上开启。

## ⚠️ 上线前请核对这些内容

页面里的**服务能力**都来自你的描述，但这几处是**我替你做的默认假设**，需要你确认或改写：

1. **技术栈标签**（`index.html` / `en/index.html` 的「常用技术栈」区）
   我按你的服务范围推断了 12 项（LangChain / Playwright / Elasticsearch 等）。**请删掉你没实际用过的**，客户会拿这个问你。

2. **FAQ 里的承诺** —— 这些是会被客户当真的：
   - 「按项目整体报价，拆成若干里程碑分批支付」
   - 「数据采集通常 1–2 周；知识库和 AI 应用集成通常 3–6 周」
   - 「可以签保密协议」「上线后答疑期限写进合同」
   请确认你都能兑现，否则改成你实际的做法。

3. **服务交付清单** —— 五个服务卡片里列的交付物，逐条确认你能做到。

4. **英文页的联系方式** —— 目前只有微信二维码。海外客户通常不用微信，
   建议补一个邮箱或 Calendly 链接（改 `en/index.html` 的 `#contact` 区块）。

5. **页脚年份** `© 2026`。

6. **微信二维码已重新着色，请用手机实扫一次确认。** 原图是紫红渐变，与蓝绿主题冲突。重着色时**保持亮度结构不变、只旋转色相**（扫码器按亮度阈值识别），并把对比度从原图的 **1.91:1 提升到 3.35:1** —— 比微信官方那张卡片本身更清晰。原始截图 `wechat-qrcode.png` 仍在工作区，随时可回退。如果你的手机扫不出来（理论上不会），把原图重新裁一次即可。

## 两个已知风险（与代码无关，但会影响这个页面能不能用）

- **GitHub Pages 官方条款限制商业用途。** 原文禁止把 Pages 当作免费主机来运营在线业务、电商站，或「主要以促成商业交易为目的」的网站。营销落地页属灰色地带，很多同类站点仍在运行；但**一旦放上报价单、在线下单或收款，就是明确违规**。届时需要迁到 Cloudflare Pages / 腾讯云 EdgeOne Pages / 对象存储静态托管。

- **`github.io` 在大陆访问不稳定**，且境外主机无法完成 ICP 备案。你自己能打开不代表客户能打开。
  这个站是**纯静态、零外部依赖**的，整个 `dist/` 可以直接原样搬到任何静态托管上，不需要改一行代码（路径全部是相对路径）。
  如果之后要绑自定义域名，别忘了同时更新 `index.html` / `en/index.html` 的 `canonical`、`hreflang`
  以及 `robots.txt`、`sitemap.xml` 里的绝对 URL。

## 额度

站点远低于 GitHub Pages 的限制（站点 <1GB、发布仓库 <1GB、软性带宽 100GB/月）。
使用自定义 Actions 工作流构建**不受**「每小时 10 次构建」的软性限制约束 —— 那是分支发布模式才有的。
