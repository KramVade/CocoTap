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
  
  const tree2Level = ref(0);
  const tree2PH = ref(5.75);
  const tree2Temp = ref(25);
  const tree2LastUpdated = ref('');
  
  const lastTemperatureReading = ref(null);
  const containerCapacity = ref(2);

  // Add historical data storage
  const tree1History = ref([]);
  const tree2History = ref([]);
  const tree1PHHistory = ref([]);
  const tree2PHHistory = ref([]);
  const tree1TempHistory = ref([]);
  const tree2TempHistory = ref([]);
  const maxHistoryPoints = 24; // Store last 24 readings

  let tree1Unsubscribe = null;
  let tree2Unsubscribe = null;
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

  const updateTree2 = (level, ph, temp) => {
    if (level !== undefined) {
      const newLevel = typeof level === 'object' ? Number(level.doubleValue) : Number(level);
      tree2Level.value = newLevel;
      
      // Add to history
      tree2History.value.unshift({
        level: newLevel,
        timestamp: new Date().toISOString()
      });
      
      // Keep only last 24 readings
      if (tree2History.value.length > maxHistoryPoints) {
        tree2History.value = tree2History.value.slice(0, maxHistoryPoints);
      }
    }
    if (ph !== undefined) {
      const newPH = typeof ph === 'object' ? Number(ph.doubleValue) : Number(ph);
      tree2PH.value = newPH;
      
      // Add to pH history
      tree2PHHistory.value.unshift({
        pH: newPH,
        timestamp: new Date().toISOString()
      });
      
      // Keep only last 24 readings
      if (tree2PHHistory.value.length > maxHistoryPoints) {
        tree2PHHistory.value = tree2PHHistory.value.slice(0, maxHistoryPoints);
      }
    }
    if (temp !== undefined && typeof temp === 'number' && !isNaN(temp)) {
      tree2Temp.value = temp;
      
      // Add to temperature history
      tree2TempHistory.value.unshift({
        temp: temp,
        timestamp: new Date().toISOString()
      });
      
      // Keep only last 24 readings
      if (tree2TempHistory.value.length > maxHistoryPoints) {
        tree2TempHistory.value = tree2TempHistory.value.slice(0, maxHistoryPoints);
      }
    }
  };

  const initializeListeners = () => {
    // Listen for temperature sensor readings
    const tempQuery = query(
      collection(firestore, "temp_sensor"),
      orderBy("timestamp", "desc")
    );
    
    tempUnsubscribe = onSnapshot(tempQuery, (snapshot) => {
      if (!snapshot.empty) {
        const latest = snapshot.docs[0].data();
        lastTemperatureReading.value = {
          temperature: latest.temperature_celsius,
          timestamp: latest.timestamp
        };
        tree1Temp.value = lastTemperatureReading.value.temperature;
        tree2Temp.value = lastTemperatureReading.value.temperature;
      }
    });

    // Listen for Tree 1 sensor data
    const tree1Query = query(
      collection(firestore, "sensor"),
      orderBy("timestamp", "desc")
    );
    
    tree1Unsubscribe = onSnapshot(tree1Query, (snapshot) => {
      if (!snapshot.empty) {
        const docs = snapshot.docs.map(doc => doc.data());
        if (docs.length > 0) {
          const latest = docs[0];
          updateTree1(
            latest.volume_liters,
            latest.ph,
            latest.temperature_celsius || latest.temperature
          );
          tree1LastUpdated.value = formatTimestamp(latest.timestamp);
        }
      }
    });

    // Listen for Tree 2 sensor data
    const tree2Query = query(
      collection(firestore, "sensor2"),
      orderBy("timestamp", "desc")
    );
    
    tree2Unsubscribe = onSnapshot(tree2Query, (snapshot) => {
      if (!snapshot.empty) {
        const docs = snapshot.docs.map(doc => doc.data());
        const latest = docs[0];
        updateTree2(latest.volume_liters, latest.ph, latest.temperature);
        tree2LastUpdated.value = formatTimestamp(latest.timestamp);
      }
    });

    // Listen for pH sensor readings
    const phQuery = query(
      collection(firestore, "ph_sensor"),
      orderBy("timestamp", "desc")
    );
    
    phUnsubscribe = onSnapshot(phQuery, (snapshot) => {
      console.log('pH sensor snapshot received:', snapshot.docs.length, 'documents');
      if (!snapshot.empty) {
        const docs = snapshot.docs.map(doc => doc.data());
        console.log('pH sensor data:', docs[0]);
        if (docs.length > 0) {
          const latest = docs[0];
          const phValue = latest.estimated_ph;
          const timestamp = latest.timestamp;
          const temperatureC = latest.temperature_c;

          console.log('Extracted pH value:', phValue);
          console.log('Extracted timestamp:', timestamp);
          console.log('Extracted temperature_c:', temperatureC);

          if (phValue !== undefined) {
            updateTree1(undefined, phValue, undefined);
            updateTree2(undefined, phValue, undefined);
            
            console.log('Updated tree1PH:', tree1PH.value);
            console.log('Updated tree2PH:', tree2PH.value);
            
            if (temperatureC !== undefined && typeof temperatureC === 'number' && !isNaN(temperatureC)) {
              updateTree1(undefined, undefined, temperatureC);
              updateTree2(undefined, undefined, temperatureC);
              console.log('Updated tree1Temp and tree2Temp with temperature_c:', temperatureC);
            }

            // Update last updated timestamps
            if (timestamp) {
              tree1LastUpdated.value = formatTimestamp(timestamp);
              tree2LastUpdated.value = formatTimestamp(timestamp);
              console.log('Updated timestamps:', tree1LastUpdated.value);
            }
          }
        }
      }
    });
  };

  const cleanup = () => {
    if (tree1Unsubscribe) tree1Unsubscribe();
    if (tree2Unsubscribe) tree2Unsubscribe();
    if (tempUnsubscribe) tempUnsubscribe();
    if (phUnsubscribe) phUnsubscribe();
  };

  return {
    tree1Level,
    tree1PH,
    tree1Temp,
    tree1LastUpdated,
    tree2Level,
    tree2PH,
    tree2Temp,
    tree2LastUpdated,
    lastTemperatureReading,
    containerCapacity,
    formatTimestamp,
    initializeListeners,
    cleanup,
    tree1History,
    tree2History,
    tree1PHHistory,
    tree2PHHistory,
    tree1TempHistory,
    tree2TempHistory
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
      tree2History,
      tree1PHHistory,
      tree2PHHistory,
      tree1TempHistory,
      tree2TempHistory
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
      tree2History,
      tree1PHHistory,
      tree2PHHistory,
      tree1TempHistory,
      tree2TempHistory
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