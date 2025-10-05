<template>
  <view class="copylist" v-for="item in info.contentList" :key="item.stepDetailId">
    <view class="item flex-c m-bottom-30" :class="{ disabled: props.disabled }">
      <view class="content m-right-20">{{ _setContent(item.content) }}</view>
      <md-icon
        name="copy_icon"
        width="45"
        height="45"
        :style="{ opacity: props.disabled ? 0.3 : 1 }"
        @click="() => handleCopy(item)"></md-icon>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { Toast } from '@/utils/util';
import type { Four } from '@/api/data';

const props = defineProps({
  info: {
    type: Object as () => Four.GetContentDetail.Data,
    default: () => [],
  },
  disabled: {
    type: Boolean,
    default: false,
  },
});
const emit = defineEmits(['copy']);

// 设置内容
const _setContent = (content: string) => {
  if (!content) return '';
  const _content = content?.replace('FF', '');
  const at = _content?.split('@');
  const ll = _content?.split('LL');
  if (at?.length > 1) {
    return at[0];
  } else if (ll?.length) {
    return ll[0];
  }
  return content;
};

const handleCopy = (item: any) => {
  if (props.disabled) {
    Toast('请等待倒计时结束');
    return;
  }
  if (!!props?.info?.statusVo) {
    const { stepDetailId, ...other } = props?.info?.statusVo;
    const params = { ...item, preStepDetailId: stepDetailId || undefined, ...other };
    emit('copy', params);
  } else {
    emit('copy', item);
  }
};
</script>

<style lang="scss" scoped>
.copylist {
  width: 100%;
  .item {
    & > .content {
      flex: 1;
      padding: 20rpx;
      box-sizing: border-box;
      gap: 10px;
      border-radius: 20rpx;
      border: 1rpx solid #0000001a;
    }

    // ✅ 禁用状态样式
    &.disabled {
      opacity: 0.5;

      .content {
        background: #f5f5f5;
        color: #999;
      }
    }
  }
}
</style>
