<template>
  <view class="container">
    <scroll-view class="detail-scroll" scroll-y v-if="notice">
      <!-- 标题 -->
      <view class="title-section">
        <view class="type-badge" :style="{ backgroundColor: getTypeColor(notice.type) }">
          {{ notice.type }}
        </view>
        <text class="title">{{ notice.title }}</text>
        <view class="meta-info">
          <text class="author">{{ notice.author || '校园助手' }}</text>
          <text class="time">{{ formatFullTime(notice.publishTime) }}</text>
          <text class="views">浏览 {{ notice.views || 0 }}次</text>
        </view>
      </view>

      <!-- 内容 -->
      <view class="content-section">
        <rich-text :nodes="notice.content"></rich-text>
      </view>

      <!-- 附件 -->
      <view class="attachments-section" v-if="notice.attachments && notice.attachments.length">
        <view class="section-title">附件下载</view>
        <view 
          v-for="(file, index) in notice.attachments" 
          :key="index"
          class="attachment-item"
          @click="downloadFile(file)"
        >
          <uni-icons type="download" size="20" color="#4A90E2"></uni-icons>
          <text>{{ file.name }}</text>
          <text class="file-size">{{ file.size }}</text>
        </view>
      </view>

      <!-- 点赞评论 -->
      <view class="action-section">
        <view class="action-btn" @click="handleLike">
          <uni-icons :type="isLiked ? 'heart-filled' : 'heart'" size="28" :color="isLiked ? '#ff4d4f' : '#999'"></uni-icons>
          <text :style="{ color: isLiked ? '#ff4d4f' : '#999' }">{{ likeCount }}</text>
        </view>
        <view class="action-btn" @click="scrollToComment">
          <uni-icons type="chat" size="28" color="#999"></uni-icons>
          <text>{{ comments.length }}</text>
        </view>
        <view class="action-btn" @click="handleShare">
          <uni-icons type="redo" size="28" color="#999"></uni-icons>
          <text>分享</text>
        </view>
      </view>

      <!-- 评论区 -->
      <view class="comments-section">
        <view class="section-title">
          <text>评论</text>
          <text class="comment-count">{{ comments.length }}条评论</text>
        </view>
        
        <!-- 评论输入框 -->
        <view class="comment-input-area">
          <image class="comment-avatar" :src="userInfo.avatarUrl || '/static/default-avatar.png'"></image>
          <view class="comment-input-box">
            <input 
              v-model="commentText" 
              type="text" 
              placeholder="写下你的评论..."
              confirm-type="send"
              @confirm="submitComment"
            />
          </view>
          <button class="comment-submit" @click="submitComment" :disabled="!commentText.trim()">发送</button>
        </view>

        <!-- 评论列表 -->
        <view class="comments-list" v-if="comments.length > 0">
          <view v-for="(comment, index) in comments" :key="index" class="comment-item">
            <image class="comment-avatar" :src="comment.avatar || '/static/default-avatar.png'"></image>
            <view class="comment-content">
              <view class="comment-header">
                <text class="comment-name">{{ comment.nickname }}</text>
                <text class="comment-time">{{ formatTime(comment.time) }}</text>
              </view>
              <text class="comment-text">{{ comment.content }}</text>
              <view class="comment-actions">
                <text @click="replyComment(comment)">回复</text>
                <text v-if="comment.replies && comment.replies.length">{{ comment.replies.length }}条回复</text>
              </view>
              <!-- 回复列表 -->
              <view v-if="comment.showReplies && comment.replies && comment.replies.length" class="replies-list">
                <view v-for="(reply, idx) in comment.replies" :key="idx" class="reply-item">
                  <text class="reply-name">{{ reply.nickname }}:</text>
                  <text class="reply-text">{{ reply.content }}</text>
                </view>
              </view>
            </view>
          </view>
        </view>
        <view v-else class="empty-comment">
          <text>暂无评论，快来抢沙发吧~</text>
        </view>
      </view>
    </scroll-view>

    <view v-else class="loading">
      <uni-load-more status="loading"></uni-load-more>
    </view>
  </view>
</template>

<script>
import { mockNotices } from '@/mock/data'
import Storage from '@/utils/storage'

export default {
  data() {
    return {
      notice: null,
      comments: [],
      userInfo: {},
      commentText: '',
      isLiked: false,
      likeCount: 0
    }
  },
  onLoad(options) {
    const id = parseInt(options.id)
    this.loadNotice(id)
    this.loadComments(id)
    this.userInfo = Storage.getUserInfo() || { nickName: '游客', avatarUrl: '/static/default-avatar.png' }
  },
  methods: {
    loadNotice(id) {
      // 从模拟数据中查找
      const notice = mockNotices.find(n => n.id === id)
      if (notice) {
        this.notice = JSON.parse(JSON.stringify(notice))
        this.likeCount = this.notice.likes || 0
        // 更新浏览量
        this.notice.views = (this.notice.views || 0) + 1
      }
    },
    loadComments(id) {
      const key = `comments_${id}`
      const saved = uni.getStorageSync(key)
      if (saved) {
        this.comments = saved
      } else {
        // 模拟评论数据
        this.comments = [
          {
            id: 1,
            nickname: '热心同学',
            avatar: '/static/default-avatar.png',
            content: '这个通知很有用，感谢分享！',
            time: Date.now() - 3600000,
            replies: [
              { nickname: '校园助手', content: '感谢支持！' }
            ],
            showReplies: false
          }
        ]
        uni.setStorageSync(key, this.comments)
      }
    },
    submitComment() {
      if (!this.commentText.trim()) return
      
      const newComment = {
        id: Date.now(),
        nickname: this.userInfo.nickName || '校园用户',
        avatar: this.userInfo.avatarUrl || '/static/default-avatar.png',
        content: this.commentText.trim(),
        time: Date.now(),
        replies: [],
        showReplies: false
      }
      
      this.comments.unshift(newComment)
      const key = `comments_${this.notice.id}`
      uni.setStorageSync(key, this.comments)
      this.commentText = ''
      this.$showToast('评论成功', 'success')
    },
    replyComment(comment) {
      uni.showModal({
        title: '回复评论',
        content: `回复 ${comment.nickname}`,
        editable: true,
        placeholderText: '请输入回复内容',
        success: (res) => {
          if (res.confirm && res.content) {
            const reply = {
              nickname: this.userInfo.nickName || '校园用户',
              content: res.content
            }
            if (!comment.replies) comment.replies = []
            comment.replies.push(reply)
            const key = `comments_${this.notice.id}`
            uni.setStorageSync(key, this.comments)
            this.$showToast('回复成功', 'success')
          }
        }
      })
    },
    handleLike() {
      this.isLiked = !this.isLiked
      this.likeCount += this.isLiked ? 1 : -1
      this.$showToast(this.isLiked ? '点赞成功' : '取消点赞')
    },
    handleShare() {
      // #ifdef MP-WEIXIN
      uni.showShareMenu({
        withShareTicket: true,
        menus: ['shareAppMessage', 'shareTimeline']
      })
      // #endif
    },
    scrollToComment() {
      uni.pageScrollTo({
        selector: '.comments-section',
        duration: 300
      })
    },
    downloadFile(file) {
      uni.showLoading({ title: '下载中...' })
      setTimeout(() => {
        uni.hideLoading()
        uni.showToast({ title: '下载功能开发中', icon: 'none' })
      }, 1000)
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
    formatFullTime(timestamp) {
      const date = new Date(timestamp)
      return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`
    },
    formatTime(timestamp) {
      const date = new Date(timestamp)
      const now = new Date()
      const diff = now - date
      
      if (diff < 60000) return '刚刚'
      if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`
      if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`
      if (diff < 604800000) return `${Math.floor(diff / 86400000)}天前`
      return `${date.getMonth() + 1}/${date.getDate()}`
    }
  }
}
</script>

<style scoped>
.container {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.detail-scroll {
  padding: 20rpx;
  padding-bottom: 120rpx;
}

.title-section {
  background-color: #fff;
  border-radius: 20rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
}

.type-badge {
  display: inline-block;
  font-size: 24rpx;
  padding: 6rpx 20rpx;
  border-radius: 20rpx;
  color: #fff;
  margin-bottom: 20rpx;
}

.title {
  font-size: 40rpx;
  font-weight: bold;
  color: #333;
  line-height: 1.4;
  display: block;
  margin-bottom: 20rpx;
}

.meta-info {
  display: flex;
  gap: 30rpx;
  font-size: 24rpx;
  color: #999;
}

.content-section {
  background-color: #fff;
  border-radius: 20rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
  font-size: 30rpx;
  line-height: 1.8;
  color: #333;
}

.attachments-section {
  background-color: #fff;
  border-radius: 20rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 20rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.attachment-item {
  display: flex;
  align-items: center;
  gap: 12rpx;
  padding: 16rpx 0;
  border-bottom: 1rpx solid #f0f0f0;
  font-size: 26rpx;
  color: #333;
}

.file-size {
  margin-left: auto;
  font-size: 22rpx;
  color: #999;
}

.action-section {
  background-color: #fff;
  border-radius: 20rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
  display: flex;
  justify-content: space-around;
}

.action-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8rpx;
}

.action-btn text {
  font-size: 24rpx;
  color: #999;
}

.comments-section {
  background-color: #fff;
  border-radius: 20rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
}

.comment-count {
  font-size: 26rpx;
  color: #999;
  font-weight: normal;
}

.comment-input-area {
  display: flex;
  align-items: center;
  gap: 16rpx;
  margin-bottom: 30rpx;
}

.comment-avatar {
  width: 64rpx;
  height: 64rpx;
  border-radius: 50%;
}

.comment-input-box {
  flex: 1;
  background-color: #f5f5f5;
  border-radius: 50rpx;
  padding: 0 20rpx;
  height: 64rpx;
  display: flex;
  align-items: center;
}

.comment-input-box input {
  flex: 1;
  font-size: 28rpx;
}

.comment-submit {
  background-color: #4A90E2;
  color: #fff;
  border-radius: 40rpx;
  font-size: 24rpx;
  padding: 0 20rpx;
  height: 60rpx;
  line-height: 60rpx;
}

.comments-list {
  margin-top: 20rpx;
}

.comment-item {
  display: flex;
  gap: 16rpx;
  margin-bottom: 30rpx;
}

.comment-content {
  flex: 1;
}

.comment-header {
  display: flex;
  align-items: baseline;
  gap: 16rpx
}
</style>