<template>
  <div class="valve-control">
    <span class="stat-label">Valve Status</span>
    <div class="valve-status-group">
      <span class="stat-value" :class="{ 'active': isValveOpen }">
        {{ isValveOpen ? 'Open' : 'Closed' }}
      </span>
      <button 
        class="valve-toggle-btn" 
        :class="{ 'active': isValveOpen }"
        @click="toggleValve"
        :disabled="isValveLoading"
      >
        <span v-if="isValveLoading" class="loading-spinner"></span>
        <span v-else>{{ isValveOpen ? 'Close Valve' : 'Open Valve' }}</span>
      </button>
    </div>
  </div>
</template>

<script>
import { 
  firestore,
  doc,
  setDoc,
  onSnapshot
} from '../firebase';

export default {
  name: 'ValveControl',
  props: {
    showControl: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      isValveOpen: false,
      isValveLoading: false,
      valveUpdateLock: false,
      manualOverride: false,
      lastValveUpdate: null,
      valveUnsubscribe: null
    }
  },
  methods: {
    async toggleValve() {
      if (this.isValveLoading) return;
      
      this.isValveLoading = true;
      try {
        const newState = !this.isValveOpen;
        const timestamp = new Date().toISOString();
        
        if (this.valveUpdateLock) {
          console.log('Ignoring valve state change due to lock');
          return;
        }
        
        this.valveUpdateLock = true;
        
        const valveRef = doc(firestore, 'control', 'valve');
        
        await setDoc(valveRef, {
          fields: {
            valveState: {
              booleanValue: newState
            },
            lastUpdated: {
              timestampValue: timestamp
            },
            manualOverride: {
              booleanValue: newState !== this.isValveOpen
            }
          }
        }, { merge: true });
        
        this.isValveOpen = newState;
        this.lastValveUpdate = timestamp;
        this.manualOverride = newState !== this.isValveOpen;
        
        this.$emit('valve-toggled', {
          success: true,
          message: `Valve ${newState ? 'opened' : 'closed'} successfully`
        });
      } catch (error) {
        console.error('Error toggling valve:', error);
        this.$emit('valve-toggled', {
          success: false,
          message: 'Failed to control valve. Please try again.'
        });
      } finally {
        this.isValveLoading = false;
        setTimeout(() => {
          this.valveUpdateLock = false;
          console.log('Valve update lock released');
        }, 1000);
      }
    },
    async initializeValveControl() {
      if (!this.showControl) return;

      try {
        const valveRef = doc(firestore, 'control', 'valve');
        await setDoc(valveRef, {
          fields: {
            valveState: {
              booleanValue: false
            },
            lastUpdated: {
              timestampValue: new Date().toISOString()
            },
            manualOverride: {
              booleanValue: false
            }
          }
        }, { merge: true });

        this.valveUnsubscribe = onSnapshot(valveRef, (doc) => {
          if (doc.exists()) {
            const data = doc.data();
            const newTimestamp = data.fields?.lastUpdated?.timestampValue;

            if (this.lastValveUpdate && newTimestamp < this.lastValveUpdate) {
              console.log('Ignoring older valve state change');
              return;
            }
            if (this.valveUpdateLock) {
              console.log('Ignoring valve state change due to lock');
              return;
            }

            const newState = data.fields?.valveState?.booleanValue ?? false;
            const newManualOverride = data.fields?.manualOverride?.booleanValue ?? false;

            this.isValveOpen = newState;
            this.manualOverride = newManualOverride;
            this.lastValveUpdate = newTimestamp;
          }
        });
      } catch (error) {
        console.error('Error initializing valve control:', error);
        this.isValveOpen = false;
        this.manualOverride = false;
      }
    },
    checkContainerLevel(level, containerCapacity) {
      if (this.manualOverride || !this.showControl) return;
      
      const fillPercentage = (level / containerCapacity) * 100;
      if (fillPercentage >= 90 && !this.isValveOpen) {
        this.toggleValve();
      } else if (fillPercentage < 90 && this.isValveOpen) {
        this.toggleValve();
      }
    }
  },
  watch: {
    showControl: {
      immediate: true,
      handler(newValue) {
        if (newValue) {
          this.initializeValveControl();
        } else if (this.valveUnsubscribe) {
          this.valveUnsubscribe();
        }
      }
    }
  },
  beforeUnmount() {
    if (this.valveUnsubscribe) {
      this.valveUnsubscribe();
      console.log('Unsubscribed from valve listener');
    }
  }
}
</script>

<style scoped>
.valve-control {
  grid-column: 1 / -1;
  margin-top: 10px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 8px;
}

.valve-status-group {
  display: flex;
  align-items: center;
  gap: 20px;
}

.stat-label {
  color: #666;
  font-size: 0.9em;
  display: block;
  margin-bottom: 8px;
}

.stat-value {
  font-size: 1.2em;
  font-weight: 500;
  color: #2c3e50;
}

.stat-value.active {
  color: #27ae60;
}

.valve-toggle-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  background-color: #e74c3c;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 120px;
}

.valve-toggle-btn.active {
  background-color: #27ae60;
}

.valve-toggle-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.valve-toggle-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.valve-toggle-btn:active:not(:disabled) {
  transform: translateY(0);
}

.loading-spinner {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid #f3f3f3;
  border-top: 2px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style> 