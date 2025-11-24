<template>
  <div class="statistics">
    <h1>统计分析页面</h1>
    <p>如果您能看到这个页面，说明路由工作正常</p>
    <button @click="testClick">测试按钮</button>
    <p v-if="clicked">按钮已被点击</p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const clicked = ref(false)

const testClick = () => {
  clicked.value = true
  console.log('Statistics页面按钮被点击')
}
</script>

<style scoped>
.statistics {
  padding: 20px;
}

button {
  margin: 10px 0;
  padding: 10px 20px;
  background: #409eff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:hover {
  background: #337ecc;
}
</style>