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
            <span class="stat-value">{{ lastUpdated }}</span>
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
    temperature: {
      type: Number,
      required: false,
      default: null
    },
    lastUpdated: {
      type: String,
      required: true
    },
    history: {
      type: Array,
      required: true,
      default: () => []
    },
    formatTimestamp: {
      type: Function,
      required: true
    }
  },
  data() {
    return {
      tempUnsubscribe: null
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
    }
  },
  methods: {
    fetchEstimatedTemperature() {
      console.log('fetchEstimatedTemperature method is no longer needed as data is passed via props.');
    }
  },
  mounted() {
    this.fetchEstimatedTemperature();
  },
  beforeUnmount() {
    if (this.tempUnsubscribe) {
      this.tempUnsubscribe();
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