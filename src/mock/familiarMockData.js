/**
 * 熟悉模块模拟数据
 * 包括问卷、库内容、提示板等
 */

// ==================== 问卷配置 ====================

/**
 * 阶段0问卷配置
 */
export const QUESTIONNAIRE_CONFIG = {
  title: '熟悉问卷',
  description: '请根据实际情况完成以下问卷',
  scoreThreshold: 10, // 得分阈值X
  questions: [
    {
      id: 'q1',
      question: '问题一',
      options: [
        { label: '选项A', value: 0, score: 0 },
        { label: '选项B', value: 1, score: 0 },
        { label: '选项C', value: 2, score: 0 },
        { label: '选项D', value: 3, score: 0 },
        { label: '选项E', value: 4, score: 0 },
      ],
    },
    {
      id: 'q2',
      question: '问题二',
      options: [
        { label: '选项A', value: 0, score: 0 },
        { label: '选项B', value: 1, score: 4 },
        { label: '选项C', value: 2, score: 5 },
        { label: '选项D', value: 3, score: 7 },
        { label: '选项E', value: 4, score: 4 },
      ],
    },
    {
      id: 'q3',
      question: '问题三',
      options: [
        { label: '选项A', value: 0, score: 0 },
        { label: '选项B', value: 1, score: 0 },
        { label: '选项C', value: 2, score: 6 },
        { label: '选项D', value: 3, score: 10 },
        { label: '选项E', value: 4, score: 10 },
      ],
    },
    {
      id: 'q4',
      question: '问题四',
      options: [
        { label: '选项A', value: 0, score: 0 },
        { label: '选项B', value: 1, score: 0 },
        { label: '选项C', value: 2, score: 0 },
        { label: '选项D', value: 3, score: 0 },
        { label: '选项E', value: 4, score: 0 },
      ],
    },
    {
      id: 'q5',
      question: '问题五',
      options: [
        { label: '选项A', value: 0, score: 0 },
        { label: '选项B', value: 1, score: 0 },
        { label: '选项C', value: 2, score: 0 },
        { label: '选项D', value: 3, score: 0 },
        { label: '选项E', value: 4, score: 0 },
      ],
    },
  ],
};

// ==================== 阶段0对话框配置 ====================

/**
 * 问1：是否有联系方式
 */
export const QUESTION_1_CONFIG = {
  title: '温馨提示',
  content: '有对方微信或其他线上可交流方式吗？',
  buttons: [
    { label: '是', value: 'yes' },
    { label: '否', value: 'no' },
  ],
};

/**
 * 问2：是否准备好
 */
export const QUESTION_2_CONFIG = {
  title: '温馨提示',
  content: '需要让对方见不到您20天左右。其中前10天左右什么也不用做，后10天左右请根据之后指引操作，确定可以开始并准备好之后请选"是"（即是否准备好）',
  buttons: [
    { label: '是', value: 'yes' },
    { label: '否', value: 'no' },
  ],
};

/**
 * 问3：是否完成第一阶段
 */
export const QUESTION_3_CONFIG = {
  title: '温馨提示',
  content: '请确定完成第一阶段，即倒计时结束前未与对方见面或主动联系，是或否？',
  buttons: [
    { label: '是', value: 'yes' },
    { label: '否', value: 'no' },
  ],
};

// ==================== 提示板配置 ====================

/**
 * 提示板S1：没有联系方式提示
 */
export const TIPS_S1 = {
  id: 'S1',
  title: '温馨提示',
  content: '建议您先获取对方的联系方式后再继续',
  type: 'info',
  buttons: [{ label: '确定', value: 'confirm' }],
};

/**
 * 提示板S2：准备好开始
 */
export const TIPS_S2 = {
  id: 'S2',
  title: '温馨提示',
  content: '请保持耐心，接下来将进入9-10天的等待期',
  type: 'info',
  buttons: [{ label: '确定', value: 'confirm' }],
};

/**
 * 提示板S3：未准备好
 */
export const TIPS_S3 = {
  id: 'S3',
  title: '温馨提示',
  content: '请您做好准备后再开始',
  type: 'warning',
  buttons: [{ label: '确定', value: 'confirm' }],
};

/**
 * 提示板S4：完成等待期
 */
export const TIPS_S4 = {
  id: 'S4',
  title: '温馨提示',
  content: '很好！接下来将进入正式阶段，请继续保持',
  type: 'success',
  buttons: [{ label: '确定', value: 'confirm' }],
};

/**
 * 提示板S5-S31（阶段1-4使用，暂时占位）
 */
export const TIPS_S5 = {
  id: 'S5',
  title: '熟悉提示',
  content: '提示板S5内容待定',
  type: 'info',
  buttons: [{ label: '确定', value: 'confirm' }],
};

export const TIPS_S6 = {
  id: 'S6',
  title: '熟悉提示',
  content: '提示板S6内容待定',
  type: 'info',
  buttons: [{ label: '确定', value: 'confirm' }],
};

export const TIPS_S7 = {
  id: 'S7',
  title: '是否坚持',
  content: '您已经尝试多次，是否继续坚持？',
  type: 'warning',
  buttons: [
    { label: '坚持', value: 'persist' },
    { label: '放弃', value: 'give_up' },
  ],
};

export const TIPS_S8 = {
  id: 'S8',
  title: '温馨提示',
  content: '提示板S8内容待定',
  type: 'info',
  buttons: [{ label: '确定', value: 'confirm' }],
};

export const TIPS_S9 = {
  id: 'S9',
  title: '任务结束',
  content: '确认要结束当前任务吗？',
  type: 'warning',
  buttons: [
    { label: '确定', value: 'confirm' },
    { label: '取消', value: 'cancel' },
  ],
};

// 导出所有提示板的映射
export const TIPS_BOARD_MAP = {
  S1: TIPS_S1,
  S2: TIPS_S2,
  S3: TIPS_S3,
  S4: TIPS_S4,
  S5: TIPS_S5,
  S6: TIPS_S6,
  S7: TIPS_S7,
  S8: TIPS_S8,
  S9: TIPS_S9,
};

// ==================== 倒计时配置 ====================

/**
 * 各种倒计时的时长配置（单位：毫秒）
 * 开发测试时可以缩短时间，正式上线时改为真实时长
 */
export const COUNTDOWN_CONFIG = {
  // 阶段0
  countdown_9_10_days: {
    min: 9 * 24 * 60 * 60 * 1000, // 9天
    max: 10 * 24 * 60 * 60 * 1000, // 10天
  },
  countdown_stage_1: {
    min: 6 * 24 * 60 * 60 * 1000, // 6天
    max: 9 * 24 * 60 * 60 * 1000, // 9天
  },
  
  // 阶段1
  stage1_z_time: {
    min: 2 * 60 * 1000, // 2分钟
    max: 4 * 60 * 1000, // 4分钟
  },
  
  // 阶段2
  stage2_z_time: {
    min: 3 * 60 * 1000, // 3分钟
    max: 6 * 60 * 1000, // 6分钟
  },
  
  // 阶段3
  stage3_z_time: {
    min: 3 * 60 * 1000, // 3分钟
    max: 7 * 60 * 1000, // 7分钟
  },
  
  // 通用
  copy_cooldown: 2 * 1000, // 复制按钮冷却时间 2秒
  proactive_wait_time: {
    min: 30 * 60 * 1000, // 对方找等待时间范围（随机）
    max: 60 * 60 * 1000,
  },
  proactive_copy_wait: 3.5 * 1000, // 对方找复制按钮可用时间 3.5秒
  
  // 开发测试用（快速版本）
  DEV_MODE: true, // 开发模式开关
  dev_countdown_9_10_days: 30 * 1000, // 30秒
  dev_countdown_stage_1: 20 * 1000, // 20秒
};

/**
 * 获取随机倒计时时长
 */
export function getRandomCountdown(config) {
  const { min, max } = config;
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * 根据开发模式获取倒计时时长
 */
export function getCountdownDuration(type) {
  if (COUNTDOWN_CONFIG.DEV_MODE) {
    // 开发模式：使用快速倒计时
    switch (type) {
      case 'countdown_9_10':
        return COUNTDOWN_CONFIG.dev_countdown_9_10_days;
      case 'countdown_stage_1':
        return COUNTDOWN_CONFIG.dev_countdown_stage_1;
      default:
        return getRandomCountdown(COUNTDOWN_CONFIG[type] || { min: 10000, max: 20000 });
    }
  } else {
    // 正式模式：使用真实倒计时
    switch (type) {
      case 'countdown_9_10':
        return getRandomCountdown(COUNTDOWN_CONFIG.countdown_9_10_days);
      case 'countdown_stage_1':
        return getRandomCountdown(COUNTDOWN_CONFIG.countdown_stage_1);
      default:
        return getRandomCountdown(COUNTDOWN_CONFIG[type] || { min: 60000, max: 120000 });
    }
  }
}

// ==================== 库内容模拟数据 ====================

/**
 * 内容库数据结构
 * 采用链表式结构，每个内容有ID和后续内容
 */

/**
 * 阶段1 - 内容库S1
 */
export const CONTENT_LIBRARY_S1 = {
  libraryId: 'S1',
  libraryName: '内容库S1',
  stage: 1,
  contents: [
    {
      id: 'S1_1',
      text: '这是内容库S1的第一条内容',
      next: 'S1_1_1',
    },
    {
      id: 'S1_1_1',
      text: '这是内容库S1的第一条内容的后续内容',
      symbol: '@', // 符号分隔
      next: 'S1_1_2',
    },
    {
      id: 'S1_1_2',
      text: '这是@符号后的内容',
      symbol: 'Z', // Z符号
      next: null,
    },
    {
      id: 'S1_2',
      text: '这是内容库S1的第二条内容',
      next: 'S1_2_1',
    },
    {
      id: 'S1_2_1',
      text: '第二条内容的后续',
      symbol: 'AZ',
      next: null,
    },
  ],
};

/**
 * 离开库S1
 */
export const LEAVE_LIBRARY_S1 = {
  libraryId: 'leave_S1',
  libraryName: '离开库S1',
  stage: 1,
  contents: [
    {
      id: 'leave_S1_1',
      text: '好的，那我先忙了',
      next: null,
    },
    {
      id: 'leave_S1_2',
      text: '拜拜～',
      next: null,
    },
  ],
};

/**
 * 对方找库S1
 */
export const PROACTIVE_LIBRARY_S1 = {
  libraryId: 'proactive_S1',
  libraryName: '对方找库S1',
  stage: 1,
  contents: [
    {
      id: 'proactive_S1_1',
      text: '对方找内容1',
      next: 'proactive_S1_2',
    },
    {
      id: 'proactive_S1_2',
      text: '对方找内容2',
      next: 'proactive_S1_3',
    },
    {
      id: 'proactive_S1_3',
      text: '对方找内容3',
      next: 'proactive_S1_4',
    },
    {
      id: 'proactive_S1_4',
      text: '对方找内容4（最后一条）',
      next: null,
    },
  ],
};

/**
 * 问答库S1
 */
export const QA_LIBRARY_S1 = {
  libraryId: 'qa_S1',
  libraryName: '问答库S1',
  stage: 1,
  items: [
    {
      id: 'qa_S1_1',
      keywords: ['你好', '嗨', 'hello'],
      answers: [
        {
          id: 'qa_S1_1_a1',
          text: '你好呀，很高兴认识你',
          next: 'qa_S1_1_a1_1',
        },
        {
          id: 'qa_S1_1_a1_1',
          text: '有什么可以帮你的吗？',
          next: null,
        },
      ],
    },
    {
      id: 'qa_S1_2',
      keywords: ['天气', '今天'],
      answers: [
        {
          id: 'qa_S1_2_a1',
          text: '今天天气不错呢',
          next: null,
        },
      ],
    },
  ],
};

// ==================== 导出 ====================

export default {
  QUESTIONNAIRE_CONFIG,
  QUESTION_1_CONFIG,
  QUESTION_2_CONFIG,
  QUESTION_3_CONFIG,
  TIPS_BOARD_MAP,
  COUNTDOWN_CONFIG,
  getRandomCountdown,
  getCountdownDuration,
  CONTENT_LIBRARY_S1,
  LEAVE_LIBRARY_S1,
  PROACTIVE_LIBRARY_S1,
  QA_LIBRARY_S1,
};

