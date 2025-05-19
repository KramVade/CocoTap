<template>
  <div class="sidebar" :class="{ show: showSidebar }">
    <div class="nav-header">
      <h2>Menu</h2>
    </div>
    <div class="nav-items">
      <!-- Container Status Group -->
      <div class="nav-group">
        <div 
          class="nav-group-header"
          :class="{ active: selectedGroup === 'container' }"
          @click="toggleGroup('container')"
        >
          <span class="nav-icon">🫗</span>
          Container Status
          <span class="arrow" :class="{ rotated: selectedGroup === 'container' }">▼</span>
        </div>
        <div class="nav-group-items" v-show="selectedGroup === 'container'">
          <div 
            class="nav-item" 
            :class="{ active: currentView === 'tree1-container' }"
            @click="selectView('tree1-container')"
          >
            <span class="nav-icon">🌴</span>
            Tree 1
          </div>
          <div 
            class="nav-item" 
            :class="{ active: currentView === 'tree2-container' }"
            @click="selectView('tree2-container')"
          >
            <span class="nav-icon">🌴</span>
            Tree 2
          </div>
        </div>
      </div>

      <!-- pH Level Group -->
      <div class="nav-group">
        <div 
          class="nav-group-header"
          :class="{ active: selectedGroup === 'ph' }"
          @click="toggleGroup('ph')"
        >
          <span class="nav-icon">🧪</span>
          pH Level
          <span class="arrow" :class="{ rotated: selectedGroup === 'ph' }">▼</span>
        </div>
        <div class="nav-group-items" v-show="selectedGroup === 'ph'">
          <div 
            class="nav-item" 
            :class="{ active: currentView === 'tree1-ph' }"
            @click="selectView('tree1-ph')"
          >
            <span class="nav-icon">🫗</span>
            Bottle 1
          </div>
          <div 
            class="nav-item" 
            :class="{ active: currentView === 'tree2-ph' }"
            @click="selectView('tree2-ph')"
          >
            <span class="nav-icon">🫗</span>
            Bottle 2
          </div>
        </div>
      </div>

      <!-- Temperature Group -->
      <div class="nav-group">
        <div 
          class="nav-group-header"
          :class="{ active: selectedGroup === 'temperature' }"
          @click="toggleGroup('temperature')"
        >
          <span class="nav-icon">🌡️</span>
          Temperature
          <span class="arrow" :class="{ rotated: selectedGroup === 'temperature' }">▼</span>
        </div>
        <div class="nav-group-items" v-show="selectedGroup === 'temperature'">
          <div 
            class="nav-item" 
            :class="{ active: currentView === 'tree1-temp' }"
            @click="selectView('tree1-temp')"
          >
            <span class="nav-icon">🫗</span>
            Bottle 1
          </div>
          <div 
            class="nav-item" 
            :class="{ active: currentView === 'tree2-temp' }"
            @click="selectView('tree2-temp')"
          >
            <span class="nav-icon">🫗</span>
            Bottle 2
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Sidebar',
  props: {
    selectedGroup: {
      type: String,
      required: true
    },
    currentView: {
      type: String,
      required: true
    },
    showSidebar: {
      type: Boolean,
      required: true
    }
  },
  methods: {
    toggleGroup(group) {
      this.$emit('update:selectedGroup', this.selectedGroup === group ? null : group);
      // Set default view for selected group
      if (group === 'container') {
        this.selectView('tree1-container');
      } else if (group === 'ph') {
        this.selectView('tree1-ph');
      } else if (group === 'temperature') {
        this.selectView('tree1-temp');
      }
    },
    selectView(view) {
      this.$emit('update:currentView', view);
      // Auto-close sidebar on mobile
      if (window.innerWidth <= 768) {
        this.$emit('update:showSidebar', false);
      }
    }
  }
}
</script>

<style scoped>
/* Copy all the sidebar-related styles from Dashboard.vue */
.sidebar {
  width: 250px;
  background-color: white;
  border-right: 1px solid #eee;
  display: flex;
  flex-direction: column;
  position: fixed;
  left: 0;
  top: 140px;
  bottom: 0;
  border-top-right-radius: 10px;
  border-top-left-radius: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  z-index: 1100;
}

.nav-header {
  padding: 20px;
  border-bottom: 1px solid #eee;
}

.nav-header h2 {
  margin: 0;
  color: var(--color-darkest);
  font-size: 1.2em;
}

.nav-items {
  flex: 1;
  overflow-y: auto;
  padding: 10px 0;
}

.nav-group {
  margin-bottom: 10px;
}

.nav-group-header {
  padding: 15px 25px;
  display: flex;
  align-items: center;
  cursor: pointer;
  transition: all 0.3s ease;
  color: #2c3e50;
  font-weight: 500;
  background-color: white;
  border-bottom: 1px solid #eee;
}

.nav-group-header:hover {
  background-color: #f8f9fa;
}

.nav-group-header.active {
  color: var(--color-dark);
  background-color: #f8f9fa;
}

.arrow {
  margin-left: auto;
  transition: transform 0.3s ease;
  color: inherit;
}

.arrow.rotated {
  transform: rotate(180deg);
}

.nav-group-items {
  padding-left: 20px;
  background-color: #ffffff;
}

.nav-item {
  padding: 12px 25px;
  display: flex;
  align-items: center;
  cursor: pointer;
  transition: all 0.3s ease;
  color: #2c3e50;
  margin: 5px 15px;
  border-radius: 6px;
  background-color: #f8f9fa;
  border: 1px solid #eee;
}

.nav-item:hover {
  background-color: var(--color-lightest);
  color: var(--color-dark);
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.nav-item.active {
  background-color: var(--color-lightest);
  color: var(--color-dark);
  border-color: var(--color-medium);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.nav-icon {
  margin-right: 12px;
  font-size: 1.2em;
}

@media (max-width: 768px) {
  .sidebar {
    transform: translateX(-100%);
    transition: transform 0.3s ease;
    z-index: 1100;
    top: 0;
    height: 100vh;
    border-radius: 0 10px 10px 0;
  }
  
  .sidebar.show {
    transform: translateX(0);
  }
}
</style> 