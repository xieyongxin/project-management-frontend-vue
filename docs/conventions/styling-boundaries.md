# Styling Boundaries

Element Plus 负责 Button、Input、Form、Menu、Popover、Dropdown、Result 等企业级控件。

Tailwind 负责页面布局、Flex、Grid、Spacing、尺寸和自研展示组件。

禁止：

- 大面积使用 `:deep(.el-*)` 覆盖 Element Plus 内部结构。
- 使用 `!important` 强行覆盖组件。
- 在业务代码中依赖 Element Plus 内部 DOM。
- 同时维护两套 Button、Input、Menu 等核心组件。

Element Plus 外观调整优先通过 props、CSS 变量、ConfigProvider 或项目级包装组件完成。
