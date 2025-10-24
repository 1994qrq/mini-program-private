<template>
  <view class="countdown-container" v-if="isActive">
    <view class="countdown-title" v-if="title">{{ title }}</view>
    <view class="countdown-display">
      <view class="time-block" v-if="days > 0">
        <text class="time-number">{{ paddedDays }}</text>
        <text class="time-unit">天</text>
      </view>
      <view class="time-block">
        <text class="time-number">{{ paddedHours }}</text>
        <text class="time-unit">时</text>
      </view>
      <view class="time-separator">:</view>
      <view class="time-block">
        <text class="time-number">{{ paddedMinutes }}</text>
        <text class="time-unit">分</text>
      </view>
      <view class="time-separator">:</view>
      <view class="time-block">
        <text class="time-number">{{ paddedSeconds }}</text>
        <text class="time-unit">秒</text>
      </view>
    </view>
    <view class="countdown-hint" v-if="hint">{{ hint }}</view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';

interface Props {
  // 倒计时结束时间戳（毫秒）
  endTime: number | null;
  // 标题
  title?: string;
  // 提示文字
  hint?: string;
  // 是否自动开始
  autoStart?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  endTime: null,
  title: '',
  hint: '',
  autoStart: true,
});

const emit = defineEmits<{
  // 倒计时结束
  finished: [];
  // 每秒更新
  tick: [remaining: number];
}>();

const remaining = ref(0); // 剩余毫秒数
const isActive = ref(false);
let timer: number | null = null;

// 计算剩余时间各部分
const days = computed(() => Math.floor(remaining.value / (1000 * 60 * 60 * 24)));
const hours = computed(() => Math.floor((remaining.value % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)));
const minutes = computed(() => Math.floor((remaining.value % (1000 * 60 * 60)) / (1000 * 60)));
const seconds = computed(() => Math.floor((remaining.value % (1000 * 60)) / 1000));

// 补零显示
const paddedDays = computed(() => String(days.value).padStart(2, '0'));
const paddedHours = computed(() => String(hours.value).padStart(2, '0'));
const paddedMinutes = computed(() => String(minutes.value).padStart(2, '0'));
const paddedSeconds = computed(() => String(seconds.value).padStart(2, '0'));

/**
 * 计算剩余时间
 */
const calculateRemaining = () => {
  if (!props.endTime) {
    remaining.value = 0;
    return 0;
  }
  
  const now = Date.now();
  const diff = props.endTime - now;
  
  if (diff <= 0) {
    remaining.value = 0;
    return 0;
  }
  
  remaining.value = diff;
  return diff;
};

/**
 * 更新倒计时
 */
const updateCountdown = () => {
  const rem = calculateRemaining();
  
  if (rem <= 0) {
    stop();
    emit('finished');
    return;
  }
  
  emit('tick', rem);
};

/**
 * 开始倒计时
 */
const start = () => {
  if (!props.endTime) {
    console.warn('[FamiliarCountdown] endTime is null, cannot start countdown');
    return;
  }
  
  // 先计算一次
  const rem = calculateRemaining();
  
  if (rem <= 0) {
    isActive.value = false;
    emit('finished');
    return;
  }
  
  isActive.value = true;
  
  // 清除旧定时器
  if (timer !== null) {
    clearInterval(timer);
  }
  
  // 每秒更新
  timer = setInterval(() => {
    updateCountdown();
  }, 1000) as unknown as number;
  
  console.log('[FamiliarCountdown] Started, remaining:', formatTime(rem));
};

/**
 * 停止倒计时
 */
const stop = () => {
  isActive.value = false;
  
  if (timer !== null) {
    clearInterval(timer);
    timer = null;
  }
};

/**
 * 重置倒计时
 */
const reset = () => {
  stop();
  remaining.value = 0;
};

/**
 * 格式化时间（用于日志）
 */
const formatTime = (ms: number) => {
  const d = Math.floor(ms / (1000 * 60 * 60 * 24));
  const h = Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const m = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
  const s = Math.floor((ms % (1000 * 60)) / 1000);
  
  if (d > 0) {
    return `${d}天${h}时${m}分${s}秒`;
  } else if (h > 0) {
    return `${h}时${m}分${s}秒`;
  } else if (m > 0) {
    return `${m}分${s}秒`;
  } else {
    return `${s}秒`;
  }
};

// 监听 endTime 变化，自动重启
watch(() => props.endTime, (newEndTime) => {
  console.log('[FamiliarCountdown] endTime changed:', newEndTime ? new Date(newEndTime).toLocaleString() : 'null');
  
  if (newEndTime) {
    reset();
    if (props.autoStart) {
      start();
    }
  } else {
    reset();
  }
});

onMounted(() => {
  console.log('[FamiliarCountdown] Mounted, endTime:', props.endTime ? new Date(props.endTime).toLocaleString() : 'null');
  
  if (props.endTime && props.autoStart) {
    start();
  }
});

onUnmounted(() => {
  console.log('[FamiliarCountdown] Unmounted');
  stop();
});

// 暴露方法
defineExpose({
  start,
  stop,
  reset,
  remaining: computed(() => remaining.value),
});
</script>

<style lang="scss" scoped>
.countdown-container {
  padding: 30rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 20rpx;
  box-shadow: 0 8rpx 20rpx rgba(102, 126, 234, 0.3);
}

.countdown-title {
  font-size: 28rpx;
  color: #fff;
  text-align: center;
  margin-bottom: 20rpx;
  opacity: 0.9;
}

.countdown-display {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10rpx;
}

.time-block {
  display: flex;
  flex-direction: column;
  align-items: center;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 12rpx;
  padding: 10rpx 20rpx;
  min-width: 80rpx;
  backdrop-filter: blur(10rpx);
}

.time-number {
  font-size: 48rpx;
  font-weight: 700;
  color: #fff;
  line-height: 1;
  font-family: 'D-DIN', 'Arial', sans-serif;
}

.time-unit {
  font-size: 20rpx;
  color: rgba(255, 255, 255, 0.8);
  margin-top: 6rpx;
}

.time-separator {
  font-size: 40rpx;
  color: #fff;
  font-weight: 700;
  line-height: 1;
  margin: 0 5rpx;
}

.countdown-hint {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.8);
  text-align: center;
  margin-top: 20rpx;
}
</style>

