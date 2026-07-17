import { defineComponent, h, onMounted } from 'vue'
import { ElEmpty } from 'element-plus'

export const BlankRoutePage = defineComponent({
  name: 'BlankRoutePage',
  props: {
    title: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    onMounted(() => {
      document.title = `${props.title} · 项目协作工作台`
    })

    return () =>
      h('div', { class: 'flex min-h-[360px] items-center justify-center' }, [
        h(ElEmpty, {
          description: `${props.title}模块待接入`,
        }),
      ])
  },
})
