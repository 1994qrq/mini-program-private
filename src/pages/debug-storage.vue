<template>
  <view class="debug-container">
    <view class="debug-header">本地存储调试</view>

    <view class="debug-section">
      <view class="section-title">当前存储的数据</view>
      <view class="info-item">
        <text class="label">Token:</text>
        <text class="value">{{ storageData.token ? '已设置' : '未设置' }}</text>
      </view>
      <view class="info-item">
        <text class="label">用户昵称:</text>
        <text class="value">{{ storageData.userNickname || '未设置' }}</text>
      </view>
      <view class="info-item">
        <text class="label">是否同意免责声明:</text>
        <text class="value">{{ storageData.hasAgreedDisclaimer ? '是' : '否' }}</text>
      </view>
    </view>

    <view class="debug-section">
      <view class="section-title">测试昵称保存</view>
      <view class="input-wrapper">
        <uni-easyinput
          v-model="testNickname"
          placeholder="输入测试昵称"
          :maxlength="20"></uni-easyinput>
      </view>
      <button @click="saveTestNickname" class="test-btn">保存测试昵称</button>
      <button @click="clearNickname" class="test-btn secondary">清除昵称</button>
    </view>

    <view class="debug-section">
      <button @click="refreshData" class="test-btn">刷新数据</button>
      <button @click="clearAllStorage" class="test-btn danger">清除所有存储</button>
    </view>

    <view class="debug-section">
      <view class="section-title">操作日志</view>
      <scroll-view class="log-box" scroll-y>
        <text class="log-text">{{ logText }}</text>
      </scroll-view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';

const storageData = ref<any>({
  token: '',
  userNickname: '',
  hasAgreedDisclaimer: false
});

const testNickname = ref('');
const logText = ref('等待操作...\n');

const addLog = (message: string) => {
  const time = new Date().toLocaleTimeString();
  logText.value += `[${time}] ${message}\n`;
  console.log(`[存储调试] ${message}`);
};

const refreshData = () => {
  addLog('开始刷新存储数据...');

  storageData.value.token = uni.getStorageSync('token');
  storageData.value.userNickname = uni.getStorageSync('userNickname');
  storageData.value.hasAgreedDisclaimer = uni.getStorageSync('hasAgreedDisclaimer');

  addLog(`Token: ${storageData.value.token ? '已设置' : '未设置'}`);
  addLog(`用户昵称: ${storageData.value.userNickname || '未设置'}`);
  addLog(`免责声明: ${storageData.value.hasAgreedDisclaimer ? '已同意' : '未同意'}`);
  addLog('刷新完成');
};

const saveTestNickname = () => {
  if (!testNickname.value || testNickname.value.trim() === '') {
    uni.showToast({
      title: '请输入测试昵称',
      icon: 'none'
    });
    return;
  }

  addLog(`尝试保存昵称: ${testNickname.value}`);

  try {
    uni.setStorageSync('userNickname', testNickname.value.trim());
    addLog('✓ 保存成功');

    // 验证保存
    const saved = uni.getStorageSync('userNickname');
    addLog(`验证读取: ${saved}`);

    if (saved === testNickname.value.trim()) {
      addLog('✓ 验证成功，数据一致');
      uni.showToast({
        title: '保存成功',
        icon: 'success'
      });
    } else {
      addLog('✗ 验证失败，数据不一致');
      uni.showToast({
        title: '保存失败',
        icon: 'error'
      });
    }

    refreshData();
  } catch (error: any) {
    addLog(`✗ 保存失败: ${error.message}`);
    uni.showToast({
      title: '保存失败',
      icon: 'error'
    });
  }
};

const clearNickname = () => {
  addLog('清除昵称...');
  uni.removeStorageSync('userNickname');
  addLog('✓ 昵称已清除');
  refreshData();

  uni.showToast({
    title: '昵称已清除',
    icon: 'success'
  });
};

const clearAllStorage = () => {
  uni.showModal({
    title: '确认',
    content: '确定要清除所有本地存储吗？',
    success: (res) => {
      if (res.confirm) {
        addLog('清除所有存储...');
        uni.clearStorageSync();
        addLog('✓ 所有存储已清除');
        refreshData();

        uni.showToast({
          title: '已清除所有存储',
          icon: 'success'
        });
      }
    }
  });
};

onMounted(() => {
  addLog('页面加载完成');
  refreshData();
});
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
  min-width: 180rpx;
}

.value {
  font-size: 26rpx;
  color: #333;
  flex: 1;
  word-break: break-all;
}

.input-wrapper {
  margin-bottom: 20rpx;
}

.test-btn {
  width: 100%;
  background: linear-gradient(180deg, #9AB3FF 0%, #7A59ED 100%);
  color: #fff;
  font-size: 28rpx;
  font-weight: 600;
  border-radius: 12rpx;
  padding: 24rpx;
  margin-bottom: 16rpx;
  border: none;
}

.test-btn.secondary {
  background: linear-gradient(180deg, #A0D8F1 0%, #5DADE2 100%);
}

.test-btn.danger {
  background: linear-gradient(180deg, #FF9A9A 0%, #FF6B6B 100%);
}

.log-box {
  max-height: 400rpx;
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
</style>
