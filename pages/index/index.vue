<template>
  <view class="container">
    <!-- 头部用户信息 -->
    <view class="header">
      <view class="user-info" @click="goToProfile">
        <image class="avatar" :src="userInfo.avatarUrl || '/static/default-avatar.png'" mode="aspectFill"></image>
        <view class="user-text">
          <text class="nickname">{{ userInfo.nickName || '校园用户' }}</text>
          <text class="greeting">{{ greeting }}</text>
        </view>
      </view>
      <view class="settings" @click="goToSettings">
        <uni-icons type="settings" size="22" color="#fff"></uni-icons>
      </view>
    </view>

    <!-- 天气卡片 -->
    <view class="weather-card" @click="refreshWeather">
      <view class="weather-header">
        <view class="location">
          <uni-icons type="location" size="18" color="#fff"></uni-icons>
          <text>{{ weather.location || '获取中...' }}</text>
        </view>
        <text class="refresh-hint">点击刷新</text>
      </view>
      <view class="weather-content" v-if="weather.now">
        <view class="temp-section">
          <text class="temperature">{{ weather.now.temp }}°</text>
          <view class="weather-info">
            <text class="weather-text">{{ weather.now.text }}</text>
            <text class="temp-range">体感温度 {{ weather.now.feelsLike }}°</text>
          </view>
        </view>
        <view class="weather-detail">
          <view class="detail-item">
            <uni-icons type="wind" size="20" color="#fff"></uni-icons>
            <text>{{ weather.now.windDir }} {{ weather.now.windScale }}级</text>
          </view>
          <view class="detail-item">
            <uni-icons type="rain" size="20" color="#fff"></uni-icons>
            <text>湿度 {{ weather.now.humidity }}%</text>
          </view>
        </view>
      </view>
      <view class="weather-loading" v-else>
        <uni-load-more status="loading" :content-text="{ contentdown: '加载中...' }"></uni-load-more>
      </view>
    </view>

    <!-- 快捷入口 -->
    <view class="quick-actions">
      <view class="action-item" v-for="item in actions" :key="item.path" @click="navigateTo(item.path)">
        <view class="action-icon" :style="{ backgroundColor: item.color }">
          <uni-icons :type="item.icon" size="32" color="#fff"></uni-icons>
        </view>
        <text class="action-text">{{ item.name }}</text>
      </view>
    </view>

    <!-- 课程提醒 -->
    <view class="card course-reminder" v-if="nextCourse">
      <view class="reminder-header">
        <uni-icons type="calendar" size="20" color="#4A90E2"></uni-icons>
        <text class="reminder-title">下一节课</text>
      </view>
      <view class="course-info">
        <text class="course-name">{{ nextCourse.name }}</text>
        <text class="course-time">{{ nextCourse.time }} · {{ nextCourse.room }}</text>
      </view>
      <view class="course-progress" v-if="nextCourse.progress">
        <view class="progress-bar" :style="{ width: nextCourse.progress + '%' }"></view>
        <text class="progress-text">{{ nextCourse.progressText }}</text>
      </view>
    </view>

    <!-- 待办提醒 -->
    <view class="card todo-preview" @click="goToTodo">
      <view class="todo-header">
        <view class="header-left">
          <uni-icons type="checkbox" size="20" color="#4A90E2"></uni-icons>
          <text class="todo-title">今日待办</text>
        </view>
        <text class="todo-count">{{ todayTodos.length }}项未完成</text>
      </view>
      <view class="todo-list" v-if="todayTodos.length > 0">
        <view class="todo-item" v-for="todo in todayTodos.slice(0, 3)" :key="todo.id">
          <view class="todo-status" :class="{ completed: todo.completed }"></view>
          <text class="todo-content" :class="{ 'completed-text': todo.completed }">{{ todo.content }}</text>
        </view>
      </view>
      <view class="empty-todo" v-else>
        <text>今日暂无待办，放松一下吧~</text>
      </view>
    </view>

    <!-- 最新通知 -->
    <view class="card notice-preview" @click="goToNotice">
      <view class="notice-header">
        <view class="header-left">
          <uni-icons type="notification" size="20" color="#4A90E2"></uni-icons>
          <text class="notice-title">最新通知</text>
        </view>
        <text class="more">查看更多 &gt;</text>
      </view>
      <view class="notice-list">
        <view class="notice-item" v-for="notice in latestNotices" :key="notice.id">
          <view class="notice-dot"></view>
          <text class="notice-content">{{ notice.title }}</text>
          <text class="notice-time">{{ notice.time }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { ref, reactive, onMounted } from 'vue'
import { onShow } from '@dcloudio/uni-app'  
import Storage from '@/utils/storage'
import { weatherAPI, getCityId } from '@/utils/request'
import { mockSchedule, mockNotices } from '@/mock/data'

export default {
  setup() {
    // 响应式数据
    const userInfo = ref({})
    const greeting = ref('')
    const weather = reactive({
      location: '加载中...',
      now: null
    })
    const nextCourse = ref(null)
    const todayTodos = ref([])
    const latestNotices = ref([])
    
    const actions = [
      { name: '课表查询', icon: 'calendar', path: '/pages/schedule/schedule', color: '#4A90E2' },
      { name: '待办事项', icon: 'checkbox', path: '/pages/todo/todo', color: '#52C41A' },
      { name: '校园通知', icon: 'notification', path: '/pages/notice/notice', color: '#FA8C16' },
      { name: '个人中心', icon: 'person', path: '/pages/profile/profile', color: '#722ED1' }
    ]
    
    // 方法
    const setGreeting = () => {
      const hour = new Date().getHours()
      if (hour < 12) {
        greeting.value = '早上好'
      } else if (hour < 18) {
        greeting.value = '下午好'
      } else {
        greeting.value = '晚上好'
      }
    }
    
    const loadUserInfo = () => {
      userInfo.value = Storage.getUserInfo() || {
        nickName: '校园用户',
        avatarUrl: '/static/default-avatar.png'
      }
    }
    
    const loadTodos = () => {
      const allTodos = Storage.getTodos()
      const today = new Date().toDateString()
      todayTodos.value = allTodos.filter(todo => {
        if (todo.completed) return false
        if (!todo.deadline) return true
        return new Date(todo.deadline).toDateString() === today
      })
    }
    
    const loadNotices = () => {
      latestNotices.value = mockNotices.slice(0, 3)
    }
    
    const findNextCourse = (schedule, hour, minute) => {
      if (!schedule || schedule.length === 0) return null
      
      const currentTime = hour * 60 + minute
      let next = null
      let minTimeDiff = Infinity
      
      for (const course of schedule) {
        const [startHour, startMinute] = course.startTime.split(':')
        const startTime = parseInt(startHour) * 60 + parseInt(startMinute)
        
        if (startTime > currentTime) {
          const diff = startTime - currentTime
          if (diff < minTimeDiff) {
            minTimeDiff = diff
            next = { ...course }
          }
        }
      }
      
      if (next) {
        const [startHour, startMinute] = next.startTime.split(':')
        const [endHour, endMinute] = next.endTime.split(':')
        const startTime = parseInt(startHour) * 60 + parseInt(startMinute)
        const endTime = parseInt(endHour) * 60 + parseInt(endMinute)
        const currentTime = hour * 60 + minute
        
        if (currentTime >= startTime && currentTime <= endTime) {
          const progress = ((currentTime - startTime) / (endTime - startTime)) * 100
          next.progress = Math.min(100, Math.max(0, progress))
          next.progressText = '上课中'
        } else if (currentTime < startTime) {
          const remainingMinutes = startTime - currentTime
          if (remainingMinutes < 60) {
            next.progressText = `${remainingMinutes}分钟后开始`
          } else {
            next.progressText = `还有${Math.floor(remainingMinutes / 60)}小时${remainingMinutes % 60}分钟`
          }
        }
      }
      
      return next
    }
    
    const loadScheduleReminder = () => {
      const schedule = Storage.getSchedule()
      const now = new Date()
      const currentDay = now.getDay()
      const currentHour = now.getHours()
      const currentMinute = now.getMinutes()
      
      let todaySchedule
      if (!schedule) {
        todaySchedule = mockSchedule.filter(item => item.day === currentDay)
      } else {
        todaySchedule = schedule.filter(item => item.day === currentDay)
      }
      nextCourse.value = findNextCourse(todaySchedule, currentHour, currentMinute)
    }
    
    const useMockWeather = () => {
      weather.location = '杭州电子科技大学'
      weather.now = {
        temp: '22',
        text: '多云',
        feelsLike: '21',
        windDir: '东北风',
        windScale: '2',
        humidity: '65'
      }
    }
    
    const getWeather = () => {
      const cached = Storage.getWeatherCache()
      if (cached) {
        Object.assign(weather, cached)
        return
      }
      
      uni.getLocation({
        type: 'gcj02',
        success: async (res) => {
          try {
            const cityRes = await getCityId(res.longitude, res.latitude)
            if (cityRes.code === '200' && cityRes.location && cityRes.location[0]) {
              const locationId = cityRes.location[0].id
              weather.location = cityRes.location[0].name
              
              const weatherRes = await weatherAPI.getNowWeather(locationId)
              if (weatherRes.code === '200') {
                weather.now = {
                  temp: weatherRes.now.temp,
                  text: weatherRes.now.text,
                  feelsLike: weatherRes.now.feelsLike,
                  windDir: weatherRes.now.windDir,
                  windScale: weatherRes.now.windScale,
                  humidity: weatherRes.now.humidity,
                  icon: weatherRes.now.icon
                }
                Storage.saveWeather(weather)
              }
            }
          } catch (err) {
            console.error('获取天气失败', err)
            useMockWeather()
          }
        },
        fail: (err) => {
          console.error('获取位置失败', err)
          useMockWeather()
          if (err.errMsg && err.errMsg.includes('auth deny')) {
            uni.showModal({
              title: '位置授权',
              content: '需要获取您的位置信息以提供准确的天气服务，请在设置中开启位置权限',
              confirmText: '去设置',
              success: (res) => {
                if (res.confirm) {
                  uni.openSetting()
                }
              }
            })
          }
        }
      })
    }
    
    const refreshWeather = () => {
      uni.showLoading({ title: '刷新中...' })
      Storage.saveWeather(null)
      getWeather()
      setTimeout(() => {
        uni.hideLoading()
        uni.showToast({ title: '刷新成功', icon: 'success' })
      }, 1000)
    }
    
    const navigateTo = (path) => {
      const tabBarPaths = ['/pages/schedule/schedule', '/pages/todo/todo', '/pages/notice/notice', '/pages/profile/profile']
      if (tabBarPaths.includes(path)) {
        uni.switchTab({ url: path })
      } else {
        uni.navigateTo({ url: path })
      }
    }
    
    const goToProfile = () => {
      uni.switchTab({ url: '/pages/profile/profile' })
    }
    
    const goToTodo = () => {
      uni.switchTab({ url: '/pages/todo/todo' })
    }
    
    const goToNotice = () => {
      uni.switchTab({ url: '/pages/notice/notice' })
    }
    
    const goToSettings = () => {
      uni.showModal({
        title: '提示',
        content: '设置功能开发中...',
        showCancel: false
      })
    }
    
    const init = () => {
      setGreeting()
      loadUserInfo()
      loadTodos()
      loadNotices()
      loadScheduleReminder()
      getWeather()
    }
    
    // 生命周期
    onMounted(() => {
      init()
    })
    
    onShow(() => {
      loadUserInfo()
      loadTodos()
    })
    
    return {
      userInfo,
      greeting,
      weather,
      actions,
      nextCourse,
      todayTodos,
      latestNotices,
      navigateTo,
      goToProfile,
      goToTodo,
      goToNotice,
      goToSettings,
      refreshWeather
    }
  }
}
</script>

<style scoped>
/* 样式保持不变，和之前一样 */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx 20rpx 20rpx;
  background: linear-gradient(135deg, #4A90E2, #357ABD);
  margin: -20rpx -20rpx 0 -20rpx;
  padding-top: calc(env(safe-area-inset-top) + 30rpx);
}

.user-info {
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.avatar {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  border: 4rpx solid rgba(255, 255, 255, 0.3);
}

.user-text {
  display: flex;
  flex-direction: column;
  color: #fff;
}

.nickname {
  font-size: 32rpx;
  font-weight: bold;
}

.greeting {
  font-size: 24rpx;
  opacity: 0.9;
}

.settings {
  padding: 10rpx;
}

.weather-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 24rpx;
  margin: 20rpx;
  padding: 30rpx;
  color: #fff;
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.15);
}

.weather-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30rpx;
}

.location {
  display: flex;
  align-items: center;
  gap: 8rpx;
  font-size: 28rpx;
}

.refresh-hint {
  font-size: 22rpx;
  opacity: 0.8;
}

.weather-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.temp-section {
  display: flex;
  align-items: baseline;
  gap: 16rpx;
}

.temperature {
  font-size: 72rpx;
  font-weight: bold;
}

.weather-info {
  display: flex;
  flex-direction: column;
}

.weather-text {
  font-size: 28rpx;
}

.temp-range {
  font-size: 22rpx;
  opacity: 0.8;
}

.weather-detail {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 8rpx;
  font-size: 24rpx;
  opacity: 0.9;
}

.quick-actions {
  display: flex;
  justify-content: space-around;
  background: #fff;
  margin: 20rpx;
  padding: 20rpx;
  border-radius: 24rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.action-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12rpx;
}

.action-icon {
  width: 96rpx;
  height: 96rpx;
  border-radius: 48rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
}

.action-text {
  font-size: 24rpx;
  color: #666;
}

.course-reminder {
  margin: 20rpx;
}

.reminder-header {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-bottom: 20rpx;
}

.reminder-title {
  font-size: 30rpx;
  font-weight: bold;
  color: #333;
}

.course-info {
  margin-bottom: 16rpx;
}

.course-name {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 8rpx;
}

.course-time {
  font-size: 26rpx;
  color: #999;
}

.course-progress {
  background: #f0f0f0;
  border-radius: 20rpx;
  height: 40rpx;
  position: relative;
  overflow: hidden;
}

.progress-bar {
  background: linear-gradient(90deg, #4A90E2, #52C41A);
  height: 100%;
  border-radius: 20rpx;
  transition: width 0.3s;
}

.progress-text {
  position: absolute;
  right: 16rpx;
  top: 50%;
  transform: translateY(-50%);
  font-size: 22rpx;
  color: #fff;
  font-weight: bold;
}

.todo-preview, .notice-preview {
  margin: 20rpx;
}

.todo-header, .notice-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.todo-title, .notice-title {
  font-size: 30rpx;
  font-weight: bold;
  color: #333;
}

.todo-count {
  font-size: 24rpx;
  color: #FA8C16;
}

.more {
  font-size: 24rpx;
  color: #999;
}

.todo-list, .notice-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.todo-item, .notice-item {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.todo-status {
  width: 32rpx;
  height: 32rpx;
  border-radius: 50%;
  border: 2rpx solid #ddd;
}

.todo-status.completed {
  background-color: #52C41A;
  border-color: #52C41A;
}

.todo-content {
  flex: 1;
  font-size: 28rpx;
  color: #333;
}

.todo-content.completed-text {
  text-decoration: line-through;
  color: #999;
}

.notice-dot {
  width: 12rpx;
  height: 12rpx;
  border-radius: 50%;
  background-color: #FA8C16;
}

.notice-content {
  flex: 1;
  font-size: 28rpx;
  color: #333;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.notice-time {
  font-size: 22rpx;
  color: #999;
}

.empty-todo {
  text-align: center;
  padding: 40rpx;
  color: #999;
  font-size: 26rpx;
}
</style>