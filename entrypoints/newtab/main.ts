
import 'primeicons/primeicons.css'
import 'primeicons/primeicons.css'
import './style/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import PrimeVue from 'primevue/config';
import Aura from '@primeuix/themes/aura';
import ToastService from 'primevue/toastservice';

import App from './App.vue'
import router from './router'

const app = createApp(App)
app.use(PrimeVue, {
    theme: {
        preset: Aura
    }
});
app.use(ToastService);
app.use(createPinia())
app.use(router)

app.mount('#app')
