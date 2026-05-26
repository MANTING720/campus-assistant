<template>
  <view class="container">
    <!-- 用户信息卡片 -->
    <view class="user-card">
      <image class="avatar" :src="userInfo.avatarUrl || '/static/default-avatar.png'" mode="aspectFill"></image>
      <view class="user-info">
        <text class="nickname">{{ userInfo.nickName || '校园用户' }}</text>
        <text class="user-id">ID: {{ userId }}</text>
      </view>
      <button class="edit-btn" @click="editProfile" size="mini">编辑</button>
    </view>

    <!-- 统计数据 -->
    <view class="stats-card">
      <view class="stat-item" @click="goToTodo">
        <text class="stat-number">{{ todoCount }}</text>
        <text class="stat-label">待办事项</text>
      </view>
      <view class="stat-divider"></view>
      <view class="stat-item">
        <text class="stat-number">{{ completedCount }}</text>
        <text class="stat-label">已完成</text>
      </view>
      <view class="stat-divider"></view>
      <view class="stat-item">
        <text class="stat-number">{{ loginDays }}</text>
        <text class="stat-label">累计登录</text>
      </view>
    </view>

    <!-- 功能菜单 -->
    <view class="menu-list">
      <view class="menu-item" @click="navigateTo('/pages/schedule/schedule')">
        <view class="menu-left">
          <uni-icons type="calendar" size="22" color="#4A90E2"></uni-icons>
          <text>我的课表</text>
        </view>
        <uni-icons type="right" size="18" color="#ccc"></uni-icons>
      </view>
      <view class="menu-item" @click="navigateTo('/pages/todo/todo')">
        <view class="menu-left">
          <uni-icons type="checkbox" size="22" color="#52C41A"></uni-icons>
          <text>待办事项</text>
        </view>
        <uni-icons type="right" size="18" color="#ccc"></uni-icons>
      </view>
      <view class="menu-item" @click="clearCache">
        <view class="menu-left">
          <uni-icons type="trash" size="22" color="#FA8C16"></uni-icons>
          <text>清除缓存</text>
        </view>
        <text class="cache-size">{{ cacheSize }}</text>
      </view>
      <view class="menu-item" @click="showAbout">
        <view class="menu-left">
          <uni-icons type="info" size="22" color="#722ED1"></uni-icons>
          <text>关于我们</text>
        </view>
        <uni-icons type="right" size="18" color="#ccc"></uni-icons>
      </view>
    </view>

    <!-- 退出登录 -->
    <button class="logout-btn" @click="logout">退出登录</button>

    <!-- 版本信息 -->
    <text class="version">版本 v1.0.0</text>
  </view>
</template>

<script>
import Storage from '@/utils/storage'

export default {
  data() {
    return {
      userInfo: {},
      userId: '10001',
      todoCount: 0,
      completedCount: 0,
      loginDays: 42,
      cacheSize: '0KB'
    }
  },
  onLoad() {
    this.loadUserInfo()
    this.loadStats()
    this.getCacheSize()
  },
  onShow() {
    this.loadStats()
  },
  methods: {
    loadUserInfo() {
      this.userInfo = Storage.getUserInfo() || {
        nickName: '校园用户',
        avatarUrl: '/static/default-avatar.png'
      }
    },
    loadStats() {
      const todos = Storage.getTodos()
      this.todoCount = todos.filter(t => !t.completed).length
      this.completedCount = todos.filter(t => t.completed).length
    },
    getCacheSize() {
      // 计算缓存大小
      const info = uni.getStorageInfoSync()
      this.cacheSize = (info.currentSize / 1024).toFixed(2) + 'KB'
    },
    editProfile() {
      uni.showModal({
        title: '编辑资料',
        content: '请输入新昵称',
        editable: true,
        placeholderText: this.userInfo.nickName,
        success: (res) => {
          if (res.confirm && res.content) {
            this.userInfo.nickName = res.content
            Storage.saveUserInfo(this.userInfo)
            this.$showToast('修改成功', 'success')
          }
        }
      })
    },
    navigateTo(url) {
      uni.switchTab({ url })
    },
    clearCache() {
      uni.showModal({
        title: '确认清除',
        content: '清除缓存不会影响你的课表和待办数据，确定要清除吗？',
        success: (res) => {
          if (res.confirm) {
            // 保留重要数据
            const schedule = Storage.getSchedule()
            const todos = Storage.getTodos()
            const userInfo = Storage.getUserInfo()
            
            uni.clearStorageSync()
            
            // 恢复重要数据
            if (schedule) Storage.saveSchedule(schedule)
            if (todos) Storage.saveTodos(todos)
            if (userInfo) Storage.saveUserInfo(userInfo)
            
            this.getCacheSize()
            this.$showToast('清除成功', 'success')
          }
        }
      })
    },
    showAbout() {
      uni.showModal({
        title: '关于校园助手',
        content: '校园助手 v1.0.0\n\n一款专为校园生活打造的小程序，提供课表查询、天气查看、待办事项、校园通知等功能。\n\n技术支持：uni-app + Vue',
        showCancel: false
      })
    },
    logout() {
      uni.showModal({
        title: '确认退出',
        content: '确定要退出登录吗？',
        success: (res) => {
          if (res.confirm) {
            uni.clearStorageSync()
            uni.reLaunch({ url: '/pages/index/index' })
          }
        }
      })
    }
  }
}
</script>

<style scoped>
.container {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding-bottom: 40rpx;
}

.user-card {
  background: linear-gradient(135deg, #4A90E2, #357ABD);
  display: flex;
  align-items: center;
  padding: 50rpx 30rpx;
  margin-bottom: 20rpx;
}

.avatar {
  width: 120rpx;
  height: 120rpx;
  border-radius: 50%;
  border: 4rpx solid rgba(255, 255, 255, 0.3);
  margin-right: 24rpx;
}

.user-info {
  flex: 1;
}

.nickname {
  font-size: 36rpx;
  font-weight: bold;
  color: #fff;
  display: block;
  margin-bottom: 8rpx;
}

.user-id {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.8);
}

.edit-btn {
  background-color: rgba(255, 255, 255, 0.2);
  color: #fff;
  border: none;
  border-radius: 30rpx;
}

.stats-card {
  background-color: #fff;
  display: flex;
  margin: 20rpx;
  border-radius: 20rpx;
  padding: 30rpx 0;
}

.stat-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12rpx;
}

.stat-number {
  font-size: 40rpx;
  font-weight: bold;
  color: #4A90E2;
}

.stat-label {
  font-size: 26rpx;
  color: #999;
}

.stat-divider {
  width: 1rpx;
  background-color: #f0f0f0;
}

.menu-list {
  background-color: #fff;
  margin: 20rpx;
  border-radius: 20rpx;
  overflow: hidden;
}

.menu-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.menu-item:last-child {
  border-bottom: none;
}

.menu-left {
  display: flex;
  align-items: center;
  gap: 20rpx;
  font-size: 30rpx;
  color: #333;
}

.cache-size {
  font-size: 26rpx;
  color: #999;
}

.logout-btn {
  background-color: #fff;
  color: #ff4d4f;
  border-radius: 50rpx;
  margin: 40rpx 20rpx;
  font-size: 32rpx;
  border: 1rpx solid #ff4d4f;
}

.version {
  display: block;
  text-align: center;
  font-size: 24rpx;
  color: #ccc;
  margin-top: 40rpx;
}
</style>