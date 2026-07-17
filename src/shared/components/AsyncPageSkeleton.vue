<template>
  <div class="p-[var(--space-3)]" aria-label="页面加载中">
    <div class="flex w-full flex-col gap-[var(--space-2)]">
      <ElSkeletonItem variant="text" class="!w-40" />
      <ElCard>
        <ElSkeleton :rows="5" animated />
      </ElCard>
    </div>
  </div>
</template>
