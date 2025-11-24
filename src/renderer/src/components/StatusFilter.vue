<script setup lang="ts">
import { computed } from 'vue'
import { READING_STATUS, READING_STATUS_LABEL } from '../constants'

const props = defineProps<{
  modelValue: string | null
  placeholder?: string
  clearable?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string | null]
}>()

const selectedStatus = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const statusOptions = [
  { value: null, label: props.placeholder || '全部状态' },
  ...Object.entries(READING_STATUS_LABEL).map(([value, label]) => ({
    value,
    label
  }))
]

function handleClear(): void {
  selectedStatus.value = null
}
</script>

<template>
  <div class="status-filter">
    <el-select
      v-model="selectedStatus"
      :placeholder="placeholder || '全部状态'"
      :clearable="clearable !== false"
      @clear="handleClear"
      size="default"
      style="width: 120px"
    >
      <el-option
        v-for="option in statusOptions"
        :key="option.value || 'all'"
        :label="option.label"
        :value="option.value"
      />
    </el-select>
  </div>
</template>

<style scoped>
.status-filter {
  display: inline-block;
}

.status-filter .el-select {
  width: 120px;
}

@media (max-width: 640px) {
  .status-filter .el-select {
    width: 100px;
  }
}
</style>