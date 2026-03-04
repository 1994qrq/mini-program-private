<template>
  <md-page :title="data.prevPageQuery?.taskName">
    <view class="container">
      <!-- 36小时方案倒计时 -->
      <view class="scheme-countdown" v-if="data.schemeExpireTime && !data.schemeExpired">
        <bc-countdown size="small" :time="data.schemeExpireTime" desc="当前方案将在倒计时结束后消失，届时将随机展示新方案" @timeup="onSchemeExpired" />
      </view>
      <!-- 方案已过期提示 -->
      <view class="expired-tip" v-if="data.schemeExpired">
        <text class="expired-text">当前方案已过期，请重新进入查看新方案</text>
      </view>
      <!-- 方案卡片（未过期时显示） -->
      <template v-if="!data.schemeExpired">
        <block v-for="item in displayList" :key="item.replayId || item.id">
          <bc-title-card :item="item" @click="handleClick" :showLevel="data.showLevel"></bc-title-card>
        </block>
      </template>
      <bc-bottom-bar
        countdown-desc="倒计时结束后，此任务将结束，回复将消失"
        :countdownTime="data.time"
        showCountdown
        :showOk="false" />
      <!-- 提示弹窗 -->
      <md-dialog ref="popup" title="温馨提示" @ok="handleOk" @cancel="handleCancel">
        点击确定后，将开启为期3天的倒计时，倒计时结束后，该页面上所有的回复将被清空，该线下计划也将结束。
      </md-dialog>
    </view>
  </md-page>
</template>

<script setup lang="ts">
import { reactive, ref, computed } from 'vue';
import { onLoad, onShow } from '@dcloudio/uni-app';
// 接口
import api from '@/api';
// 工具
import { hasItTimeOut } from '@/utils/util';
import { taskModule } from '@/utils/data';

const data = reactive<any>({
  prevPageQuery: {}, // 上一个页面带过来的参数
  list: [],
  allSets: [], // 所有套餐数据
  time: '',
  showLevel: -1,
  schemeExpired: false, // 当前方案是否已过期（36小时）
  schemeExpireTime: '', // 当前方案过期时间（用于倒计时显示）
});
const popup = ref(null);

// 本地存储的key
const STORAGE_KEY_PREFIX = 'offline_scheme_';

// 获取当前任务的存储key
const getStorageKey = (taskId: number) => {
  return `${STORAGE_KEY_PREFIX}${taskId}`;
};

// 格式化时间戳为 YYYY-MM-DD HH:mm:ss 格式（倒计时组件需要）
const formatTimestamp = (timestamp: number): string => {
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

// 获取或创建随机套餐选择
const getOrCreateRandomSet = (taskId: number, totalSets: number) => {
  const storageKey = getStorageKey(taskId);
  const stored = uni.getStorageSync(storageKey);

  const now = Date.now();
  const EXPIRE_TIME = 36 * 60 * 60 * 1000; // 36小时（毫秒）

  // 如果存在存储数据且未过期，返回存储的索引
  if (stored && stored.selectedIndex !== undefined && stored.expireAt) {
    if (now < stored.expireAt) {
      // 设置过期时间用于倒计时显示
      data.schemeExpireTime = formatTimestamp(stored.expireAt);
      data.schemeExpired = false;
      console.log('[Offline] 使用已存储的套餐:', stored.selectedIndex);
      return stored.selectedIndex;
    } else {
      // 已过期，清除存储，重新随机
      console.log('[Offline] 套餐已过期，重新随机选择');
      uni.removeStorageSync(storageKey);
    }
  }

  // 随机选择一个套餐
  const randomIndex = Math.floor(Math.random() * totalSets);
  const expireAt = now + EXPIRE_TIME;

  // 存储选择和过期时间
  uni.setStorageSync(storageKey, {
    selectedIndex: randomIndex,
    expireAt: expireAt,
    createdAt: now
  });

  // 设置过期时间用于倒计时显示
  data.schemeExpireTime = formatTimestamp(expireAt);
  data.schemeExpired = false;

  console.log('[Offline] 新随机选择套餐:', randomIndex, '过期时间:', new Date(expireAt).toLocaleString());
  return randomIndex;
};

// 计算当前显示的内容列表
const displayList = computed(() => {
  if (data.allSets.length === 0) {
    return [];
  }

  const taskId = data.prevPageQuery?.taskId;
  if (!taskId) {
    return data.allSets[0] || [];
  }

  const selectedIndex = getOrCreateRandomSet(taskId, data.allSets.length);
  return data.allSets[selectedIndex] || [];
});

const handleClick = () => {
  uni.navigateTo({
    url: '/pages/sub-page/offline/analysis',
  });
};

// 36小时倒计时结束，方案过期
const onSchemeExpired = () => {
  data.schemeExpired = true;
  // 清除本地存储，下次进入时重新随机
  const taskId = data.prevPageQuery?.taskId;
  if (taskId) {
    uni.removeStorageSync(getStorageKey(taskId));
  }
};

/**
 * 弹窗处理
 */
const handleOk = () => {
  fetchTaskEndTime();
};

const handleCancel = () => {
  uni.redirectTo({
    url: '/pages/sub-page/offline/list',
  });
};

/**
 * 接口相关
 */

// 获取问题列表
const getQuestionAnswerList = async (taskId: number) => {
  try {
    const res = await api.task.searchQuestionAnswer({ taskId });

    // 映射原始数据
    const mappedList = res.data?.contentList.map(item => ({
      title: item.answerTitle,
      content: item.answerContent,
      status: 1,
      replayId: item.replayId,
      showLevel: item.showLevel,
    })) || [];

    // 将内容按 replayId 分组成不同的套餐
    const setMap: Record<string, any[]> = {};
    mappedList.forEach(item => {
      const setKey = String(item.replayId || 0);
      if (!setMap[setKey]) {
        setMap[setKey] = [];
      }
      setMap[setKey].push(item);
    });

    // 按照 key 排序，确保套餐顺序一致
    const sortedKeys = Object.keys(setMap).sort((a, b) => Number(a) - Number(b));
    data.allSets = sortedKeys.map(key => setMap[key]);

    // 保留原有的 list 用于兼容性
    data.list = mappedList;
    data.time = res.data.endTime;

    console.log('[Offline] 套餐总数:', data.allSets.length);

    // 如果没返回时间，则是第一次进入
    if (!res.data?.endTime) {
      // 用户第一次打开任务，如果该任务显示此页面的时候，页面上会有灰色蒙版挡住，并弹出如下对话框
      popup.value!.open();
      return;
    }
    let _hasItTimeOut = hasItTimeOut(res.data.endTime);
    // 超时
    if (_hasItTimeOut) {
      uni.showModal({
        title: '温馨提示',
        content: '您的线下计划有效期已经截止。',
        showCancel: false,
      });
    }
  } catch (error) {}
};

const fetchGetInfo = async () => {
  try {
    const res = await api.common.info();
    data.showLevel = res.data?.userLevel || -1;
  } catch (error) {}
};

// 任务结束时间
const fetchTaskEndTime = async () => {
  try {
    await api.task.taskEndTime({ moduleCode: taskModule['线下模块'], taskId: data.prevPageQuery?.taskId });
    // 设置结束时间后，重新加载数据以获取最新的 endTime
    getQuestionAnswerList(data.prevPageQuery?.taskId);
  } catch (error) {}
};

onLoad(option => {
  data.prevPageQuery = option as Record<string, any>;
  getQuestionAnswerList(option?.taskId);
});

onShow(() => {
  fetchGetInfo();
});
</script>

<style lang="scss" scoped>
.container {
  padding: 30rpx;
  padding-bottom: calc($safe-bottom + 120rpx);

  .scheme-countdown {
    margin-bottom: 30rpx;
  }

  .expired-tip {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 40rpx 30rpx;
    margin: 30rpx 0;
    border-radius: 16rpx;
    background: #f5f5f5;
    .expired-text {
      color: #999;
      font-size: 28rpx;
    }
  }

  .list {
    width: 100%;
    padding: 16rpx 36rpx;
    box-sizing: border-box;
    gap: 20rpx;
    border-radius: 24rpx;
    border: 1rpx solid #dddddd;
    box-shadow: 0 8rpx 8rpx 0 #00000040;
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 60rpx;
    .title {
      margin-top: -40rpx;
      font-size: 36rpx;
      display: inline-block;
      height: 60rpx;
      line-height: 60rpx;
      padding: 0 40rpx;
      box-sizing: border-box;
      gap: 2px;
      border-radius: 10rpx;
      background: linear-gradient(159.7deg, #fff8ee 10.76%, #fde3e0 93.75%);
      box-shadow: 0 0 12rpx 0 #c4ae8680;
    }
    .content {
      font-size: 24rpx;
    }
  }
}
</style>
