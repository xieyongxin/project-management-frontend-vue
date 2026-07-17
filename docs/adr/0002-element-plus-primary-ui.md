# 0002 Element Plus Primary UI

状态：Accepted

## 背景

系统是企业内部管理工具，需要稳定的表单、按钮、菜单、弹窗和反馈组件。

## 决策

使用 Element Plus 作为 Vue 版主要 UI 组件库。Tailwind 负责布局、间距和自研展示组件，不用于大面积覆盖 Element Plus 内部样式。

## 备选方案

- Naive UI：组件质量较好，但本项目优先选择企业后台常见度更高的 Element Plus。
- 自研组件库：首期成本过高。

## 后果

视觉定制优先通过 Element Plus props、CSS 变量、ConfigProvider 和项目级包装组件实现。
