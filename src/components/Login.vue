<template>
  <div class="login-container">
    <div class="login-card">
      <h1>CocoTap</h1>
      <p class="subtitle">Tuba Production Monitoring System</p>
      
      <div v-if="!user" class="login-form">
        <button @click="login" class="login-button">
          <img src="../assets/google-icon.svg" alt="Google" class="google-icon">
          Login with Google
        </button>
      </div>
      
      <div v-else class="user-info">
        <img :src="user.photoURL" :alt="user.displayName" class="user-avatar">
        <h2>Welcome, {{ user.displayName }}</h2>
        <button @click="goToDashboard" class="dashboard-button">Go to Dashboard</button>
        <button @click="logout" class="logout-button">Logout</button>
      </div>
    </div>
  </div>
</template>

<script>
import { auth, provider, signInWithPopup, signOut, onAuthStateChanged } from '../firebase';

export default {
  name: 'Login',
  data() {
    return {
      user: null
    };
  },
  methods: {
    async login() {
      try {
        const result = await signInWithPopup(auth, provider);
        this.user = result.user;
        this.$router.push('/dashboard');
      } catch (error) {
        console.error('Login error:', error);
      }
    },
    async logout() {
      try {
        await signOut(auth);
        this.user = null;
      } catch (error) {
        console.error('Logout error:', error);
      }
    },
    goToDashboard() {
      this.$router.push('/dashboard');
    }
  },
  created() {
    onAuthStateChanged(auth, (firebaseUser) => {
      this.user = firebaseUser;
      if (firebaseUser) {
        this.$router.push('/dashboard');
      }
    });
  }
};
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f5f7fa;
}

.login-card {
  background: white;
  padding: 40px;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
  text-align: center;
}

h1 {
  color: #2c3e50;
  font-size: 2.5em;
  margin-bottom: 10px;
}

.subtitle {
  color: #7f8c8d;
  font-size: 1.1em;
  margin-bottom: 30px;
}

.login-button {
  background-color: #4285f4;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 4px;
  font-size: 1em;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  transition: background-color 0.3s;
}

.login-button:hover {
  background-color: #357abd;
}

.google-icon {
  width: 24px;
  height: 24px;
  margin-right: 10px;
}

.user-info {
  margin-top: 20px;
}

.user-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  margin-bottom: 15px;
}

.dashboard-button {
  background-color: #2ecc71;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 4px;
  font-size: 1em;
  cursor: pointer;
  margin: 10px 0;
  width: 100%;
  transition: background-color 0.3s;
}

.dashboard-button:hover {
  background-color: #27ae60;
}

.logout-button {
  background-color: #e74c3c;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 4px;
  font-size: 1em;
  cursor: pointer;
  width: 100%;
  transition: background-color 0.3s;
}

.logout-button:hover {
  background-color: #c0392b;
}
</style>