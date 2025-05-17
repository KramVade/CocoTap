<template>
  <div class="dashboard">
    <h1>Tree Monitoring Dashboard</h1>
    <TreeStatus />
  </div>
</template>

<script>
import TreeStatus from '@/components/TreeStatus.vue'

export default {
  name: 'Dashboard',
  components: {
    TreeStatus
  }
}
</script>

<style scoped>
.dashboard {
  padding: 20px;
}

h1 {
  color: #2c3e50;
  margin-bottom: 30px;
}
</style> 