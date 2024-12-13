import './assets/main.css'
import './assets/fonts.css'
import 'cropperjs/dist/cropper.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(router)

app.mount('#app')
