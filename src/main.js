import { createApp } from 'vue'
import App from './App.vue'
import './registerServiceWorker'
import router from './router'
import { app as firebaseApp, VueFire } from './firebase'

const app = createApp(App)
app.use(router)
app.use(VueFire, {
  firebaseApp,
  modules: [
    // Add any additional Firebase modules here if needed
  ]
})
app.mount('#app')
