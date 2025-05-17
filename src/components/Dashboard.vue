<template>
  <div class="dashboard-container">
    <!-- Header -->
    <div class="main-header">
      <button class="menu-toggle" @click="toggleSidebar">
        <span class="hamburger-icon">☰</span>
      </button>
      <h1 class="app-title">CocoTap</h1>
      <p class="app-subtitle">Tuba Production Monitoring System</p>
      
      <!-- Add back the profile section -->
      <div class="profile-section">
        <div class="profile-icon" @click="toggleProfileMenu">
          <img 
            v-if="user?.photoURL" 
            :src="user.photoURL" 
            class="profile-avatar-img" 
            :alt="user.displayName"
          >
          <span v-else class="profile-avatar">��</span>
          <span class="profile-arrow" :class="{ 'rotated': showProfileMenu }">▼</span>
        </div>
        
        <!-- Profile dropdown menu -->
        <div class="profile-menu" v-if="showProfileMenu">
          <div class="profile-info">
            <div class="profile-picture">
              <img 
                v-if="user?.photoURL" 
                :src="user.photoURL" 
                :alt="user.displayName"
              >
              <span v-else class="large-avatar">👤</span>
            </div>
            <div class="user-details">
              <div class="user-name">{{ user?.displayName || 'User' }}</div>
              <div class="user-email">{{ user?.email }}</div>
            </div>
          </div>
          <div class="profile-menu-divider"></div>
          <div 
            class="profile-menu-item" 
            :class="{ 'loading': isLoading }"
            @click="!isLoading && changeAccount()"
          >
            <span class="menu-icon">🔄</span>
            {{ isLoading ? 'Changing Account...' : 'Change Account' }}
          </div>
          <div class="profile-menu-divider"></div>
          <div class="profile-menu-item logout" @click="logout">
            <span class="menu-icon">⇦</span>
            Logout
          </div>
        </div>
      </div>
    </div>

    <div class="content-wrapper">
      <!-- Navigation Sidebar -->
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
                @click="currentView = 'tree1-ph'"
              >
                <span class="nav-icon">🫗</span>
                Bottle 1
              </div>
              <div 
                class="nav-item" 
                :class="{ active: currentView === 'tree2-ph' }"
                @click="currentView = 'tree2-ph'"
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
                @click="currentView = 'tree1-temp'"
              >
                <span class="nav-icon">🫗</span>
                Bottle 1
              </div>
              <div 
                class="nav-item" 
                :class="{ active: currentView === 'tree2-temp' }"
                @click="currentView = 'tree2-temp'"
              >
                <span class="nav-icon">🫗</span>
                Bottle 2
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Sidebar overlay for mobile -->
      <div class="sidebar-overlay" v-if="showSidebar" @click="toggleSidebar"></div>

      <!-- Main Content/Form Area -->
      <div class="main-content">
        <div class="main-content-inner">
          <!-- Tree 1 Container Status -->
          <div v-if="currentView === 'tree1-container'" class="view-content">
            <div class="view-header">
              <h2>Tree 1 - Container Status</h2>
            </div>
            <div class="content-grid">
              <!-- Container Visualization -->
              <div class="visualization-card">
                <h2>Container Status</h2>
                <div class="bottle-container">
                  <div class="bottle">
                    <div class="bottle-cap"></div>
                    <div class="bottle-body">
                      <div class="bottle-fill" :style="{ height: `${(tree1Level / containerCapacity) * 100}%` }">
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
                  <div class="level-indicator">{{ tree1Level }}L</div>
                </div>
              </div>

              <!-- Container Statistics -->
              <div class="data-card">
                <h2>Container Statistics</h2>
                <div class="stats-grid">
                  <div class="stat-item">
                    <span class="stat-label">Current Level</span>
                    <span class="stat-value">{{ tree1Level }}L</span>
                  </div>
                  <div class="stat-item">
                    <span class="stat-label">Maximum Capacity</span>
                    <span class="stat-value">{{ containerCapacity }}L</span>
                  </div>
                  <div class="stat-item">
                    <span class="stat-label">Fill Percentage</span>
                    <span class="stat-value">{{ ((tree1Level / containerCapacity) * 100).toFixed(1) }}%</span>
                  </div>
                  <div class="stat-item">
                    <span class="stat-label">Last Updated</span>
                    <span class="stat-value">{{ tree1LastUpdated }}</span>
                  </div>
                </div>
              </div>

              <div class="chart-card">
                <h2>Content Level History</h2>
                <div class="chart-container">
                  <p class="placeholder">Historical Level Chart</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Tree 1 pH Status -->
          <div v-if="currentView === 'tree1-ph'" class="view-content">
            <div class="view-header">
              <h2>Tree 1 - pH Status</h2>
            </div>
            <div class="content-grid">
              <!-- pH Visualization -->
              <div class="visualization-card">
                <h2>Fermentation Status</h2>
                <div class="ph-container">
                  <div class="ph-meter">
                    <div class="ph-scale">
                      <div class="ph-indicator" :style="{ left: `${((tree1PH - 2) / (5.75 - 2)) * 100}%` }">
                        <div class="ph-value">pH {{ tree1PH }}</div>
                      </div>
                      <div class="ph-labels">
                        <span>Vinegar (pH 2)</span>
                        <span>Tuba (pH 5.75)</span>
                      </div>
                    </div>
                  </div>
                  <div class="fermentation-status" :class="getTree1FermentationStatus().toLowerCase()">
                    Current Status: {{ getTree1FermentationStatus() }}
                  </div>
                </div>
              </div>

              <!-- pH Statistics -->
              <div class="data-card">
                <h2>Fermentation Analysis</h2>
                <div class="stats-grid">
                  <div class="stat-item">
                    <span class="stat-label">Current pH</span>
                    <span class="stat-value">{{ tree1PH }}</span>
                  </div>
                  <div class="stat-item">
                    <span class="stat-label">Status</span>
                    <span class="stat-value" :class="getTree1FermentationStatus().toLowerCase()">
                      {{ getTree1FermentationStatus() }}
                    </span>
                  </div>
                  <div class="stat-item">
                    <span class="stat-label">Last Reading</span>
                    <span class="stat-value">{{ tree1LastUpdated }}</span>
                  </div>
                </div>
              </div>

              <div class="chart-card">
                <h2>pH Level History</h2>
                <div class="chart-container">
                  <p class="placeholder">pH History Chart</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Tree 2 Container Status -->
          <div v-if="currentView === 'tree2-container'" class="view-content">
            <div class="view-header">
              <h2>Tree 2 - Container Status</h2>
            </div>
            <div class="content-grid">
              <!-- Container Visualization -->
              <div class="visualization-card">
                <h2>Container Status</h2>
                <div class="bottle-container">
                  <div class="bottle">
                    <div class="bottle-cap"></div>
                    <div class="bottle-body">
                      <div class="bottle-fill" :style="{ height: `${(tree2Level / containerCapacity) * 100}%` }">
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
                  <div class="level-indicator">{{ tree2Level }}L</div>
                </div>
              </div>

              <!-- Container Statistics -->
              <div class="data-card">
                <h2>Container Statistics</h2>
                <div class="stats-grid">
                  <div class="stat-item">
                    <span class="stat-label">Current Level</span>
                    <span class="stat-value">{{ tree2Level }}L</span>
                  </div>
                  <div class="stat-item">
                    <span class="stat-label">Maximum Capacity</span>
                    <span class="stat-value">{{ containerCapacity }}L</span>
                  </div>
                  <div class="stat-item">
                    <span class="stat-label">Fill Percentage</span>
                    <span class="stat-value">{{ ((tree2Level / containerCapacity) * 100).toFixed(1) }}%</span>
                  </div>
                  <div class="stat-item">
                    <span class="stat-label">Last Updated</span>
                    <span class="stat-value">{{ tree2LastUpdated }}</span>
                  </div>
                </div>
              </div>

              <div class="chart-card">
                <h2>Content Level History</h2>
                <div class="chart-container">
                  <p class="placeholder">Historical Level Chart</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Tree 2 pH Status -->
          <div v-if="currentView === 'tree2-ph'" class="view-content">
            <div class="view-header">
              <h2>Tree 2 - pH Status</h2>
            </div>
            <div class="content-grid">
              <!-- pH Visualization -->
              <div class="visualization-card">
                <h2>Fermentation Status</h2>
                <div class="ph-container">
                  <div class="ph-meter">
                    <div class="ph-scale">
                      <div class="ph-indicator" :style="{ left: `${((tree2PH - 2) / (5.75 - 2)) * 100}%` }">
                        <div class="ph-value">pH {{ tree2PH }}</div>
                      </div>
                      <div class="ph-labels">
                        <span>Vinegar (pH 2)</span>
                        <span>Tuba (pH 5.75)</span>
                      </div>
                    </div>
                  </div>
                  <div class="fermentation-status" :class="getTree2FermentationStatus().toLowerCase()">
                    Current Status: {{ getTree2FermentationStatus() }}
                  </div>
                </div>
              </div>

              <!-- pH Statistics -->
              <div class="data-card">
                <h2>Fermentation Analysis</h2>
                <div class="stats-grid">
                  <div class="stat-item">
                    <span class="stat-label">Current pH</span>
                    <span class="stat-value">{{ tree2PH }}</span>
                  </div>
                  <div class="stat-item">
                    <span class="stat-label">Status</span>
                    <span class="stat-value" :class="getTree2FermentationStatus().toLowerCase()">
                      {{ getTree2FermentationStatus() }}
                    </span>
                  </div>
                  <div class="stat-item">
                    <span class="stat-label">Last Reading</span>
                    <span class="stat-value">{{ tree2LastUpdated }}</span>
                  </div>
                </div>
              </div>

              <div class="chart-card">
                <h2>pH Level History</h2>
                <div class="chart-container">
                  <p class="placeholder">pH History Chart</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Temperature View for Bottle 1 -->
          <div v-if="currentView === 'tree1-temp'" class="view-content">
            <div class="view-header">
              <h2>Bottle 1 - Temperature</h2>
            </div>
            <div class="content-grid">
              <!-- Temperature Visualization -->
              <div class="visualization-card">
                <h2>Temperature Status</h2>
                <div class="temperature-container">
                  <div class="thermometer">
                    <div class="thermometer-body">
                      <div 
                        class="temperature-fill" 
                        :style="{ 
                          height: `${((tree1Temp - 20) / (35 - 20)) * 100}%`,
                          backgroundColor: getTemperatureColor(tree1Temp)
                        }"
                      ></div>
                    </div>
                    <div class="temperature-value">{{ tree1Temp }}°C</div>
                  </div>
                  <div class="temperature-scale">
                    <span>35°C</span>
                    <span>20°C</span>
                  </div>
                </div>
              </div>

              <!-- Temperature Statistics -->
              <div class="data-card">
                <h2>Temperature Analysis</h2>
                <div class="stats-grid">
                  <div class="stat-item">
                    <span class="stat-label">Current Temperature</span>
                    <span class="stat-value">{{ tree1Temp }}°C</span>
                  </div>
                  <div class="stat-item">
                    <span class="stat-label">Status</span>
                    <span class="stat-value" :class="getTemperatureStatus(tree1Temp).toLowerCase()">
                      {{ getTemperatureStatus(tree1Temp) }}
                    </span>
                  </div>
                  <div class="stat-item">
                    <span class="stat-label">Optimal Range</span>
                    <span class="stat-value">25°C - 30°C</span>
                  </div>
                  <div class="stat-item">
                    <span class="stat-label">Last Updated</span>
                    <span class="stat-value">{{ tree1LastUpdated }}</span>
                  </div>
                </div>
              </div>

              <div class="chart-card">
                <h2>Temperature History</h2>
                <div class="chart-container">
                  <p class="placeholder">Temperature History Chart</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Temperature View for Bottle 2 -->
          <div v-if="currentView === 'tree2-temp'" class="view-content">
            <div class="header">
              <h1>Bottle 2 - Temperature</h1>
            </div>
            <div class="content-grid">
              <!-- Temperature Visualization -->
              <div class="visualization-card">
                <h2>Temperature Status</h2>
                <div class="temperature-container">
                  <div class="thermometer">
                    <div class="thermometer-body">
                      <div 
                        class="temperature-fill" 
                        :style="{ 
                          height: `${((tree2Temp - 20) / (35 - 20)) * 100}%`,
                          backgroundColor: getTemperatureColor(tree2Temp)
                        }"
                      ></div>
                    </div>
                    <div class="temperature-value">{{ tree2Temp }}°C</div>
                  </div>
                  <div class="temperature-scale">
                    <span>35°C</span>
                    <span>20°C</span>
                  </div>
                </div>
              </div>

              <!-- Temperature Statistics -->
              <div class="data-card">
                <h2>Temperature Analysis</h2>
                <div class="stats-grid">
                  <div class="stat-item">
                    <span class="stat-label">Current Temperature</span>
                    <span class="stat-value">{{ tree2Temp }}°C</span>
                  </div>
                  <div class="stat-item">
                    <span class="stat-label">Status</span>
                    <span class="stat-value" :class="getTemperatureStatus(tree2Temp).toLowerCase()">
                      {{ getTemperatureStatus(tree2Temp) }}
                    </span>
                  </div>
                  <div class="stat-item">
                    <span class="stat-label">Optimal Range</span>
                    <span class="stat-value">25°C - 30°C</span>
                  </div>
                  <div class="stat-item">
                    <span class="stat-label">Last Updated</span>
                    <span class="stat-value">{{ tree2LastUpdated }}</span>
                  </div>
                </div>
              </div>

              <div class="chart-card">
                <h2>Temperature History</h2>
                <div class="chart-container">
                  <p class="placeholder">Temperature History Chart</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Logout Modal -->
    <div class="modal" v-if="showLogoutModal">
      <div class="modal-content">
        <div class="modal-header">
          <h2>Confirm Logout</h2>
        </div>
        <div class="modal-body">
          <p>Are you sure you want to logout?</p>
        </div>
        <div class="modal-footer">
          <button class="cancel-button" @click="showLogoutModal = false">Cancel</button>
          <button class="confirm-button" @click="confirmLogout">Logout</button>
        </div>
      </div>
    </div>

    <!-- Notification -->
    <div v-if="showNotification" class="notification">
      <span class="notification-icon">{{ notificationIcon }}</span>
      {{ notificationMessage }}
    </div>
  </div>
</template>

<style scoped>
/* Base variables */
:root {
  --color-darkest: #08314A;
  --color-dark: #005F7B;
  --color-medium: #00A0A9;
  --color-light: #04E4D8;
  --color-lightest: #7FEDDF;
}

/* Updated layout styles */
.dashboard-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.main-header {
  width: 100%;
  background-color: white;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  text-align: center;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.menu-toggle {
  position: absolute;
  left: 20px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: var(--color-darkest);
  display: none;
  padding: 8px;
  z-index: 1001;
}

.hamburger-icon {
  display: block;
}

.app-title {
  font-size: 2.5em;
  color: var(--color-darkest);
  margin: 0;
}

.app-subtitle {
  font-size: 1.2em;
  color: var(--color-dark);
  margin: 5px 0 0;
}

.content-wrapper {
  margin-top: 120px;
}

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

.main-content {
  flex: 1;
  margin-left: 250px;
  padding: 20px;
  background-color: #f5f7fa;
  min-height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.main-content-inner {
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 24px;
}

/* Navigation styles */
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

/* Update existing navigation styles */
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

/* Responsive design */
@media (max-width: 768px) {
  .menu-toggle {
    display: block;
  }

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
  
  .main-content {
    margin-left: 0;
  }

  .sidebar-overlay {
    display: block;
  }

  .app-title {
    font-size: 2.2em;
  }
  
  .app-subtitle {
    font-size: 1em;
  }
  
  .title-section {
    padding: 8px 16px;
  }
}

/* Keep all other existing styles */
.view-content {
  margin-bottom: 30px;
}

.view-header {
  margin-bottom: 30px;
}

.view-header h2 {
  font-size: 1.8em;
  color: var(--color-darkest);
}

.content-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 40px;
  padding: 32px 0;
}

.chart-card {
  grid-column: 1 / -1;
}

.visualization-card, .data-card, .chart-card {
  background: white;
  border-radius: 10px;
  padding: 40px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  min-width: 320px;
}

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

.ph-container {
  padding: 20px;
}

.ph-meter {
  margin: 40px 0;
  position: relative;
  padding-bottom: 20px;
}

.ph-scale {
  height: 60px;
  background: linear-gradient(to right, #ff4444, #ffae00, #44ff44);
  border-radius: 30px;
  position: relative;
  margin: 40px 20px 60px;
}

.ph-indicator {
  position: absolute;
  top: -25px;
  width: 20px;
  height: 80px;
  transform: translateX(-50%);
  transition: left 0.5s ease-out;
}

.ph-indicator::after {
  content: '';
  position: absolute;
  top: 25px;
  left: 50%;
  transform: translateX(-50%);
  width: 4px;
  height: 55px;
  background-color: #2c3e50;
}

.ph-value {
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

.ph-labels {
  display: flex;
  justify-content: space-between;
  position: absolute;
  width: 100%;
  bottom: -40px;
  left: 0;
  color: #666;
  font-size: 0.9em;
}

.ph-labels span {
  transform: translateX(-50%);
}

.ph-labels span:last-child {
  transform: translateX(50%);
}

.fermentation-status {
  text-align: center;
  font-size: 1.2em;
  font-weight: bold;
  margin: 20px 0;
  padding: 10px;
  border-radius: 5px;
}

.fermentation-status.fresh {
  color: #27ae60;
  background-color: rgba(39, 174, 96, 0.1);
}

.fermentation-status.fermenting {
  color: #f39c12;
  background-color: rgba(243, 156, 18, 0.1);
}

.fermentation-status.nearly {
  color: #e67e22;
  background-color: rgba(230, 126, 34, 0.1);
}

.fermentation-status.vinegar {
  color: #e74c3c;
  background-color: rgba(231, 76, 60, 0.1);
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
  color: var(--color-darkest);
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

.placeholder {
  color: #999;
  font-style: italic;
}

.temperature-container {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 30px;
  margin: 40px 0;
  height: 300px;
}

.thermometer {
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
}

.thermometer-body {
  width: 40px;
  height: 200px;
  background-color: #f5f5f5;
  border-radius: 20px;
  position: relative;
  overflow: hidden;
  border: 3px solid #ddd;
}

.temperature-fill {
  position: absolute;
  bottom: 0;
  width: 100%;
  transition: height 0.5s ease, background-color 0.5s ease;
}

.temperature-value {
  margin-top: 10px;
  font-size: 1.5em;
  font-weight: bold;
  color: #2c3e50;
}

.temperature-scale {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 200px;
  color: #666;
}

.temperature-status.optimal {
  color: #27ae60;
  background-color: rgba(39, 174, 96, 0.1);
}

.temperature-status.high {
  color: #e74c3c;
  background-color: rgba(231, 76, 60, 0.1);
}

.temperature-status.low {
  color: #3498db;
  background-color: rgba(52, 152, 219, 0.1);
}

.logout-button {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background-color: #e74c3c;
  color: white;
  border: none;
  padding: 12px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1em;
  transition: background-color 0.3s, transform 0.2s;
}

.logout-button:hover {
  background-color: #c0392b;
  transform: translateY(-1px);
}

.logout-button:active {
  transform: translateY(0);
  background-color: #a93122;
}

.logout-icon {
  margin-right: 12px;
  font-size: 1.2em;
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
}

.modal-content {
  background-color: white;
  border-radius: 8px;
  width: 400px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  animation: modal-appear 0.3s ease;
}

@keyframes modal-appear {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-header {
  padding: 20px;
  border-bottom: 1px solid #eee;
}

.modal-header h2 {
  margin: 0;
  color: var(--color-darkest);
  font-size: 1.5em;
}

.modal-body {
  padding: 30px 20px;
  text-align: center;
  color: #2c3e50;
  font-size: 1.1em;
}

.modal-footer {
  padding: 20px;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.cancel-button {
  padding: 10px 20px;
  border: 1px solid #ddd;
  background-color: white;
  color: #666;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1em;
  transition: all 0.3s ease;
}

.cancel-button:hover {
  background-color: #f5f5f5;
}

.confirm-button {
  padding: 10px 20px;
  border: none;
  background-color: #e74c3c;
  color: white;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1em;
  transition: all 0.3s ease;
}

.confirm-button:hover {
  background-color: #c0392b;
}

/* Update the navigation item styles */
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

/* Profile section styles */
.profile-section {
  position: absolute;
  top: 50%;
  right: 80px;
  transform: translateY(-50%);
}

.profile-icon {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background-color: #f8f9fa;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid #eee;
}

.profile-icon:hover {
  background-color: var(--color-lightest);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.profile-avatar-img {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  object-fit: cover;
}

.profile-avatar {
  font-size: 1.2em;
}

.profile-arrow {
  font-size: 0.8em;
  color: #666;
  transition: transform 0.3s ease;
}

.profile-arrow.rotated {
  transform: rotate(180deg);
}

/* Profile dropdown menu styles */
.profile-menu {
  position: absolute;
  top: 60px;
  right: 20px;
  background-color: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 12px;
  min-width: 200px;
  z-index: 1000;
}

.profile-info {
  display: flex;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #e0e0e0;
  margin-bottom: 8px;
}

.profile-picture {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin-right: 12px;
  overflow: hidden;
}

.profile-picture img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.user-details {
  flex: 1;
  min-width: 0;
}

.user-name {
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 4px;
  font-size: 1em;
}

.user-email {
  color: #666;
  font-size: 0.9em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.profile-menu-item {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  color: #2c3e50;
  cursor: pointer;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.profile-menu-item:hover {
  background-color: #f5f5f5;
}

.profile-menu-item .menu-icon {
  margin-right: 8px;
}

.profile-menu-divider {
  height: 1px;
  background-color: #e0e0e0;
  margin: 8px 0;
}

.profile-menu-item.logout {
  color: #e74c3c;
}

.profile-menu-item.loading {
  opacity: 0.7;
  cursor: not-allowed;
}

/* Add notification styles */
.notification {
  position: fixed;
  top: 20px;
  right: 20px;
  padding: 16px 24px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 12px;
  color: white;
  font-weight: 500;
  animation: slide-in 0.3s ease;
  z-index: 2000;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.notification.success {
  background-color: #2ecc71;
}

.notification.error {
  background-color: #e74c3c;
}

.notification-icon {
  font-size: 1.2em;
}

@keyframes slide-in {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.fade-out {
  animation: fade-out 0.3s ease forwards;
}

@keyframes fade-out {
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(100%);
    opacity: 0;
  }
}

/* Optional: Add loading spinner */
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

/* Update profile menu item to show loading state */
.profile-menu-item.loading::after {
  content: '';
  position: absolute;
  right: 16px;
  width: 16px;
  height: 16px;
  border: 2px solid #f3f3f3;
  border-top: 2px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

/* Add animation for gradient */
@keyframes gradient {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

.sidebar-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0,0,0,0.3);
  z-index: 1099;
  display: block;
}

@media (min-width: 1400px) {
  .content-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 900px) {
  .content-grid {
    grid-template-columns: 1fr;
    gap: 20px;
    padding: 16px 0;
  }
  .visualization-card, .data-card, .chart-card {
    padding: 20px;
  }
}
</style>

<script>
import { auth, provider, signOut, signInWithPopup } from '../firebase';
import { firestore, collection, query, orderBy, onSnapshot } from '@/firebase';

export default {
  name: 'Dashboard',
  data() {
    return {
      selectedGroup: 'container',
      currentView: 'tree1-container',
      containerCapacity: 7,
      // Tree 1 data
      tree1Level: 0,
      tree1PH: 5.75,
      tree1LastUpdated: '',
      // Tree 2 data
      tree2Level: 0,
      tree2PH: 5.75,
      tree2LastUpdated: '',
      // Add temperature data
      tree1Temp: 25,
      tree2Temp: 25,
      showLogoutModal: false,
      showProfileMenu: false,
      user: null,
      isLoading: false,
      showSidebar: false,
    }
  },
  methods: {
    toggleGroup(group) {
      this.selectedGroup = this.selectedGroup === group ? null : group;
      // Set default view for selected group
      if (group === 'container') {
        this.currentView = 'tree1-container';
      } else if (group === 'ph') {
        this.currentView = 'tree1-ph';
      } else if (group === 'temperature') {
        this.currentView = 'tree1-temp';
      }
    },
    selectView(view) {
      this.currentView = view;
      // Auto-close sidebar on mobile
      if (window.innerWidth <= 768) {
        this.showSidebar = false;
      }
    },
    getTree1FermentationStatus() {
      return this.getFermentationStatus(this.tree1PH);
    },
    getTree2FermentationStatus() {
      return this.getFermentationStatus(this.tree2PH);
    },
    getFermentationStatus(ph) {
      if (ph >= 5) return 'Fresh Tuba';
      if (ph >= 4) return 'Fermenting';
      if (ph >= 3) return 'Nearly Vinegar';
      return 'Vinegar';
    },
    logout() {
      this.showProfileMenu = false;
      this.showLogoutModal = true;
    },
    async confirmLogout() {
      try {
        await signOut(auth);
        this.showLogoutModal = false;
        this.$router.push('/');
      } catch (error) {
        console.error('Logout error:', error);
      }
    },
    getTemperatureColor(temp) {
      if (temp < 25) return '#3498db';
      if (temp > 30) return '#e74c3c';
      return '#27ae60';
    },
    getTemperatureStatus(temp) {
      if (temp < 25) return 'Low';
      if (temp > 30) return 'High';
      return 'Optimal';
    },
    updateTree1(level, ph, temp) {
      // Only update if values are provided
      if (level !== undefined) this.tree1Level = Number(level.toFixed(2));
      if (ph !== undefined) this.tree1PH = Number(ph.toFixed(2));
      if (temp !== undefined) this.tree1Temp = Number(temp.toFixed(1));
    },
    updateTree2(level, ph, temp) {
      // Only update if values are provided
      if (level !== undefined) this.tree2Level = Number(level.toFixed(2));
      if (ph !== undefined) this.tree2PH = Number(ph.toFixed(2));
      if (temp !== undefined) this.tree2Temp = Number(temp.toFixed(1));
    },
    toggleProfileMenu() {
      this.showProfileMenu = !this.showProfileMenu;
    },
    // Update user data when authenticated
    updateUserData(firebaseUser) {
      if (firebaseUser) {
        this.user = {
          displayName: firebaseUser.displayName,
          email: firebaseUser.email,
          photoURL: firebaseUser.photoURL
        };
      } else {
        this.user = null;
      }
    },
    async changeAccount() {
      try {
        // Set prompt parameter to 'select_account' to force account selection
        provider.setCustomParameters({
          prompt: 'select_account'
        });
        
        // Sign out current user
        await signOut(auth);
        
        // Show loading state (optional)
        this.isLoading = true;
        
        // Sign in with popup and force account selection
        const result = await signInWithPopup(auth, provider);
        
        // Update user data with new account
        this.updateUserData(result.user);
        
        // Close profile menu
        this.showProfileMenu = false;
        
        // Show success message
        this.showSuccessMessage('Account changed successfully!');
        
      } catch (error) {
        console.error('Change account error:', error);
        // Show error message to user
        this.showErrorMessage('Failed to change account. Please try again.');
      } finally {
        // Hide loading state (optional)
        this.isLoading = false;
      }
    },
    // Add methods for showing messages
    showSuccessMessage(message) {
      // Create success notification
      const notification = document.createElement('div');
      notification.className = 'notification success';
      notification.innerHTML = `
        <span class="notification-icon">✓</span>
        ${message}
      `;
      this.showNotification(notification);
    },
    showErrorMessage(message) {
      // Create error notification
      const notification = document.createElement('div');
      notification.className = 'notification error';
      notification.innerHTML = `
        <span class="notification-icon">⚠</span>
        ${message}
      `;
      this.showNotification(notification);
    },
    showNotification(notification) {
      // Add notification to document
      document.body.appendChild(notification);
      
      // Remove notification after 3 seconds
      setTimeout(() => {
        notification.classList.add('fade-out');
        setTimeout(() => {
          document.body.removeChild(notification);
        }, 300);
      }, 3000);
    },
    toggleSidebar() {
      this.showSidebar = !this.showSidebar;
      const sidebar = document.querySelector('.sidebar');
      if (sidebar) {
        sidebar.classList.toggle('show');
      }
    },
  },
  mounted() {
    // Listen for Tree 1 sensor data
    const tree1Query = query(collection(firestore, "sensor"), orderBy("timestamp", "desc"));
    onSnapshot(tree1Query, (snapshot) => {
      const latest = snapshot.docs[0]?.data();
      if (latest) {
        this.updateTree1(
          parseFloat(latest.volume_liters.doubleValue),
          latest.ph?.doubleValue,
          latest.temperature?.doubleValue
        );
        this.tree1LastUpdated = latest.timestamp.stringValue;
      }
    });

    // Listen for Tree 2 sensor data
    const tree2Query = query(collection(firestore, "sensor2"), orderBy("timestamp", "desc"));
    onSnapshot(tree2Query, (snapshot) => {
      const latest = snapshot.docs[0]?.data();
      if (latest) {
        this.updateTree2(
          parseFloat(latest.volume_liters.doubleValue),
          latest.ph?.doubleValue,
          latest.temperature?.doubleValue
        );
        this.tree2LastUpdated = latest.timestamp.stringValue;
      }
    });

    document.addEventListener('click', (e) => {
      const profileSection = document.querySelector('.profile-section');
      if (profileSection && !profileSection.contains(e.target)) {
        this.showProfileMenu = false;
      }
    });

    // Listen for auth state changes
    auth.onAuthStateChanged((firebaseUser) => {
      this.updateUserData(firebaseUser);
    });
  }
}
</script> 