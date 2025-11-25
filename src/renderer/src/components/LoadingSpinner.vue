<template>
  <div :class="['loading-spinner', size, { overlay }]">
    <div class="spinner">
      <div class="spinner-ring" />
      <div class="spinner-ring" />
      <div class="spinner-ring" />
    </div>
    <p v-if="text" class="loading-text">{{ text }}</p>
  </div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    size?: 'small' | 'medium' | 'large'
    text?: string
    overlay?: boolean
  }>(),
  {
    size: 'medium',
    text: '',
    overlay: false
  }
)
</script>

<style scoped>
.loading-spinner {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
}

.loading-spinner.overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
}

.dark .loading-spinner.overlay {
  background: rgba(0, 0, 0, 0.7);
}

.spinner {
  position: relative;
  display: inline-block;
}

.loading-spinner.small .spinner {
  width: 24px;
  height: 24px;
}

.loading-spinner.medium .spinner {
  width: 40px;
  height: 40px;
}

.loading-spinner.large .spinner {
  width: 64px;
  height: 64px;
}

.spinner-ring {
  position: absolute;
  inset: 0;
  border: 3px solid transparent;
  border-top-color: var(--color-accent);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.spinner-ring:nth-child(2) {
  animation-delay: 0.15s;
  border-top-color: var(--color-accent-strong);
  opacity: 0.7;
}

.spinner-ring:nth-child(3) {
  animation-delay: 0.3s;
  border-top-color: var(--color-accent);
  opacity: 0.4;
}

.loading-text {
  margin: 0;
  font-size: 14px;
  color: var(--color-text-secondary);
  font-weight: 500;
}

.loading-spinner.small .loading-text {
  font-size: 12px;
}

.loading-spinner.large .loading-text {
  font-size: 16px;
}

.loading-spinner.overlay .loading-text {
  color: var(--color-text-primary);
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>

