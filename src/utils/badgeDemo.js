import { useTabBadge } from '@/composables/useTabBadge';

// 使用示例
export function demoBadgeUsage() {
  const { setBadge, showDot, hideBadge } = useTabBadge();

  // 示例1：设置消息数量为5
  setBadge('message', 5);

  // 示例2：显示红点（不显示数字）
  showDot('task');

  // 示例3：隐藏badge
  hideBadge('my');

  // 示例4：模拟收到新消息
  setTimeout(() => {
    setBadge('message', 3);
  }, 2000);
}

// 在页面中检测内容更新并设置badge
export function checkContentUpdate() {
  const { setBadge, showDot } = useTabBadge();

  // 检查消息列表
  const hasNewMessage = checkNewMessages(); // 你的业务逻辑
  if (hasNewMessage) {
    setBadge('message', hasNewMessage);
  }

  // 检查任务更新
  const hasTaskUpdate = checkTaskUpdates(); // 你的业务逻辑
  if (hasTaskUpdate) {
    showDot('task'); // 只显示红点
  }

  // 检查其他更新...
}

// 模拟函数 - 需要替换为实际业务逻辑
function checkNewMessages() {
  // 这里应该是实际的API调用或本地数据检查
  return Math.floor(Math.random() * 10); // 随机返回0-9条消息
}

function checkTaskUpdates() {
  // 这里应该是实际的业务逻辑
  return Math.random() > 0.5; // 随机返回是否有更新
}

// 在页面加载时调用
export function initBadgeSystem() {
  // 初始检查
  checkContentUpdate();

  // 可以设置定时检查
  setInterval(() => {
    checkContentUpdate();
  }, 30000); // 每30秒检查一次
}