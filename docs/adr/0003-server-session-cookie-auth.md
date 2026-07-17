# 0003 Server Session Cookie Auth

状态：Accepted

## 背景

系统面向企业内部场景，鉴权应降低浏览器令牌泄露风险。

## 决策

正式环境使用同域网关和服务端 Session Cookie。浏览器不保存 access token 或 refresh token。变更请求携带 CSRF Token。

## 备选方案

- localStorage JWT：实现简单，但 XSS 风险更高。
- refresh token 轮换：适合跨域和开放客户端，首期不需要。

## 后果

Axios 开启 `withCredentials`，前端只感知登录态、当前用户和错误码，不管理长期令牌。
