import App from './App'

// #ifndef VUE3
import Vue from 'vue'
Vue.config.productionTip = false
App.mpType = 'app'
const app = new Vue({
  ...App
})
app.$mount()
// #endif

// #ifdef VUE3
import { createSSRApp } from 'vue'
export function createApp() {
  const app = createSSRApp(App)
  
  // 全局属性挂载
  app.config.globalProperties.$showToast = (title, icon = 'none') => {
    uni.showToast({ title, icon, duration: 2000 })
  }
  
  app.config.globalProperties.$showLoading = (title = '加载中...') => {
    uni.showLoading({ title, mask: true })
  }
  
  app.config.globalProperties.$hideLoading = () => {
    uni.hideLoading()
  }
  
  return {
    app
  }
}
// #endif