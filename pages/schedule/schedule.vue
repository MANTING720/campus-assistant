<template>
  <view class="container">
    <!-- 周次选择 -->
    <view class="week-selector">
      <view class="week-nav">
        <view class="nav-btn" @click="prevWeek">
          <uni-icons type="left" size="20" color="#4A90E2"></uni-icons>
        </view>
        <text class="week-text">{{ currentWeek }} 教学周</text>
        <view class="nav-btn" @click="nextWeek">
          <uni-icons type="right" size="20" color="#4A90E2"></uni-icons>
        </view>
      </view>
      <view class="weekdays">
        <view 
          v-for="(day, index) in weekdays" 
          :key="index"
          class="weekday-item"
          :class="{ active: currentDay === index }"
          @click="switchDay(index)"
        >
          <text class="weekday-name">{{ day.name }}</text>
          <text class="weekday-date">{{ day.date }}</text>
        </view>
      </view>
    </view>

    <!-- 课程列表 -->
    <scroll-view class="schedule-list" scroll-y>
      <view v-if="currentSchedule.length > 0">
        <view 
          v-for="(course, index) in currentSchedule" 
          :key="index"
          class="course-card"
          @click="showCourseDetail(course)"
        >
          <view class="course-time-badge">
            <text class="time">{{ course.startTime }}-{{ course.endTime }}</text>
            <text class="section">{{ course.section }}</text>
          </view>
          <view class="course-info">
            <text class="course-name">{{ course.name }}</text>
            <view class="course-detail">
              <text class="room">{{ course.room }}</text>
              <text class="teacher">{{ course.teacher }}</text>
            </view>
          </view>
          <view class="course-week" v-if="course.weeks">
            <text class="week-badge">{{ course.weeks }}</text>
          </view>
        </view>
      </view>
      <view v-else class="empty-state">
        <image src="/static/empty-schedule.png" mode="aspectFit" class="empty-img"></image>
        <text class="empty-text">今天没有课程安排</text>
        <text class="empty-hint">享受你的闲暇时光吧~</text>
      </view>
    </scroll-view>

    <!-- 添加课程按钮 -->
    <view class="add-btn" @click="addCourse">
      <uni-icons type="plusempty" size="28" color="#fff"></uni-icons>
    </view>

    <!-- 课程详情弹窗 -->
    <uni-popup ref="coursePopup" type="bottom">
      <view class="course-detail-popup" v-if="selectedCourse">
        <view class="popup-header" :style="{ backgroundColor: getCourseColor(selectedCourse.name) }">
          <text class="popup-title">{{ selectedCourse.name }}</text>
          <uni-icons type="close" size="24" color="#fff" @click="closePopup"></uni-icons>
        </view>
        <view class="popup-content">
          <view class="info-row">
            <uni-icons type="calendar" size="20" color="#4A90E2"></uni-icons>
            <text>{{ getWeekdayName(selectedCourse.day) }} {{ selectedCourse.startTime }}-{{ selectedCourse.endTime }}</text>
          </view>
          <view class="info-row">
            <uni-icons type="location" size="20" color="#4A90E2"></uni-icons>
            <text>{{ selectedCourse.room }}</text>
          </view>
          <view class="info-row">
            <uni-icons type="person" size="20" color="#4A90E2"></uni-icons>
            <text>{{ selectedCourse.teacher }}</text>
          </view>
          <view class="info-row" v-if="selectedCourse.weeks">
            <uni-icons type="flag" size="20" color="#4A90E2"></uni-icons>
            <text>第{{ selectedCourse.weeks }}周</text>
          </view>
          <view class="action-buttons">
            <button class="btn-edit" @click="editCourse">编辑</button>
            <button class="btn-delete" @click="deleteCourse">删除</button>
          </view>
        </view>
      </view>
    </uni-popup>

    <!-- 添加课程弹窗 -->
    <uni-popup ref="addPopup" type="bottom">
      <view class="add-course-popup">
        <view class="popup-header" style="background-color: #4A90E2;">
          <text class="popup-title">{{ isEdit ? '编辑课程' : '添加课程' }}</text>
          <uni-icons type="close" size="24" color="#fff" @click="closeAddPopup"></uni-icons>
        </view>
        <scroll-view class="popup-scroll" scroll-y>
          <uni-forms :modelValue="formData" ref="form">
            <uni-forms-item label="课程名称" name="name" required>
              <uni-easyinput v-model="formData.name" placeholder="请输入课程名称" />
            </uni-forms-item>
            <uni-forms-item label="任课教师" name="teacher">
              <uni-easyinput v-model="formData.teacher" placeholder="请输入教师姓名" />
            </uni-forms-item>
            <uni-forms-item label="上课地点" name="room" required>
              <uni-easyinput v-model="formData.room" placeholder="请输入教室" />
            </uni-forms-item>
            <uni-forms-item label="上课星期" name="day" required>
              <uni-data-select v-model="formData.day" :localdata="weekOptions" placeholder="请选择星期"></uni-data-select>
            </uni-forms-item>
            <uni-forms-item label="开始时间" name="startTime" required>
              <uni-datetime-picker type="time" v-model="formData.startTime" />
            </uni-forms-item>
            <uni-forms-item label="结束时间" name="endTime" required>
              <uni-datetime-picker type="time" v-model="formData.endTime" />
            </uni-forms-item>
            <uni-forms-item label="上课周数" name="weeks">
              <uni-easyinput v-model="formData.weeks" placeholder="如：1-16周" />
            </uni-forms-item>
          </uni-forms>
          <button class="submit-btn" @click="submitCourse">{{ isEdit ? '保存修改' : '添加课程' }}</button>
        </scroll-view>
      </view>
    </uni-popup>
  </view>
</template>

<script>
import Storage from '@/utils/storage'
import { mockSchedule } from '@/mock/data'

export default {
  data() {
    return {
      weekdays: [],
      currentWeek: 8,
      currentDay: new Date().getDay(),
      schedule: [],
      currentSchedule: [],
      selectedCourse: null,
      isEdit: false,
      formData: {
        id: null,
        name: '',
        teacher: '',
        room: '',
        day: 0,
        startTime: '08:00',
        endTime: '09:35',
        weeks: '1-16周'
      },
      weekOptions: [
        { value: 0, text: '星期日' },
        { value: 1, text: '星期一' },
        { value: 2, text: '星期二' },
        { value: 3, text: '星期三' },
        { value: 4, text: '星期四' },
        { value: 5, text: '星期五' },
        { value: 6, text: '星期六' }
      ]
    }
  },
  onLoad() {
    this.initWeekdays()
    this.loadSchedule()
  },
  onShow() {
    this.loadSchedule()
  },
  methods: {
    initWeekdays() {
      const today = new Date()
      const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
      const weekData = []
      for (let i = 0; i < 7; i++) {
        const date = new Date(today)
        date.setDate(today.getDate() - today.getDay() + i)
        weekData.push({
          name: weekdays[i],
          date: `${date.getMonth() + 1}/${date.getDate()}`
        })
      }
      this.weekdays = weekData
    },
    loadSchedule() {
      const saved = Storage.getSchedule()
      if (saved) {
        this.schedule = saved
      } else {
        // 使用模拟数据
        this.schedule = JSON.parse(JSON.stringify(mockSchedule))
        Storage.saveSchedule(this.schedule)
      }
      this.filterScheduleByDay()
    },
    filterScheduleByDay() {
      this.currentSchedule = this.schedule.filter(item => item.day === this.currentDay)
      // 按时间排序
      this.currentSchedule.sort((a, b) => {
        return a.startTime.localeCompare(b.startTime)
      })
    },
    switchDay(index) {
      this.currentDay = index
      this.filterScheduleByDay()
    },
    prevWeek() {
      if (this.currentWeek > 1) {
        this.currentWeek--
      }
    },
    nextWeek() {
      if (this.currentWeek < 20) {
        this.currentWeek++
      }
    },
    getCourseColor(courseName) {
      const colors = ['#4A90E2', '#52C41A', '#FA8C16', '#722ED1', '#EB2F96', '#13C2C2']
      const index = courseName.length % colors.length
      return colors[index]
    },
    getWeekdayName(day) {
      const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
      return weekdays[day]
    },
    showCourseDetail(course) {
      this.selectedCourse = { ...course }
      this.$refs.coursePopup.open()
    },
    closePopup() {
      this.$refs.coursePopup.close()
      this.selectedCourse = null
    },
    addCourse() {
      this.isEdit = false
      this.formData = {
        id: null,
        name: '',
        teacher: '',
        room: '',
        day: this.currentDay,
        startTime: '08:00',
        endTime: '09:35',
        weeks: '1-16周'
      }
      this.$refs.addPopup.open()
    },
    editCourse() {
      this.closePopup()
      this.isEdit = true
      this.formData = { ...this.selectedCourse }
      this.$refs.addPopup.open()
    },
    deleteCourse() {
      uni.showModal({
        title: '确认删除',
        content: `确定要删除课程"${this.selectedCourse.name}"吗？`,
        success: (res) => {
          if (res.confirm) {
            const index = this.schedule.findIndex(c => c.id === this.selectedCourse.id)
            if (index !== -1) {
              this.schedule.splice(index, 1)
              Storage.saveSchedule(this.schedule)
              this.filterScheduleByDay()
              this.closePopup()
              uni.showToast({ title: '删除成功', icon: 'success' })
            }
          }
        }
      })
    },
    closeAddPopup() {
      this.$refs.addPopup.close()
    },
    submitCourse() {
      if (!this.formData.name || !this.formData.room) {
        uni.showToast({ title: '请填写完整信息', icon: 'none' })
        return
      }
      
      if (this.isEdit) {
        const index = this.schedule.findIndex(c => c.id === this.formData.id)
        if (index !== -1) {
          this.schedule[index] = { ...this.formData }
          Storage.saveSchedule(this.schedule)
          uni.showToast({ title: '修改成功', icon: 'success' })
        }
      } else {
        const newCourse = {
          ...this.formData,
          id: Date.now(),
          section: this.getSectionByTime(this.formData.startTime)
        }
        this.schedule.push(newCourse)
        Storage.saveSchedule(this.schedule)
        uni.showToast({ title: '添加成功', icon: 'success' })
      }
      
      this.filterScheduleByDay()
      this.closeAddPopup()
    },
    getSectionByTime(time) {
      const hour = parseInt(time.split(':')[0])
      if (hour < 10) return '第1-2节'
      if (hour < 12) return '第3-4节'
      if (hour < 14) return '第5-6节'
      if (hour < 16) return '第7-8节'
      return '第9-10节'
    }
  }
}
</script>

<style scoped>
.container {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding-bottom: 120rpx;
}

.week-selector {
  background-color: #fff;
  padding: 20rpx 0;
  position: sticky;
  top: 0;
  z-index: 10;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
}

.week-nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 40rpx 20rpx;
}

.nav-btn {
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f0f0f0;
  border-radius: 50%;
}

.week-text {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.weekdays {
  display: flex;
  justify-content: space-around;
  padding: 0 20rpx;
}

.weekday-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16rpx 0;
  border-radius: 16rpx;
  min-width: 80rpx;
  transition: all 0.3s;
}

.weekday-item.active {
  background-color: #4A90E2;
}

.weekday-item.active .weekday-name,
.weekday-item.active .weekday-date {
  color: #fff;
}

.weekday-name {
  font-size: 28rpx;
  color: #666;
  margin-bottom: 8rpx;
}

.weekday-date {
  font-size: 24rpx;
  color: #999;
}

.schedule-list {
  padding: 20rpx 0;
  height: calc(100vh - 200rpx);
}

.course-card {
  background-color: #fff;
  border-radius: 20rpx;
  padding: 20rpx;
  margin-bottom: 20rpx;
  display: flex;
  align-items: center;
  gap: 20rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.05);
  transition: all 0.3s;
}

.course-card:active {
  transform: scale(0.98);
}

.course-time-badge {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16rpx;
  padding: 16rpx 20rpx;
  min-width: 140rpx;
  text-align: center;
}

.time {
  font-size: 22rpx;
  color: #fff;
  display: block;
  margin-bottom: 6rpx;
}

.section {
  font-size: 20rpx;
  color: rgba(255, 255, 255, 0.8);
}

.course-info {
  flex: 1;
}

.course-name {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 8rpx;
}

.course-detail {
  display: flex;
  gap: 24rpx;
}

.room, .teacher {
  font-size: 24rpx;
  color: #999;
}

.course-week {
  background-color: #f0f0f0;
  border-radius: 20rpx;
  padding: 8rpx 16rpx;
}

.week-badge {
  font-size: 22rpx;
  color: #666;
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

.add-btn {
  position: fixed;
  bottom: 120rpx;
  right: 40rpx;
  width: 100rpx;
  height: 100rpx;
  background: linear-gradient(135deg, #4A90E2, #357ABD);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8rpx 20rpx rgba(74, 144, 226, 0.3);
  z-index: 20;
}

.course-detail-popup, .add-course-popup {
  background-color: #fff;
  border-radius: 40rpx 40rpx 0 0;
  overflow: hidden;
}

.popup-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx;
  color: #fff;
}

.popup-title {
  font-size: 36rpx;
  font-weight: bold;
}

.popup-content {
  padding: 30rpx;
}

.popup-scroll {
  max-height: 70vh;
  padding: 30rpx;
}

.info-row {
  display: flex;
  align-items: center;
  gap: 16rpx;
  padding: 16rpx 0;
  font-size: 30rpx;
  color: #666;
  border-bottom: 1rpx solid #f0f0f0;
}

.action-buttons {
  display: flex;
  gap: 20rpx;
  margin-top: 40rpx;
}

.btn-edit, .btn-delete {
  flex: 1;
  height: 80rpx;
  border-radius: 40rpx;
  font-size: 30rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-edit {
  background-color: #4A90E2;
  color: #fff;
}

.btn-delete {
  background-color: #ff4d4f;
  color: #fff;
}

.submit-btn {
  background: linear-gradient(135deg, #4A90E2, #357ABD);
  color: #fff;
  border-radius: 50rpx;
  height: 80rpx;
  font-size: 32rpx;
  margin-top: 40rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>