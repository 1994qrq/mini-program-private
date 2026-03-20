<template>
  <view class="debug-container">
    <view class="debug-header">充值等级提升调试</view>

    <view class="debug-section">
      <view class="section-title">当前用户信息</view>
      <view class="info-item">
        <text class="label">用户ID:</text>
        <text class="value">{{ userInfo.userId || '未获取' }}</text>
      </view>
      <view class="info-item">
        <text class="label">VIP等级:</text>
        <text class="value" :class="levelClass">{{ userInfo.userLevel !== undefined ? `VIP ${userInfo.userLevel}` : '未获取' }}</text>
      </view>
      <view class="info-item">
        <text class="label">心币余额:</text>
        <text class="value">{{ userInfo.remainingVirtual || 0 }}</text>
      </view>
      <view class="info-item">
        <text class="label">累计充值:</text>
        <text class="value">{{ userInfo.accumulateMoney || 0 }} 元</text>
      </view>
      <view class="info-item">
        <text class="label">累计虚拟币:</text>
        <text class="value">{{ userInfo.accumulateVirtual || 0 }}</text>
      </view>
    </view>

    <view class="debug-section">
      <view class="section-title">等级规则</view>
      <view class="level-rules">
        <view v-for="(rule, index) in levelRules" :key="index" class="rule-item" :class="{ active: userInfo.userLevel === index }">
          <text class="rule-level">VIP {{ index }}</text>
          <text class="rule-requirement">{{ rule.requirement }}</text>
        </view>
      </view>
    </view>

    <view class="debug-section">
      <button @click="refreshUserInfo" class="test-btn">刷新用户信息</button>
      <button @click="testPaymentFlow" class="test-btn secondary">模拟支付流程测试</button>
      <button @click="checkBackendUpgrade" class="test-btn secondary">检查后端升级逻辑</button>
    </view>

    <view class="debug-section">
      <view class="section-title">刷新历史</view>
      <scroll-view class="history-list" scroll-y>
        <view v-if="refreshHistory.length === 0" class="empty-state">
          <text>暂无刷新记录</text>
        </view>
        <view v-for="(item, index) in refreshHistory" :key="index" class="history-item">
          <view class="history-time">{{ item.time }}</view>
          <view class="history-data">
            <text class="history-label">等级:</text>
            <text class="history-value" :class="{ changed: item.levelChanged }">VIP {{ item.level }}</text>
            <text class="history-label">余额:</text>
            <text class="history-value" :class="{ changed: item.balanceChanged }">{{ item.balance }}</text>
            <text class="history-label">累计:</text>
            <text class="history-value" :class="{ changed: item.accumulateChanged }">{{ item.accumulate }}元</text>
          </view>
        </view>
      </scroll-view>
    </view>

    <view class="debug-section">
      <view class="section-title">问题诊断</view>
      <view class="diagnosis-list">
        <view class="diagnosis-item" :class="diagnosisStatus.token">
          <text class="diagnosis-icon">{{ diagnosisStatus.token === 'success' ? '✓' : '✗' }}</text>
          <text class="diagnosis-text">Token状态</text>
        </view>
        <view class="diagnosis-item" :class="diagnosisStatus.api">
          <text class="diagnosis-icon">{{ diagnosisStatus.api === 'success' ? '✓' : '✗' }}</text>
          <text class="diagnosis-text">API响应正常</text>
        </view>
        <view class="diagnosis-item" :class="diagnosisStatus.data">
          <text class="diagnosis-icon">{{ diagnosisStatus.data === 'success' ? '✓' : '✗' }}</text>
          <text class="diagnosis-text">数据完整性</text>
        </view>
        <view class="diagnosis-item" :class="diagnosisStatus.upgrade">
          <text class="diagnosis-icon">{{ diagnosisStatus.upgrade === 'success' ? '✓' : '?' }}</text>
          <text class="diagnosis-text">等级升级逻辑</text>
        </view>
      </view>
    </view>

    <view class="debug-section">
      <view class="section-title">调试日志</view>
      <scroll-view class="log-box" scroll-y>
        <text class="log-text">{{ debugLog }}</text>
      </scroll-view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import api from '@/api';
import type { Common } from '@/api/data';
import { VIP_LEVEL_RULES, calculateLevel, formatVirtual } from '@/config/vip-level';

const userInfo = ref<Partial<Common.Info.Data>>({});
const refreshHistory = ref<any[]>([]);
const debugLog = ref('等待操作...\n');
const diagnosisStatus = ref({
  token: 'unknown',
  api: 'unknown',
  data: 'unknown',
  upgrade: 'unknown'
});

// 使用统一的等级规则配置
const levelRules = VIP_LEVEL_RULES.map(rule => ({
  requirement: rule.description
}));

const levelClass = computed(() => {
  const level = userInfo.value.userLevel || 0;
  if (level === 0) return 'level-guest';
  if (level >= 1 && level <= 2) return 'level-low';
  if (level >= 3 && level <= 5) return 'level-mid';
  return 'level-high';
});

const addLog = (message: string) => {
  const time = new Date().toLocaleTimeString();
  debugLog.value += `[${time}] ${message}\n`;
  console.log(`[充值调试] ${message}`);
};

const refreshUserInfo = async () => {
  addLog('开始刷新用户信息...');

  try {
    // 检查Token
    const token = uni.getStorageSync('token');
    if (!token) {
      diagnosisStatus.value.token = 'error';
      addLog('❌ Token不存在，请先登录');
      uni.showToast({ title: '请先登录', icon: 'none' });
      return;
    }
    diagnosisStatus.value.token = 'success';
    addLog('✓ Token存在');

    // 调用API
    addLog('正在调用 /api/member/info 接口...');
    const res = await api.common.info();

    if (res.code === 200) {
      diagnosisStatus.value.api = 'success';
      addLog('✓ API响应成功');

      // 检查数据完整性
      if (res.data && res.data.userId && res.data.userLevel !== undefined) {
        diagnosisStatus.value.data = 'success';
        addLog('✓ 数据完整');

        // 记录历史
        const prevLevel = userInfo.value.userLevel;
        const prevBalance = userInfo.value.remainingVirtual;
        const prevAccumulate = userInfo.value.accumulateMoney;

        userInfo.value = res.data;

        const levelChanged = prevLevel !== undefined && prevLevel !== res.data.userLevel;
        const balanceChanged = prevBalance !== undefined && prevBalance !== res.data.remainingVirtual;
        const accumulateChanged = prevAccumulate !== undefined && prevAccumulate !== res.data.accumulateMoney;

        refreshHistory.value.unshift({
          time: new Date().toLocaleTimeString(),
          level: res.data.userLevel,
          balance: res.data.remainingVirtual,
          accumulate: res.data.accumulateMoney,
          levelChanged,
          balanceChanged,
          accumulateChanged
        });

        // 限制历史记录数量
        if (refreshHistory.value.length > 10) {
          refreshHistory.value = refreshHistory.value.slice(0, 10);
        }

        addLog(`当前等级: VIP ${res.data.userLevel}`);
        addLog(`心币余额: ${formatVirtual(res.data.remainingVirtual)}`);
        addLog(`累计充值: ${res.data.accumulateMoney}元`);
        addLog(`累计心币: ${formatVirtual(res.data.accumulateVirtual)}`);

        if (levelChanged) {
          addLog(`🎉 等级发生变化: VIP ${prevLevel} → VIP ${res.data.userLevel}`);
        }

        // 检查升级逻辑
        checkUpgradeLogic(res.data);

      } else {
        diagnosisStatus.value.data = 'error';
        addLog('❌ 数据不完整');
      }

    } else {
      diagnosisStatus.value.api = 'error';
      addLog(`❌ API返回错误: ${res.message}`);
    }

  } catch (error: any) {
    diagnosisStatus.value.api = 'error';
    addLog(`❌ 请求失败: ${error.message}`);
    console.error('[充值调试] 刷新失败:', error);
  }
};

const checkUpgradeLogic = (data: Common.Info.Data) => {
  addLog('--- 检查升级逻辑 ---');

  const { userLevel, accumulateVirtual } = data;

  // 使用统一的等级计算函数
  const expectedLevel = calculateLevel(accumulateVirtual);

  addLog(`累计充值心币: ${formatVirtual(accumulateVirtual)}`);
  addLog(`当前等级: VIP ${userLevel}`);
  addLog(`预期等级: VIP ${expectedLevel}`);

  if (userLevel === expectedLevel) {
    diagnosisStatus.value.upgrade = 'success';
    addLog('✓ 等级正确');
  } else if (userLevel < expectedLevel) {
    diagnosisStatus.value.upgrade = 'error';
    addLog(`❌ 等级异常: 应该是 VIP ${expectedLevel}，但实际是 VIP ${userLevel}`);
    addLog('⚠️ 可能原因:');
    addLog('  1. 后端升级逻辑未执行');
    addLog('  2. 后端升级规则与前端不一致');
    addLog('  3. 数据库更新失败');
  } else {
    diagnosisStatus.value.upgrade = 'warning';
    addLog(`⚠️ 等级高于预期: 应该是 VIP ${expectedLevel}，但实际是 VIP ${userLevel}`);
  }
};

const testPaymentFlow = async () => {
  addLog('--- 模拟支付流程测试 ---');
  addLog('1. 获取支付前的用户信息');

  await refreshUserInfo();

  addLog('2. 模拟支付成功回调');
  addLog('   (实际支付需要在充值页面完成)');

  addLog('3. 等待2秒后刷新用户信息');
  await new Promise(resolve => setTimeout(resolve, 2000));

  addLog('4. 第1次刷新');
  await refreshUserInfo();

  addLog('5. 等待1秒后再次刷新');
  await new Promise(resolve => setTimeout(resolve, 1000));

  addLog('6. 第2次刷新');
  await refreshUserInfo();

  addLog('7. 等待1秒后最后一次刷新');
  await new Promise(resolve => setTimeout(resolve, 1000));

  addLog('8. 第3次刷新');
  await refreshUserInfo();

  addLog('--- 测试完成 ---');
};

const checkBackendUpgrade = () => {
  addLog('--- 后端升级逻辑检查建议 ---');
  addLog('请联系后端开发人员检查以下内容:');
  addLog('');
  addLog('1. 支付回调处理:');
  addLog('   - 支付成功后是否正确更新 accumulateVirtual（累计心币）');
  addLog('   - 是否触发了等级升级逻辑');
  addLog('');
  addLog('2. 等级升级规则（按累计心币计算）:');
  addLog('   - VIP 0: 默认（游客/来宾）');
  addLog('   - VIP 1: 累计充值 ≥ 1000心币');
  addLog('   - VIP 2: 累计充值 ≥ 5000心币');
  addLog('   - VIP 3: 累计充值 ≥ 10000心币');
  addLog('   - VIP 4: 累计充值 ≥ 50000心币');
  addLog('   - VIP 5: 累计充值 ≥ 100000心币');
  addLog('   - VIP 6: 累计充值 ≥ 500000心币');
  addLog('   - VIP 7: 累计充值 ≥ 1000000心币');
  addLog('');
  addLog('3. 数据库更新:');
  addLog('   - 检查 member 表的 user_level 字段');
  addLog('   - 检查 accumulate_virtual 字段（累计心币）');
  addLog('   - 确认事务是否正确提交');
  addLog('');
  addLog('4. 日志检查:');
  addLog('   - 查看支付回调日志');
  addLog('   - 查看等级升级日志');
  addLog('   - 查看数据库更新日志');

  uni.showModal({
    title: '后端检查建议',
    content: '请查看调试日志中的详细建议，并联系后端开发人员进行检查',
    showCancel: false
  });
};

// 页面加载时自动刷新
refreshUserInfo();
</script>

<style lang="scss" scoped>
.debug-container {
  padding: 30rpx;
  background: #f5f5f5;
  min-height: 100vh;
}

.debug-header {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 30rpx;
  text-align: center;
}

.debug-section {
  background: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 24rpx;
}

.section-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 16rpx;
}

.info-item {
  display: flex;
  margin-bottom: 12rpx;
}

.label {
  font-size: 26rpx;
  color: #666;
  margin-right: 12rpx;
  min-width: 140rpx;
}

.value {
  font-size: 26rpx;
  color: #333;
  flex: 1;
  word-break: break-all;
}

.level-guest { color: #999; }
.level-low { color: #52c41a; }
.level-mid { color: #1890ff; }
.level-high { color: #f5222d; }

.test-btn {
  width: 100%;
  background: linear-gradient(180deg, #9AB3FF 0%, #7A59ED 100%);
  color: #fff;
  font-size: 28rpx;
  font-weight: 600;
  border-radius: 12rpx;
  padding: 24rpx;
  margin-bottom: 16rpx;
}

.test-btn.secondary {
  background: linear-gradient(180deg, #A0D8F1 0%, #5DADE2 100%);
}

.level-rules {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.rule-item {
  display: flex;
  justify-content: space-between;
  padding: 16rpx;
  background: #f9f9f9;
  border-radius: 8rpx;
  border: 2rpx solid transparent;
}

.rule-item.active {
  background: #e6f7ff;
  border-color: #1890ff;
}

.rule-level {
  font-size: 26rpx;
  font-weight: 600;
  color: #333;
}

.rule-requirement {
  font-size: 24rpx;
  color: #666;
}

.history-list {
  max-height: 400rpx;
}

.history-item {
  padding: 16rpx;
  background: #f9f9f9;
  border-radius: 8rpx;
  margin-bottom: 12rpx;
}

.history-time {
  font-size: 22rpx;
  color: #999;
  margin-bottom: 8rpx;
}

.history-data {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.history-label {
  font-size: 24rpx;
  color: #666;
}

.history-value {
  font-size: 24rpx;
  color: #333;
  font-weight: 600;
}

.history-value.changed {
  color: #f5222d;
  font-weight: bold;
}

.diagnosis-list {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16rpx;
}

.diagnosis-item {
  display: flex;
  align-items: center;
  padding: 16rpx;
  background: #f9f9f9;
  border-radius: 8rpx;
  border: 2rpx solid #e0e0e0;
}

.diagnosis-item.success {
  background: #f6ffed;
  border-color: #52c41a;
}

.diagnosis-item.error {
  background: #fff1f0;
  border-color: #f5222d;
}

.diagnosis-item.warning {
  background: #fffbe6;
  border-color: #faad14;
}

.diagnosis-icon {
  font-size: 32rpx;
  margin-right: 12rpx;
  font-weight: bold;
}

.diagnosis-text {
  font-size: 24rpx;
  color: #333;
}

.log-box {
  max-height: 500rpx;
  background: #f9f9f9;
  border-radius: 8rpx;
  padding: 16rpx;
}

.log-text {
  font-size: 22rpx;
  color: #333;
  font-family: monospace;
  white-space: pre-wrap;
  word-break: break-all;
}

.empty-state {
  padding: 60rpx 0;
  text-align: center;
  color: #999;
  font-size: 26rpx;
}
</style>
