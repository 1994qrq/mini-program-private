<template>
  <md-page title="第一阶段测试">
    <view class="container">
      <!-- 任务信息 -->
      <view class="info-card">
        <view class="info-row">
          <text class="label">任务名称：</text>
          <text class="value">{{ taskData.name }}</text>
        </view>
        <view class="info-row">
          <text class="label">当前阶段：</text>
          <text class="value">{{ taskData.stageIndex }}</text>
        </view>
        <view class="info-row">
          <text class="label">当前回合：</text>
          <text class="value">{{ taskData.roundIndex || 0 }}</text>
        </view>
        <view class="info-row">
          <text class="label">阶段得分：</text>
          <text class="value" style="color: #ff6b6b; font-weight: bold;">{{ taskData.stageScore }}</text>
        </view>
        <view class="info-row">
          <text class="label">前三回合总分：</text>
          <text class="value">{{ taskData.stage1?.firstThreeRoundsTotal || 0 }}</text>
        </view>
      </view>

      <!-- 内容显示区域 -->
      <view class="content-card" v-if="currentContent">
        <view class="content-text">{{ currentContent }}</view>
        <button class="copy-btn" @click="handleCopy">复制</button>
      </view>

      <!-- 操作按钮 -->
      <view class="action-buttons">
        <button class="action-btn" @click="startRound" v-if="!taskData.roundIndex">开始第一回合</button>
        <button class="action-btn" @click="finishRound" v-if="taskData.roundIndex">完成当前回合</button>
        <button class="action-btn secondary" @click="checkTransition">检查转换</button>
        <button class="action-btn secondary" @click="refreshTask">刷新任务</button>
      </view>

      <!-- 调试信息 -->
      <view class="debug-info">
        <text class="debug-title">调试信息：</text>
        <text class="debug-text">{{ debugInfo }}</text>
      </view>
    </view>
  </md-page>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import {
  initFamiliarLocal,
  getTask,
  enterStage1,
  startStage1Round,
  finishStage1Round,
  checkStage1RoundTransition
} from '@/utils/familiar-local';

const taskData = reactive<any>({
  id: '',
  name: '',
  stageIndex: 0,
  roundIndex: 0,
  stageScore: 0,
  stage1: null
});

const currentContent = ref('');
const debugInfo = ref('');
const taskId = ref('');

onLoad((options: any) => {
  console.log('[stage1-test] onLoad:', options);
  taskId.value = options.taskId || '';
  
  if (taskId.value) {
    refreshTask();
  } else {
    debugInfo.value = '错误：未提供 taskId';
  }
});

const refreshTask = () => {
  initFamiliarLocal();
  const task = getTask(taskId.value);
  
  if (task) {
    Object.assign(taskData, task);
    currentContent.value = `当前回合：第${task.roundIndex || 0}回合`;
    debugInfo.value = JSON.stringify(task, null, 2);
    console.log('[stage1-test] 任务数据:', task);
  } else {
    debugInfo.value = '错误：任务不存在';
  }
};

const startRound = () => {
  const roundNumber = (taskData.roundIndex || 0) + 1;
  const result = startStage1Round(taskId.value, roundNumber);
  
  if (result.ok) {
    uni.showToast({
      title: `开始第${roundNumber}回合`,
      icon: 'success'
    });
    refreshTask();
  } else {
    uni.showToast({
      title: result.reason || '开始回合失败',
      icon: 'error'
    });
  }
};

const finishRound = () => {
  // 模拟回合得分（随机0-2分）
  const roundScore = Math.floor(Math.random() * 3);
  const result = finishStage1Round(taskId.value, roundScore);
  
  if (result.ok) {
    uni.showToast({
      title: `回合完成，得分：${roundScore}`,
      icon: 'success'
    });
    refreshTask();
  } else {
    uni.showToast({
      title: result.reason || '完成回合失败',
      icon: 'error'
    });
  }
};

const checkTransition = () => {
  const result = checkStage1RoundTransition(taskId.value);
  
  if (result.ok) {
    debugInfo.value = `转换检查结果：\n动作：${result.action}\n原因：${result.reason}`;
    uni.showModal({
      title: '转换检查',
      content: `动作：${result.action}\n原因：${result.reason}`,
      showCancel: false
    });
  } else {
    uni.showToast({
      title: result.reason || '检查失败',
      icon: 'error'
    });
  }
};

const handleCopy = () => {
  uni.setClipboardData({
    data: currentContent.value,
    success: () => {
      uni.showToast({
        title: '复制成功',
        icon: 'success'
      });
    }
  });
};
</script>

<style lang="scss" scoped>
.container {
  padding: 30rpx;
}

.info-card {
  background: white;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
}

.info-row {
  display: flex;
  align-items: center;
  margin-bottom: 20rpx;
  
  &:last-child {
    margin-bottom: 0;
  }
}

.label {
  font-size: 28rpx;
  color: #666;
  min-width: 180rpx;
}

.value {
  font-size: 28rpx;
  color: #333;
  font-weight: 500;
}

.content-card {
  background: #f5f5f5;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 30rpx;
}

.content-text {
  font-size: 32rpx;
  color: #333;
  line-height: 1.6;
  margin-bottom: 20rpx;
}

.copy-btn {
  width: 100%;
  height: 80rpx;
  line-height: 80rpx;
  background: #7A59ED;
  color: white;
  border-radius: 12rpx;
  font-size: 32rpx;
  text-align: center;
}

.action-buttons {
  margin-bottom: 30rpx;
}

.action-btn {
  width: 100%;
  height: 88rpx;
  line-height: 88rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 16rpx;
  font-size: 32rpx;
  font-weight: 600;
  text-align: center;
  margin-bottom: 20rpx;
  
  &.secondary {
    background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  }
}

.debug-info {
  background: #2d2d2d;
  border-radius: 16rpx;
  padding: 30rpx;
  color: #00ff00;
  font-family: monospace;
  font-size: 24rpx;
  line-height: 1.6;
  word-break: break-all;
}

.debug-title {
  display: block;
  font-size: 28rpx;
  font-weight: bold;
  margin-bottom: 20rpx;
  color: #ffff00;
}

.debug-text {
  display: block;
  white-space: pre-wrap;
}
</style>

