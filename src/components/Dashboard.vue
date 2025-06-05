<template>
  <div class="dashboard-container">
    <!-- Header -->
    <div class="main-header">
      <button class="menu-toggle" @click="toggleSidebar">
        <span class="hamburger-icon">☰</span>
      </button>
      <div class="header-center-group">
        <img src="/img/logo/CocoTap Logo.png" alt="CocoTap Logo" class="header-logo" />
        <div class="header-text-group">
          <h1 class="app-title">CocoTap</h1>
          <p class="app-subtitle">Tuba Production Monitoring System</p>
        </div>
      </div>
      
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
              <span class="nav-icon">🍾</span>
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
                <span class="nav-icon">🍾</span>
                Bottle 1
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
                <span class="nav-icon">🍾</span>
                Bottle 1
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
              <ContainerStatus
                :level="tree1Level"
                :container-capacity="containerCapacity"
                :last-updated="tree1LastUpdated"
                :history="tree1History"
                :show-valve-control="true"
                @valve-toggled="handleValveToggle"
              />
            </div>
          </div>

          <!-- Tree 1 pH Status -->
          <div v-if="currentView === 'tree1-ph'" class="view-content">
            <div class="view-header">
              <h2>Tree 1 - pH Status</h2>
            </div>
            <div class="content-grid">
              <PHStatus
                :ph="tree1PH"
                :last-updated="tree1LastUpdated"
                :history="tree1PHHistory"
                :format-timestamp="formatTimestamp"
              />
            </div>
          </div>

          <!-- Temperature View for Bottle 1 -->
          <div v-if="currentView === 'tree1-temp'" class="view-content">
            <div class="view-header">
              <h2>Bottle 1 - Temperature</h2>
            </div>
            <div class="content-grid">
              <TemperatureStatus
                :temperature="tree1Temp"
                :last-updated="tree1LastUpdated"
                :history="tree1TempHistory"
                :format-timestamp="formatTimestamp"
              />
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
  --sidebar-width: 250px;
}

/* Updated layout styles */
.dashboard-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  width: 100%;
  position: relative;
}

.main-header {
  width: 100%;
  background-color: white;
  padding: 0 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1000;
  display: flex;
  flex-direction: row;
  align-items: center;
  height: 100px;
  min-height: 80px;
  justify-content: center;
}

.header-center-group {
  display: flex;
  align-items: center;
  margin: 0 auto;
}

.header-logo {
  height: 80px;
  width: auto;
  margin-right: 20px;
  flex-shrink: 0;
  display: block;
}

.header-text-group {
  display: flex;
  flex-direction: column;
  justify-content: center;
  height: 100%;
}

.app-title {
  font-size: 2.5em;
  color: var(--color-darkest);
  margin: 0;
  text-align: left;
}

.app-subtitle {
  font-size: 1.2em;
  color: var(--color-dark);
  margin: 5px 0 0;
  text-align: left;
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

.content-wrapper {
  margin-top: 120px;
  display: flex;
  width: 100%;
  position: relative;
}

.sidebar {
  width: var(--sidebar-width);
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
  margin-left: var(--sidebar-width);
  padding: 20px;
  background-color: #f5f7fa;
  min-height: calc(100vh - 120px);
  display: flex;
  flex-direction: column;
  align-items: stretch;
  width: 100%;
  justify-content: center;
}

.main-content-inner {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: margin-left 0.3s;
}

/* Desktop: push cards to the right */
@media (min-width: 1200px) {
  .main-content-inner {
    margin-left: 200px; /* Adjust this value for how far right you want */
  }
}

/* Tablet and below: center cards */
@media (max-width: 1199px) {
  .main-content-inner {
    margin-left: auto;
    margin-right: auto;
  }
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
@media (max-width: 1400px) {
  .content-grid {
    grid-template-columns: repeat(2, 1fr);
    max-width: 800px;
    gap: 48px;
  }
}

@media (max-width: 1024px) {
  .content-grid {
    grid-template-columns: 1fr;
    max-width: 600px;
    gap: 32px;
  }
  
  .visualization-card, 
  .data-card, 
  .chart-card {
    padding: 24px;
  }
}

@media (max-width: 768px) {
  :root {
    --sidebar-width: 0px;
  }

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
    width: 250px;
  }
  
  .main-content {
    margin-left: 0;
    width: 100%;
  }

  .content-grid {
    gap: 20px;
    padding: 16px 0;
  }

  .visualization-card, 
  .data-card, 
  .chart-card {
    padding: 20px;
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
  grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
  gap: 100px;
  padding: 32px 0;
  width: 100%;
  max-width: 1000px;
  margin: 0 auto;
}

.chart-card {
  grid-column: 1 / -1;
}

.visualization-card, .data-card, .chart-card {
  background: white;
  border-radius: 10px;
  padding: 40px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  min-width: 400px;
  max-width: 600px;
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

.ph-container,
.ph-meter,
.ph-scale,
.ph-indicator,
.ph-value,
.ph-labels,
.fermentation-status,
.fermentation-status.fresh,
.fermentation-status.fermenting,
.fermentation-status.nearly,
.fermentation-status.vinegar {
  display: none;
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
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
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

/* Remove sensor status styles */
.stat-value.online,
.stat-value.warning,
.stat-value.offline {
  display: none;
}

/* Medium screens */
@media (max-width: 1024px) {
  .content-grid {
    grid-template-columns: 1fr;
    max-width: 600px;
  }
  .visualization-card, .data-card, .chart-card {
    min-width: 300px;
    max-width: 400px;
    padding: 24px;
  }
}

/* Small screens */
@media (max-width: 600px) {
  .content-grid {
    max-width: 100%;
    gap: 20px;
  }
  .visualization-card, .data-card, .chart-card {
    min-width: 180px;
    max-width: 100%;
    padding: 10px;
  }
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

.valve-control {
  grid-column: 1 / -1;
  margin-top: 10px;
}

.valve-status-group {
  display: flex;
  align-items: center;
  gap: 20px;
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
</style>

<script>
import { 
  auth, 
  provider, 
  signOut, 
  signInWithPopup,
  firestore,
  collection,
  query,
  getDocs,
  doc,
  setDoc,
  updateDoc,
  onSnapshot,
  getDoc
} from '../firebase';
import SensorData from './SensorData.vue';
import ContainerStatus from './ContainerStatus.vue';
import PHStatus from './PHStatus.vue';
import TemperatureStatus from './TemperatureStatus.vue';
import { watch } from 'vue';

export default {
  name: 'Dashboard',
  components: {
    SensorData,
    ContainerStatus,
    PHStatus,
    TemperatureStatus
  },
  data() {
    return {
      selectedGroup: 'container',
      currentView: 'tree1-container',
      showLogoutModal: false,
      showProfileMenu: false,
      user: null,
      isLoading: false,
      showSidebar: false,
      notificationIcon: '📊',
      notificationMessage: '',
      showNotification: false
    }
  },
  setup() {
    const {
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
      tree1History,
      tree2History,
      tree1PHHistory,
      tree2PHHistory,
      tree1TempHistory,
      tree2TempHistory
    } = SensorData.setup();

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
      tree1History,
      tree2History,
      tree1PHHistory,
      tree2PHHistory,
      tree1TempHistory,
      tree2TempHistory
    };
  },
  methods: {
    toggleGroup(group) {
      this.selectedGroup = this.selectedGroup === group ? null : group;
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
      if (window.innerWidth <= 768) {
        this.showSidebar = false;
      }
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
    toggleProfileMenu() {
      this.showProfileMenu = !this.showProfileMenu;
    },
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
        provider.setCustomParameters({
          prompt: 'select_account'
        });
        
        await signOut(auth);
        this.isLoading = true;
        
        const result = await signInWithPopup(auth, provider);
        this.updateUserData(result.user);
        this.showProfileMenu = false;
        this.showSuccessMessage('Account changed successfully!');
        
      } catch (error) {
        console.error('Change account error:', error);
        this.showErrorMessage('Failed to change account. Please try again.');
      } finally {
        this.isLoading = false;
      }
    },
    showSuccessMessage(message) {
      this.notificationMessage = message;
      this.notificationIcon = '✓';
      this.showNotification = true;
      setTimeout(() => {
        this.showNotification = false;
      }, 3000);
    },
    showErrorMessage(message) {
      this.notificationMessage = message;
      this.notificationIcon = '⚠';
      this.showNotification = true;
      setTimeout(() => {
        this.showNotification = false;
      }, 3000);
    },
    toggleSidebar() {
      this.showSidebar = !this.showSidebar;
      const sidebar = document.querySelector('.sidebar');
      if (sidebar) {
        sidebar.classList.toggle('show');
      }
    },
    handleValveToggle(result) {
      if (result.success) {
        this.showSuccessMessage(result.message);
      } else {
        this.showErrorMessage(result.message);
      }
    }
  },
  mounted() {
    document.addEventListener('click', (e) => {
      const profileSection = document.querySelector('.profile-section');
      if (profileSection && !profileSection.contains(e.target)) {
        this.showProfileMenu = false;
      }
    });

    // Listen for auth state changes
    this.authUnsubscribe = auth.onAuthStateChanged((firebaseUser) => {
      this.updateUserData(firebaseUser);
    });
  },
  beforeUnmount() {
    if (this.authUnsubscribe) {
      this.authUnsubscribe();
    }
  }
}
</script> 