<template>
  <div class="landing-bg">
    <div class="overlay"></div>
    <div class="landing-container">
      <!-- Login button in top right -->
      <div class="login-button-container">
        <button v-if="!user" @click="handleGoogleLogin" class="login-button">
          <img src="../assets/google-icon.svg" alt="Google" class="google-icon">
          Login with Google
        </button>
        <div v-else class="user-info-top">
          <img :src="user.photoURL" :alt="user.displayName" class="user-avatar-small">
          <span class="user-name">{{ user.displayName }}</span>
          <button @click="goToDashboard" class="dashboard-button-small">Dashboard</button>
          <button @click="logout" class="logout-button-small">Logout</button>
        </div>
      </div>

      <!-- Main content -->
      <div class="content-container">
        <div class="hero-section">
          <div class="logo-title-row">
            <img src="/img/logo/CocoTap Logo.png" alt="CocoTap Logo" class="cocotap-logo" />
            <h1>CocoTap</h1>
          </div>
          <p class="subtitle">Tuba Production Monitoring System</p>
        </div>

        <div class="info-sections">
          <section class="info-card">
            <h2>What is Tuba?</h2>
            <p>Tuba is a traditional Filipino alcoholic beverage made from the sap of coconut trees. It's a natural, sweet-tasting drink that undergoes natural fermentation, creating a unique alcoholic beverage that's deeply rooted in Filipino culture and tradition.</p>
          </section>

          <section class="info-card">
            <h2>How is Tuba Collected?</h2>
            <p>The collection of tuba is a skilled and traditional process:</p>
            <ul>
              <li>Skilled harvesters climb coconut trees to reach the flower buds</li>
              <li>The flower buds are carefully cut and tied to allow the sap to flow</li>
              <li>A container is attached to collect the dripping sap</li>
              <li>The sap is collected twice daily, typically in the morning and evening</li>
              <li>Fresh tuba is sweet and non-alcoholic, but naturally ferments within hours</li>
            </ul>
          </section>

          <section class="info-card">
            <h2>Our Monitoring System</h2>
            <p>CocoTap helps tuba producers and collectors:</p>
            <ul>
              <li>Track daily production volumes</li>
              <li>Monitor collection schedules</li>
              <li>Manage inventory and distribution</li>
              <li>Analyze production trends</li>
            </ul>
          </section>
        </div>
      </div>

      <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
    </div>
  </div>
</template>

<script>
import { auth, provider, signInWithPopup, signOut, onAuthStateChanged } from '../firebase';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';

const db = getFirestore();

export default {
  name: 'Login',
  data() {
    return {
      user: null,
      errorMessage: ''
    };
  },
  methods: {
    async handleGoogleLogin() {
      try {
        const result = await signInWithPopup(auth, provider);
        const user = result.user;
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
          await setDoc(userRef, { createdAt: new Date().toISOString() });
        }

        this.user = user;
        this.$router.push('/dashboard');
      } catch (error) {
        console.error('Login error:', error);
        this.errorMessage = 'Login failed. Please try again.';
      }
    },

    async logout() {
      try {
        await signOut(auth);
        this.user = null;
        this.errorMessage = '';
      } catch (error) {
        console.error('Logout error:', error);
      }
    },

    goToDashboard() {
      this.$router.push('/dashboard');
    }
  },
  created() {
    onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userRef = doc(db, 'users', firebaseUser.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          this.user = firebaseUser;
          this.$router.push('/dashboard');
        } else {
          await signOut(auth);
        }
      } else {
        this.user = null;
      }
    });
  }
};
</script>

<style scoped>
.landing-bg {
  position: relative;
  width: 100vw;
  min-height: 100vh;
  z-index: 0;
  overflow: hidden;
}
.landing-bg::before {
  content: '';
  position: fixed;
  inset: 0;
  background: url('../assets/tuba-bg.jpg') center center/cover no-repeat;
  filter: blur(8px) brightness(0.7);
  z-index: 1;
  pointer-events: none;
}
.overlay {
  position: fixed;
  inset: 0;
  background: linear-gradient(120deg, rgba(255,255,255,0.7) 60%, rgba(200,230,201,0.5) 100%);
  z-index: 2;
  pointer-events: none;
}
.landing-container {
  position: relative;
  z-index: 3;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}
.login-button-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 10;
}
.login-button {
  background: rgba(255,255,255,0.85);
  color: #4285f4;
  border: none;
  padding: 10px 20px;
  border-radius: 24px;
  font-size: 1em;
  cursor: pointer;
  display: flex;
  align-items: center;
  box-shadow: 0 2px 8px rgba(44,62,80,0.08);
  transition: background 0.3s, color 0.3s;
  font-weight: 600;
}
.login-button:hover {
  background: #4285f4;
  color: #fff;
}
.google-icon {
  width: 24px;
  height: 24px;
  margin-right: 10px;
}
.user-info-top {
  display: flex;
  align-items: center;
  gap: 10px;
  background: rgba(255,255,255,0.85);
  padding: 8px 16px;
  border-radius: 24px;
  box-shadow: 0 2px 8px rgba(44,62,80,0.08);
}
.user-avatar-small {
  width: 32px;
  height: 32px;
  border-radius: 50%;
}
.user-name {
  font-size: 0.95em;
  color: #2c3e50;
  font-weight: 500;
}
.dashboard-button-small, .logout-button-small {
  padding: 6px 14px;
  border: none;
  border-radius: 16px;
  font-size: 0.9em;
  cursor: pointer;
  transition: background-color 0.3s;
  font-weight: 500;
}
.dashboard-button-small {
  background-color: #2ecc71;
  color: white;
}
.logout-button-small {
  background-color: #e74c3c;
  color: white;
}
.content-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 80px 20px 40px 20px;
}
.hero-section {
  text-align: center;
  margin-bottom: 60px;
}
.logo-title-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 32px;
  margin-bottom: 10px;
}
.cocotap-logo {
  width: 140px;
  height: 140px;
  object-fit: contain;
  filter: drop-shadow(0 2px 8px rgba(44,62,80,0.10));
  margin-bottom: 0;
  margin-left: 0;
  margin-right: 0;
}
.hero-section h1 {
  margin-bottom: 0;
}
.subtitle {
  color: #388e3c;
  font-size: 1.3em;
  margin-bottom: 30px;
  font-weight: 500;
  text-shadow: 0 2px 8px rgba(44,62,80,0.08);
}
.info-sections {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 32px;
  padding: 20px 0;
}
.info-card {
  background: rgba(255,255,255,0.85);
  padding: 32px 28px;
  border-radius: 18px;
  box-shadow: 0 4px 24px rgba(44,62,80,0.10);
  backdrop-filter: blur(2px);
  border: 1px solid rgba(44,62,80,0.06);
}
.info-card h2 {
  color: #2c3e50;
  margin-bottom: 18px;
  font-size: 1.5em;
  font-weight: 700;
}
.info-card p {
  color: #34495e;
  line-height: 1.6;
  margin-bottom: 15px;
  font-size: 1.08em;
}
.info-card ul {
  list-style-type: none;
  padding: 0;
}
.info-card li {
  color: #388e3c;
  margin-bottom: 10px;
  padding-left: 22px;
  position: relative;
  font-size: 1em;
}
.info-card li:before {
  content: "•";
  color: #fbc02d;
  position: absolute;
  left: 0;
  font-size: 1.2em;
  top: 0;
}
.error-message {
  color: #e74c3c;
  margin-top: 10px;
  font-size: 1em;
  text-align: center;
  background: rgba(255,255,255,0.85);
  padding: 10px 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(44,62,80,0.08);
  max-width: 400px;
  margin-left: auto;
  margin-right: auto;
}
@media (max-width: 700px) {
  .content-container {
    padding: 40px 5vw 20px 5vw;
  }
  .info-sections {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  .logo-title-row {
    flex-direction: column;
    gap: 12px;
  }
  .cocotap-logo {
    width: 90px;
    height: 90px;
  }
}
</style>