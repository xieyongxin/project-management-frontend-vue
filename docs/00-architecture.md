# 00 Architecture

本文是 Vue 版项目协作工作台的架构地图。代码仓库文档是工程规范的权威来源。

## 技术边界

- Vue 3 + TypeScript strict + Vite + pnpm。
- Vue Router 负责浏览器端路由。
- TanStack Query for Vue 负责服务端状态、缓存、失效和请求并发。
- Pinia 只保存侧栏折叠等客户端 UI 偏好。
- Axios + Orval 负责 OpenAPI 契约生成和 HTTP 调用。
- Element Plus 负责企业级交互组件，Tailwind 负责布局、间距和自研展示组件。
- 项目类型排序使用 SortableJS；默认工作流只读图预览使用 Vue Flow。
- 运行时不保留 MSW/mock 数据入口；业务数据、项目创建模板、负责人候选人和配置项均以后端接口为准。

## 目录边界

```text
src/
├── app/       # 应用根组件和全局 Provider
├── router/    # Vue Router 路由和受保护壳层
├── layouts/   # 登录布局和后台主布局
├── features/  # auth、dashboard 等业务模块
├── shared/    # 跨模块基础能力
├── styles/    # Token、全局样式和品牌样式
├── test/      # 测试全局设置
└── assets/    # 源码内静态资源
```

依赖方向：

```text
app/router → layouts/features/shared
layouts    → shared
features   → shared
shared     → shared
```

feature 之间禁止直接依赖。跨领域流程由 router/app 组合，真正共享的能力下沉到 shared。

## 鉴权流程

正式环境采用同域网关和服务端会话：

- `HttpOnly + Secure + SameSite=Lax` Session Cookie。
- 变更请求携带与会话绑定的 CSRF Token。
- 浏览器存储中不得保存访问令牌或刷新令牌。

首期对接 Go 后端真实接口，接口契约来自后端仓库 `openapi/openapi.yaml`，前端通过 Orval 生成客户端：

- `POST /auth/emergency/login`
- `POST /auth/logout`
- `GET /me`
- `GET /auth/csrf`
- `GET /auth/wecom/authorize`
- `GET /auth/wecom/callback`

企业微信登录在页面内展示扫码体验。当前阶段按正式授权 URL、二维码 URL、state 和 callback 链路实现，第三方 code/userid 校验由后端模拟通过并映射到已有用户。

## 当前业务边界

已实现页面以“登录、工作台、项目管理、项目详情概要、配置中心”为验收边界。项目管理与配置中心不在前端构造项目类型、负责人、流程模板或工作流候选项；新建项目读取 `/projects/create-template`，项目类型筛选读取后端项目类型模板，配置保存只影响后续新建项目。

## ADR 索引

- [0001 Vue Vite SPA](adr/0001-vue-vite-spa.md)
- [0002 Element Plus Primary UI](adr/0002-element-plus-primary-ui.md)
- [0003 Server Session Cookie Auth](adr/0003-server-session-cookie-auth.md)
- [0004 TanStack Query Server State](adr/0004-tanstack-query-vue-server-state.md)
- [0005 Feature First and Pinia Scope](adr/0005-feature-first-and-pinia-scope.md)
