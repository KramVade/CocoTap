<template>
  <div class="sensor-data">
    <h2>Sensor Data</h2>
    <div class="sensor-grid">
      <div v-for="(sensor, key) in sensorData" :key="key" class="sensor-card">
        <h3>{{ sensor.name }}</h3>
        <p>Value: {{ sensor.value }}</p>
        <p>Unit: {{ sensor.unit }}</p>
        <p>Last Updated: {{ formatTimestamp(sensor.timestamp) }}</p>
      </div>
    </div>
  </div>
</template>

<script>
import { database, ref, onValue, set } from '../firebase';

export default {
  name: 'SensorData',
  data() {
    return {
      sensorData: {}
    };
  },
  methods: {
    formatTimestamp(timestamp) {
      if (!timestamp) return 'N/A';
      return new Date(timestamp).toLocaleString();
    },
    listenToSensorData() {
      const sensorRef = ref(database, 'sensors');
      onValue(sensorRef, (snapshot) => {
        this.sensorData = snapshot.val() || {};
      });
    },
    saveSensorData(sensorId, data) {
      const sensorRef = ref(database, `sensors/${sensorId}`);
      set(sensorRef, {
        name: data.name,
        value: data.value,
        unit: data.unit,
        timestamp: Date.now()
      });
    }
  },
  mounted() {
    this.listenToSensorData();
  }
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
</style> 