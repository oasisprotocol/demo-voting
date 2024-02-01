import { createPinia } from 'pinia';
import { createApp } from 'vue';

import App from './App.vue';
import './assets/main.css';
import router from './router';

console.log('Web3 Gateway', import.meta.env.VITE_WEB3_GATEWAY);

const app = createApp(App);

app.use(createPinia());
app.use(router);

app.mount('#app');
