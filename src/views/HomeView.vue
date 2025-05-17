<template>
  <div class="home">
    <img alt="Vue logo" src="../assets/logo.png">
    <HelloWorld msg="Welcome to Your Vue.js App"/>
    <div class="tree-status">
      <h2>Tree 1 Status</h2>
      <p>Current Level: {{ tree1Level }} liters</p>
      <p>Last Updated: {{ tree1LastUpdated }}</p>
      <p>Container Capacity: {{ containerCapacity }} liters</p>
    </div>
  </div>
</template>

<script>
// @ is an alias to /src
import HelloWorld from '@/components/HelloWorld.vue'
import { firestore, collection, query, orderBy, onSnapshot } from '@/firebase';

export default {
  name: 'HomeView',
  components: {
    HelloWorld
  },
  data() {
    return {
      tree1Level: 0,
      tree1LastUpdated: '',
      containerCapacity: 10
    };
  },
  mounted() {
    const q = query(collection(firestore, "sensor"), orderBy("timestamp", "desc"));
    onSnapshot(q, (snapshot) => {
      const latest = snapshot.docs[0]?.data();
      if (latest) {
        this.tree1Level = parseFloat(latest.volume_liters.doubleValue);
        this.tree1LastUpdated = latest.timestamp.stringValue;
      }
    });
  }
}
</script>
