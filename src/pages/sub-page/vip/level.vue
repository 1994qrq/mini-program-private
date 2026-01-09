<template>
  <view class="page">
    <!-- 自定义导航栏 -->
    <view class="navbar" :style="{ paddingTop: data.statusBarHeight + 'px' }">
      <view class="navbar-content">
        <view class="nav-left" @click="goBack">
          <text class="back-icon">‹</text>
        </view>
        <view class="nav-title">我的会员等级</view>
        <view class="nav-right">
          <text class="icon-menu">⋯</text>
          <text class="icon-help">◉</text>
        </view>
      </view>
    </view>

    <!-- 内容区域 -->
    <view class="content" :style="{ paddingTop: (44 + data.statusBarHeight) + 'px' }">
      <!-- 用户信息 -->
      <view class="user-header">
        <view class="avatar">
          <md-icon type="bg" name="apple"></md-icon>
        </view>
        <view class="user-info">
          <text class="username">{{ data.info?.nickname || '李晓李晓' }}</text>
        </view>
        <view class="level-badge">
          <text>会员等级：{{ data.info?.userLevel || 'X' }}</text>
        </view>
      </view>

      <!-- 会员卡片 -->
      <view class="vip-card">
        <view class="card-bg">
          <view class="card-content">
            <view class="card-left">
              <text class="card-label">我的会员等级</text>
              <text class="vip-level">VIP 等级{{ data.info?.userLevel || 'X' }}</text>
              <text class="upgrade-tip">
                距离下一级会员还需{{ formatMoney(data.nextLevelMoney) }}
                {{ Math.floor(data.nextLevelMoney / 100) }}个金币
              </text>
              <view class="coin-info">
                <text class="coin-label">我的金币</text>
                <text class="coin-value">{{ formatMoney(data.info?.remainingVirtual || 0) }}</text>
              </view>
            </view>
            <view class="card-right">
              <view class="crown-icon">
                <md-icon type="bg" name="home/vip" width="120" height="120"></md-icon>
              </view>
            </view>
          </view>
          <view class="card-actions">
            <view class="action-btn" @click="handleRecharge">
              <text>去充值</text>
            </view>
            <view class="action-btn" @click="handlePrivilege">
              <text>我的特权</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 等级进度条 -->
      <view class="level-progress">
        <view class="progress-line"></view>
        <view class="levels">
          <view
            v-for="level in data.levels"
            :key="level.value"
            class="level-item"
            :class="{ active: level.value <= (data.info?.userLevel || 1) }">
            <view class="level-circle">
              <text>V{{ level.value }}</text>
            </view>
            <view class="level-desc">
              <text>{{ level.label1 }}</text>
              <text>{{ level.label2 }}</text>
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { reactive } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import api from '@/api/index';

const data = reactive<any>({
  statusBarHeight: uni.getWindowInfo().statusBarHeight || 0,
  info: {},
  nextLevelMoney: 0,
  levels: [
    { value: 1, label1: '文字待定', label2: '文字待定' },
    { value: 2, label1: '文字待定', label2: '文字待定' },
    { value: 3, label1: '文字待定', label2: '文字待定' },
    { value: 4, label1: '文字待定', label2: '文字待定' },
    { value: 5, label1: '文字待定', label2: '文字待定' },
  ],
});

// 格式化金额
const formatMoney = (money: number): string => {
  if (!money) return '0';
  return money.toLocaleString('zh-CN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  });
};

// 计算下一级所需金额
const getNextLevelMoney = (currentLevel: number, currentMoney: number): number => {
  const levelRequirements = [0, 1000, 5000, 10000, 50000, 100000, 500000, 1000000];
  const nextLevelRequirement = levelRequirements[currentLevel] || levelRequirements[levelRequirements.length - 1];
  return Math.max(0, nextLevelRequirement - currentMoney);
};

// 获取会员信息
const getVipInfo = async () => {
  try {
    const res = await api.common.info();
    data.info = res.data;

    if (data.info?.userLevel && data.info?.accumulateMoney !== undefined) {
      data.nextLevelMoney = getNextLevelMoney(data.info.userLevel, data.info.accumulateMoney);
    }
  } catch (error) {
    console.error('获取会员信息失败:', error);
  }
};

// 返回
const goBack = () => {
  uni.navigateBack();
};

// 去充值
const handleRecharge = () => {
  uni.navigateTo({
    url: '/pages/recharge/index'
  });
};

// 我的特权
const handlePrivilege = () => {
  uni.showToast({
    title: '特权功能开发中...',
    icon: 'none',
    duration: 2000
  });
};

onLoad(() => {
  getVipInfo();
});
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: linear-gradient(180deg, #2c2c2c 0%, #1a1a1a 100%);
}

/* 导航栏 */
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  background: rgba(44, 44, 44, 0.95);
}

.navbar-content {
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 32rpx;
}

.nav-left {
  width: 80rpx;
}

.back-icon {
  font-size: 60rpx;
  color: #fff;
  font-weight: 300;
}

.nav-title {
  flex: 1;
  text-align: center;
  font-size: 32rpx;
  color: #fff;
  font-weight: 500;
}

.nav-right {
  width: 80rpx;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 20rpx;
}

.icon-menu, .icon-help {
  font-size: 44rpx;
  color: #fff;
}

/* 内容区域 */
.content {
  padding: 40rpx 30rpx;
}

/* 用户信息 */
.user-header {
  display: flex;
  align-items: center;
  margin-bottom: 40rpx;
}

.avatar {
  width: 120rpx;
  height: 120rpx;
  border-radius: 50%;
  overflow: hidden;
  background: #fff;
  margin-right: 24rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.user-info {
  flex: 1;
}

.username {
  font-size: 36rpx;
  color: #fff;
  font-weight: 600;
}

.level-badge {
  padding: 8rpx 24rpx;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 999rpx;

  text {
    font-size: 24rpx;
    color: #fff;
  }
}

/* 会员卡片 */
.vip-card {
  margin-bottom: 80rpx;
}

.card-bg {
  background: linear-gradient(135deg, #f4d7a8 0%, #e8c896 50%, #d4b585 100%);
  border-radius: 32rpx;
  padding: 48rpx 36rpx 32rpx;
  box-shadow: 0 16rpx 48rpx rgba(0, 0, 0, 0.3);
  position: relative;
  overflow: hidden;
}

.card-bg::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -20%;
  width: 300rpx;
  height: 300rpx;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
}

.card-content {
  display: flex;
  justify-content: space-between;
  margin-bottom: 40rpx;
}

.card-left {
  flex: 1;
}

.card-label {
  display: block;
  font-size: 26rpx;
  color: #8b6f47;
  margin-bottom: 12rpx;
}

.vip-level {
  display: block;
  font-size: 48rpx;
  font-weight: 800;
  color: #2c2c2c;
  margin-bottom: 20rpx;
  letter-spacing: 2rpx;
}

.upgrade-tip {
  display: block;
  font-size: 24rpx;
  color: #6b5638;
  margin-bottom: 32rpx;
}

.coin-info {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.coin-label {
  font-size: 26rpx;
  color: #8b6f47;
}

.coin-value {
  font-size: 44rpx;
  font-weight: 700;
  color: #2c2c2c;
}

.card-right {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 200rpx;
}

.crown-icon {
  width: 160rpx;
  height: 160rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(44, 44, 44, 0.8);
  border-radius: 50%;
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.2);
}

.card-actions {
  display: flex;
  gap: 24rpx;
  justify-content: center;
}

.action-btn {
  flex: 1;
  height: 72rpx;
  background: transparent;
  border: 2rpx solid rgba(139, 111, 71, 0.3);
  border-radius: 36rpx;
  display: flex;
  align-items: center;
  justify-content: center;

  text {
    font-size: 28rpx;
    color: #2c2c2c;
    font-weight: 500;
  }
}

/* 等级进度条 */
.level-progress {
  position: relative;
  padding-top: 40rpx;
}

.progress-line {
  position: absolute;
  top: 70rpx;
  left: 10%;
  right: 10%;
  height: 4rpx;
  background: rgba(255, 255, 255, 0.2);
}

.levels {
  display: flex;
  justify-content: space-between;
  padding: 0 5%;
}

.level-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16rpx;
}

.level-circle {
  width: 96rpx;
  height: 96rpx;
  border-radius: 50%;
  background: rgba(212, 181, 133, 0.3);
  border: 4rpx solid rgba(212, 181, 133, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 2;

  text {
    font-size: 28rpx;
    color: rgba(255, 255, 255, 0.6);
    font-weight: 600;
  }
}

.level-item.active .level-circle {
  background: linear-gradient(135deg, #f4d7a8 0%, #d4b585 100%);
  border-color: #f4d7a8;
  box-shadow: 0 8rpx 24rpx rgba(244, 215, 168, 0.4);

  text {
    color: #2c2c2c;
  }
}

.level-desc {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4rpx;

  text {
    font-size: 20rpx;
    color: rgba(255, 255, 255, 0.5);
  }
}

.level-item.active .level-desc text {
  color: rgba(255, 255, 255, 0.8);
}
</style>
