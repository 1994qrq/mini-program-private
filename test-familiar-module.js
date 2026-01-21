#!/usr/bin/env node
/**
 * 熟悉模块核心功能测试脚本
 * 直接在Node.js环境中运行，无需浏览器
 */

// ==================== 模拟 uni-app API ====================
const mockStorage = {};
const uni = {
  getStorageSync: (key) => {
    const val = mockStorage[key];
    return val !== undefined ? JSON.parse(JSON.stringify(val)) : null;
  },
  setStorageSync: (key, value) => {
    mockStorage[key] = JSON.parse(JSON.stringify(value));
  },
  removeStorageSync: (key) => {
    delete mockStorage[key];
  }
};

// ==================== 模拟配置函数 ====================
function getCountdownTimeMs(ms) { return ms; }
function getCountdownDays(days) { return days; }
function getCountdownHours(hours) { return hours; }
function getCountdownMinutes(minutes) { return minutes; }

// ==================== 核心功能实现（从 familiar-local.ts 提取） ====================
const VERSION = 1;

function get(k) {
  try {
    return uni.getStorageSync(k);
  } catch {
    return null;
  }
}

function set(k, v) {
  try {
    uni.setStorageSync(k, v);
  } catch {}
}

function remove(k) {
  try {
    uni.removeStorageSync(k);
  } catch {}
}

function randInt(min, max) {
  if (min >= max) return min;
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function initDefaults() {
  const ver = get("fm:stateVersion");
  if (!ver) set("fm:stateVersion", VERSION);

  if (!get("fm:settings")) {
    const settings = {
      cd: {
        bigRoundMinMs: getCountdownTimeMs(24 * 60 * 60 * 1000),
        stageMinDays: {
          "1-2": getCountdownDays(3),
          "2-3": getCountdownDays(0),
          "3-4": getCountdownDays(3)
        },
        zDurationByStage: {
          0: { minMs: 0, maxMs: 0 },
          1: { minMs: getCountdownTimeMs(2 * 60 * 1000), maxMs: getCountdownTimeMs(4 * 60 * 1000) },
          2: { minMs: getCountdownTimeMs(3 * 60 * 1000), maxMs: getCountdownTimeMs(6 * 60 * 1000) },
          3: { minMs: getCountdownTimeMs(3 * 60 * 1000), maxMs: getCountdownTimeMs(7 * 60 * 1000) },
          4: { minMs: 0, maxMs: 0 },
        },
        smallCopyCdMs: getCountdownTimeMs(2000),
        idleWarnMs: getCountdownTimeMs(40 * 60 * 1000),
        idleForceCdMs: getCountdownTimeMs(2 * 60 * 60 * 1000),
        opponentFindWaitMs: getCountdownTimeMs(60 * 60 * 1000),
        opponentFindCopyEnableMs: getCountdownTimeMs(10 * 60 * 1000),
      },
      vip: { levels: [{ level: 0, qaMaxItems: 2 }, { level: 1, qaMaxItems: 3 }, { level: 2, qaMaxItems: 4 }] },
      stageThresholdX: { 0: 10, 1: 2, 2: 3, 3: 3, 4: 0 },
    };
    set("fm:settings", settings);
  }

  if (!get("fm:libs")) {
    const mkText = (id, text, splitBy) => ({ id, text, type: "text", splitBy });
    const mkZ = (id, text) => ({ id, text, type: "Z" });
    const mkD = (id, text) => ({ id, text, type: "D" });

    const libs = {
      opening: {},
      content: {
        S1: [[mkText("c1-1", "内容S1", "@"), mkZ("c1-z", "Z1")]],
        S2: [[mkText("c2-1", "内容S2", "@")]],
        S3: [[mkText("c3-1", "内容S3", "@")]],
        S4: [[mkText("c4-1", "内容S4", "@")]],
        S5: [[mkText("c5-1", "内容S5", "@")]],
        "S4.5": [[mkText("c4.5-1", "内容S4.5", "@")]],
      },
      leaving: {
        S1: [[mkText("l1-1", "离库S1", "@")]],
        S2: [[mkText("l2-1", "离库S2", "@")]],
        S3: [[mkText("l3-1", "离库S3", "@")]],
        "S3.5": [[mkText("l3.5-1", "离库S3.5", "@")]],
      },
      opponent: {
        S2: [[mkText("op2-1", "对方找S2", "@")]],
      },
      qa: {},
      questionnaire: {
        thresholdX: 10,
        questions: [
          { id: "q1", title: "问题1", options: [{ id: "A", text: "A", score: 0 }, { id: "B", text: "B", score: 0 }] },
          { id: "q2", title: "问题2", options: [{ id: "A", text: "A", score: 4 }, { id: "B", text: "B", score: 0 }] },
          { id: "q3", title: "问题3", options: [{ id: "A", text: "A", score: 6 }, { id: "B", text: "B", score: 10 }] },
          { id: "q4", title: "问题4", options: [{ id: "A", text: "A", score: 0 }] },
          { id: "q5", title: "问题5", options: [{ id: "A", text: "A", score: 0 }] },
        ],
      },
    };
    set("fm:libs", libs);
  }

  if (!get("fm:tasks")) set("fm:tasks", []);
}

function genId() {
  return "fm_" + Date.now() + "_" + Math.floor(Math.random() * 10000);
}

function createTask(payload) {
  initDefaults();
  const { name, durationDays } = payload;
  if (!name || name.trim().length === 0 || name.trim().length > 6) {
    return { ok: false, reason: "名称需1-6字" };
  }
  const id = genId();
  const now = Date.now();
  const expireAt = now + durationDays * 24 * 60 * 60 * 1000;
  const settings = get("fm:settings");
  const vipMax = settings.vip.levels[0].qaMaxItems;

  const task = {
    id,
    name: name.trim(),
    createdAt: now,
    durationDays,
    expireAt,
    isRestartHalfPrice: false,
    status: "active",
    stageIndex: 0,
    roundIndex: null,
    stepIndex: 0,
    stageScore: 0,
    totalScore: 0,
    stageThresholdX: settings.stageThresholdX[0],
    roundCdUnlockAt: null,
    stageCdUnlockAt: null,
    zUnlockAt: null,
    dMode: false,
    opponentFindUnlockAt: null,
    opponentFindCopyUnlockAt: null,
    idleWarningAt: null,
    hardIdleToCdAt: null,
    lastActionAt: now,
    usedLibIdsByStage: {},
    currentLibChain: null,
    opponentFindUsedInRound: false,
    qaVipMaxItems: vipMax,
    questionnaire: { answers: [], totalScore: 0, routedModule: "familiar" },
    prompts: {},
    askFlow: {},
    renewHistory: [],
    listBadge: "聊天任务进行中",
    listCountdownEndAt: null,
  };

  const ids = get("fm:tasks") || [];
  ids.push(id);
  set("fm:tasks", ids);
  set(`fm:task:${id}`, task);
  return { ok: true, task };
}

function getTask(taskId) {
  initDefaults();
  const t = get(`fm:task:${taskId}`);
  return t || null;
}

function saveQuestionnaireAnswer(taskId, questionId, optionId) {
  initDefaults();
  const t = getTask(taskId);
  if (!t) return;
  const libs = get("fm:libs");
  const q = libs.questionnaire.questions.find((x) => x.id === questionId);
  if (!q) return;
  const opt = q.options.find((o) => o.id === optionId);
  const score = opt ? opt.score : 0;

  const idx = t.questionnaire.answers.findIndex((a) => a.questionId === questionId);
  if (idx >= 0) t.questionnaire.answers[idx] = { questionId, optionId, score };
  else t.questionnaire.answers.push({ questionId, optionId, score });

  t.questionnaire.totalScore = t.questionnaire.answers.reduce((sum, a) => sum + a.score, 0);
  t.lastActionAt = Date.now();
  set(`fm:task:${taskId}`, t);
}

function submitQuestionnaire(taskId) {
  initDefaults();
  const t = getTask(taskId);
  if (!t) return { routed: "familiar", next: "问1" };
  const libs = get("fm:libs");
  const X = libs.questionnaire.thresholdX;
  const score = t.questionnaire.totalScore;

  let routed = "familiar";
  if (score < X) {
    routed = "familiar";
  }

  t.stageIndex = 0;
  t.stepIndex = 0;
  t.lastActionAt = Date.now();
  set(`fm:task:${taskId}`, t);

  return { routed, next: "问1" };
}

function enterStage1(taskId) {
  initDefaults();
  const t = getTask(taskId);
  if (!t) return { ok: false, reason: "任务不存在" };

  t.stageIndex = 1;
  t.roundIndex = 0;
  t.stepIndex = 0;
  t.stageScore = 0;
  t.stageThresholdX = 2;
  t.status = "active";

  t.stage1 = {
    roundScores: [],
    firstThreeRoundsTotal: 0,
    currentRoundStartTime: null,
    roundAllowedTimeMs: getCountdownTimeMs(30 * 60 * 1000),
    zTimerMs: getCountdownTimeMs(randInt(2 * 60 * 1000, 4 * 60 * 1000)),
    hasUsedOpponentFind: false,
    roundCdMultiplier: 1,
  };

  t.stageCdUnlockAt = null;
  t.listCountdownEndAt = null;
  t.listBadge = "聊天任务进行中";

  set(`fm:task:${taskId}`, t);
  return { ok: true, task: t };
}

function finishStage1Round(taskId, roundScore) {
  initDefaults();
  const t = getTask(taskId);
  if (!t || !t.stage1) return { ok: false, reason: "任务不在第一阶段" };

  const roundNumber = t.roundIndex || 0;

  t.stage1.roundScores[roundNumber - 1] = roundScore;
  t.stageScore += roundScore;
  t.totalScore += roundScore;

  if (roundNumber <= 3) {
    t.stage1.firstThreeRoundsTotal = t.stage1.roundScores.slice(0, 3).reduce((sum, score) => sum + score, 0);
  }

  set(`fm:task:${taskId}`, t);
  return { ok: true, task: t };
}

function checkStage1RoundTransition(taskId) {
  initDefaults();
  const t = getTask(taskId);
  if (!t || !t.stage1) return { ok: false, reason: "任务不在第一阶段" };

  const roundNumber = t.roundIndex || 0;
  const stageScore = t.stageScore;
  const firstThreeRoundsTotal = t.stage1.firstThreeRoundsTotal;

  if (roundNumber === 3) {
    if (stageScore >= t.stageThresholdX) {
      return { ok: true, action: "enterRound4", reason: "前三回合得分足够" };
    }
    return { ok: true, action: "enterRound5", reason: "前三回合得分不足，进入延时回合" };
  } else if (roundNumber === 4) {
    return {
      ok: true,
      action: "enterStageCd",
      reason: "第四回合完成，进入阶段CD",
      stageCdRange: { minDays: 3, maxDays: 5 }
    };
  } else if (roundNumber === 5) {
    if (stageScore === firstThreeRoundsTotal) {
      return { ok: true, action: "enterRound6", reason: "得分相等，进入第六回合" };
    }
    return { ok: true, action: "enterStageCd", reason: "得分不等，进入阶段CD" };
  } else if (roundNumber === 6) {
    if (stageScore === firstThreeRoundsTotal) {
      return { ok: true, action: "showPromptS7", reason: "得分相等，询问是否坚持" };
    }
    return { ok: true, action: "enterStageCd", reason: "得分不等，进入阶段CD" };
  }

  return { ok: true, action: "continue", reason: "继续当前回合" };
}

function addPoint(taskId, amount, source = "other") {
  initDefaults();
  const t = getTask(taskId);
  if (!t) return;
  t.stageScore += amount;
  t.totalScore += amount;
  t.lastActionAt = Date.now();
  set(`fm:task:${taskId}`, t);
}

// ==================== 测试框架 ====================
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
};

let testResults = { passed: 0, failed: 0, total: 0, details: [] };
let currentSuite = '';

function testSuite(name, fn) {
  currentSuite = name;
  console.log(`\n${colors.cyan}${colors.bright}======== ${name} ========${colors.reset}`);
  fn();
}

function testCase(name, fn) {
  testResults.total++;
  const startTime = Date.now();
  try {
    fn();
    const duration = Date.now() - startTime;
    testResults.passed++;
    testResults.details.push({ suite: currentSuite, name, status: 'pass', duration });
    console.log(`${colors.green}✓${colors.reset} ${name} ${colors.gray}(${duration}ms)${colors.reset}`);
  } catch (error) {
    const duration = Date.now() - startTime;
    testResults.failed++;
    testResults.details.push({ suite: currentSuite, name, status: 'fail', duration, error: error.message });
    console.log(`${colors.red}✗${colors.reset} ${name}`);
    console.log(`  ${colors.red}${error.message}${colors.reset} ${colors.gray}(${duration}ms)${colors.reset}`);
  }
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(`断言失败: ${message}`);
  }
}

function assertEqual(actual, expected, message) {
  if (actual !== expected) {
    throw new Error(`${message}\n  期望: ${expected}\n  实际: ${actual}`);
  }
}

// ==================== 测试用例 ====================

console.log(`${colors.bright}${colors.blue}🧪 熟悉模块核心功能测试${colors.reset}\n`);

// 测试套件1: 基本功能
testSuite('基本功能测试', () => {
  testCase('初始化默认配置', () => {
    initDefaults();
    const settings = get('fm:settings');
    assert(settings !== null, '设置应该被初始化');
    assert(settings.stageThresholdX[1] === 2, '第一阶段阈值应为2');
  });

  testCase('创建任务 - 正常情况', () => {
    const result = createTask({ name: '测试任务', durationDays: 5 });
    assert(result.ok === true, '应该创建成功');
    assert(result.task.name === '测试任务', '任务名称应正确');
    assertEqual(result.task.durationDays, 5, '任务天数应正确');
    assertEqual(result.task.stageIndex, 0, '初始阶段应为0');
  });

  testCase('创建任务 - 名称验证（空名称）', () => {
    const result = createTask({ name: '', durationDays: 5 });
    assert(result.ok === false, '空名称应该失败');
  });

  testCase('创建任务 - 名称验证（超长名称）', () => {
    const result = createTask({ name: '超过六个字的名称', durationDays: 5 });
    assert(result.ok === false, '超长名称应该失败');
  });

  testCase('获取任务', () => {
    const createResult = createTask({ name: '任务1', durationDays: 5 });
    const taskId = createResult.task.id;
    const task = getTask(taskId);
    assert(task !== null, '应该能获取任务');
    assertEqual(task.name, '任务1', '任务名称应匹配');
  });
});

// 测试套件2: 问卷流程
testSuite('问卷流程测试', () => {
  let taskId;

  testCase('问卷初始化', () => {
    const result = createTask({ name: '问卷测试', durationDays: 5 });
    taskId = result.task.id;
    const task = getTask(taskId);
    assertEqual(task.questionnaire.totalScore, 0, '初始分数应为0');
    assertEqual(task.questionnaire.answers.length, 0, '初始答案应为空');
  });

  testCase('保存问卷答案', () => {
    saveQuestionnaireAnswer(taskId, 'q1', 'A');
    const task = getTask(taskId);
    assertEqual(task.questionnaire.answers.length, 1, '应该有1个答案');
  });

  testCase('问卷计分 - 达到阈值', () => {
    saveQuestionnaireAnswer(taskId, 'q2', 'A'); // 4分
    saveQuestionnaireAnswer(taskId, 'q3', 'A'); // 6分
    const task = getTask(taskId);
    assertEqual(task.questionnaire.totalScore, 10, '总分应为10分（0+4+6）');
  });

  testCase('问卷提交 - 得分≥阈值', () => {
    const result = submitQuestionnaire(taskId);
    assertEqual(result.routed, 'familiar', '应该路由到熟悉模块');
    assertEqual(result.next, '问1', '下一步应为问1');
  });

  testCase('问卷提交 - 得分<阈值', () => {
    const result2 = createTask({ name: '低分任务', durationDays: 5 });
    const lowScoreTaskId = result2.task.id;
    saveQuestionnaireAnswer(lowScoreTaskId, 'q2', 'A'); // 4分
    const submitResult = submitQuestionnaire(lowScoreTaskId);
    const task = getTask(lowScoreTaskId);
    assert(task.questionnaire.totalScore < 10, '得分应小于阈值10');
  });
});

// 测试套件3: 第一阶段流程
testSuite('第一阶段流程测试', () => {
  let taskId;

  testCase('进入第一阶段', () => {
    const createResult = createTask({ name: '阶段1测试', durationDays: 5 });
    taskId = createResult.task.id;
    const result = enterStage1(taskId);
    assert(result.ok === true, '应该成功进入');
    const task = getTask(taskId);
    assertEqual(task.stageIndex, 1, '阶段应为1');
    assertEqual(task.stageThresholdX, 2, '阈值应为2');
    assert(task.stage1 !== undefined, 'stage1数据应存在');
  });

  testCase('第一阶段数据结构验证', () => {
    const task = getTask(taskId);
    assert(Array.isArray(task.stage1.roundScores), 'roundScores应为数组');
    assertEqual(task.stage1.firstThreeRoundsTotal, 0, '前三回合总分初始为0');
    assertEqual(task.stage1.roundCdMultiplier, 1, 'CD倍数初始为1');
  });

  testCase('完成回合并记录得分', () => {
    const task = getTask(taskId);
    task.roundIndex = 1;
    set(`fm:task:${taskId}`, task);

    finishStage1Round(taskId, 1); // 回合1得1分

    const updatedTask = getTask(taskId);
    assertEqual(updatedTask.stageScore, 1, '阶段得分应为1');
    assertEqual(updatedTask.stage1.roundScores[0], 1, '回合1得分应记录为1');
  });

  testCase('积分累加', () => {
    addPoint(taskId, 1, 'leaving');
    const task = getTask(taskId);
    assertEqual(task.stageScore, 2, '阶段得分应累加到2');
    assertEqual(task.totalScore, 2, '总得分应为2');
  });
});

// 测试套件4: 判分逻辑
testSuite('判分逻辑测试', () => {
  testCase('第3回合后判分 - 得分≥阈值 → 第4回合', () => {
    const result = createTask({ name: '判分1', durationDays: 5 });
    const taskId = result.task.id;
    enterStage1(taskId);

    const task = getTask(taskId);
    task.roundIndex = 3;
    task.stageScore = 2; // 达到阈值
    set(`fm:task:${taskId}`, task);

    const transition = checkStage1RoundTransition(taskId);
    assertEqual(transition.action, 'enterRound4', '应该进入第4回合');
  });

  testCase('第3回合后判分 - 得分<阈值 → 第5回合', () => {
    const result = createTask({ name: '判分2', durationDays: 5 });
    const taskId = result.task.id;
    enterStage1(taskId);

    const task = getTask(taskId);
    task.roundIndex = 3;
    task.stageScore = 1; // 小于阈值2
    set(`fm:task:${taskId}`, task);

    const transition = checkStage1RoundTransition(taskId);
    assertEqual(transition.action, 'enterRound5', '应该进入第5回合（延时）');
  });

  testCase('第4回合后 → 阶段CD', () => {
    const result = createTask({ name: '判分3', durationDays: 5 });
    const taskId = result.task.id;
    enterStage1(taskId);

    const task = getTask(taskId);
    task.roundIndex = 4;
    set(`fm:task:${taskId}`, task);

    const transition = checkStage1RoundTransition(taskId);
    assertEqual(transition.action, 'enterStageCd', '应该进入阶段CD');
    assert(transition.stageCdRange !== undefined, '应该返回CD天数范围');
    assertEqual(transition.stageCdRange.minDays, 3, 'CD最小天数应为3');
    assertEqual(transition.stageCdRange.maxDays, 5, 'CD最大天数应为5');
  });

  testCase('第5回合判分 - 得分相等 → 第6回合', () => {
    const result = createTask({ name: '判分4', durationDays: 5 });
    const taskId = result.task.id;
    enterStage1(taskId);

    const task = getTask(taskId);
    task.roundIndex = 5;
    task.stageScore = 2;
    task.stage1.firstThreeRoundsTotal = 2;
    set(`fm:task:${taskId}`, task);

    const transition = checkStage1RoundTransition(taskId);
    assertEqual(transition.action, 'enterRound6', '得分相等应进入第6回合');
  });

  testCase('第5回合判分 - 得分不等 → 阶段CD', () => {
    const result = createTask({ name: '判分5', durationDays: 5 });
    const taskId = result.task.id;
    enterStage1(taskId);

    const task = getTask(taskId);
    task.roundIndex = 5;
    task.stageScore = 3;
    task.stage1.firstThreeRoundsTotal = 2;
    set(`fm:task:${taskId}`, task);

    const transition = checkStage1RoundTransition(taskId);
    assertEqual(transition.action, 'enterStageCd', '得分不等应进入阶段CD');
  });

  testCase('第6回合判分 - 得分相等 → 提示板S7', () => {
    const result = createTask({ name: '判分6', durationDays: 5 });
    const taskId = result.task.id;
    enterStage1(taskId);

    const task = getTask(taskId);
    task.roundIndex = 6;
    task.stageScore = 2;
    task.stage1.firstThreeRoundsTotal = 2;
    set(`fm:task:${taskId}`, task);

    const transition = checkStage1RoundTransition(taskId);
    assertEqual(transition.action, 'showPromptS7', '应该显示提示板S7');
  });

  testCase('第6回合判分 - 得分不等 → 阶段CD', () => {
    const result = createTask({ name: '判分7', durationDays: 5 });
    const taskId = result.task.id;
    enterStage1(taskId);

    const task = getTask(taskId);
    task.roundIndex = 6;
    task.stageScore = 3;
    task.stage1.firstThreeRoundsTotal = 2;
    set(`fm:task:${taskId}`, task);

    const transition = checkStage1RoundTransition(taskId);
    assertEqual(transition.action, 'enterStageCd', '得分不等应进入阶段CD');
  });
});

// 测试套件5: 边界情况
testSuite('边界情况测试', () => {
  testCase('获取不存在的任务', () => {
    const task = getTask('non-existent-id');
    assert(task === null, '不存在的任务应返回null');
  });

  testCase('重复保存同一问卷答案', () => {
    const result = createTask({ name: '重复答案', durationDays: 5 });
    const taskId = result.task.id;

    saveQuestionnaireAnswer(taskId, 'q1', 'A');
    saveQuestionnaireAnswer(taskId, 'q1', 'A');

    const task = getTask(taskId);
    assertEqual(task.questionnaire.answers.length, 1, '重复答案应该只记录一次');
  });

  testCase('阶段转换时的数据一致性', () => {
    const result = createTask({ name: '数据一致性', durationDays: 5 });
    const taskId = result.task.id;

    const initialTask = getTask(taskId);
    const initialTotalScore = initialTask.totalScore;

    enterStage1(taskId);

    const task = getTask(taskId);
    assertEqual(task.totalScore, initialTotalScore, '进入新阶段不应影响总得分');
    assertEqual(task.stageScore, 0, '阶段得分应重置为0');
  });

  testCase('前三回合总分自动计算', () => {
    const result = createTask({ name: '总分计算', durationDays: 5 });
    const taskId = result.task.id;
    enterStage1(taskId);

    let task = getTask(taskId);
    task.roundIndex = 1;
    set(`fm:task:${taskId}`, task);
    finishStage1Round(taskId, 1);

    task = getTask(taskId);
    task.roundIndex = 2;
    set(`fm:task:${taskId}`, task);
    finishStage1Round(taskId, 0);

    task = getTask(taskId);
    task.roundIndex = 3;
    set(`fm:task:${taskId}`, task);
    finishStage1Round(taskId, 1);

    task = getTask(taskId);
    assertEqual(task.stage1.firstThreeRoundsTotal, 2, '前三回合总分应为2（1+0+1）');
    assertEqual(task.stageScore, 2, '阶段得分应为2');
  });

  testCase('空白名称任务创建', () => {
    const result = createTask({ name: '   ', durationDays: 5 });
    assert(result.ok === false, '空白名称应该创建失败');
  });
});

// ==================== 测试结果汇总 ====================
console.log(`\n${colors.bright}${colors.cyan}========================================${colors.reset}`);
console.log(`${colors.bright}📊 测试结果汇总${colors.reset}\n`);

const passRate = testResults.total > 0
  ? ((testResults.passed / testResults.total) * 100).toFixed(1)
  : 0;

console.log(`总测试数: ${colors.bright}${testResults.total}${colors.reset}`);
console.log(`通过数量: ${colors.green}${colors.bright}${testResults.passed}${colors.reset}`);
console.log(`失败数量: ${colors.red}${colors.bright}${testResults.failed}${colors.reset}`);
console.log(`通过率: ${passRate >= 90 ? colors.green : passRate >= 70 ? colors.yellow : colors.red}${colors.bright}${passRate}%${colors.reset}\n`);

if (testResults.failed === 0) {
  console.log(`${colors.green}${colors.bright}✓ 所有测试通过！${colors.reset} 🎉\n`);
} else {
  console.log(`${colors.red}${colors.bright}✗ 有 ${testResults.failed} 个测试失败${colors.reset}\n`);
  console.log(`${colors.yellow}失败的测试:${colors.reset}`);
  testResults.details.filter(t => t.status === 'fail').forEach(t => {
    console.log(`  ${colors.red}✗${colors.reset} ${t.suite} - ${t.name}`);
    console.log(`    ${colors.gray}${t.error}${colors.reset}`);
  });
  console.log();
}

console.log(`${colors.bright}${colors.cyan}========================================${colors.reset}\n`);

// 退出码
process.exit(testResults.failed > 0 ? 1 : 0);
