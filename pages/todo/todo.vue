<template>
  <view class="container">
    <!-- 统计卡片 -->
    <view class="stats-card">
      <view class="stat-item">
        <text class="stat-number">{{ totalCount }}</text>
        <text class="stat-label">全部</text>
      </view>
      <view class="stat-divider"></view>
      <view class="stat-item">
        <text class="stat-number">{{ pendingCount }}</text>
        <text class="stat-label">未完成</text>
      </view>
      <view class="stat-divider"></view>
      <view class="stat-item">
        <text class="stat-number">{{ completedCount }}</text>
        <text class="stat-label">已完成</text>
      </view>
    </view>

    <!-- 标签切换 -->
    <view class="tabs">
      <view 
        v-for="(tab, index) in tabs" 
        :key="index"
        class="tab-item"
        :class="{ active: activeTab === index }"
        @click="switchTab(index)"
      >
        <text>{{ tab.name }}</text>
        <view class="tab-line" v-if="activeTab === index"></view>
      </view>
    </view>

    <!-- 待办列表 -->
    <scroll-view class="todo-list" scroll-y>
      <view v-if="filteredTodos.length > 0">
        <view 
          v-for="todo in filteredTodos" 
          :key="todo.id"
          class="todo-card"
          :class="{ completed: todo.completed }"
        >
          <view class="todo-checkbox" @click="toggleTodo(todo.id)">
            <view class="checkbox" :class="{ checked: todo.completed }">
              <uni-icons v-if="todo.completed" type="checkmark" size="16" color="#fff"></uni-icons>
            </view>
          </view>
          <view class="todo-content" @click="editTodo(todo)">
            <text class="todo-title" :class="{ 'completed-text': todo.completed }">{{ todo.content }}</text>
            <view class="todo-meta">
              <text class="todo-category" :style="{ backgroundColor: getCategoryColor(todo.category) }">
                {{ todo.category }}
              </text>
              <text class="todo-deadline" v-if="todo.deadline">
                <uni-icons type="calendar" size="14" color="#999"></uni-icons>
                {{ formatDate(todo.deadline) }}
              </text>
              <text class="todo-priority" :class="'priority-' + todo.priority">
                {{ getPriorityText(todo.priority) }}
              </text>
            </view>
          </view>
          <view class="todo-actions">
            <uni-icons type="trash" size="20" color="#ff4d4f" @click="deleteTodo(todo.id)"></uni-icons>
          </view>
        </view>
      </view>
      <view v-else class="empty-state">
        <image src="/static/empty-todo.png" mode="aspectFit" class="empty-img"></image>
        <text class="empty-text">暂无待办事项</text>
        <text class="empty-hint">点击下方按钮添加待办</text>
      </view>
    </scroll-view>

    <!-- 添加按钮 -->
    <view class="add-btn" @click="showAddModal">
      <uni-icons type="plusempty" size="28" color="#fff"></uni-icons>
    </view>

    <!-- 添加/编辑弹窗 -->
    <uni-popup ref="todoPopup" type="bottom">
      <view class="todo-popup">
        <view class="popup-header" style="background-color: #4A90E2;">
          <text class="popup-title">{{ isEdit ? '编辑待办' : '添加待办' }}</text>
          <uni-icons type="close" size="24" color="#fff" @click="closePopup"></uni-icons>
        </view>
        <scroll-view class="popup-scroll" scroll-y>
          <view class="form-group">
            <text class="form-label">待办内容</text>
            <textarea 
              class="form-textarea" 
              v-model="formData.content" 
              placeholder="请输入待办内容"
              maxlength="100"
            ></textarea>
          </view>
          <view class="form-group">
            <text class="form-label">分类</text>
            <view class="category-selector">
              <view 
                v-for="cat in categories" 
                :key="cat"
                class="category-chip"
                :class="{ active: formData.category === cat }"
                @click="formData.category = cat"
              >
                {{ cat }}
              </view>
            </view>
          </view>
          <view class="form-group">
            <text class="form-label">优先级</text>
            <view class="priority-selector">
              <view 
                v-for="p in priorities" 
                :key="p.value"
                class="priority-chip"
                :class="['priority-' + p.value, { active: formData.priority === p.value }]"
                @click="formData.priority = p.value"
              >
                {{ p.label }}
              </view>
            </view>
          </view>
          <view class="form-group">
            <text class="form-label">截止日期</text>
            <uni-datetime-picker 
              v-model="formData.deadline" 
              type="date"
              :clear-icon="false"
            />
          </view>
          <view class="form-group">
            <text class="form-label">备注</text>
            <textarea 
              class="form-textarea" 
              v-model="formData.remark" 
              placeholder="请输入备注（选填）"
              maxlength="200"
            ></textarea>
          </view>
          <button class="submit-btn" @click="submitTodo">{{ isEdit ? '保存修改' : '添加待办' }}</button>
        </scroll-view>
      </view>
    </uni-popup>
  </view>
</template>

<script>
import Storage from '@/utils/storage'

export default {
  data() {
    return {
      todos: [],
      activeTab: 0,
      tabs: [
        { name: '全部', filter: 'all' },
        { name: '未完成', filter: 'pending' },
        { name: '已完成', filter: 'completed' }
      ],
      categories: ['学习', '生活', '工作', '其他'],
      priorities: [
        { value: 1, label: '低' },
        { value: 2, label: '中' },
        { value: 3, label: '高' }
      ],
      isEdit: false,
      formData: {
        id: null,
        content: '',
        category: '学习',
        priority: 2,
        deadline: '',
        remark: '',
        completed: false,
        createdAt: null
      }
    }
  },
  computed: {
    totalCount() {
      return this.todos.length
    },
    pendingCount() {
      return this.todos.filter(t => !t.completed).length
    },
    completedCount() {
      return this.todos.filter(t => t.completed).length
    },
    filteredTodos() {
      if (this.activeTab === 0) return this.todos
      if (this.activeTab === 1) return this.todos.filter(t => !t.completed)
      return this.todos.filter(t => t.completed)
    }
  },
  onLoad() {
    this.loadTodos()
  },
  onShow() {
    this.loadTodos()
  },
  methods: {
    loadTodos() {
      this.todos = Storage.getTodos()
      // 按创建时间倒序排列
      this.todos.sort((a, b) => b.createdAt - a.createdAt)
    },
    saveTodos() {
      Storage.saveTodos(this.todos)
    },
    switchTab(index) {
      this.activeTab = index
    },
    toggleTodo(id) {
      const todo = this.todos.find(t => t.id === id)
      if (todo) {
        todo.completed = !todo.completed
        this.saveTodos()
        this.$showToast(todo.completed ? '已完成' : '已撤销', 'success')
      }
    },
    deleteTodo(id) {
      uni.showModal({
        title: '确认删除',
        content: '确定要删除这个待办事项吗？',
        success: (res) => {
          if (res.confirm) {
            const index = this.todos.findIndex(t => t.id === id)
            if (index !== -1) {
              this.todos.splice(index, 1)
              this.saveTodos()
              this.$showToast('删除成功', 'success')
            }
          }
        }
      })
    },
    showAddModal() {
      this.isEdit = false
      this.formData = {
        id: null,
        content: '',
        category: '学习',
        priority: 2,
        deadline: '',
        remark: '',
        completed: false,
        createdAt: null
      }
      this.$refs.todoPopup.open()
    },
    editTodo(todo) {
      this.isEdit = true
      this.formData = { ...todo }
      this.$refs.todoPopup.open()
    },
    closePopup() {
      this.$refs.todoPopup.close()
    },
    submitTodo() {
      if (!this.formData.content.trim()) {
        this.$showToast('请输入待办内容', 'none')
        return
      }
      
      if (this.isEdit) {
        const index = this.todos.findIndex(t => t.id === this.formData.id)
        if (index !== -1) {
          this.todos[index] = { ...this.formData }
          this.saveTodos()
          this.$showToast('修改成功', 'success')
        }
      } else {
        const newTodo = {
          ...this.formData,
          id: Date.now(),
          createdAt: Date.now(),
          completed: false
        }
        this.todos.unshift(newTodo)
        this.saveTodos()
        this.$showToast('添加成功', 'success')
      }
      
      this.closePopup()
    },
    getCategoryColor(category) {
      const colors = {
        '学习': '#4A90E2',
        '生活': '#52C41A',
        '工作': '#FA8C16',
        '其他': '#722ED1'
      }
      return colors[category] || '#999'
    },
    getPriorityText(priority) {
      const texts = { 1: '低', 2: '中', 3: '高' }
      return texts[priority] || '中'
    },
    formatDate(timestamp) {
      if (!timestamp) return ''
      const date = new Date(timestamp)
      const now = new Date()
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      const targetDate = new Date(date.getFullYear(), date.getMonth(), date.getDate())
      
      const diffDays = Math.floor((targetDate - today) / (1000 * 60 * 60 * 24))
      
      if (diffDays === 0) return '今天'
      if (diffDays === 1) return '明天'
      if (diffDays === -1) return '昨天'
      if (diffDays > 0 && diffDays < 7) return `${diffDays}天后`
      return `${date.getMonth() + 1}/${date.getDate()}`
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

/* 统计卡片 */
.stats-card {
  display: flex;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  margin: 20rpx;
  border-radius: 24rpx;
  padding: 40rpx 20rpx;
  justify-content: space-around;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
}

.stat-number {
  font-size: 48rpx;
  font-weight: bold;
  color: #fff;
  margin-bottom: 8rpx;
}

.stat-label {
  font-size: 26rpx;
  color: rgba(255, 255, 255, 0.8);
}

.stat-divider {
  width: 1rpx;
  height: 60rpx;
  background-color: rgba(255, 255, 255, 0.3);
}

/* 标签切换 */
.tabs {
  display: flex;
  background-color: #fff;
  padding: 0 40rpx;
  margin: 0 20rpx;
  border-radius: 20rpx;
}

.tab-item {
  flex: 1;
  text-align: center;
  padding: 24rpx 0;
  position: relative;
}

.tab-item text {
  font-size: 28rpx;
  color: #999;
  transition: color 0.3s;
}

.tab-item.active text {
  color: #4A90E2;
  font-weight: bold;
}

.tab-line {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 60rpx;
  height: 4rpx;
  background-color: #4A90E2;
  border-radius: 2rpx;
}

/* ✅ 关键修改：待办列表容器 - 左右内边距改为 20rpx */
.todo-list {
  padding: 20rpx; /* 左右各 20rpx，与卡片宽度一致 */ 
  height: calc(100vh - 380rpx);
}

/* 待办卡片 */
.todo-card {
  background-color: #fff;
  border-radius: 20rpx;
  padding: 24rpx;
  margin-right: 40rpx;
  margin-bottom: 20rpx;
  display: flex;
  align-items: center;
  gap: 20rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
  transition: all 0.3s;
}

.todo-card.completed {
  opacity: 0.7;
  background-color: #fafafa;
}

.todo-checkbox {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.checkbox {
  width: 44rpx;
  height: 44rpx;
  border-radius: 50%;
  border: 2rpx solid #ddd;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
}

.checkbox.checked {
  background-color: #52C41A;
  border-color: #52C41A;
}

.todo-content {
  flex: 1;
  min-width: 0;
}

.todo-title {
  font-size: 30rpx;
  color: #333;
  display: block;
  margin-bottom: 12rpx;
  line-height: 1.4;
  word-break: break-all;
}

.todo-title.completed-text {
  text-decoration: line-through;
  color: #999;
}

.todo-meta {
  display: flex;
  align-items: center;
  gap: 16rpx;
  flex-wrap: wrap;
}

.todo-category {
  font-size: 22rpx;
  padding: 6rpx 16rpx;
  border-radius: 20rpx;
  color: #fff;
  flex-shrink: 0;
}

.todo-deadline {
  display: flex;
  align-items: center;
  gap: 6rpx;
  font-size: 22rpx;
  color: #999;
  flex-shrink: 0;
}

.todo-priority {
  font-size: 22rpx;
  padding: 6rpx 16rpx;
  border-radius: 20rpx;
  flex-shrink: 0;
}

.priority-1 {
  background-color: #f0f0f0;
  color: #999;
}

.priority-2 {
  background-color: #fff7e6;
  color: #FA8C16;
}

.priority-3 {
  background-color: #fff2f0;
  color: #ff4d4f;
}

.todo-actions {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  padding: 0;
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

/* 弹窗样式 */
.todo-popup {
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

.popup-scroll {
  max-height: 70vh;
  padding: 30rpx;
}

.form-group {
  margin-bottom: 32rpx;
}

.form-label {
  display: block;
  font-size: 28rpx;
  color: #333;
  margin-bottom: 16rpx;
  font-weight: bold;
}

.form-textarea {
  width: 100%;
  padding: 20rpx;
  border: 1rpx solid #e5e5e5;
  border-radius: 16rpx;
  font-size: 28rpx;
  box-sizing: border-box;
  min-height: 120rpx;
}

.category-selector,
.priority-selector {
  display: flex;
  gap: 20rpx;
  flex-wrap: wrap;
}

.category-chip,
.priority-chip {
  padding: 12rpx 28rpx;
  border-radius: 40rpx;
  font-size: 26rpx;
  background-color: #f5f5f5;
  color: #666;
  transition: all 0.3s;
}

.category-chip.active,
.priority-chip.active {
  background-color: #4A90E2;
  color: #fff;
}

.priority-chip.priority-1.active {
  background-color: #999;
}

.priority-chip.priority-2.active {
  background-color: #FA8C16;
}

.priority-chip.priority-3.active {
  background-color: #ff4d4f;
}

.submit-btn {
  background: linear-gradient(135deg, #4A90E2, #357ABD);
  color: #fff;
  border-radius: 50rpx;
  height: 80rpx;
  font-size: 32rpx;
  margin-top: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
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
</style>