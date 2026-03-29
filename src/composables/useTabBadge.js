import { ref } from 'vue';

const TAB_BADGE_STORAGE_KEY = 'tab_badges_state';
const DEFAULT_TAB_BADGES = {
  task: 2,
  describe: 2,
  index: 2,
  message: 2,
  my: 2,
};

const loadBadgeState = () => {
  try {
    const saved = uni.getStorageSync(TAB_BADGE_STORAGE_KEY);
    if (saved && typeof saved === 'object') {
      return {
        ...DEFAULT_TAB_BADGES,
        ...saved,
      };
    }
  } catch (error) {
    console.error('[useTabBadge] 读取红点状态失败:', error);
  }
  return { ...DEFAULT_TAB_BADGES };
};

const saveBadgeState = () => {
  try {
    uni.setStorageSync(TAB_BADGE_STORAGE_KEY, { ...tabBadges.value });
  } catch (error) {
    console.error('[useTabBadge] 保存红点状态失败:', error);
  }
};

const tabBadges = ref(loadBadgeState());

const isLoggedIn = () => {
  return !!uni.getStorageSync('token');
};

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
      saveBadgeState();
    }
  };

  // 显示红点（不显示数字）
  const showDot = (tabName) => {
    if (tabBadges.value.hasOwnProperty(tabName)) {
      tabBadges.value[tabName] = true;
      saveBadgeState();
    }
  };

  // 隐藏badge
  const hideBadge = (tabName) => {
    if (tabBadges.value.hasOwnProperty(tabName)) {
      tabBadges.value[tabName] = 0;
      saveBadgeState();
    }
  };

  // 获取badge值
  const getBadge = (tabName) => {
    return tabBadges.value[tabName] || 0;
  };

  const resetBadges = () => {
    tabBadges.value = { ...DEFAULT_TAB_BADGES };
    saveBadgeState();
  };

  // 获取所有badge状态（用于tab-bar组件）
  const getAllBadges = () => {
    // 如果未登录，所有badge都为0
    if (!isLoggedIn()) {
      return {
        task: 0,
        describe: 0,
        index: 0,
        message: 0,
        my: 0,
      };
    }

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
    resetBadges,
    tabBadges,
  };
}