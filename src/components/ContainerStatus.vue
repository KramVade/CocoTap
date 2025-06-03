<template>
  <div class="container-status">
    <div class="cards-grid">
      <!-- Container Visualization -->
      <div class="visualization-card">
        <h2>Container Status</h2>
        <div class="bottle-container">
          <div class="bottle">
            <div class="bottle-cap"></div>
            <div class="bottle-body">
              <div class="bottle-fill" :style="{ height: `${(level / containerCapacity) * 100}%` }">
                <div class="bubbles">
                  <span></span>
                  <span></span>
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          </div>
          <div class="level-indicator">{{ level }}L</div>
        </div>
      </div>

      <!-- Container Statistics -->
      <div class="data-card">
        <h2>Container Statistics</h2>
        <div class="stats-grid">
          <div class="stat-item">
            <span class="stat-label">Current Level</span>
            <span class="stat-value">{{ level }}L</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Maximum Capacity</span>
            <span class="stat-value">{{ containerCapacity }}L</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Fill Percentage</span>
            <span class="stat-value">{{ ((level / containerCapacity) * 100).toFixed(1) }}%</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Last Updated</span>
            <span class="stat-value">
              {{ defaultFormatTimestamp(timestamp) }}
            </span>
          </div>
          <ValveControl
            v-if="showValveControl"
            :show-control="showValveControl"
            @valve-toggled="handleValveToggle"
            ref="valveControl"
          />
        </div>
      </div>

      <!-- Chart Card - Full Width -->
      <div class="chart-card full-width">
        <h2>Content Level History</h2>
        <div class="chart-container">
          <div v-if="history.length === 0" class="placeholder">
            No data available.
          </div>
          <div v-else class="history-chart">
            <div class="chart-lines">
              <!-- Horizontal grid lines for content level -->
              <div v-for="n in Math.max(containerCapacity, 1)" :key="n" class="chart-grid-line"
                   :style="{ bottom: `${(n / containerCapacity) * 100}%` }"></div>
              <div v-for="(point, index) in history" 
                   :key="index" 
                   class="chart-point"
                   :style="{
                     left: `${(index / (history.length - 1 || 1)) * 100}%`,
                     bottom: `${(point.level / containerCapacity) * 100}%`
                   }">
              </div>
            </div>
            <div class="chart-labels">
              <div class="y-axis">
                <span>{{ containerCapacity }}L</span>
                <span>0L</span>
              </div>
              <div class="x-axis">
                <span>{{ history.length > 0 ? defaultFormatTimestamp(history[history.length - 1]?.timestamp) : 'No data' }}</span>
                <span>{{ history.length > 0 ? defaultFormatTimestamp(history[0]?.timestamp) : 'No data' }}</span>
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
import ValveControl from './ValveControl.vue';

export default {
  name: 'ContainerStatus',
  components: {
    ValveControl
  },
  props: {
    treeId: {
      type: String,
      required: true
    },
    containerCapacity: {
      type: Number,
      required: true
    },
    lastUpdated: {
      type: String,
      required: false
    },
    history: {
      type: Array,
      required: false,
      default: () => []
    },
    formatTimestamp: {
      type: Function,
      required: false
    },
    showValveControl: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      level: 0,
      timestamp: '',
      containerUnsubscribe: null
    }
  },
  methods: {
    fetchContainerLevel() {
      try {
        const sensorRef = collection(firestore, 'sensor');
        const q = query(sensorRef, orderBy('timestamp', 'desc'), limit(1));
        this.containerUnsubscribe = onSnapshot(q, (querySnapshot) => {
          querySnapshot.forEach((doc) => {
            const data = doc.data();
            console.log('Firestore data:', data);
            this.level = data.volume_liters || 0;
            this.timestamp = data.timestamp || '';
            console.log('Set timestamp:', this.timestamp);
            
            // Check container level for valve control
            if (this.$refs.valveControl) {
              this.$refs.valveControl.checkContainerLevel(this.level, this.containerCapacity);
            }
          });
        });
      } catch (error) {
        console.error('Error fetching container level:', error);
      }
    },
    defaultFormatTimestamp(ts) {
      if (!ts) return '';
      const date = new Date(ts);
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
        timeZone: 'UTC'
      });
    },
    handleValveToggle(result) {
      this.$emit('valve-toggled', result);
    }
  },
  mounted() {
    this.fetchContainerLevel();
  },
  beforeUnmount() {
    if (this.containerUnsubscribe) {
      this.containerUnsubscribe();
      console.log('Unsubscribed from container listener');
    }
  }
}
</script>

<style scoped>
.container-status {
  width: 100%;
}

.cards-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(520px, 1fr));
  column-gap: 48px;
  row-gap: -10px;
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

.visualization-card,
.data-card {
  margin-bottom: 48px;
}

.chart-card.full-width {
  grid-column: 1 / -1;
  justify-self: center;
}

/* Bottle Visualization Styles */
.bottle-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 40px 0;
  position: relative;
  height: 300px;
}

.bottle {
  width: 120px;
  height: 280px;
  position: relative;
}

.bottle-cap {
  width: 40px;
  height: 20px;
  background-color: #f39c12;
  border-radius: 5px;
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  z-index: 2;
}

.bottle-body {
  width: 100%;
  height: 250px;
  background-color: rgba(0, 0, 0, 0.05);
  border-radius: 10px;
  position: absolute;
  bottom: 0;
  overflow: hidden;
}

.bottle-fill {
  width: 100%;
  background-color: rgba(0, 128, 128, 0.8);
  position: absolute;
  bottom: 0;
  transition: height 0.5s ease-out;
}

.level-indicator {
  font-size: 1.5em;
  font-weight: bold;
  color: #2c3e50;
  margin-top: 10px;
}

.bubbles {
  position: absolute;
  width: 100%;
  height: 100%;
}

.bubbles span {
  position: absolute;
  width: 10px;
  height: 10px;
  background-color: rgba(0, 180, 180, 0.4);
  border-radius: 50%;
  animation: bubble 2s ease-in infinite;
}

.bubbles span:nth-child(1) { left: 10%; animation-delay: 0.2s; }
.bubbles span:nth-child(2) { left: 30%; animation-delay: 0.6s; }
.bubbles span:nth-child(3) { left: 50%; animation-delay: 0.1s; }
.bubbles span:nth-child(4) { left: 70%; animation-delay: 0.7s; }
.bubbles span:nth-child(5) { left: 90%; animation-delay: 0.4s; }

@keyframes bubble {
  0% {
    bottom: -20px;
    transform: translateX(0);
    opacity: 1;
  }
  50% {
    transform: translateX(-10px);
  }
  100% {
    bottom: 100%;
    transform: translateX(0);
    opacity: 0;
  }
}

/* Statistics Grid Styles */
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

/* Chart Styles */
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
  margin-left: 0;
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

/* Responsive Design */
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

  .bottle-container {
    height: 250px;
  }

  .bottle {
    width: 100px;
    height: 240px;
  }
}

@media (max-width: 480px) {
  .visualization-card,
  .data-card,
  .chart-card {
    padding: 15px;
  }

  .bottle-container {
    height: 200px;
  }

  .bottle {
    width: 80px;
    height: 190px;
  }

  .level-indicator {
    font-size: 1.2em;
  }
}

.placeholder {
  color: #999;
  font-style: italic;
  text-align: center;
  padding: 80px 0;
  font-size: 1.2em;
}
</style> 