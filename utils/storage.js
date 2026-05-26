// 本地存储工具类
class Storage {
  // 存储待办事项
  static saveTodos(todos) {
    uni.setStorageSync('todos', todos)
  }
  
  static getTodos() {
    const todos = uni.getStorageSync('todos')
    return todos ? todos : []
  }
  
  // 存储缓存天气数据
  static saveWeather(weather) {
    uni.setStorageSync('weatherCache', {
      data: weather,
      timestamp: Date.now()
    })
  }
  
  static getWeatherCache() {
    const cache = uni.getStorageSync('weatherCache')
    if (cache && (Date.now() - cache.timestamp) < 30 * 60 * 1000) { // 30分钟缓存
      return cache.data
    }
    return null
  }
  
  // 存储课表
  static saveSchedule(schedule) {
    uni.setStorageSync('schedule', schedule)
  }
  
  static getSchedule() {
    const schedule = uni.getStorageSync('schedule')
    return schedule ? schedule : null
  }
  
  // 用户信息
  static saveUserInfo(userInfo) {
    uni.setStorageSync('userInfo', userInfo)
  }
  
  static getUserInfo() {
    return uni.getStorageSync('userInfo')
  }
}

export default Storage