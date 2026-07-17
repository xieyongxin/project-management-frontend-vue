# 0004 TanStack Query for Vue Server State

状态：Accepted

## 背景

服务端状态需要缓存、失效、并发控制、错误处理和重新获取能力。

## 决策

使用 TanStack Query for Vue 管理服务端状态。Query Key 放在所属 feature 内。

## 备选方案

- 直接在组件中请求：缓存和错误处理会分散。
- Pinia 管全部请求状态：会把服务端缓存和客户端偏好混在一起。

## 后果

Pinia 只用于客户端 UI 偏好，服务端数据走 Query。
