import { ref } from 'vue';

// 全局的tab badge状态 - 默认每个tab显示2个红点
const tabBadges = ref({
  task: 2,      // 对话列表
  describe: 2,  // AO
  index: 2,     // 首页
  message: 2,   // 消息列表
  my: 2,        // 我的
});

// Tab索引映射
const tabIndexMap = {
  task: 0,
  describe: 1,
  index: 2,
  message: 3,
  my: 4,
};

export function useTabBadge() {
  // 设置badge数量
  const setBadge = (tabName, count) => {
    if (tabBadges.value.hasOwnProperty(tabName)) {
      tabBadges.value[tabName] = count;
    }
  };

  // 显示红点（不显示数字）
  const showDot = (tabName) => {
    if (tabBadges.value.hasOwnProperty(tabName)) {
      tabBadges.value[tabName] = true;
    }
  };

  // 隐藏badge
  const hideBadge = (tabName) => {
    if (tabBadges.value.hasOwnProperty(tabName)) {
      tabBadges.value[tabName] = 0;
    }
  };

  // 获取badge值
  const getBadge = (tabName) => {
    return tabBadges.value[tabName] || 0;
  };

  // 获取所有badge状态（用于tab-bar组件）
  const getAllBadges = () => {
    const badges = {};
    for (const [name, count] of Object.entries(tabBadges.value)) {
      badges[tabIndexMap[name]] = count;
    }
    return badges;
  };

  return {
    setBadge,
    showDot,
    hideBadge,
    getBadge,
    getAllBadges,
    tabBadges,
  };
}