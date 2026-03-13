<template>
  <md-page title="个人中心" :showLeft="false">
    <view class="container">
      <!-- 个人信息头部 -->
      <view class="header" @click="handleProfileClick">
        <view class="avatar">
          <md-icon type="bg" name="apple"></md-icon>
        </view>
        <view class="info">
          <view class="row">
            <text class="nickname">{{ displayNickname }}</text>
            <text class="arrow">›</text>
          </view>
          <view class="member-number">会员编号: {{ data.info?.memberNumber || '013919' }}</view>
          <view class="labels">
            <text class="chip">预留标签</text>
            <bc-vip :level="data.info?.userLevel" />
          </view>
        </view>
      </view>

      <!-- 统计卡片 -->
      <view class="stats">
        <view class="card" @click="handleMemberCardClick">
          <view class="card-title">我的会员等级</view>
          <view class="card-main">
            <text class="vip-level">VIP等级 {{ data.info?.userLevel ?? 2 }}</text>
          </view>
          <view class="card-sub">
            距离下一级会员还有
            <text class="num">{{ formatMoney(data.info?.nextLevelMoney || 0) }}</text>
          </view>
          <view class="card-arrow">→</view>
        </view>

        <view class="card" @click="handleRechargeClick">
          <view class="card-title">我的心币</view>
          <view class="card-main">
            <text class="coin">{{ formatMoney(data.info?.remainingVirtual || 0) }}</text>
          </view>
          <view class="card-sub link">去充值</view>
        </view>
      </view>

      <!-- 列表项 -->
      <view class="list">
        <view class="item" @click="handlePrivilegeClick">
          <view class="left">
            <view class="icon-badge">💎</view>
            <text>我的特权</text>
          </view>
          <text class="chevron">›</text>
        </view>
      </view>
    </view>
  </md-page>
  <bottom-tab-bar :current="4" />
</template>

<script setup lang="ts">
import { reactive, computed } from 'vue';
import { onShow } from '@dcloudio/uni-app';
// 接口
import api from '@/api/index';

const data = reactive<any>({
  info: {},
});

// 计算显示的昵称：优先使用后端昵称，其次本地昵称，最后默认值
const displayNickname = computed(() => {
  // 优先使用后端返回的昵称
  if (data.info?.nickname) {
    return data.info.nickname;
  }
  // 其次使用本地存储的昵称
  const localNickname = uni.getStorageSync('userNickname');
  if (localNickname) {
    return localNickname;
  }
  // 最后使用默认昵称
  return '牛大胆';
});

/**
 * 工具函数
 */
// 格式化金额，只显示数值，不显示单位
const formatMoney = (money: number): string => {
  if (!money) return '0';
  return money.toLocaleString('zh-CN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  });
};

/**
 * 接口相关
 */
// 获取会员信息
const getVipInfo = async () => {
  try {
    const res = await api.common.info();
    data.info = res.data;
    console.log('会员信息:', data.info);

    // 计算距离下一级还需要的金额
    if (data.info?.userLevel && data.info?.accumulateMoney !== undefined) {
      // 这里需要根据实际情况计算下一级所需金额
      // 暂时使用示例数据，实际应该根据等级规则计算
      const nextLevelMoney = getNextLevelMoney(data.info.userLevel, data.info.accumulateMoney);
      data.info.nextLevelMoney = nextLevelMoney;
    }
  } catch (error) {
    console.error('获取会员信息失败:', error);
  }
};

// 计算下一级所需金额（示例函数，需要根据实际情况调整）
const getNextLevelMoney = (currentLevel: number, currentMoney: number): number => {
  // 这里应该根据实际的等级规则计算
  // 示例：每级需要10000元，返回差额
  const levelRequirements = [0, 1000, 5000, 10000, 50000, 100000, 500000, 1000000]; // 各级所需累计金额
  const nextLevelRequirement = levelRequirements[currentLevel] || levelRequirements[levelRequirements.length - 1];
  return Math.max(0, nextLevelRequirement - currentMoney);
};

onShow(() => {
  // 只有在已登录的情况下才获取会员信息
  const token = uni.getStorageSync('token');
  if (token) {
    console.log('[个人中心] 用户已登录，获取会员信息');
    getVipInfo();
  } else {
    console.log('[个人中心] 用户未登录，跳过会员信息获取');
    // 未登录时跳转到登录页
    uni.navigateTo({
      url: '/pages/login/index',
    });
  }
});

/**
 * 事件处理函数
 */
// 会员卡片点击
const handleMemberCardClick = () => {
  console.log('点击会员卡片');
  uni.navigateTo({
    url: '/pages/sub-page/vip/level'
  });
};

// 充值点击
const handleRechargeClick = () => {
  console.log('点击充值, 用户VIP等级:', data.info?.userLevel);

  // 如果用户是游客/来宾（VIP等级<1），显示提示
  if (!data.info?.userLevel || data.info.userLevel < 1) {
    uni.showModal({
      title: '提示',
      content: '充值即可升级为会员',
      confirmText: '立即充值',
      cancelText: '取消',
      success: (res) => {
        if (res.confirm) {
          // 用户点击确认，跳转到充值页面
          uni.navigateTo({
            url: '/pages/recharge/index'
          });
        }
      }
    });
    return;
  }

  // 已经是会员，直接跳转充值页面
  uni.navigateTo({
    url: '/pages/recharge/index'
  });
};

// 特权点击
const handlePrivilegeClick = () => {
  console.log('点击我的特权');
  uni.showToast({
    title: '特权功能开发中...',
    icon: 'none',
    duration: 2000
  });
};

// 个人信息点击
const handleProfileClick = () => {
  console.log('点击个人信息');
  uni.showToast({
    title: '个人信息功能开发中...',
    icon: 'none',
    duration: 2000
  });
};
</script>

<style lang="scss" scoped>
.container {
  padding: 30rpx;
  min-height: 100vh;
  box-sizing: border-box;
  background: linear-gradient(180deg, #eef0ff 0%, #f8f9ff 60%, #ffffff 100%);
}

/* 头部资料卡 */
.header {
  display: flex;
  align-items: center;
  padding: 28rpx;
  border-radius: 24rpx;
  background: linear-gradient(180deg, #f0f3ff 0%, #ffffff 100%);
  box-shadow: 0 12rpx 24rpx rgba(36,36,36,0.06);
}
.avatar {
  width: 120rpx;
  height: 120rpx;
  border-radius: 50%;
  overflow: hidden;
  margin-right: 24rpx;
  background: #fff;
  box-shadow: 0 8rpx 20rpx rgba(36,36,36,0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  /* 让 md-icon 自适应 */
  :deep(.md-icon), :deep(svg) { width: 100%; height: 100%; }
}
.info { flex: 1; }
.row {
  display: flex;
  align-items: center;
  margin-bottom: 12rpx;
}
.member-number {
  font-size: 24rpx;
  color: #666;
  margin-bottom: 12rpx;
}
.nickname {
  font-size: 36rpx;
  font-weight: 600;
  color: #1f1f1f;
}
.arrow {
  margin-left: 12rpx;
  font-size: 40rpx;
  color: #999;
}
.labels {
  display: flex;
  align-items: center;
  gap: 16rpx;
}
.chip {
  padding: 6rpx 16rpx;
  background: #f2f3f5;
  border-radius: 999rpx;
  color: #666;
  font-size: 22rpx;
}

/* 中部统计卡 */
.stats {
  display: flex;
  gap: 20rpx;
  margin-top: 24rpx;
}
.card {
  flex: 1;
  background: #fff;
  border-radius: 20rpx;
  padding: 24rpx;
  box-shadow: 0 12rpx 32rpx rgba(36,36,36,0.08);
  position: relative;
}
.card-title {
  font-size: 26rpx;
  color: #6b6b6b;
  margin-bottom: 12rpx;
}
.card-main {
  display: flex;
  align-items: baseline;
  gap: 8rpx;
  margin-bottom: 12rpx;
}
.vip-level {
  font-size: 30rpx;
  font-weight: 700;
  color: #1f1f1f;
}
.coin {
  font-size: 40rpx;
  font-weight: 800;
  color: #f0c200; /* 近似截图的金色 */
}
.card-sub {
  font-size: 24rpx;
  color: #8c8c8c;
}
.card-sub .num { font-weight: 700; color: #1f1f1f; }
.card-sub.link { color: #6b6b6b; }
.card-arrow {
  position: absolute;
  right: 20rpx;
  bottom: 20rpx;
  color: #bfbfbf;
  font-size: 28rpx;
}

/* 列表 */
.list {
  margin-top: 28rpx;
  background: #fff;
  border-radius: 20rpx;
  box-shadow: 0 12rpx 24rpx rgba(36,36,36,0.06);
}
.item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 28rpx;
  border-bottom: 1rpx solid #f0f0f0;
}
.item:last-child { border-bottom: none; }
.left { display: flex; align-items: center; gap: 16rpx; color: #1f1f1f; }
.icon-badge {
  width: 40rpx;
  height: 40rpx;
  border-radius: 20rpx;
  background: #f6f0ff;
  color: #7a5cff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 26rpx;
}
.chevron { color: #bfbfbf; font-size: 36rpx; }
</style>
