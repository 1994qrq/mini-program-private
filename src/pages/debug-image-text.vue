<template>
  <view class="debug-container">
    <view class="debug-header">图文模块API调试</view>

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
      <button @click="testModuleImg" class="test-btn">测试 moduleImg 接口</button>
    </view>

    <view class="debug-section">
      <view class="section-title">请求状态</view>
      <view class="status-item">
        <text class="label">状态:</text>
        <text class="value" :class="statusClass">{{ status }}</text>
      </view>
    </view>

    <view class="debug-section">
      <view class="section-title">响应数据</view>
      <scroll-view class="response-box" scroll-y>
        <text class="response-text">{{ responseText }}</text>
      </scroll-view>
    </view>

    <view class="debug-section">
      <view class="section-title">解析后的数据</view>
      <view class="parsed-item" v-if="parsedData.describe">
        <text class="label">图文说明:</text>
        <text class="value">{{ parsedData.describe }}</text>
      </view>
      <view class="parsed-item">
        <text class="label">图文数量:</text>
        <text class="value">{{ parsedData.count }}</text>
      </view>
      <view class="list-items" v-if="parsedData.list.length > 0">
        <view class="list-item" v-for="(item, index) in parsedData.list" :key="index">
          <text class="item-index">{{ index + 1 }}.</text>
          <view class="item-content">
            <text class="item-title">{{ item.title }}</text>
            <text class="item-type">类型: {{ item.dataType === null ? '普通' : '特殊' }}</text>
            <text class="item-imgs">图片数: {{ item.imgs?.length || 0 }}</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import api from '@/api';

const apiUrl = ref(process.env.VUE_APP_BASEHOST + '/api/module/moduleImg');
const token = ref(uni.getStorageSync('token'));
const status = ref('未开始');
const responseText = ref('');
const parsedData = ref<any>({
  describe: '',
  count: 0,
  list: []
});

const statusClass = computed(() => {
  if (status.value === '成功') return 'success';
  if (status.value === '失败') return 'error';
  return '';
});

const testModuleImg = async () => {
  status.value = '请求中...';
  responseText.value = '';
  parsedData.value = { describe: '', count: 0, list: [] };

  try {
    console.log('[调试] 开始请求 moduleImg 接口');
    console.log('[调试] API地址:', apiUrl.value);
    console.log('[调试] Token:', token.value);

    const res = await api.task.moduleImg();

    console.log('[调试] 接口响应:', res);

    status.value = '成功';
    responseText.value = JSON.stringify(res, null, 2);

    // 解析数据
    if (res.data) {
      parsedData.value = {
        describe: res.data.describe || '',
        count: res.data.moduleImgVoList?.length || 0,
        list: res.data.moduleImgVoList?.map(item => ({
          title: item.title || '图文内容',
          content: item.imgContent,
          imgs: item.imgUrlList,
          dataType: item.type
        })) || []
      };

      console.log('[调试] 解析后的数据:', parsedData.value);
    }

  } catch (error: any) {
    console.error('[调试] 请求失败:', error);
    status.value = '失败';
    responseText.value = JSON.stringify({
      error: error.message || '请求失败',
      details: error
    }, null, 2);
  }
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

.info-item, .status-item, .parsed-item {
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

.list-items {
  margin-top: 16rpx;
}

.list-item {
  display: flex;
  padding: 16rpx;
  background: #f9f9f9;
  border-radius: 8rpx;
  margin-bottom: 12rpx;
}

.item-index {
  font-size: 24rpx;
  color: #666;
  margin-right: 12rpx;
}

.item-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.item-title {
  font-size: 26rpx;
  color: #333;
  font-weight: 600;
}

.item-type, .item-imgs {
  font-size: 22rpx;
  color: #666;
}
</style>
