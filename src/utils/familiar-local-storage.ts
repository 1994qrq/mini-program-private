/**
 * 熟悉模块本地存储管理
 * 基于localStorage的脱机数据管理
 */

interface TaskBasicInfo {
  taskId: string;
  name: string;
  status: '倒计时' | '聊天中' | '已完成' | '问卷中';
  currentStage: number; // 0-4阶段
  currentRound: number; // 当前回合
  currentStep: string; // 当前步骤
  createdAt: string;
  expiresAt: string; // 任务有效期
  score: number; // 当前积分
  vipLevel: number;
}

interface StageProgress {
  completed: boolean;
  questionnaireScore?: number; // 阶段0专用
  answers?: Record<string, string>; // 阶段0问卷答案
  dialogStatus?: Record<string, string>; // 问1/问2/问3状态
  currentRound?: number; // 当前阶段内的回合
  roundScores?: number[]; // 各回合积分
  currentLibrary?: string; // 当前使用的库
  contentChain?: string[]; // 当前内容链
  currentChainIndex?: number; // 当前内容位置
  zTimer?: string | null; // Z倒计时结束时间
  cdTimer?: string | null; // 大CD倒计时
}

interface TaskDetail {
  taskId: string;
  stageProgress: Record<number, StageProgress>;
  timers: {
    stageCD: string | null; // 阶段间倒计时
    roundCD: string | null; // 回合倒计时
    zCD: string | null; // Z倒计时
    opponentFindCD: string | null; // 对方找倒计时
    taskExpiryCD: string | null; // 任务过期倒计时
  };
  libraryUsage: {
    usedLibraries: string[]; // 已使用库
    availableLibraries: string[]; // 可用库
  };
  opponentFindCount: number; // 对方找次数
  lastOperationTime: string; // 最后操作时间
}

interface MockData {
  questionnaire: {
    questions: Array<{
      id: string;
      title: string;
      options: Array<{ value: string; text: string; score: number }>;
    }>;
  };
  libraries: Record<string, string[]>;
  promptBoards: Record<string, string>;
  timerSettings: {
    zTimeRange: [number, number]; // Z时间范围(分钟)
    roundTimeout: number; // 回合超时时间(分钟)
    copyCooldown: number; // 复制冷却时间(秒)
    stageCDRange: [number, number]; // 阶段CD范围(天)
  };
}

interface UserState {
  currentTaskId: string | null;
  vipLevel: number;
  balance: number;
  settings: {
    zTimeRange: [number, number];
    roundTimeout: number;
    copyCooldown: number;
  };
}

class FamiliarLocalStorage {
  private readonly TASKS_KEY = 'familiar_tasks';
  private readonly TASK_DETAIL_PREFIX = 'familiar_task_';
  private readonly MOCK_DATA_KEY = 'familiar_mock_data';
  private readonly USER_STATE_KEY = 'familiar_user_state';

  // 任务列表操作
  getTaskList(): TaskBasicInfo[] {
    const data = localStorage.getItem(this.TASKS_KEY);
    return data ? JSON.parse(data).tasks : [];
  }

  saveTaskList(tasks: TaskBasicInfo[]): void {
    localStorage.setItem(this.TASKS_KEY, JSON.stringify({ tasks }));
  }

  // 单个任务详情操作
  getTaskDetail(taskId: string): TaskDetail | null {
    const data = localStorage.getItem(`${this.TASK_DETAIL_PREFIX}${taskId}`);
    return data ? JSON.parse(data) : null;
  }

  saveTaskDetail(taskId: string, detail: TaskDetail): void {
    localStorage.setItem(`${this.TASK_DETAIL_PREFIX}${taskId}`, JSON.stringify(detail));
  }

  // Mock数据操作
  getMockData(): MockData {
    const data = localStorage.getItem(this.MOCK_DATA_KEY);
    if (data) {
      return JSON.parse(data);
    }
    
    // 初始化Mock数据
    const defaultMockData: MockData = this.createDefaultMockData();
    this.saveMockData(defaultMockData);
    return defaultMockData;
  }

  saveMockData(mockData: MockData): void {
    localStorage.setItem(this.MOCK_DATA_KEY, JSON.stringify(mockData));
  }

  // 用户状态操作
  getUserState(): UserState {
    const data = localStorage.getItem(this.USER_STATE_KEY);
    if (data) {
      return JSON.parse(data);
    }
    
    const defaultState: UserState = {
      currentTaskId: null,
      vipLevel: 1,
      balance: 100,
      settings: {
        zTimeRange: [3, 7],
        roundTimeout: 40,
        copyCooldown: 2
      }
    };
    this.saveUserState(defaultState);
    return defaultState;
  }

  saveUserState(userState: UserState): void {
    localStorage.setItem(this.USER_STATE_KEY, JSON.stringify(userState));
  }

  // 创建任务
  createTask(name: string, duration: 5 | 9 | 16): string {
    const taskId = `task_${Date.now()}`;
    const now = new Date();
    const expiresAt = new Date(now.getTime() + duration * 24 * 60 * 60 * 1000);
    
    const newTask: TaskBasicInfo = {
      taskId,
      name,
      status: '问卷中',
      currentStage: 0,
      currentRound: 0,
      currentStep: '问卷',
      createdAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
      score: 0,
      vipLevel: this.getUserState().vipLevel
    };

    const taskDetail: TaskDetail = {
      taskId,
      stageProgress: {
        0: {
          completed: false,
          questionnaireScore: 0,
          answers: {},
          dialogStatus: {}
        }
      },
      timers: {
        stageCD: null,
        roundCD: null,
        zCD: null,
        opponentFindCD: null,
        taskExpiryCD: expiresAt.toISOString()
      },
      libraryUsage: {
        usedLibraries: [],
        availableLibraries: this.getAvailableLibrariesForStage(0)
      },
      opponentFindCount: 0,
      lastOperationTime: now.toISOString()
    };

    // 保存到列表和详情
    const tasks = this.getTaskList();
    tasks.push(newTask);
    this.saveTaskList(tasks);
    this.saveTaskDetail(taskId, taskDetail);

    // 更新用户当前任务
    const userState = this.getUserState();
    userState.currentTaskId = taskId;
    this.saveUserState(userState);

    return taskId;
  }

  // 更新任务进度
  updateTaskProgress(taskId: string, updates: Partial<TaskDetail>): void {
    const detail = this.getTaskDetail(taskId);
    if (!detail) return;

    Object.assign(detail, updates);
    detail.lastOperationTime = new Date().toISOString();
    this.saveTaskDetail(taskId, detail);

    // 同时更新任务列表中的基本信息
    this.updateTaskBasicInfo(taskId);
  }

  // 提交问卷
  submitQuestionnaire(taskId: string, answers: Record<string, string>, score: number): void {
    const detail = this.getTaskDetail(taskId);
    if (!detail) return;

    detail.stageProgress[0] = {
      ...detail.stageProgress[0],
      completed: true,
      questionnaireScore: score,
      answers
    };

    // 根据分数决定下一步
    if (score >= 10) {
      // 进入问1对话框
      detail.stageProgress[0].dialogStatus = { ask1: 'pending' };
    } else {
      // 分数不足，进入不熟或陌生模块
      detail.stageProgress[0].dialogStatus = { ask1: 'pending' };
    }

    this.updateTaskProgress(taskId, detail);
  }

  // 处理对话框选择
  handleDialogChoice(taskId: string, question: string, choice: string): void {
    const detail = this.getTaskDetail(taskId);
    if (!detail) return;

    const stage0 = detail.stageProgress[0];
    if (!stage0.dialogStatus) stage0.dialogStatus = {};

    stage0.dialogStatus[question] = choice;

    // 根据选择逻辑更新状态
    this.updateDialogFlow(taskId, question, choice);
    this.updateTaskProgress(taskId, detail);
  }

  // 进入下一阶段
  advanceStage(taskId: string): void {
    const detail = this.getTaskDetail(taskId);
    if (!detail) return;

    const currentStage = this.getTaskBasicInfo(taskId)?.currentStage || 0;
    const nextStage = currentStage + 1;

    if (nextStage <= 4) {
      // 更新任务基本信息
      const tasks = this.getTaskList();
      const taskIndex = tasks.findIndex(t => t.taskId === taskId);
      if (taskIndex !== -1) {
        tasks[taskIndex].currentStage = nextStage;
        tasks[taskIndex].currentRound = 1;
        tasks[taskIndex].currentStep = '对话';
        this.saveTaskList(tasks);
      }

      // 初始化新阶段进度
      detail.stageProgress[nextStage] = {
        completed: false,
        currentRound: 1,
        roundScores: [],
        currentLibrary: '',
        contentChain: [],
        currentChainIndex: 0
      };

      // 设置阶段间CD
      const cdDuration = this.getRandomStageCD();
      detail.timers.stageCD = new Date(Date.now() + cdDuration).toISOString();

      this.updateTaskProgress(taskId, detail);
    }
  }

  // 进入下一回合
  advanceRound(taskId: string): void {
    const detail = this.getTaskDetail(taskId);
    const basicInfo = this.getTaskBasicInfo(taskId);
    if (!detail || !basicInfo) return;

    const currentStage = basicInfo.currentStage;
    const currentRound = basicInfo.currentRound;
    const nextRound = currentRound + 1;

    // 更新任务基本信息
    const tasks = this.getTaskList();
    const taskIndex = tasks.findIndex(t => t.taskId === taskId);
    if (taskIndex !== -1) {
      tasks[taskIndex].currentRound = nextRound;
      this.saveTaskList(tasks);
    }

    // 更新阶段进度
    const stageProgress = detail.stageProgress[currentStage];
    if (stageProgress) {
      stageProgress.currentRound = nextRound;
      stageProgress.roundScores = stageProgress.roundScores || [];
      stageProgress.roundScores.push(0); // 初始化新回合积分
    }

    // 设置回合CD
    const roundCD = this.getRandomRoundCD();
    detail.timers.roundCD = new Date(Date.now() + roundCD).toISOString();

    this.updateTaskProgress(taskId, detail);
  }

  // 获取库内容
  getLibraryContent(libraryName: string): string[] {
    const mockData = this.getMockData();
    return mockData.libraries[libraryName] || [];
  }

  // 开始Z倒计时
  startZTimer(taskId: string): void {
    const detail = this.getTaskDetail(taskId);
    if (!detail) return;

    const zDuration = this.getRandomZTime() * 60 * 1000; // 转换为毫秒
    detail.timers.zCD = new Date(Date.now() + zDuration).toISOString();
    this.updateTaskProgress(taskId, detail);
  }

  // 恢复上次状态
  resumeFromLastState(taskId: string): TaskDetail | null {
    const detail = this.getTaskDetail(taskId);
    if (!detail) return null;

    // 检查所有倒计时状态
    this.checkAndUpdateTimers(detail);
    return detail;
  }

  // 私有方法
  private getTaskBasicInfo(taskId: string): TaskBasicInfo | undefined {
    return this.getTaskList().find(t => t.taskId === taskId);
  }

  private updateTaskBasicInfo(taskId: string): void {
    const detail = this.getTaskDetail(taskId);
    const basicInfo = this.getTaskBasicInfo(taskId);
    if (!detail || !basicInfo) return;

    const tasks = this.getTaskList();
    const taskIndex = tasks.findIndex(t => t.taskId === taskId);
    if (taskIndex !== -1) {
      // 更新积分
      tasks[taskIndex].score = this.calculateTotalScore(detail);
      this.saveTaskList(tasks);
    }
  }

  private calculateTotalScore(detail: TaskDetail): number {
    let total = 0;
    Object.values(detail.stageProgress).forEach(stage => {
      if (stage.questionnaireScore) total += stage.questionnaireScore;
      if (stage.roundScores) total += stage.roundScores.reduce((sum, score) => sum + score, 0);
    });
    return total;
  }

  private getAvailableLibrariesForStage(stage: number): string[] {
    const mockData = this.getMockData();
    const libraries = Object.keys(mockData.libraries);
    return libraries.filter(lib => lib.includes(`S${stage}`) || lib.includes('开场') || lib.includes('离库'));
  }

  private updateDialogFlow(taskId: string, question: string, choice: string): void {
    // 根据文档逻辑处理对话框流程
    // 这里实现复杂的问1/问2/问3逻辑判断
  }

  private getRandomZTime(): number {
    const settings = this.getUserState().settings;
    const min = settings.zTimeRange[0];
    const max = settings.zTimeRange[1];
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  private getRandomStageCD(): number {
    // 3-5天随机CD
    const minDays = 3;
    const maxDays = 5;
    const days = Math.floor(Math.random() * (maxDays - minDays + 1)) + minDays;
    return days * 24 * 60 * 60 * 1000;
  }

  private getRandomRoundCD(): number {
    // 回合CD，根据阶段不同而变化
    return 30 * 60 * 1000; // 30分钟默认
  }

  private checkAndUpdateTimers(detail: TaskDetail): void {
    const now = Date.now();
    Object.keys(detail.timers).forEach(timerKey => {
      const timer = detail.timers[timerKey as keyof typeof detail.timers];
      if (timer && new Date(timer).getTime() <= now) {
        detail.timers[timerKey as keyof typeof detail.timers] = null;
      }
    });
  }

  private createDefaultMockData(): MockData {
    return {
      questionnaire: {
        questions: [
          {
            id: 'q1',
            title: '有对方微信或其他线上可交流方式吗？',
            options: [
              { value: 'A', text: '是', score: 0 },
              { value: 'B', text: '否', score: 0 }
            ]
          },
          {
            id: 'q2', 
            title: '需要让对方见不到您20天左右。其中前10天左右什么也不用做，后10天左右请根据之后指引操作，确定可以开始并准备好之后请选"是"',
            options: [
              { value: 'A', text: '是', score: 4 },
              { value: 'B', text: '否', score: 0 }
            ]
          }
        ]
      },
      libraries: {
        '开场库S1': ['开场内容1', '开场内容2@后续'],
        '内容库S1': ['内容1', '内容2@Z@后续', '内容3@D'],
        '离库S1': ['离开内容1', '离开内容2'],
        '对方找库S2': ['对方找内容1', '对方找内容2']
      },
      promptBoards: {
        'S1': '提示板S1内容',
        'S2': '提示板S2内容'
      },
      timerSettings: {
        zTimeRange: [3, 7],
        roundTimeout: 40,
        copyCooldown: 2,
        stageCDRange: [3, 5]
      }
    };
  }
}

export const familiarStorage = new FamiliarLocalStorage();
export type { TaskBasicInfo, TaskDetail, MockData, UserState };