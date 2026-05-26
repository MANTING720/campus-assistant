<template>
  <view class="container">
    <!-- 搜索栏 -->
    <view class="search-bar">
      <uni-search-bar 
        v-model="searchKeyword"
        placeholder="搜索通知"
        @confirm="searchNotice"
        @cancel="clearSearch"
        :focus="false"
        bgColor="#f5f5f5"
        radius="100"
      />
    </view>

    <!-- 分类标签 -->
    <scroll-view class="category-scroll" scroll-x>
      <view class="category-list">
        <view 
          v-for="(cat, index) in categories" 
          :key="index"
          class="category-item"
          :class="{ active: currentCategory === cat.value }"
          @click="switchCategory(cat.value)"
        >
          <text>{{ cat.name }}</text>
        </view>
      </view>
    </scroll-view>

    <!-- 通知列表 -->
    <scroll-view class="notice-list" scroll-y @scrolltolower="loadMore">
      <view v-if="displayNotices.length > 0">
        <view 
          v-for="notice in displayNotices" 
          :key="notice.id"
          class="notice-card"
          @click="goToDetail(notice)"
        >
          <view class="notice-header">
            <view class="notice-type" :style="{ backgroundColor: getTypeColor(notice.type) }">
              {{ notice.type }}
            </view>
            <text class="notice-time">{{ formatTime(notice.publishTime) }}</text>
          </view>
          <text class="notice-title">{{ notice.title }}</text>
          <text class="notice-summary">{{ notice.summary }}</text>
          <view class="notice-footer">
            <view class="footer-stats">
              <uni-icons type="eye" size="14" color="#999"></uni-icons>
              <text>{{ notice.views || 0 }}</text>
              <uni-icons type="chat" size="14" color="#999" style="margin-left: 20rpx;"></uni-icons>
              <text>{{ notice.comments || 0 }}</text>
            </view>
            <view class="footer-more">
              <text>查看详情</text>
              <uni-icons type="right" size="14" color="#4A90E2"></uni-icons>
            </view>
          </view>
        </view>
      </view>
      <view v-else class="empty-state">
        <image src="/static/empty-notice.png" mode="aspectFit" class="empty-img"></image>
        <text class="empty-text">暂无通知</text>
        <text class="empty-hint">下拉刷新试试</text>
      </view>
      
      <!-- 加载更多 -->
      <view v-if="hasMore && displayNotices.length > 0" class="load-more">
        <uni-load-more :status="loadingStatus"></uni-load-more>
      </view>
    </scroll-view>
  </view>
</template>

<script>
import { mockNotices } from '@/mock/data'

export default {
  data() {
    return {
      categories: [
        { name: '全部', value: 'all' },
        { name: '教务通知', value: '教务通知' },
        { name: '校园活动', value: '校园活动' },
        { name: '就业信息', value: '就业信息' },
        { name: '讲座信息', value: '讲座信息' },
        { name: '其他', value: '其他' }
      ],
      currentCategory: 'all',
      searchKeyword: '',
      allNotices: [],
      currentPage: 1,
      pageSize: 10,
      hasMore: true,
      loadingStatus: 'more'
    }
  },
  computed: {
    filteredNotices() {
      let result = [...this.allNotices]
      
      // 分类筛选
      if (this.currentCategory !== 'all') {
        result = result.filter(n => n.type === this.currentCategory)
      }
      
      // 关键词搜索
      if (this.searchKeyword.trim()) {
        const keyword = this.searchKeyword.trim().toLowerCase()
        result = result.filter(n => 
          n.title.toLowerCase().includes(keyword) || 
          n.summary.toLowerCase().includes(keyword)
        )
      }
      
      return result
    },
    displayNotices() {
      return this.filteredNotices.slice(0, this.currentPage * this.pageSize)
    }
  },
  onLoad() {
    this.loadNotices()
  },
  onPullDownRefresh() {
    this.loadNotices(true)
  },
  methods: {
    loadNotices(refresh = false) {
      if (refresh) {
        this.currentPage = 1
        this.hasMore = true
      }
      
      // 使用模拟数据
      if (this.allNotices.length === 0 || refresh) {
        this.allNotices = JSON.parse(JSON.stringify(mockNotices))
        setTimeout(() => {
          uni.stopPullDownRefresh()
          uni.showToast({ title: '刷新成功', icon: 'success' })
        }, 500)
      }
    },
    loadMore() {
      if (this.hasMore && this.displayNotices.length < this.filteredNotices.length) {
        this.currentPage++
        this.loadingStatus = 'loading'
        setTimeout(() => {
          this.loadingStatus = 'more'
        }, 500)
      } else {
        this.loadingStatus = 'noMore'
      }
    },
    switchCategory(category) {
      this.currentCategory = category
      this.currentPage = 1
    },
    searchNotice() {
      this.currentPage = 1
      if (!this.searchKeyword.trim()) {
        this.$showToast('请输入搜索关键词')
      }
    },
    clearSearch() {
      this.searchKeyword = ''
      this.currentPage = 1
    },
    goToDetail(notice) {
      uni.navigateTo({
        url: `/pages/notice/detail?id=${notice.id}`
      })
    },
    getTypeColor(type) {
      const colors = {
        '教务通知': '#4A90E2',
        '校园活动': '#52C41A',
        '就业信息': '#FA8C16',
        '讲座信息': '#722ED1',
        '其他': '#999'
      }
      return colors[type] || '#999'
    },
    formatTime(timestamp) {
      const date = new Date(timestamp)
      const now = new Date()
      const diff = now - date
      
      if (diff < 3600000) {
        return `${Math.floor(diff / 60000)}分钟前`
      } else if (diff < 86400000) {
        return `${Math.floor(diff / 3600000)}小时前`
      } else if (diff < 604800000) {
        return `${Math.floor(diff / 86400000)}天前`
      } else {
        return `${date.getMonth() + 1}/${date.getDate()}`
      }
    }
  }
}
</script>

<style scoped>
.container {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.search-bar {
  background-color: #fff;
  padding: 20rpx 30rpx;
}

.category-scroll {
  background-color: #fff;
  white-space: nowrap;
  border-bottom: 1rpx solid #f0f0f0;
}

.category-list {
  display: inline-flex;
  padding: 0 30rpx;
}

.category-item {
  display: inline-block;
  padding: 20rpx 30rpx;
  font-size: 28rpx;
  color: #666;
  position: relative;
}

.category-item.active {
  color: #4A90E2;
  font-weight: bold;
}

.category-item.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 30rpx;
  right: 30rpx;
  height: 4rpx;
  background-color: #4A90E2;
  border-radius: 2rpx;
}

.notice-list {
  padding: 20rpx 0;
  height: calc(100vh - 220rpx);
}

.notice-card {
  background-color: #fff;
  border-radius: 20rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
  transition: all 0.3s;
}

.notice-card:active {
  transform: scale(0.98);
}

.notice-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.notice-type {
  font-size: 22rpx;
  padding: 6rpx 16rpx;
  border-radius: 20rpx;
  color: #fff;
}

.notice-time {
  font-size: 22rpx;
  color: #999;
}

.notice-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 16rpx;
  line-height: 1.4;
}

.notice-summary {
  font-size: 26rpx;
  color: #666;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin-bottom: 20rpx;
}

.notice-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.footer-stats {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.footer-stats text {
  font-size: 22rpx;
  color: #999;
}

.footer-more {
  display: flex;
  align-items: center;
  gap: 4rpx;
}

.footer-more text {
  font-size: 24rpx;
  color: #4A90E2;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 120rpx 40rpx;
}

.empty-img {
  width: 240rpx;
  height: 240rpx;
  margin-bottom: 30rpx;
  opacity: 0.6;
}

.empty-text {
  font-size: 32rpx;
  color: #999;
  margin-bottom: 12rpx;
}

.empty-hint {
  font-size: 26rpx;
  color: #ccc;
}

.load-more {
  padding: 20rpx;
}
</style>