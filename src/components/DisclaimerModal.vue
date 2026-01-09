<template>
  <view v-if="visible" class="disclaimer-modal">
    <!-- 遮罩层 -->
    <view class="modal-mask" @tap="onMaskTap"></view>

    <!-- 弹窗内容 -->
    <view class="modal-content">
      <!-- 图标 -->
      <view class="icon-wrapper">
        <view class="icon-circle">
          <view class="shield-icon">
            <text class="checkmark">✓</text>
          </view>
        </view>
      </view>

      <!-- 标题 -->
      <view class="modal-title">服务协议和隐私权政策</view>

      <!-- 内容区域 -->
      <view class="modal-body">
        <text class="body-text">
          请你务必审慎阅读、充分理解用户协议和隐私政策各条款，包括但不限于用户注意事项、用户行为规范以及为了向你提供服务而收集、使用、存储你个人信息的情况等。你可阅读
        </text>
        <text class="link-text" @tap="handleViewAgreement">《回响用户服务协议》</text>
        <text class="body-text">和</text>
        <text class="link-text" @tap="handleViewPrivacy">《回响隐私权政策》</text>
        <text class="body-text">
          了解详细信息。如你同意，请点击下方按钮开始接受我们的服务。
        </text>
      </view>

      <!-- 按钮区域 -->
      <view class="modal-footer">
        <button class="btn btn-disagree" @tap="handleDisagree">
          <text class="btn-text">不同意</text>
        </button>
        <button class="btn btn-agree" @tap="handleAgree">
          <text class="btn-text">同意</text>
        </button>
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue';

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['agree', 'disagree']);

// 处理同意
const handleAgree = () => {
  emit('agree');
};

// 处理不同意
const handleDisagree = () => {
  emit('disagree');
};

// 查看用户服务协议
const handleViewAgreement = () => {
  uni.navigateTo({
    url: '/pages/sub-page/agreement/user-agreement'
  });
};

// 查看隐私政策
const handleViewPrivacy = () => {
  uni.navigateTo({
    url: '/pages/sub-page/agreement/privacy-policy'
  });
};

// 处理遮罩层点击（不允许关闭）
const onMaskTap = () => {
  // 不允许通过点击遮罩层关闭弹窗
  // 用户必须明确选择同意或不同意
};
</script>

<style lang="scss" scoped>
.disclaimer-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-mask {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
}

.modal-content {
  position: relative;
  width: 600rpx;
  max-width: 85vw;
  background: #ffffff;
  border-radius: 32rpx;
  padding: 60rpx 40rpx 40rpx;
  box-shadow: 0 20rpx 60rpx rgba(0, 0, 0, 0.2);
  animation: modalSlideIn 0.3s ease-out;
  display: flex;
  flex-direction: column;
  align-items: center;
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* 图标 */
.icon-wrapper {
  margin-bottom: 40rpx;
}

.icon-circle {
  width: 120rpx;
  height: 120rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, #a78bfa 0%, #8b5cf6 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8rpx 24rpx rgba(139, 92, 246, 0.3);
}

.shield-icon {
  width: 64rpx;
  height: 72rpx;
  background: linear-gradient(135deg, #86efac 0%, #22c55e 100%);
  clip-path: polygon(50% 0%, 100% 20%, 100% 70%, 50% 100%, 0% 70%, 0% 20%);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.checkmark {
  font-size: 40rpx;
  color: #ffffff;
  font-weight: bold;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

/* 标题 */
.modal-title {
  font-size: 36rpx;
  font-weight: 600;
  color: #1f1f1f;
  margin-bottom: 32rpx;
  text-align: center;
}

/* 内容 */
.modal-body {
  font-size: 28rpx;
  line-height: 1.8;
  color: #666;
  margin-bottom: 48rpx;
  text-align: justify;
}

.body-text {
  color: #666;
}

.link-text {
  color: #8b5cf6;
  text-decoration: underline;
  font-weight: 500;
}

/* 按钮区域 */
.modal-footer {
  display: flex;
  width: 100%;
  gap: 24rpx;
}

.btn {
  flex: 1;
  height: 88rpx;
  border-radius: 44rpx;
  border: none;
  font-size: 32rpx;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.btn-agree {
  background: linear-gradient(135deg, #a78bfa 0%, #8b5cf6 100%);
  color: white;
  box-shadow: 0 8rpx 24rpx rgba(139, 92, 246, 0.3);
}

.btn-agree:active {
  transform: scale(0.98);
  box-shadow: 0 4rpx 16rpx rgba(139, 92, 246, 0.4);
}

.btn-disagree {
  background: #f3f4f6;
  color: #9ca3af;
  border: none;
}

.btn-disagree:active {
  background: #e5e7eb;
  transform: scale(0.98);
}

.btn-text {
  font-size: 32rpx;
  font-weight: 500;
}
</style>