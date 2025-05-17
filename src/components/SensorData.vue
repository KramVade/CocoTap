<template>
  <div class="sensor-data">
    <h2>Sensor Data</h2>
    <div class="sensor-grid">
      <div class="sensor-card">
        <h3>Tree 1</h3>
        <p>Value: {{ tree1Level }} liters</p>
        <p>Last Updated: {{ formatTimestamp(tree1LastUpdated) }}</p>
        <p>Container Capacity: {{ containerCapacity }} liters</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { firestore, collection, query, orderBy, onSnapshot } from '@/firebase';

const tree1Level = ref(0);
const tree1LastUpdated = ref('');
const containerCapacity = ref(10);

const formatTimestamp = (timestamp) => {
  if (!timestamp) return 'N/A';
  return new Date(timestamp).toLocaleString();
};

onMounted(() => {
  const q = query(collection(firestore, "sensor"), orderBy("timestamp", "desc"));
  onSnapshot(q, (snapshot) => {
    const latest = snapshot.docs[0]?.data();
    if (latest) {
      tree1Level.value = parseFloat(latest.volume_liters.doubleValue);
      tree1LastUpdated.value = latest.timestamp.stringValue;
    }
  });
});
</script>

<style scoped>
.sensor-data {
  padding: 20px;
}

.sensor-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.sensor-card {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.sensor-card h3 {
  margin: 0 0 10px 0;
  color: #2c3e50;
}

.sensor-card p {
  margin: 5px 0;
  color: #666;
}
</style> 