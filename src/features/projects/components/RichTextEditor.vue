<template>
  <div class="rich-text-editor">
    <div class="rich-text-editor__toolbar">
      <ElButton
        size="small"
        :type="editor?.isActive('bold') ? 'primary' : 'default'"
        @click="editor?.chain().focus().toggleBold().run()"
      >
        B
      </ElButton>
      <ElButton
        size="small"
        :type="editor?.isActive('italic') ? 'primary' : 'default'"
        @click="editor?.chain().focus().toggleItalic().run()"
      >
        I
      </ElButton>
      <ElButton
        size="small"
        @click="editor?.chain().focus().toggleBulletList().run()"
      >
        列表
      </ElButton>
      <ElButton
        size="small"
        @click="editor?.chain().focus().toggleOrderedList().run()"
      >
        编号
      </ElButton>
    </div>
    <EditorContent
      v-if="editor"
      :editor="editor"
      class="rich-text-editor__content"
    />
  </div>
</template>

<script setup lang="ts">
import StarterKit from '@tiptap/starter-kit'
import { EditorContent, useEditor } from '@tiptap/vue-3'
import { watch } from 'vue'

const props = defineProps<{
  modelValue: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const editor = useEditor({
  content: props.modelValue || '<p></p>',
  extensions: [StarterKit],
  editorProps: {
    attributes: {
      class: 'rich-text-editor__surface',
    },
  },
  onUpdate: ({ editor }) => {
    emit('update:modelValue', editor.getHTML())
  },
})

watch(
  () => props.modelValue,
  (value) => {
    if (!editor.value || value === editor.value.getHTML()) {
      return
    }
    editor.value.commands.setContent(value || '<p></p>')
  },
)
</script>

<style scoped>
.rich-text-editor {
  width: 100%;
  border: 1px solid rgba(40, 70, 100, 0.12);
  border-radius: 6px;
  overflow: hidden;
  background: var(--color-bg-surface);
}

.rich-text-editor:focus-within {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 2px var(--color-focus);
}

.rich-text-editor__toolbar {
  display: flex;
  min-height: 42px;
  align-items: center;
  gap: 6px;
  padding: 8px;
  border-bottom: 1px solid rgba(40, 70, 100, 0.1);
  background: rgba(248, 250, 252, 0.72);
}

.rich-text-editor__toolbar :deep(.el-button) {
  min-height: 28px;
  padding: 4px 8px;
  border-radius: 6px;
}

.rich-text-editor__content {
  min-height: 140px;
  padding: 16px 18px;
}

:deep(.rich-text-editor__surface) {
  min-height: 116px;
  outline: 0;
  line-height: 1.7;
}

:deep(.rich-text-editor__surface p) {
  margin: 0 0 8px;
}
</style>
