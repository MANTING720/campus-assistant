<script>
import { ref } from 'vue'
import Storage from '@/utils/storage'

export default {
  setup() {
    console.log('App Launch')
    
    // 检查登录状态
    const checkLoginStatus = () => {
      const userInfo = uni.getStorageSync('userInfo')
      if (!userInfo) {
        autoLogin()
      }
    }
    
    const autoLogin = () => {
      // #ifdef MP-WEIXIN
      uni.login({
        success: (res) => {
          if (res.code) {
            console.log('登录成功', res.code)
            const mockUserInfo = {
              nickName: '校园用户',
              avatarUrl: '/static/default-avatar.png',
              loginTime: Date.now()
            }
            uni.setStorageSync('userInfo', mockUserInfo)
          }
        },
        fail: (err) => {
          console.log('登录失败，使用模拟用户', err)
          const mockUserInfo = {
            nickName: '测试用户',
            avatarUrl: '/static/default-avatar.png',
            loginTime: Date.now()
          }
          uni.setStorageSync('userInfo', mockUserInfo)
        }
      })
      // #endif
      
      // #ifndef MP-WEIXIN
      const mockUserInfo = {
        nickName: '校园用户',
        avatarUrl: '/static/default-avatar.png',
        loginTime: Date.now()
      }
      uni.setStorageSync('userInfo', mockUserInfo)
      // #endif
    }
    
    checkLoginStatus()
    
    // 生命周期钩子
    const onLaunch = () => {
      console.log('App Launch')
    }
    
    const onShow = () => {
      console.log('App Show')
    }
    
    const onHide = () => {
      console.log('App Hide')
    }
    
    return {
      onLaunch,
      onShow,
      onHide
    }
  }
}
</script>

<style>
/* 全局样式 */
page {
  background-color: #F5F5F5;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif;
}

.container {
  padding: 20rpx;
}

/* 通用卡片样式 */
.card {
  background-color: #fff;
  border-radius: 20rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

/* 通用按钮样式 */
.btn-primary {
  background: linear-gradient(135deg, #4A90E2, #357ABD);
  color: #fff;
  border-radius: 50rpx;
  padding: 20rpx 40rpx;
  text-align: center;
  font-size: 28rpx;
}

/* 通用标题样式 */
.section-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 20rpx;
  padding-left: 20rpx;
  border-left: 8rpx solid #4A90E2;
}
</style>