<template>
  <div class="sensor-data">
    <h2>Sensor Data</h2>
    <div class="sensor-grid">
      <div v-for="(sensor, key) in sensors" :key="key" class="sensor-card">
        <h3>{{ sensor.name }}</h3>
        <p>Value: {{ sensor.value }}</p>
        <p>Unit: {{ sensor.unit }}</p>
        <p>Last Updated: {{ formatTimestamp(sensor.timestamp) }}</p>
      </div>
    </div>
    
    <!-- Add Sensor Form -->
    <div class="add-sensor-form">
      <h3>Add New Sensor</h3>
      <form @submit.prevent="addSensor">
        <div class="form-group">
          <label>Sensor Name:</label>
          <input v-model="newSensor.name" required>
        </div>
        <div class="form-group">
          <label>Value:</label>
          <input type="number" v-model="newSensor.value" required>
        </div>
        <div class="form-group">
          <label>Unit:</label>
          <input v-model="newSensor.unit" required>
        </div>
        <button type="submit">Add Sensor</button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useDatabase, ref as dbRef, set } from 'vuefire';
import { database } from '../firebase';

const db = useDatabase();
const sensorsRef = dbRef(database, 'sensors');
const sensors = useDatabase(sensorsRef);

const newSensor = ref({
  name: '',
  value: '',
  unit: ''
});

const formatTimestamp = (timestamp) => {
  if (!timestamp) return 'N/A';
  return new Date(timestamp).toLocaleString();
};

const addSensor = async () => {
  const sensorRef = dbRef(database, `sensors/${Date.now()}`);
  await set(sensorRef, {
    name: newSensor.value.name,
    value: parseFloat(newSensor.value.value),
    unit: newSensor.value.unit,
    timestamp: Date.now()
  });
  
  // Reset form
  newSensor.value = {
    name: '',
    value: '',
    unit: ''
  };
};
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

.add-sensor-form {
  margin-top: 40px;
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  color: #2c3e50;
}

.form-group input {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

button {
  background-color: #42b983;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1em;
}

button:hover {
  background-color: #3aa876;
}
</style> 