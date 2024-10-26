import Vue from 'vue';
import App from './App.vue';
import { BootstrapVue, IconsPlugin } from 'bootstrap-vue';
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap-vue/dist/bootstrap-vue.css';
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDhuCel3EeZlv1rYhNCFDyyv82U4JyCAUM",
  authDomain: "contacts-onlineapp.firebaseapp.com",
  projectId: "contacts-onlineapp",
  storageBucket: "contacts-onlineapp.appspot.com",
  messagingSenderId: "175220686401",
  appId: "1:175220686401:web:357fb17e181a5aa4f610c0",
  measurementId: "G-2WD718Z8RK"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Use BootstrapVue and IconsPlugin
Vue.use(BootstrapVue);
Vue.use(IconsPlugin);

Vue.config.productionTip = false;

// Create a new Vue instance
new Vue({
  render: h => h(App),
  provide: {
    db // Provide Firestore instance to the Vue app
  }
}).$mount('#app');
