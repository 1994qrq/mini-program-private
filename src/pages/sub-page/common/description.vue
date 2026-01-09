<template>
  <view class="page">
    <!-- 自定义导航栏 -->
    <view class="navbar" :style="{ paddingTop: data.statusBarHeight + 'px' }">
      <view class="navbar-content">
        <view class="nav-left" @click="goBack">
          <text class="back-icon">‹</text>
        </view>
        <view class="nav-title">总说明</view>
        <view class="nav-right"></view>
      </view>
    </view>

    <!-- 内容区域 -->
    <scroll-view
      class="content"
      :style="{ paddingTop: (44 + data.statusBarHeight) + 'px' }"
      scroll-y
      :scroll-with-animation="true"
    >
      <view class="content-inner">
        <!-- 主标题 -->
        <view class="main-title">应用总说明</view>

        <!-- 简介 -->
        <view class="intro-section">
          <view class="section-header">
            <view class="header-icon">📖</view>
            <text class="header-text">应用简介</text>
          </view>
          <view class="section-content">
            <text class="content-text">
              {{ data.introduction }}
            </text>
          </view>
        </view>

        <!-- 功能模块说明 -->
        <view class="modules-section">
          <view class="section-header">
            <view class="header-icon">🔑</view>
            <text class="header-text">功能模块</text>
          </view>
          <view class="module-list">
            <view
              v-for="(module, index) in data.modules"
              :key="index"
              class="module-item">
              <view class="module-header">
                <view class="module-icon">{{ module.icon }}</view>
                <text class="module-name">{{ module.name }}</text>
              </view>
              <view class="module-desc">{{ module.description }}</view>
            </view>
          </view>
        </view>

        <!-- 使用指南 -->
        <view class="guide-section">
          <view class="section-header">
            <view class="header-icon">💡</view>
            <text class="header-text">使用指南</text>
          </view>
          <view class="section-content">
            <view
              v-for="(step, index) in data.guideSteps"
              :key="index"
              class="guide-step">
              <view class="step-number">{{ index + 1 }}</view>
              <view class="step-content">
                <text class="step-title">{{ step.title }}</text>
                <text class="step-desc">{{ step.description }}</text>
              </view>
            </view>
          </view>
        </view>

        <!-- 注意事项 -->
        <view class="notice-section">
          <view class="section-header">
            <view class="header-icon">⚠️</view>
            <text class="header-text">注意事项</text>
          </view>
          <view class="section-content">
            <view
              v-for="(notice, index) in data.notices"
              :key="index"
              class="notice-item">
              <view class="notice-bullet">•</view>
              <text class="notice-text">{{ notice }}</text>
            </view>
          </view>
        </view>

        <!-- 联系我们 -->
        <view class="contact-section">
          <view class="section-header">
            <view class="header-icon">📞</view>
            <text class="header-text">联系我们</text>
          </view>
          <view class="section-content">
            <text class="content-text">
              如有任何问题或建议，欢迎通过以下方式联系我们：
            </text>
            <view class="contact-info">
              <text class="contact-item">客服电话：400-123-4567</text>
              <text class="contact-item">工作时间：周一至周五 9:00-18:00</text>
              <text class="contact-item">邮箱：support@example.com</text>
            </view>
          </view>
        </view>

      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { reactive } from 'vue';
import { onLoad } from '@dcloudio/uni-app';

const data = reactive({
  statusBarHeight: uni.getWindowInfo().statusBarHeight || 0,
  introduction: '欢迎使用本应用！这是一款专注于提升社交技巧和情感沟通能力的智能助手。通过科学的方法和个性化的指导，帮助您建立和维护良好的人际关系。',
  modules: [
    {
      icon: '🆓',
      name: '免费模块',
      description: '提供基础的社交沟通建议和技巧，帮助您快速上手。'
    },
    {
      icon: '👤',
      name: '陌生模块',
      description: '针对陌生人社交场景，提供破冰和建立联系的有效方法。'
    },
    {
      icon: '📚',
      name: '不熟模块',
      description: '帮助您与不太熟悉的人建立更深入的联系和信任。'
    },
    {
      icon: '💬',
      name: '熟悉模块',
      description: '针对熟人关系，提供维护和深化感情的专业建议。'
    },
    {
      icon: '⭐',
      name: '超熟模块',
      description: '针对亲密关系，提供更高级的情感沟通技巧。'
    },
    {
      icon: '🩺',
      name: '问诊模块',
      description: '提供一对一的专业咨询服务，解决复杂的情感问题。'
    },
    {
      icon: '✨',
      name: '定制模块',
      description: '根据您的具体需求，定制个性化的全套解决方案。'
    },
    {
      icon: '🏢',
      name: '线下模块',
      description: '提供线下活动和实践机会，在真实场景中提升能力。'
    }
  ],
  guideSteps: [
    {
      title: '选择合适的模块',
      description: '根据您的需求和当前情况，选择最适合的功能模块。'
    },
    {
      title: '创建任务或对话',
      description: '在选定的模块中创建新任务，输入相关信息。'
    },
    {
      title: '获取专业建议',
      description: '系统会根据您的情况提供针对性的建议和方案。'
    },
    {
      title: '实践与反馈',
      description: '按照建议进行实践，并及时反馈效果，获得持续优化。'
    }
  ],
  notices: [
    '本应用提供的建议仅供参考，请结合实际情况灵活运用。',
    '涉及重要决策时，建议咨询专业人士。',
    '请保护好个人隐私，谨慎分享敏感信息。',
    '部分高级功能需要会员权限，具体请查看会员说明。',
    '使用过程中如遇问题，请及时联系客服。'
  ]
});

// 返回
const goBack = () => {
  uni.navigateBack();
};

onLoad(() => {
  // 这里可以从后台获取说明内容
  // 例如：fetchDescription()
});
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: linear-gradient(180deg, #f8f9ff 0%, #ffffff 100%);
}

/* 导航栏 */
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  background: #ffffff;
  border-bottom: 1rpx solid #f0f0f0;
}

.navbar-content {
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 32rpx;
}

.nav-left {
  width: 80rpx;
}

.back-icon {
  font-size: 60rpx;
  color: #1f1f1f;
  font-weight: 300;
}

.nav-title {
  flex: 1;
  text-align: center;
  font-size: 32rpx;
  color: #1f1f1f;
  font-weight: 500;
}

.nav-right {
  width: 80rpx;
}

/* 内容区域 */
.content {
  width: 100%;
  height: 100vh;
  box-sizing: border-box;
}

.content-inner {
  padding: 40rpx 30rpx;
  padding-bottom: 100rpx;
}

/* 主标题 */
.main-title {
  font-size: 48rpx;
  font-weight: 700;
  color: #1f1f1f;
  text-align: center;
  margin-bottom: 48rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* 通用区块样式 */
.intro-section,
.modules-section,
.guide-section,
.notice-section,
.contact-section {
  margin-bottom: 48rpx;
}

.section-header {
  display: flex;
  align-items: center;
  margin-bottom: 24rpx;
}

.header-icon {
  font-size: 40rpx;
  margin-right: 16rpx;
}

.header-text {
  font-size: 36rpx;
  font-weight: 600;
  color: #1f1f1f;
}

.section-content {
  background: #ffffff;
  border-radius: 20rpx;
  padding: 32rpx;
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.06);
}

.content-text {
  font-size: 28rpx;
  line-height: 1.8;
  color: #666;
}

/* 功能模块 */
.module-list {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.module-item {
  background: #ffffff;
  border-radius: 20rpx;
  padding: 24rpx;
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.06);
}

.module-header {
  display: flex;
  align-items: center;
  margin-bottom: 12rpx;
}

.module-icon {
  font-size: 36rpx;
  margin-right: 16rpx;
}

.module-name {
  font-size: 32rpx;
  font-weight: 600;
  color: #1f1f1f;
}

.module-desc {
  font-size: 26rpx;
  line-height: 1.6;
  color: #666;
  padding-left: 52rpx;
}

/* 使用指南 */
.guide-step {
  display: flex;
  align-items: flex-start;
  margin-bottom: 32rpx;

  &:last-child {
    margin-bottom: 0;
  }
}

.step-number {
  width: 56rpx;
  height: 56rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #ffffff;
  font-size: 28rpx;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-right: 20rpx;
}

.step-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.step-title {
  font-size: 30rpx;
  font-weight: 600;
  color: #1f1f1f;
}

.step-desc {
  font-size: 26rpx;
  line-height: 1.6;
  color: #666;
}

/* 注意事项 */
.notice-item {
  display: flex;
  align-items: flex-start;
  margin-bottom: 20rpx;

  &:last-child {
    margin-bottom: 0;
  }
}

.notice-bullet {
  font-size: 32rpx;
  color: #f59e0b;
  margin-right: 16rpx;
  line-height: 1.6;
}

.notice-text {
  flex: 1;
  font-size: 26rpx;
  line-height: 1.6;
  color: #666;
}

/* 联系我们 */
.contact-info {
  margin-top: 24rpx;
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.contact-item {
  font-size: 28rpx;
  color: #1f1f1f;
  padding-left: 24rpx;
  position: relative;

  &::before {
    content: '▪';
    position: absolute;
    left: 0;
    color: #667eea;
  }
}
</style>
