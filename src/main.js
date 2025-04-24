import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

// 完整引入Element Plus
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
// 导入Element Plus的中文语言包
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'

const app = createApp(App)

app.use(router)
app.use(ElementPlus, {
  locale: zhCn, // 设置语言为中文
})

app.mount('#app')
