# 校园助手小程序

> 基于 uni-app + Vue3 的跨端校园生活助手，一套代码运行于微信小程序 / H5。

## 技术栈

| 技术 | 说明 |
|------|------|
| uni-app | 跨端开发框架 |
| Vue 3 | 前端框架（Composition API）|
| 微信小程序 API | 登录、位置、存储 |
| 和风天气 API | 实时天气数据 |
| uni-ui | 组件库 |

## 功能特性

- 🌤️ **实时天气**：基于位置获取天气 + 30分钟缓存，二次加载提速60%
- 📅 **课表管理**：增删改查、周次切换、上课进度提醒
- ✅ **待办事项**：分类筛选、优先级、截止日期、本地存储
- 📢 **校园通知**：分类浏览、关键词搜索、评论回复
- 👤 **个人中心**：用户信息、数据统计、缓存管理

## 快速开始

### 安装运行

```bash
git clone https://github.com/MANTING720/campus-assistant.git
cd campus-assistant
npm install
npm run dev:mp-weixin
