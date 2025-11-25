<template>
  <div :class="['skeleton-loader', type]">
    <!-- 书籍卡片骨架屏 -->
    <template v-if="type === 'book-card'">
      <div class="skeleton-book-card">
        <div class="skeleton-cover" />
        <div class="skeleton-content">
          <div class="skeleton-title" />
          <div class="skeleton-meta">
            <div class="skeleton-line short" />
            <div class="skeleton-line" />
          </div>
          <div class="skeleton-footer">
            <div class="skeleton-badge" />
            <div class="skeleton-badge" />
          </div>
        </div>
      </div>
    </template>

    <!-- 列表项骨架屏 -->
    <template v-else-if="type === 'list-item'">
      <div class="skeleton-list-item">
        <div class="skeleton-avatar" />
        <div class="skeleton-content">
          <div class="skeleton-title" />
          <div class="skeleton-line" />
          <div class="skeleton-line short" />
        </div>
      </div>
    </template>

    <!-- 通用骨架屏 -->
    <template v-else>
      <div v-for="i in lines" :key="i" class="skeleton-line" :class="{ short: i === lines && lastLineShort }" />
    </template>
  </div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    type?: 'book-card' | 'list-item' | 'text'
    lines?: number
    lastLineShort?: boolean
  }>(),
  {
    type: 'text',
    lines: 3,
    lastLineShort: true
  }
)
</script>

<style scoped>
.skeleton-loader {
  width: 100%;
}

/* 骨架屏基础动画 */
@keyframes skeleton-loading {
  0% {
    background-position: -200px 0;
  }
  100% {
    background-position: calc(200px + 100%) 0;
  }
}

.skeleton-line,
.skeleton-title,
.skeleton-cover,
.skeleton-avatar,
.skeleton-badge {
  background: linear-gradient(
    90deg,
    var(--color-bg-muted) 0px,
    var(--color-bg) 40px,
    var(--color-bg-muted) 80px
  );
  background-size: 200px 100%;
  animation: skeleton-loading 1.5s ease-in-out infinite;
  border-radius: 4px;
}

.dark .skeleton-line,
.dark .skeleton-title,
.dark .skeleton-cover,
.dark .skeleton-avatar,
.dark .skeleton-badge {
  background: linear-gradient(
    90deg,
    var(--color-bg-muted) 0px,
    var(--color-surface) 40px,
    var(--color-bg-muted) 80px
  );
  background-size: 200px 100%;
}

/* 书籍卡片骨架屏 */
.skeleton-book-card {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 12px;
}

.skeleton-cover {
  width: 100%;
  aspect-ratio: 3 / 4;
  border-radius: 8px;
}

.skeleton-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.skeleton-title {
  height: 20px;
  width: 80%;
}

.skeleton-meta {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.skeleton-line {
  height: 14px;
  width: 100%;
}

.skeleton-line.short {
  width: 60%;
}

.skeleton-footer {
  display: flex;
  gap: 8px;
  margin-top: 8px;
}

.skeleton-badge {
  height: 24px;
  width: 60px;
  border-radius: 12px;
}

/* 列表项骨架屏 */
.skeleton-list-item {
  display: flex;
  gap: 16px;
  padding: 16px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 12px;
}

.skeleton-avatar {
  width: 60px;
  height: 60px;
  border-radius: 8px;
  flex-shrink: 0;
}

.skeleton-list-item .skeleton-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.skeleton-list-item .skeleton-title {
  height: 18px;
  width: 70%;
}

.skeleton-list-item .skeleton-line {
  height: 14px;
}
</style>

