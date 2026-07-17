# 项目协作工作台前端 Vue 版

面向研发、测试与项目协作场景的 Vue 3 企业级前端工程基线。视觉和首期功能对齐 React 版：Mock 登录、受保护主布局、Sidebar、Header、OpenAPI 代码生成和质量门禁。

## 环境

- Node.js 24 LTS
- pnpm 11

```bash
pnpm install
copy .env.example .env.local
pnpm dev
```

Mock 演示账号：`demo@example.com` / `demo1234`。

## 常用命令

```bash
pnpm api:generate   # 从 OpenAPI 生成 DTO 和请求函数
pnpm typecheck      # Vue + TypeScript 严格检查
pnpm lint           # ESLint 与架构边界检查
pnpm test           # Vitest
pnpm build          # 生产构建
pnpm check          # 执行完整本地质量门禁
```

开始开发前先阅读 [架构地图](docs/00-architecture.md) 和 [Feature Public API 规范](docs/conventions/feature-public-api.md)。重大技术决策记录在 `docs/adr`，生成目录 `src/shared/api/generated` 禁止手工修改。
