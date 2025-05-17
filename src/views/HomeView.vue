<template>
  <div class="home">
    <img alt="Vue logo" src="../assets/logo.png">
    <HelloWorld msg="Welcome to Your Vue.js App"/>
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
