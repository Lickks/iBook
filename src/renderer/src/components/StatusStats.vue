<script setup lang="ts">
import { computed } from 'vue'
import { READING_STATUS, READING_STATUS_LABEL } from '../constants'

const props = defineProps<{
  books: Array<{
    readingStatus: string
  }>
  selectedStatus: string | null
}>()

const emit = defineEmits<{
  'status-click': [status: string | null]
}>()

const statusStats = computed(() => {
  const stats = {
    all: props.books.length,
    [READING_STATUS.UNREAD]: 0,
    [READING_STATUS.READING]: 0,
    [READING_STATUS.FINISHED]: 0,
    [READING_STATUS.DROPPED]: 0,
    [READING_STATUS.TO_READ]: 0
  }

  props.books.forEach(book => {
    const status = book.readingStatus || READING_STATUS.UNREAD
    if (status in stats) {
      stats[status as keyof typeof stats]++
    }
  })

  return stats
})

const statItems = computed(() => [
  {
    key: 'all',
    label: '全部',
    count: statusStats.value.all,
    color: 'var(--color-text-primary)',
    active: props.selectedStatus === null
  },
  {
    key: READING_STATUS.UNREAD,
    label: READING_STATUS_LABEL[READING_STATUS.UNREAD],
    count: statusStats.value[READING_STATUS.UNREAD],
    color: '#909399',
    active: props.selectedStatus === READING_STATUS.UNREAD
  },
  {
    key: READING_STATUS.READING,
    label: READING_STATUS_LABEL[READING_STATUS.READING],
    count: statusStats.value[READING_STATUS.READING],
    color: '#409EFF',
    active: props.selectedStatus === READING_STATUS.READING
  },
  {
    key: READING_STATUS.FINISHED,
    label: READING_STATUS_LABEL[READING_STATUS.FINISHED],
    count: statusStats.value[READING_STATUS.FINISHED],
    color: '#67C23A',
    active: props.selectedStatus === READING_STATUS.FINISHED
  },
  {
    key: READING_STATUS.DROPPED,
    label: READING_STATUS_LABEL[READING_STATUS.DROPPED],
    count: statusStats.value[READING_STATUS.DROPPED],
    color: '#F56C6C',
    active: props.selectedStatus === READING_STATUS.DROPPED
  },
  {
    key: READING_STATUS.TO_READ,
    label: READING_STATUS_LABEL[READING_STATUS.TO_READ],
    count: statusStats.value[READING_STATUS.TO_READ],
    color: '#E6A23C',
    active: props.selectedStatus === READING_STATUS.TO_READ
  }
])

function handleStatClick(status: string | null): void {
  emit('status-click', status)
}
</script>

<template>
  <div class="status-stats">
    <div class="stats-grid">
      <div
        v-for="item in statItems"
        :key="item.key"
        class="stat-item"
        :class="{ active: item.active }"
        @click="handleStatClick(item.key === 'all' ? null : item.key)"
      >
        <div class="stat-count" :style="{ color: item.color }">
          {{ item.count }}
        </div>
        <div class="stat-label">
          {{ item.label }}
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.status-stats {
  margin-bottom: 16px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  gap: 12px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px 8px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  background: var(--color-bg-soft);
  border: 1px solid transparent;
}

.stat-item:hover {
  background: var(--color-bg-mute);
  transform: translateY(-2px);
}

.stat-item.active {
  background: var(--color-accent-soft);
  border-color: var(--color-accent);
}

.stat-count {
  font-size: 20px;
  font-weight: 600;
  line-height: 1;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 12px;
  color: var(--color-text-secondary);
  text-align: center;
  line-height: 1.2;
}

.stat-item.active .stat-label {
  color: var(--color-accent);
}

@media (max-width: 640px) {
  .stats-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
  }

  .stat-item {
    padding: 8px 4px;
  }

  .stat-count {
    font-size: 16px;
  }

  .stat-label {
    font-size: 11px;
  }
}
</style>