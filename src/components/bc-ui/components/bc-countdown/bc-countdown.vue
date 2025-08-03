<template>
  <view
    :class="['countdown', size === 'default' ? 'm-b-60' : '']"
    :style="{ 'align-items': alignStyle == 'left' ? 'start' : alignStyle == 'right' ? 'end' : 'center' }">
    <uni-countdown
      ref="countdownRef"
      :font-size="size === 'default' ? 30 : 16"
      :show-day="!!day || !!getCountdown(time)?.days"
      :day="!time ? day : getCountdown(time)?.days"
      :hour="!time ? hour : getCountdown(time)?.hours"
      :minute="!time ? minute : getCountdown(time)?.minutes"
      :second="!time ? second : getCountdown(time)?.seconds"
      @timeup="timerup"
      color="#000000"
      :background-color="bgType === 'dark' ? '#fff70e' : '#ffaaaa'" />
    <bc-tip-row :bgType="bgType" v-if="!hideTip">{{ desc }}</bc-tip-row>
  </view>
</template>

<script setup lang="ts">
import { getCountdown } from '@/utils/util';
import { onMounted, ref } from 'vue';
const emit = defineEmits(['timeup']);
const isMounted = ref(false);
const countdownRef = ref<any>(null);
defineExpose({
  update() {
    countdownRef.value?.update();
  },
});

defineProps({
  size: {
    type: String,
    default: 'default', // default | small
  },
  desc: {
    type: String,
    default: '',
  },
  time: {
    type: String, // 未来时间，做倒计时用
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
</script>

<style lang="scss" scoped>
.countdown {
  display: flex;
  align-items: center;
  flex-direction: column;
  // margin-bottom: 60rpx;
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
