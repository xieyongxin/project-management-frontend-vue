# 0001 Vue Vite SPA

状态：Accepted

## 背景

项目需要企业内部项目协作工作台，首期为单应用、桌面优先、中文界面。

## 决策

使用 Vue 3、TypeScript strict、Vite 和 pnpm 构建单页应用。

## 备选方案

- Nuxt：首期不需要 SSR、文件路由和服务端渲染能力。
- Monorepo：首期只有一个应用，暂不引入。

## 后果

前端由静态资源部署，路由由浏览器端接管。后续如需 SSR 或多应用，再通过新 ADR 评估。
