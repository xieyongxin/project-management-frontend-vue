import { defineComponent, h } from 'vue'
import { ElButton, ElResult } from 'element-plus'
import { RouterLink } from 'vue-router'

const BackHomeButton = () =>
  h(
    RouterLink,
    { to: '/' },
    {
      default: () => h(ElButton, { type: 'primary' }, () => '返回仪表盘'),
    },
  )

export const ForbiddenPage = defineComponent({
  name: 'ForbiddenPage',
  setup() {
    return () =>
      h(
        ElResult,
        { icon: 'warning', title: '403', subTitle: '暂无访问权限' },
        {
          extra: BackHomeButton,
        },
      )
  },
})

export const NotFoundPage = defineComponent({
  name: 'NotFoundPage',
  setup() {
    return () =>
      h(
        ElResult,
        { icon: 'error', title: '404', subTitle: '页面不存在' },
        {
          extra: BackHomeButton,
        },
      )
  },
})
