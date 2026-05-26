// mock/data.js
// 模拟课表数据
export const mockSchedule = [
  {
    id: 1,
    name: '高等数学',
    teacher: '张教授',
    room: '教学楼A-101',
    day: 1,  // 周一
    startTime: '08:00',
    endTime: '09:35',
    section: '第1-2节',
    weeks: '1-16周'
  },
  {
    id: 2,
    name: '大学英语',
    teacher: '李老师',
    room: '教学楼B-203',
    day: 1,
    startTime: '10:00',
    endTime: '11:35',
    section: '第3-4节',
    weeks: '1-16周'
  },
  {
    id: 3,
    name: '程序设计基础',
    teacher: '王教授',
    room: '计算机楼-302',
    day: 2,  // 周二
    startTime: '14:00',
    endTime: '15:35',
    section: '第5-6节',
    weeks: '1-16周'
  },
  {
    id: 4,
    name: '大学物理',
    teacher: '陈老师',
    room: '实验楼-101',
    day: 3,  // 周三
    startTime: '08:00',
    endTime: '09:35',
    section: '第1-2节',
    weeks: '1-16周'
  },
  {
    id: 5,
    name: '线性代数',
    teacher: '赵教授',
    room: '教学楼A-205',
    day: 4,  // 周四
    startTime: '10:00',
    endTime: '11:35',
    section: '第3-4节',
    weeks: '1-16周'
  },
  {
    id: 6,
    name: '体育',
    teacher: '孙老师',
    room: '体育馆',
    day: 5,  // 周五
    startTime: '14:00',
    endTime: '15:35',
    section: '第5-6节',
    weeks: '1-16周'
  }
]

// 模拟通知数据
export const mockNotices = [
  {
    id: 1,
    title: '关于2024年寒假放假安排的通知',
    type: '教务通知',
    summary: '根据校历安排，2024年寒假放假时间为1月15日至2月25日...',
    content: '<p>根据校历安排，2024年寒假放假时间为1月15日至2月25日。</p><p>请各位同学合理安排假期生活。</p>',
    author: '教务处',
    publishTime: Date.now() - 2 * 24 * 3600000,
    views: 1250,
    comments: 23,
    likes: 156,
    attachments: []
  },
  {
    id: 2,
    title: '校园歌手大赛报名通知',
    type: '校园活动',
    summary: '一年一度的校园歌手大赛即将开始，欢迎各位同学踊跃报名...',
    content: '<p>一年一度的校园歌手大赛即将开始！</p><p>报名时间：即日起至12月20日</p><p>报名方式：通过本小程序填写报名信息</p>',
    author: '校团委',
    publishTime: Date.now() - 5 * 24 * 3600000,
    views: 3420,
    comments: 89,
    likes: 567,
    attachments: []
  },
  {
    id: 3,
    title: '2025届毕业生秋季双选会邀请函',
    type: '就业信息',
    summary: '为促进毕业生高质量就业，我校将举办2025届毕业生秋季双选会...',
    content: '<p>为促进毕业生高质量就业，我校将举办2025届毕业生秋季双选会。</p><p>时间：11月25日 9:00-16:00</p><p>地点：学校体育馆</p>',
    author: '就业指导中心',
    publishTime: Date.now() - 7 * 24 * 3600000,
    views: 890,
    comments: 12,
    likes: 78,
    attachments: []
  },
  {
    id: 4,
    title: '关于举办学术讲座的通知',
    type: '讲座信息',
    summary: '特邀清华大学张教授来校作"人工智能前沿技术"专题讲座...',
    content: '<p>特邀清华大学张教授来校作"人工智能前沿技术"专题讲座。</p><p>时间：11月20日 14:00</p><p>地点：图书馆报告厅</p>',
    author: '科研处',
    publishTime: Date.now() - 10 * 24 * 3600000,
    views: 560,
    comments: 8,
    likes: 45,
    attachments: []
  },
  {
    id: 5,
    title: '图书馆闭馆通知',
    type: '其他',
    summary: '因设备维护，图书馆将于11月18日（本周六）闭馆一天...',
    content: '<p>因设备维护，图书馆将于11月18日（本周六）闭馆一天。</p><p>请同学们提前安排好学习计划。</p>',
    author: '图书馆',
    publishTime: Date.now() - 12 * 24 * 3600000,
    views: 2300,
    comments: 34,
    likes: 89,
    attachments: []
  }
]