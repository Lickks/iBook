<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'

interface Props {
  items: any[]
  itemHeight?: number
  containerHeight?: number
  overscan?: number
}

const props = withDefaults(defineProps<Props>(), {
  itemHeight: 200,
  containerHeight: 600,
  overscan: 5
})

const emit = defineEmits<{
  (e: 'render', items: any[], startIndex: number, endIndex: number): void
}>()

const containerRef = ref<HTMLElement | null>(null)
const scrollTop = ref(0)

const visibleRange = computed(() => {
  const start = Math.max(0, Math.floor(scrollTop.value / props.itemHeight) - props.overscan)
  const end = Math.min(
    props.items.length,
    Math.ceil((scrollTop.value + props.containerHeight) / props.itemHeight) + props.overscan
  )
  return { start, end }
})

const visibleItems = computed(() => {
  return props.items.slice(visibleRange.value.start, visibleRange.value.end)
})

const totalHeight = computed(() => props.items.length * props.itemHeight)
const offsetY = computed(() => visibleRange.value.start * props.itemHeight)

function handleScroll(event: Event): void {
  const target = event.target as HTMLElement
  scrollTop.value = target.scrollTop
}

// 监听 items 变化，确保重新计算可见范围
watch(
  () => [props.items.length, visibleRange.value],
  () => {
    emit('render', visibleItems.value, visibleRange.value.start, visibleRange.value.end)
  },
  { immediate: true, deep: false }
)

onMounted(() => {
  if (containerRef.value) {
    containerRef.value.addEventListener('scroll', handleScroll)
  }
})

onUnmounted(() => {
  if (containerRef.value) {
    containerRef.value.removeEventListener('scroll', handleScroll)
  }
})
</script>

<template>
  <div
    ref="containerRef"
    class="virtual-list-container"
    :style="{ height: `${containerHeight}px`, overflow: 'auto' }"
  >
    <div class="virtual-list-spacer" :style="{ height: `${totalHeight}px`, position: 'relative' }">
      <div class="virtual-list-content" :style="{ transform: `translateY(${offsetY}px)` }">
        <slot :items="visibleItems" :start-index="visibleRange.start" :end-index="visibleRange.end" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.virtual-list-container {
  position: relative;
}

.virtual-list-spacer {
  position: relative;
}

.virtual-list-content {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
}
</style>

