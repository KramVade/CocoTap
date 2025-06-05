<template>
  <div class="temperature-status">
    <div class="cards-grid">
      <!-- Temperature Visualization -->
      <div class="visualization-card">
        <h2>Temperature Status</h2>
        <div class="temp-container">
          <div class="temp-meter">
            <div class="temp-scale">
              <div
                v-if="typeof temperature === 'number' && !isNaN(temperature)"
                class="temp-indicator"
                :style="{ left: `${((temperature - 20) / (40 - 20)) * 100}%` }"
              >
                <div class="temp-value">{{ temperature }}°C</div>
              </div>
              <div v-else class="temp-indicator" style="left: 0;">
                <div class="temp-value">N/A</div>
              </div>
              <div class="temp-labels">
                <span>Cold (20°C)</span>
                <span>Hot (40°C)</span>
              </div>
            </div>
          </div>
          <div class="temperature-status" :class="temperatureStatus.toLowerCase()">
            Current Status: {{ temperatureStatus }}
          </div>
        </div>
      </div>

      <!-- Temperature Statistics -->
      <div class="data-card">
        <h2>Temperature Analysis</h2>
        <div class="stats-grid">
          <div class="stat-item">
            <span class="stat-label">Current Temperature</span>
            <span class="stat-value">
              {{ (typeof temperature === 'number' && !isNaN(temperature)) ? temperature + '°C' : 'N/A' }}
            </span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Status</span>
            <span class="stat-value" :class="temperatureStatus.toLowerCase()">
              {{ temperatureStatus }}
            </span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Last Reading</span>
            <span class="stat-value">{{ lastUpdated ? formatTimestamp(lastUpdated) : 'N/A' }}</span>
          </div>
        </div>
      </div>

      <!-- Container Status -->
      <div class="data-card">
        <h2>Container Status</h2>
        <div class="stats-grid">
          <div class="stat-item">
            <span class="stat-label">Current Level</span>
            <span class="stat-value">
              {{ (typeof containerReading === 'number' && !isNaN(containerReading)) ? containerReading + '%' : 'N/A' }}
            </span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Status</span>
            <span class="stat-value" :class="containerStatus.toLowerCase()">
              {{ containerStatus }}
            </span>
          </div>
        </div>
      </div>

      <!-- Temperature History Chart -->
      <div class="chart-card full-width">
        <h2>Temperature History</h2>
        <div class="chart-container">
          <div v-if="history.length === 0" class="placeholder">
            No data available.
          </div>
          <div v-else class="history-chart">
            <div class="chart-lines">
              <!-- Horizontal grid lines for temperature (20 to 40, every 5) -->
              <div v-for="n in 5" :key="n" class="chart-grid-line"
                   :style="{ bottom: `${(((20 + (n - 1) * 5) - 20) / (40 - 20)) * 100}%` }"></div>
              <div v-for="(point, index) in history" 
                   :key="index" 
                   class="chart-point"
                   :style="{
                     left: `${(index / (history.length - 1 || 1)) * 100}%`,
                     bottom: `${((point.temperature - 20) / (40 - 20) * 100)}%`
                   }">
              </div>
            </div>
            <div class="chart-labels">
              <div class="y-axis">
                <span>40°C</span>
                <span>20°C</span>
              </div>
              <div class="x-axis">
                <span>{{ history.length > 0 ? formatTimestamp(history[history.length - 1]?.timestamp) : 'No data' }}</span>
                <span>{{ history.length > 0 ? formatTimestamp(history[0]?.timestamp) : 'No data' }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { 
  firestore,
  collection,
  query,
  orderBy,
  limit,
  onSnapshot
} from '../firebase';

export default {
  name: 'TemperatureStatus',
  props: {
    formatTimestamp: {
      type: Function,
      required: true
    }
  },
  data() {
    return {
      temperature: null,
      lastUpdated: null,
      tempUnsubscribe: null,
      history: [],
      containerReading: null,
      containerUnsubscribe: null,
      notificationShown: false
    }
  },
  computed: {
    temperatureStatus() {
      const currentTemp = this.temperature;
      if (typeof currentTemp !== 'number' || isNaN(currentTemp)) return 'N/A';
      if (currentTemp >= 35) return 'Too Hot';
      if (currentTemp >= 30) return 'Warm';
      if (currentTemp >= 25) return 'Optimal';
      if (currentTemp >= 20) return 'Cool';
      return 'Too Cold';
    },
    containerStatus() {
      if (typeof this.containerReading !== 'number' || isNaN(this.containerReading)) return 'N/A';
      if (this.containerReading >= 95) return 'Critical';
      if (this.containerReading >= 80) return 'High';
      if (this.containerReading >= 50) return 'Medium';
      return 'Low';
    }
  },
  watch: {
    containerReading(newValue) {
      if (newValue >= 95 && !this.notificationShown) {
        this.showContainerNotification();
        this.notificationShown = true;
      } else if (newValue < 95) {
        this.notificationShown = false;
      }
    }
  },
  methods: {
    showContainerNotification() {
      // Using browser's native notification API
      if ('Notification' in window) {
        Notification.requestPermission().then(permission => {
          if (permission === 'granted') {
            new Notification('Container Alert', {
              body: 'Container reading has reached 95%!',
              icon: '/path/to/your/icon.png' // You can add your own icon
            });
          }
        });
      }
    },
    fetchContainerReading() {
      const containerRef = collection(firestore, 'container_sensor');
      const q = query(containerRef, orderBy('timestamp', 'desc'), limit(1));
      this.containerUnsubscribe = onSnapshot(q, (querySnapshot) => {
        const docs = querySnapshot.docs.map(doc => doc.data());
        if (docs.length > 0) {
          this.containerReading = docs[0].reading || null;
        } else {
          this.containerReading = null;
        }
      });
    },
    fetchTemperature() {
      const sensorRef = collection(firestore, 'ph_sensor');
      // Fetch the latest 100 readings for better hourly grouping
      const q = query(sensorRef, orderBy('timestamp', 'desc'), limit(100));
      this.tempUnsubscribe = onSnapshot(q, (querySnapshot) => {
        const docs = querySnapshot.docs.map(doc => doc.data());
        if (docs.length > 0) {
          // Group by hour
          const hourlyMap = {};
          docs.forEach(d => {
            if (!d.timestamp) return;
            const date = new Date(d.timestamp);
            // Use year-month-day-hour as the key
            const hourKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}-${date.getHours()}`;
            // Only keep the first reading for each hour
            if (!hourlyMap[hourKey]) {
              hourlyMap[hourKey] = {
                temperature: d.temperature_c || d.temperature_celsius || null,
                timestamp: d.timestamp
              };
            }
          });
          // Sort by timestamp ascending
          const hourlyHistory = Object.values(hourlyMap).sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
          this.history = hourlyHistory;
          // Use the latest for current value
          const latest = hourlyHistory[hourlyHistory.length - 1];
          this.temperature = latest ? latest.temperature : null;
          this.lastUpdated = latest ? latest.timestamp : null;
        } else {
          this.temperature = null;
          this.lastUpdated = null;
          this.history = [];
        }
      });
    }
  },
  mounted() {
    this.fetchTemperature();
    this.fetchContainerReading();
  },
  beforeUnmount() {
    if (this.tempUnsubscribe) {
      this.tempUnsubscribe();
    }
    if (this.containerUnsubscribe) {
      this.containerUnsubscribe();
    }
  }
}
</script>

<style scoped>
.temperature-status {
  width: 100%;
}

.cards-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(520px, 1fr));
  gap: 48px;
  width: 100%;
  max-width: 1700px;
  margin: 0 auto;
  padding: 32px 0;
}

.visualization-card,
.data-card,
.chart-card {
  min-width: 520px;
  max-width: 750px;
  min-height: 300px;
  background: white;
  border-radius: 10px;
  padding: 40px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  box-sizing: border-box;
}

.chart-card.full-width {
  grid-column: 1 / -1;
  justify-self: center;
}

.temp-container {
  padding: 20px;
}

.temp-meter {
  margin: 40px 0;
  position: relative;
  padding-bottom: 20px;
}

.temp-scale {
  height: 60px;
  background: linear-gradient(to right, #2196f3, #4caf50, #ff9800, #f44336);
  border-radius: 30px;
  position: relative;
  margin: 40px 20px 60px;
}

.temp-indicator {
  position: absolute;
  top: -25px;
  width: 20px;
  height: 80px;
  transform: translateX(-50%);
  transition: left 0.5s ease-out;
}

.temp-indicator::after {
  content: '';
  position: absolute;
  top: 25px;
  left: 50%;
  transform: translateX(-50%);
  width: 4px;
  height: 55px;
  background-color: #2c3e50;
}

.temp-value {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  background-color: #2c3e50;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.9em;
  white-space: nowrap;
  z-index: 2;
}

.temp-labels {
  display: flex;
  justify-content: space-between;
  position: absolute;
  width: 100%;
  bottom: -40px;
  left: 0;
  color: #666;
  font-size: 0.9em;
}

.temp-labels span {
  transform: translateX(-50%);
}

.temp-labels span:last-child {
  transform: translateX(50%);
}

.temperature-status {
  text-align: center;
  font-size: 1.2em;
  font-weight: bold;
  margin: 20px 0;
  padding: 10px;
  border-radius: 5px;
}

.temperature-status.too-hot {
  color: #e74c3c;
  background-color: rgba(231, 76, 60, 0.1);
}

.temperature-status.warm {
  color: #e67e22;
  background-color: rgba(230, 126, 34, 0.1);
}

.temperature-status.optimal {
  color: #27ae60;
  background-color: rgba(39, 174, 96, 0.1);
}

.temperature-status.cool {
  color: #3498db;
  background-color: rgba(52, 152, 219, 0.1);
}

.temperature-status.too-cold {
  color: #2980b9;
  background-color: rgba(41, 128, 185, 0.1);
}

.temperature-status.critical {
  color: #c0392b;
  background-color: rgba(192, 57, 43, 0.1);
}

.temperature-status.high {
  color: #e67e22;
  background-color: rgba(230, 126, 34, 0.1);
}

.temperature-status.medium {
  color: #f1c40f;
  background-color: rgba(241, 196, 15, 0.1);
}

.temperature-status.low {
  color: #2ecc71;
  background-color: rgba(46, 204, 113, 0.1);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  margin-top: 20px;
}

.stat-item {
  padding: 15px;
  background: #f8f9fa;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.stat-label {
  color: #666;
  font-size: 0.9em;
}

.stat-value {
  font-size: 1.2em;
  font-weight: 500;
  color: #2c3e50;
}

.chart-container {
  height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8f9fa;
  border-radius: 8px;
  margin-top: 20px;
}

.history-chart {
  position: relative;
  width: 100%;
  height: 100%;
  padding: 20px;
}

.chart-lines {
  position: relative;
  width: 100%;
  height: calc(100% - 40px);
  border-left: 1px solid #ddd;
  border-bottom: 1px solid #ddd;
}

.chart-point {
  position: absolute;
  width: 6px;
  height: 6px;
  background-color: #3498db;
  border-radius: 50%;
  transform: translate(-50%, 50%);
}

.chart-point::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 100%;
  height: 100%;
  background-color: rgba(52, 152, 219, 0.2);
  border-radius: 50%;
  transform: translate(-50%, -50%) scale(2);
}

.chart-labels {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  pointer-events: none;
}

.y-axis {
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  color: #666;
  font-size: 0.8em;
  padding-right: 8px;
  align-items: flex-start;
}

.x-axis {
  position: absolute;
  bottom: -20px;
  left: 0;
  width: 100%;
  display: flex;
  justify-content: space-between;
  color: #666;
  font-size: 0.8em;
}

.chart-grid-line {
  position: absolute;
  left: 0;
  width: 100%;
  height: 1px;
  background: #e0e0e0;
  z-index: 0;
  pointer-events: none;
}

.placeholder {
  color: #999;
  font-style: italic;
  text-align: center;
  padding: 80px 0;
  font-size: 1.2em;
}

@media (max-width: 1024px) {
  .cards-grid {
    grid-template-columns: 1fr;
  }

  .visualization-card,
  .data-card,
  .chart-card {
    min-height: auto;
  }
}

@media (max-width: 768px) {
  .visualization-card,
  .data-card,
  .chart-card {
    padding: 20px;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .visualization-card,
  .data-card,
  .chart-card {
    padding: 15px;
  }
}
</style> 