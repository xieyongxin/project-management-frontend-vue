# Feature Public API

外部模块只能通过 feature 的 `index.ts` 导入公共能力。

允许：

```ts
import { AuthGate, useLogout } from '@/features/auth'
```

禁止：

```ts
import AuthGate from '@/features/auth/components/AuthGate.vue'
```

feature 内部使用相对路径，不从自己的 `index.ts` 反向导入，避免循环依赖。
