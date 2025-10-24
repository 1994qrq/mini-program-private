<template>
  <view
    :class="['countdown', size === 'default' ? 'cd-big m-b-60' : 'cd-small']"
    :style="{ 'align-items': alignStyle == 'left' ? 'start' : alignStyle == 'right' ? 'end' : 'center' }">
    <uni-countdown
      ref="countdownRef"
      :key="keyStr"
      :font-size="size === 'default' ? 30 : 16"
      :show-day="cd.days > 0"
      :day="cd.days"
      :hour="cd.hours"
      :minute="cd.minutes"
      :second="cd.seconds"
      @timeup="timerup"
      color="#000000"
      :background-color="bgType === 'dark' ? '#fff70e' : '#EAE4FF'" />
    <bc-tip-row :bgType="bgType" v-if="!hideTip">{{ desc }}</bc-tip-row>
  </view>
</template>

<script setup lang="ts">
import { onMounted, ref, computed, watch } from 'vue';
const emit = defineEmits(['timeup']);
const isMounted = ref(false);
const countdownRef = ref<any>(null);
defineExpose({
  update() {
    countdownRef.value?.update();
  },
});

const props = defineProps({
  size: {
    type: String,
    default: 'default', // default | small
  },
  desc: {
    type: String,
    default: '',
  },
  time: {
    type: String, // 未来时间，做倒计时用，YYYY-MM-DD HH:mm:ss
    default: '',
  },
  bgType: {
    type: String,
    default: 'white', // dark
  },
  hideTip: {
    type: Boolean,
    default: false,
  },
  day: Number,
  hour: Number,
  minute: Number,
  second: Number,
  alignStyle: {
    type: String,
    default: 'center', // left | right | center
  },
});

onMounted(() => {
  isMounted.value = true;
});

const timerup = () => {
  if (isMounted.value) {
    emit('timeup');
  }
};

// 统一计算展示用的天/时/分/秒，避免父组件传参差异
const cd = computed(() => {
  if (props.time) {
    // 使用原生 Date 计算，兼容微信端，避免三方解析差异
    const toLocalMs = (str: string) => new Date(str.replace(/-/g, '/')).getTime();
    const remain = Math.max(0, toLocalMs(props.time) - Date.now());
    const totalSec = Math.floor(remain / 1000);
    const days = Math.floor(totalSec / 86400);
    const hours = Math.floor((totalSec % 86400) / 3600);
    const minutes = Math.floor((totalSec % 3600) / 60);
    const seconds = Math.floor(totalSec % 60);
    return { days, hours, minutes, seconds };
  }
  return {
    days: props.day || 0,
    hours: props.hour || 0,
    minutes: props.minute || 0,
    seconds: props.second || 0,
  };
});

const keyStr = computed(() => props.time ? `t_${props.time}` : `d_${cd.value.days}_${cd.value.hours}_${cd.value.minutes}_${cd.value.seconds}`);

watch(() => props.time, (v) => {
  // 外部更新时间，尝试刷新
  countdownRef.value?.update?.();
});
</script>

<style lang="scss" scoped>
.countdown {
  display: flex;
  align-items: center;
  flex-direction: column;
  // margin-bottom: 60rpx;

  &.cd-big {
    // 大倒计时：方块数字 + 冒号（完全按视觉）
    // 占据更多屏幕空间，字体更大，更加突出
    padding: 40rpx 20rpx;
    background: linear-gradient(135deg, #f5f0ff 0%, #fff5f0 100%);
    border-radius: 16rpx;
    box-shadow: 0 8rpx 24rpx rgba(122, 89, 255, 0.15);

    ::v-deep(.uni-countdown__number) {
      background-color: #EEE8FF !important; /* 淡紫 */
      color: #000 !important;
      border-radius: 12rpx !important;
      font-weight: 900;
      margin: 0 12rpx;
      min-width: 70rpx;
      min-height: 70rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      text-shadow: none;
      box-shadow: 0 4rpx 12rpx rgba(122, 89, 255, 0.1);
    }
    /* 第一个数字块（天）更深紫，不显示“天”字 */
    ::v-deep(.uni-countdown__number:first-child){ background-color:#7A59FF !important; color:#fff !important; box-shadow: 0 4rpx 12rpx rgba(122, 89, 255, 0.3); }
    ::v-deep(.uni-countdown__splitor:first-of-type){ display:none !important; }
    ::v-deep(.uni-countdown__splitor){ color:#7A59FF !important; font-weight:900; margin: 0 12rpx; font-size: 48rpx; }
  }

  .desc {
    display: flex;
    align-items: center;
    width: 100%;
    padding: 4rpx 16rpx;
    box-sizing: border-box;
    border-radius: 8rpx;
    background: #fdedea;
    color: #c98c59;
    font-size: 16rpx;
    &.dark_bg {
      background: linear-gradient(355.37deg, #eafb27 3.73%, #fef8f4 109.09%);
    }
  }
}
</style>
