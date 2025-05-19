<template>
  <div class="login-container">
    <div class="login-card">
      <h1>CocoTap</h1>
      <p class="subtitle">Tuba Production Monitoring System</p>
      
      <div v-if="!user" class="login-form">
        <div v-if="!showPasswordInput" class="login-button-container">
          <button @click="handleGoogleLogin" class="login-button">
            <img src="../assets/google-icon.svg" alt="Google" class="google-icon">
            Login with Google
          </button>
        </div>
        
        <div v-else class="password-input-container">
          <input 
            v-model="password"
            type="password"
            placeholder="Enter your password"
            class="password-input"
            @keyup.enter="validatePassword"
          />
          <div class="password-buttons">
            <button @click="validatePassword" class="validate-button">Login</button>
            <button @click="cancelLogin" class="back-button">Back</button>
          </div>
          <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
        </div>
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
      user: null,
      showPasswordInput: false,
      password: '',
      errorMessage: '',
      tempUser: null
    };
  },
  methods: {
    async handleGoogleLogin() {
      try {
        const result = await signInWithPopup(auth, provider);
        this.tempUser = result.user;
        this.showPasswordInput = true;
      } catch (error) {
        console.error('Login error:', error.code, error.message);
        this.errorMessage = 'Login failed. Please try again.';
      }
    },

    async validatePassword() {
      // Replace 'your-secure-password' with your actual password
      const correctPassword = 'your-secure-password';
      
      if (this.password === correctPassword) {
        this.user = this.tempUser;
        this.errorMessage = '';
        this.$router.push('/dashboard');
      } else {
        this.errorMessage = 'Incorrect password';
        this.password = '';
      }
    },

    async cancelLogin() {
      try {
        await signOut(auth);
        this.user = null;
        this.tempUser = null;
        this.showPasswordInput = false;
        this.password = '';
        this.errorMessage = '';
      } catch (error) {
        console.error('Logout error:', error);
      }
    },

    async logout() {
      try {
        await signOut(auth);
        this.user = null;
        this.tempUser = null;
        this.showPasswordInput = false;
        this.password = '';
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
    onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        this.user = firebaseUser;
        this.$router.push('/dashboard');
      } else {
        this.user = null;
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

.password-input-container {
  margin-top: 20px;
}

.password-input {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1em;
  margin-bottom: 15px;
}

.password-buttons {
  display: flex;
  gap: 10px;
}

.validate-button {
  background-color: #4285f4;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 4px;
  font-size: 1em;
  cursor: pointer;
  flex: 1;
  transition: background-color 0.3s;
}

.validate-button:hover {
  background-color: #357abd;
}

.back-button {
  background-color: #95a5a6;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 4px;
  font-size: 1em;
  cursor: pointer;
  flex: 1;
  transition: background-color 0.3s;
}

.back-button:hover {
  background-color: #7f8c8d;
}

.error-message {
  color: #e74c3c;
  margin-top: 10px;
  font-size: 0.9em;
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