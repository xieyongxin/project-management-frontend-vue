# 00 Architecture

本文是 Vue 版项目协作工作台的架构地图。代码仓库文档是工程规范的权威来源。

## 技术边界

- Vue 3 + TypeScript strict + Vite + pnpm。
- Vue Router 负责浏览器端路由。
- TanStack Query for Vue 负责服务端状态、缓存、失效和请求并发。
- Pinia 只保存侧栏折叠等客户端 UI 偏好。
- Axios + Orval 负责 OpenAPI 契约生成和 HTTP 调用。
- Element Plus 负责企业级交互组件，Tailwind 负责布局、间距和自研展示组件。

## 目录边界

```text
src/
├── app/       # 应用根组件和全局 Provider
├── router/    # Vue Router 路由和受保护壳层
├── layouts/   # 登录布局和后台主布局
├── features/  # auth、dashboard 等业务模块
├── shared/    # 跨模块基础能力
├── styles/    # Token、全局样式和品牌样式
├── mocks/     # MSW Mock
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

首期由 MSW 模拟：

- `POST /auth/login`
- `POST /auth/logout`
- `GET /auth/me`
- `GET /auth/csrf`

## ADR 索引

- [0001 Vue Vite SPA](adr/0001-vue-vite-spa.md)
- [0002 Element Plus Primary UI](adr/0002-element-plus-primary-ui.md)
- [0003 Server Session Cookie Auth](adr/0003-server-session-cookie-auth.md)
- [0004 TanStack Query Server State](adr/0004-tanstack-query-vue-server-state.md)
- [0005 Feature First and Pinia Scope](adr/0005-feature-first-and-pinia-scope.md)
