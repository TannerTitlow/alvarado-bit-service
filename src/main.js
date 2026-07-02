import './assets/main.css'
import './assets/fonts.css'
import 'cropperjs/dist/cropper.css'

import { ViteSSG } from 'vite-ssg'
import App from './App.vue'
import { routerOptions } from './router'

export const createApp = ViteSSG(App, routerOptions)
