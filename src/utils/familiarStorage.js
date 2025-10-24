/**
 * 熟悉模块本地存储工具
 * 用于管理熟悉任务的所有本地数据
 */

// ==================== 常量定义 ====================

// LocalStorage 键名
const STORAGE_KEYS = {
  TASK_LIST: 'familiar_task_list', // 任务列表
  CURRENT_TASK_ID: 'familiar_current_task_id', // 当前查看的任务ID
  VIP_INFO: 'familiar_vip_info', // VIP信息
  USER_BALANCE: 'familiar_user_balance', // 用户余额
};

// 任务有效期配置（天数和价格）
export const TASK_DURATION_CONFIG = [
  { days: 5, price: 138 },
  { days: 9, price: 225 },
  { days: 16, price: 294 },
];

// 阶段枚举
export const STAGE = {
  STAGE_0: 0, // 问卷阶段
  STAGE_1: 1, // 第一阶段
  STAGE_2: 2, // 第二阶段
  STAGE_3: 3, // 第三阶段
  STAGE_4: 4, // 第四阶段
  COMPLETED: 99, // 已完成
};

// 阶段0的步骤枚举
export const STAGE_0_STEP = {
  QUESTIONNAIRE: 'questionnaire', // 问卷调查
  QUESTION_1: 'question_1', // 问1：是否有联系方式
  QUESTION_2: 'question_2', // 问2：是否准备好
  COUNTDOWN_9_10: 'countdown_9_10', // 9-10天倒计时
  QUESTION_3: 'question_3', // 问3：是否完成第一阶段
  COUNTDOWN_STAGE_1: 'countdown_stage_1', // 进入阶段1前的倒计时
  ROUTE_TO_OTHER: 'route_to_other', // 路由到其他模块（不熟/陌生）
};

// 任务状态枚举
export const TASK_STATUS = {
  IN_PROGRESS: 'in_progress', // 进行中
  COUNTDOWN: 'countdown', // 倒计时中
  EXPIRED: 'expired', // 已过期
  COMPLETED: 'completed', // 已完成
  DELETED: 'deleted', // 已删除
};

// ==================== 数据结构模板 ====================

/**
 * 创建新任务的数据结构
 * @param {string} taskName - 任务名称
 * @param {number} duration - 任务有效期（天数）
 * @param {number} price - 任务价格
 * @returns {Object} 任务对象
 */
export function createNewTask(taskName, duration, price) {
  const taskId = `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const now = Date.now();
  
  return {
    // === 基本信息 ===
    taskId,
    taskName,
    createTime: now,
    updateTime: now,
    duration, // 任务有效期（天）
    price, // 任务价格
    expiryTime: now + duration * 24 * 60 * 60 * 1000, // 过期时间戳
    status: TASK_STATUS.IN_PROGRESS,
    
    // === 当前进度 ===
    currentStage: STAGE.STAGE_0, // 当前阶段
    currentRound: 0, // 当前回合（某些阶段使用）
    currentStep: STAGE_0_STEP.QUESTIONNAIRE, // 当前步骤（阶段0使用）
    
    // === 积分系统 ===
    totalScore: 0, // 总积分
    stageScores: {}, // 各阶段积分 { stage1: 2, stage2: 3 }
    roundScores: {}, // 各回合积分 { '1_1': 1, '1_2': 2 }
    
    // === 阶段0数据 ===
    stage0Data: {
      // 问卷答案
      questionnaireAnswers: {
        q1: null, // 问题1的答案（选项索引）
        q2: null,
        q3: null,
        q4: null,
        q5: null,
      },
      questionnaireScore: 0, // 问卷总分
      
      // 用户在问1/问2/问3的选择历史
      question1Answers: [], // ['yes', 'no', 'yes'] 记录每次选择
      question2Answers: [],
      question3Answers: [],
      
      // 倒计时信息
      countdown9_10: {
        startTime: null, // 倒计时开始时间戳
        duration: null, // 倒计时时长（毫秒）
        endTime: null, // 倒计时结束时间戳
        isActive: false, // 是否正在倒计时
      },
      countdownStage1: {
        startTime: null,
        duration: null,
        endTime: null,
        isActive: false,
      },
      
      // 特殊权限
      specialLibraryActivated: false, // 是否激活图文特殊库权限
      specialLibraryRefreshTime: null, // 特殊库刷新时间
    },
    
    // === 阶段1-4数据（后续扩展） ===
    stage1Data: {
      rounds: [], // 回合数据
      completedRounds: 0,
      usedLibraries: [], // 已使用的库编号
    },
    stage2Data: {
      rounds: [],
      completedRounds: 0,
      usedLibraries: [],
      skipOpenLibrary: false, // 是否跳过开场库
    },
    stage3Data: {
      rounds: [],
      completedRounds: 0,
      usedLibraries: [],
      skipOpenLibrary: false,
    },
    stage4Data: {
      invitationAttempts: 0, // 邀约尝试次数
      invitationSuccess: false, // 邀约是否成功
      multiChatCount: 0, // "多聊一次"的次数
    },
    
    // === 对话数据 ===
    dialogData: {
      currentLibraryType: null, // 当前库类型：open/content/leave/question/proactive
      currentLibraryId: null, // 当前库ID
      currentContentChain: [], // 当前内容链（编号）
      currentContentIndex: 0, // 当前内容链的索引
      selectedContentIds: [], // 已选择的内容ID列表
      
      // 对方找相关
      proactiveActivated: false, // 对方找是否可用
      proactiveUsed: false, // 是否已使用对方找
      proactiveCountdown: {
        startTime: null,
        duration: null,
        endTime: null,
        isActive: false,
      },
      
      // 大CD相关
      bigCDCountdown: {
        startTime: null,
        duration: null,
        endTime: null,
        isActive: false,
        multiplier: 1, // CD倍数
      },
      
      // 回合允许时间
      roundTimeCountdown: {
        startTime: null,
        duration: null,
        endTime: null,
        isActive: false,
      },
      
      // Z/D相关
      zCountdown: {
        startTime: null,
        duration: null, // 6-12分钟随机
        endTime: null,
        isActive: false,
      },
      dActive: false,
      
      // 搜索问答相关
      searchHistory: [], // 搜索历史
      searchCost: 0, // 下次搜索费用（1.6倍递增）
      searchCount: 0, // 搜索次数
    },
    
    // === 操作历史 ===
    operationHistory: [
      {
        timestamp: now,
        action: 'create_task',
        description: `创建任务：${taskName}`,
      }
    ],
    
    // === 续费记录 ===
    renewalRecords: [],
    
    // === 半价重置标记 ===
    isHalfPriceReset: false,
  };
}

// ==================== 基础存储操作 ====================

/**
 * 获取所有任务列表
 */
export function getAllTasks() {
  try {
    const tasksJson = localStorage.getItem(STORAGE_KEYS.TASK_LIST);
    return tasksJson ? JSON.parse(tasksJson) : [];
  } catch (error) {
    console.error('获取任务列表失败:', error);
    return [];
  }
}

/**
 * 保存任务列表
 */
export function saveAllTasks(tasks) {
  try {
    localStorage.setItem(STORAGE_KEYS.TASK_LIST, JSON.stringify(tasks));
    return true;
  } catch (error) {
    console.error('保存任务列表失败:', error);
    return false;
  }
}

/**
 * 获取指定任务
 */
export function getTask(taskId) {
  const tasks = getAllTasks();
  return tasks.find(task => task.taskId === taskId);
}

/**
 * 保存/更新任务
 */
export function saveTask(task) {
  try {
    const tasks = getAllTasks();
    const index = tasks.findIndex(t => t.taskId === task.taskId);
    
    task.updateTime = Date.now();
    
    if (index >= 0) {
      tasks[index] = task;
    } else {
      tasks.push(task);
    }
    
    return saveAllTasks(tasks);
  } catch (error) {
    console.error('保存任务失败:', error);
    return false;
  }
}

/**
 * 删除任务
 */
export function deleteTask(taskId) {
  try {
    const tasks = getAllTasks();
    const filteredTasks = tasks.filter(task => task.taskId !== taskId);
    return saveAllTasks(filteredTasks);
  } catch (error) {
    console.error('删除任务失败:', error);
    return false;
  }
}

/**
 * 获取当前任务ID
 */
export function getCurrentTaskId() {
  return localStorage.getItem(STORAGE_KEYS.CURRENT_TASK_ID);
}

/**
 * 设置当前任务ID
 */
export function setCurrentTaskId(taskId) {
  localStorage.setItem(STORAGE_KEYS.CURRENT_TASK_ID, taskId);
}

// ==================== 任务操作方法 ====================

/**
 * 创建新任务
 */
export function createTask(taskName, durationIndex = 0) {
  const config = TASK_DURATION_CONFIG[durationIndex];
  const task = createNewTask(taskName, config.days, config.price);
  
  if (saveTask(task)) {
    setCurrentTaskId(task.taskId);
    return task;
  }
  return null;
}

/**
 * 更新任务状态
 */
export function updateTaskStatus(taskId, updates) {
  const task = getTask(taskId);
  if (!task) return false;
  
  Object.assign(task, updates);
  
  // 记录操作历史
  if (updates.currentStep || updates.currentStage || updates.currentRound) {
    task.operationHistory.push({
      timestamp: Date.now(),
      action: 'status_update',
      description: `更新状态：阶段${task.currentStage}，步骤${task.currentStep}，回合${task.currentRound}`,
      details: updates,
    });
  }
  
  return saveTask(task);
}

/**
 * 增加积分
 */
export function addScore(taskId, points, source = '') {
  const task = getTask(taskId);
  if (!task) return false;
  
  task.totalScore += points;
  
  // 记录到对应阶段/回合
  const stageKey = `stage${task.currentStage}`;
  if (!task.stageScores[stageKey]) {
    task.stageScores[stageKey] = 0;
  }
  task.stageScores[stageKey] += points;
  
  task.operationHistory.push({
    timestamp: Date.now(),
    action: 'add_score',
    description: `增加积分 +${points}（${source}）`,
    score: task.totalScore,
  });
  
  return saveTask(task);
}

/**
 * 设置倒计时
 */
export function setCountdown(taskId, countdownType, durationMs) {
  const task = getTask(taskId);
  if (!task) return false;
  
  const now = Date.now();
  let countdownObj = null;
  
  // 根据类型找到对应的倒计时对象
  if (countdownType === 'countdown_9_10') {
    countdownObj = task.stage0Data.countdown9_10;
  } else if (countdownType === 'countdown_stage_1') {
    countdownObj = task.stage0Data.countdownStage1;
  } else if (countdownType === 'big_cd') {
    countdownObj = task.dialogData.bigCDCountdown;
  } else if (countdownType === 'round_time') {
    countdownObj = task.dialogData.roundTimeCountdown;
  } else if (countdownType === 'z_countdown') {
    countdownObj = task.dialogData.zCountdown;
  } else if (countdownType === 'proactive') {
    countdownObj = task.dialogData.proactiveCountdown;
  }
  
  if (countdownObj) {
    countdownObj.startTime = now;
    countdownObj.duration = durationMs;
    countdownObj.endTime = now + durationMs;
    countdownObj.isActive = true;
    
    task.operationHistory.push({
      timestamp: now,
      action: 'set_countdown',
      description: `设置倒计时：${countdownType}，时长${Math.round(durationMs / 1000 / 60)}分钟`,
    });
  }
  
  return saveTask(task);
}

/**
 * 检查倒计时是否结束
 */
export function checkCountdownExpired(countdownObj) {
  if (!countdownObj || !countdownObj.isActive) return false;
  return Date.now() >= countdownObj.endTime;
}

/**
 * 获取倒计时剩余时间（毫秒）
 */
export function getCountdownRemaining(countdownObj) {
  if (!countdownObj || !countdownObj.isActive) return 0;
  const remaining = countdownObj.endTime - Date.now();
  return remaining > 0 ? remaining : 0;
}

/**
 * 完成倒计时
 */
export function completeCountdown(taskId, countdownType) {
  const task = getTask(taskId);
  if (!task) return false;
  
  let countdownObj = null;
  
  if (countdownType === 'countdown_9_10') {
    countdownObj = task.stage0Data.countdown9_10;
  } else if (countdownType === 'countdown_stage_1') {
    countdownObj = task.stage0Data.countdownStage1;
  } else if (countdownType === 'big_cd') {
    countdownObj = task.dialogData.bigCDCountdown;
  } else if (countdownType === 'round_time') {
    countdownObj = task.dialogData.roundTimeCountdown;
  } else if (countdownType === 'z_countdown') {
    countdownObj = task.dialogData.zCountdown;
  } else if (countdownType === 'proactive') {
    countdownObj = task.dialogData.proactiveCountdown;
  }
  
  if (countdownObj) {
    countdownObj.isActive = false;
  }
  
  return saveTask(task);
}

/**
 * 保存问卷答案
 */
export function saveQuestionnaireAnswers(taskId, answers, totalScore) {
  const task = getTask(taskId);
  if (!task) return false;
  
  task.stage0Data.questionnaireAnswers = answers;
  task.stage0Data.questionnaireScore = totalScore;
  
  task.operationHistory.push({
    timestamp: Date.now(),
    action: 'complete_questionnaire',
    description: `完成问卷，得分：${totalScore}`,
  });
  
  return saveTask(task);
}

/**
 * 记录用户选择（问1/问2/问3）
 */
export function recordUserChoice(taskId, questionType, choice) {
  const task = getTask(taskId);
  if (!task) return false;
  
  if (questionType === 'question1') {
    task.stage0Data.question1Answers.push(choice);
  } else if (questionType === 'question2') {
    task.stage0Data.question2Answers.push(choice);
  } else if (questionType === 'question3') {
    task.stage0Data.question3Answers.push(choice);
  }
  
  task.operationHistory.push({
    timestamp: Date.now(),
    action: `user_choice_${questionType}`,
    description: `用户选择：${questionType} - ${choice}`,
  });
  
  return saveTask(task);
}

// ==================== VIP和余额相关 ====================

/**
 * 获取VIP信息
 */
export function getVIPInfo() {
  try {
    const vipJson = localStorage.getItem(STORAGE_KEYS.VIP_INFO);
    return vipJson ? JSON.parse(vipJson) : { level: 1, expireTime: null };
  } catch (error) {
    console.error('获取VIP信息失败:', error);
    return { level: 1, expireTime: null };
  }
}

/**
 * 获取用户余额
 */
export function getUserBalance() {
  try {
    const balance = localStorage.getItem(STORAGE_KEYS.USER_BALANCE);
    return balance ? parseFloat(balance) : 1000; // 默认1000
  } catch (error) {
    console.error('获取余额失败:', error);
    return 1000;
  }
}

/**
 * 设置用户余额
 */
export function setUserBalance(balance) {
  localStorage.setItem(STORAGE_KEYS.USER_BALANCE, balance.toString());
}

/**
 * 扣除余额
 */
export function deductBalance(amount) {
  const balance = getUserBalance();
  if (balance >= amount) {
    setUserBalance(balance - amount);
    return true;
  }
  return false;
}

// ==================== 导出工具方法 ====================

export default {
  // 常量
  STORAGE_KEYS,
  TASK_DURATION_CONFIG,
  STAGE,
  STAGE_0_STEP,
  TASK_STATUS,
  
  // 基础操作
  getAllTasks,
  saveAllTasks,
  getTask,
  saveTask,
  deleteTask,
  getCurrentTaskId,
  setCurrentTaskId,
  
  // 任务操作
  createTask,
  createNewTask,
  updateTaskStatus,
  addScore,
  setCountdown,
  checkCountdownExpired,
  getCountdownRemaining,
  completeCountdown,
  saveQuestionnaireAnswers,
  recordUserChoice,
  
  // VIP和余额
  getVIPInfo,
  getUserBalance,
  setUserBalance,
  deductBalance,
};

