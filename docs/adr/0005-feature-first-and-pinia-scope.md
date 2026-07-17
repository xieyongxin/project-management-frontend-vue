# 0005 Feature First and Pinia Scope

状态：Accepted

## 背景

企业级前端需要限制模块间依赖，避免页面和业务模块逐步互相缠绕。

## 决策

采用 Vue 风格的 feature-first 结构。feature 对外通过 `index.ts` 暴露公共 API。Pinia 只保存客户端 UI 偏好。

## 备选方案

- 按文件类型全局分层：小项目简单，但业务增长后模块边界弱。
- 全局 Pinia store：容易把所有业务状态集中到一个中心。

## 后果

ESLint 使用 boundaries、restricted imports 和 cycle 检查执行依赖规则。
