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

<script>
import { ref, onMounted, onUnmounted } from 'vue';
import { firestore, collection, query, orderBy, onSnapshot } from '@/firebase';

// Create a composable for sensor data
const useSensorData = () => {
  const tree1Level = ref(0);
  const tree1PH = ref(5.75);
  const tree1Temp = ref(25);
  const tree1LastUpdated = ref('');
  
  const lastTemperatureReading = ref(null);
  const containerCapacity = ref(2);

  // Add historical data storage
  const tree1History = ref([]);
  const tree1PHHistory = ref([]);
  const tree1TempHistory = ref([]);
  const maxHistoryPoints = 24; // Store last 24 readings

  let tree1Unsubscribe = null;
  let tempUnsubscribe = null;
  let phUnsubscribe = null;

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'N/A';
    
    let date;
    if (typeof timestamp === 'string') {
      date = new Date(timestamp);
    } else if (timestamp.stringValue) {
      date = new Date(timestamp.stringValue);
    } else {
      return 'N/A';
    }

    if (isNaN(date.getTime())) {
      return 'Invalid Date';
    }

    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const updateTree1 = (level, ph, temp) => {
    if (level !== undefined) {
      const newLevel = typeof level === 'object' ? Number(level.doubleValue) : Number(level);
      tree1Level.value = newLevel;
      
      // Add to history
      tree1History.value.unshift({
        level: newLevel,
        timestamp: new Date().toISOString()
      });
      
      // Keep only last 24 readings
      if (tree1History.value.length > maxHistoryPoints) {
        tree1History.value = tree1History.value.slice(0, maxHistoryPoints);
      }
    }
    if (ph !== undefined) {
      const newPH = typeof ph === 'object' ? Number(ph.doubleValue) : Number(ph);
      tree1PH.value = newPH;
      
      // Add to pH history
      tree1PHHistory.value.unshift({
        pH: newPH,
        timestamp: new Date().toISOString()
      });
      
      // Keep only last 24 readings
      if (tree1PHHistory.value.length > maxHistoryPoints) {
        tree1PHHistory.value = tree1PHHistory.value.slice(0, maxHistoryPoints);
      }
    }
    if (temp !== undefined && typeof temp === 'number' && !isNaN(temp)) {
      tree1Temp.value = temp;
      
      // Add to temperature history
      tree1TempHistory.value.unshift({
        temp: temp,
        timestamp: new Date().toISOString()
      });
      
      // Keep only last 24 readings
      if (tree1TempHistory.value.length > maxHistoryPoints) {
        tree1TempHistory.value = tree1TempHistory.value.slice(0, maxHistoryPoints);
      }
    }
  };

  const initializeListeners = () => {
    // Initialize Tree 1 listeners
    const tree1Ref = collection(firestore, 'sensor');
    const tree1Query = query(tree1Ref, orderBy('timestamp', 'desc'));
    
    tree1Unsubscribe = onSnapshot(tree1Query, (snapshot) => {
      snapshot.forEach((doc) => {
        const data = doc.data();
        updateTree1(
          data.volume_liters,
          data.ph,
          data.temperature
        );
        tree1LastUpdated.value = data.timestamp;
      });
    });
  };

  const cleanup = () => {
    if (tree1Unsubscribe) tree1Unsubscribe();
    if (tempUnsubscribe) tempUnsubscribe();
    if (phUnsubscribe) phUnsubscribe();
  };

  return {
    tree1Level,
    tree1PH,
    tree1Temp,
    tree1LastUpdated,
    lastTemperatureReading,
    containerCapacity,
    formatTimestamp,
    initializeListeners,
    cleanup,
    tree1History,
    tree1PHHistory,
    tree1TempHistory
  };
};

export default {
  name: 'SensorData',
  setup() {
    const {
      tree1Level,
      tree1LastUpdated,
      containerCapacity,
      formatTimestamp,
      initializeListeners,
      cleanup,
      tree1History,
      tree1PHHistory,
      tree1TempHistory
    } = useSensorData();

    onMounted(() => {
      initializeListeners();
    });

    onUnmounted(() => {
      cleanup();
    });

    return {
      tree1Level,
      tree1LastUpdated,
      containerCapacity,
      formatTimestamp,
      tree1History,
      tree1PHHistory,
      tree1TempHistory
    };
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