<template>
  <view class="debug-container">
    <view class="debug-header">内容库调试工具</view>

    <view class="debug-section">
      <view class="section-title">API信息</view>
      <view class="info-item">
        <text class="label">接口地址:</text>
        <text class="value">{{ apiUrl }}</text>
      </view>
      <view class="info-item">
        <text class="label">Token:</text>
        <text class="value">{{ token ? '已设置' : '未设置' }}</text>
      </view>
    </view>

    <view class="debug-section">
      <button @click="testGetAllContent" class="test-btn">测试 getAllContent 接口</button>
      <button @click="testSyncContentLibrary" class="test-btn secondary">同步内容库到本地</button>
      <button @click="checkLocalStorage" class="test-btn secondary">检查本地存储</button>
      <button @click="clearLocalStorage" class="test-btn danger">清除本地存储</button>
    </view>

    <view class="debug-section">
      <view class="section-title">请求状态</view>
      <view class="status-item">
        <text class="label">状态:</text>
        <text class="value" :class="statusClass">{{ status }}</text>
      </view>
    </view>

    <view class="debug-section">
      <view class="section-title">统计信息</view>
      <view class="stats-grid">
        <view class="stat-item">
          <text class="stat-label">原始数据</text>
          <text class="stat-value">{{ stats.rawCount }}</text>
        </view>
        <view class="stat-item">
          <text class="stat-label">内容库</text>
          <text class="stat-value">{{ stats.contentLibs }}</text>
        </view>
        <view class="stat-item">
          <text class="stat-label">离开库</text>
          <text class="stat-value">{{ stats.leaveLibs }}</text>
        </view>
        <view class="stat-item">
          <text class="stat-label">对方找库</text>
          <text class="stat-value">{{ stats.proactiveLibs }}</text>
        </view>
        <view class="stat-item">
          <text class="stat-label">问答库</text>
          <text class="stat-value">{{ stats.qaLibs }}</text>
        </view>
        <view class="stat-item">
          <text class="stat-label">总节点数</text>
          <text class="stat-value">{{ stats.totalNodes }}</text>
        </view>
      </view>
    </view>

    <view class="debug-section">
      <view class="section-title">库列表</view>
      <scroll-view class="library-list" scroll-y>
        <view v-if="libraries.length === 0" class="empty-state">
          <text>暂无数据，请先测试接口</text>
        </view>
        <view v-for="(lib, index) in libraries" :key="index" class="library-item">
          <view class="lib-header">
            <text class="lib-id">{{ lib.id }}</text>
            <text class="lib-type">{{ lib.type }}</text>
          </view>
          <view class="lib-info">
            <text class="lib-name">{{ lib.name }}</text>
            <text class="lib-stage">阶段{{ lib.stage }}</text>
          </view>
          <view class="lib-stats">
            <text class="lib-count">{{ lib.count }}个节点</text>
          </view>
        </view>
      </scroll-view>
    </view>

    <view class="debug-section">
      <view class="section-title">响应数据（原始）</view>
      <scroll-view class="response-box" scroll-y>
        <text class="response-text">{{ responseText }}</text>
      </scroll-view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import api from '@/api';
import { syncContentLibrary, getLocalContentLibrary, clearLocalContentLibrary } from '@/utils/content-library-sync';
import type { ParsedContentLibrary } from '@/utils/content-library-parser';

const apiUrl = ref(process.env.VUE_APP_BASEHOST + '/api/fourModule/getAllContent');
const token = ref(uni.getStorageSync('token'));
const status = ref('未开始');
const responseText = ref('');
const libraries = ref<any[]>([]);
const stats = ref({
  rawCount: 0,
  contentLibs: 0,
  leaveLibs: 0,
  proactiveLibs: 0,
  qaLibs: 0,
  totalNodes: 0
});

const statusClass = computed(() => {
  if (status.value === '成功') return 'success';
  if (status.value === '失败') return 'error';
  return '';
});

const testGetAllContent = async () => {
  status.value = '请求中...';
  responseText.value = '';
  libraries.value = [];
  resetStats();

  try {
    console.log('[内容库调试] 开始请求 getAllContent 接口');
    console.log('[内容库调试] API地址:', apiUrl.value);
    console.log('[内容库调试] Token:', token.value);

    const res = await api.four.getAllContent();

    console.log('[内容库调��] 接口响应:', res);

    status.value = '成功';
    responseText.value = JSON.stringify(res, null, 2);

    if (res.data && Array.isArray(res.data)) {
      stats.value.rawCount = res.data.length;
      console.log('[内容库调试] 原始数据条数:', res.data.length);

      // 显示前10条数据的摘要
      const summary = res.data.slice(0, 10).map(item => ({
        id: item.id,
        warehouseId: item.warehouseId,
        contentCode: item.contentCode,
        contentType: item.contentType,
        contentLength: item.contentDetail?.length || 0
      }));
      console.log('[内容库调试] 数据摘要（前10条）:', summary);
    }

  } catch (error: any) {
    console.error('[内容库调试] 请求失败:', error);
    status.value = '失败';
    responseText.value = JSON.stringify({
      error: error.message || '请求失败',
      details: error
    }, null, 2);
  }
};

const testSyncContentLibrary = async () => {
  status.value = '同步中...';
  resetStats();

  try {
    console.log('[内容库调试] 开始同步内容库');

    const result = await syncContentLibrary(false); // false = 完全替换

    console.log('[内容库调试] 同步完成:', result);

    status.value = '同步成功';

    // 更新统计信息
    updateStatsFromParsedData(result.data);

    // 更新库列表
    updateLibrariesFromParsedData(result.data);

    uni.showToast({
      title: '同步成功',
      icon: 'success'
    });

  } catch (error: any) {
    console.error('[内容库调试] 同步失败:', error);
    status.value = '同步失败';
    uni.showToast({
      title: error.message || '同步失败',
      icon: 'none'
    });
  }
};

const checkLocalStorage = () => {
  try {
    console.log('[内容库调试] 检查本地存储');

    const localData = getLocalContentLibrary();

    if (!localData) {
      status.value = '本地无数据';
      uni.showToast({
        title: '本地无数据',
        icon: 'none'
      });
      return;
    }

    console.log('[内容库调试] 本地数据:', localData);

    status.value = '本地有数据';

    // 更新统计信息
    updateStatsFromParsedData(localData.data);

    // 更新库列表
    updateLibrariesFromParsedData(localData.data);

    uni.showToast({
      title: `本地有数据\n同步时间: ${new Date(localData.lastSyncTime).toLocaleString()}`,
      icon: 'none',
      duration: 3000
    });

  } catch (error: any) {
    console.error('[内容库调试] 检查失败:', error);
    status.value = '检查失败';
    uni.showToast({
      title: '检查失败',
      icon: 'none'
    });
  }
};

const clearLocalStorage = () => {
  uni.showModal({
    title: '确认清除',
    content: '确定要清除本地存储的内容库数据吗？',
    success: (res) => {
      if (res.confirm) {
        try {
          clearLocalContentLibrary();
          status.value = '已清除';
          resetStats();
          libraries.value = [];
          uni.showToast({
            title: '清除成功',
            icon: 'success'
          });
        } catch (error: any) {
          console.error('[内容库调试] 清除失败:', error);
          uni.showToast({
            title: '清除失败',
            icon: 'none'
          });
        }
      }
    }
  });
};

const resetStats = () => {
  stats.value = {
    rawCount: 0,
    contentLibs: 0,
    leaveLibs: 0,
    proactiveLibs: 0,
    qaLibs: 0,
    totalNodes: 0
  };
};

const updateStatsFromParsedData = (data: ParsedContentLibrary) => {
  stats.value.contentLibs = Object.keys(data.contentLibraries).length;
  stats.value.leaveLibs = Object.keys(data.leaveLibraries).length;
  stats.value.proactiveLibs = Object.keys(data.proactiveLibraries).length;
  stats.value.qaLibs = Object.keys(data.qaLibraries).length;

  let totalNodes = 0;
  Object.values(data.contentLibraries).forEach(lib => {
    totalNodes += lib.contents.length;
  });
  Object.values(data.leaveLibraries).forEach(lib => {
    totalNodes += lib.contents.length;
  });
  Object.values(data.proactiveLibraries).forEach(lib => {
    totalNodes += lib.contents.length;
  });

  stats.value.totalNodes = totalNodes;
};

const updateLibrariesFromParsedData = (data: ParsedContentLibrary) => {
  const libs: any[] = [];

  Object.entries(data.contentLibraries).forEach(([id, lib]) => {
    libs.push({
      id,
      type: '内容库',
      name: lib.libraryName,
      stage: lib.stage,
      count: lib.contents.length
    });
  });

  Object.entries(data.leaveLibraries).forEach(([id, lib]) => {
    libs.push({
      id,
      type: '离开库',
      name: lib.libraryName,
      stage: lib.stage,
      count: lib.contents.length
    });
  });

  Object.entries(data.proactiveLibraries).forEach(([id, lib]) => {
    libs.push({
      id,
      type: '对方找库',
      name: lib.libraryName,
      stage: lib.stage,
      count: lib.contents.length
    });
  });

  Object.entries(data.qaLibraries).forEach(([id, lib]) => {
    libs.push({
      id,
      type: '问答库',
      name: lib.libraryName,
      stage: lib.stage,
      count: lib.items.length
    });
  });

  libraries.value = libs;
};
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

.info-item, .status-item {
  display: flex;
  margin-bottom: 12rpx;
}

.label {
  font-size: 26rpx;
  color: #666;
  margin-right: 12rpx;
  min-width: 120rpx;
}

.value {
  font-size: 26rpx;
  color: #333;
  flex: 1;
  word-break: break-all;
}

.value.success {
  color: #52c41a;
}

.value.error {
  color: #f5222d;
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
}

.test-btn.secondary {
  background: linear-gradient(180deg, #A0D8F1 0%, #5DADE2 100%);
}

.test-btn.danger {
  background: linear-gradient(180deg, #FF9999 0%, #FF6B6B 100%);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16rpx;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16rpx;
  background: #f9f9f9;
  border-radius: 8rpx;
}

.stat-label {
  font-size: 22rpx;
  color: #666;
  margin-bottom: 8rpx;
}

.stat-value {
  font-size: 32rpx;
  font-weight: bold;
  color: #7A59ED;
}

.library-list {
  max-height: 600rpx;
}

.library-item {
  padding: 16rpx;
  background: #f9f9f9;
  border-radius: 8rpx;
  margin-bottom: 12rpx;
}

.lib-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8rpx;
}

.lib-id {
  font-size: 22rpx;
  color: #666;
  font-family: monospace;
}

.lib-type {
  font-size: 20rpx;
  color: #fff;
  background: #7A59ED;
  padding: 4rpx 12rpx;
  border-radius: 4rpx;
}

.lib-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8rpx;
}

.lib-name {
  font-size: 26rpx;
  color: #333;
  font-weight: 600;
}

.lib-stage {
  font-size: 22rpx;
  color: #666;
}

.lib-stats {
  display: flex;
  justify-content: flex-end;
}

.lib-count {
  font-size: 22rpx;
  color: #999;
}

.response-box {
  max-height: 400rpx;
  background: #f9f9f9;
  border-radius: 8rpx;
  padding: 16rpx;
}

.response-text {
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
