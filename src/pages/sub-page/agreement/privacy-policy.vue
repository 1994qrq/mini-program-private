<template>
  <view class="page">
    <!-- 自定义导航栏 -->
    <view class="navbar" :style="{ paddingTop: data.statusBarHeight + 'px' }">
      <view class="navbar-content">
        <view class="nav-left" @click="goBack">
          <text class="back-icon">‹</text>
        </view>
        <view class="nav-title">隐私政策</view>
        <view class="nav-right">
          <text class="icon-menu">⋯</text>
          <text class="icon-help">◉</text>
        </view>
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
        <!-- 标题 -->
        <view class="page-title">隐私政策</view>

        <!-- 正文 -->
        <view class="article">
          <view class="paragraph">
            <text class="text">
              感谢您使用《回响用户协议》APP（下文简称为"本应用"）本应用由西安昆明池景区运营管理有限公司管理并运营，以下简称为"我们"，本应用非常重视用户隐私政策并严格遵守相关的法律规定。请您仔细读《隐私政策》后再继续使用。如果您继续使用我们的服务，表示您已经充分阅读和理
            </text>
          </view>

          <view class="paragraph">
            <text class="text">
              本app尊重并保护所有使用服务用户的个人隐私权。为了给您提供更准确、更优质的服务，本应用会按照本隐私权政策的规定使用和披露您的个人信息。除本隐私权政策另有规定外，在未征得您事先许可的情况下，本应用不会将这些信息对外披露或向第三方提供。本应用会不时更新本隐私权政策。您在同意本应用服务使用协议之时，即视为您已经同意本隐私权政策全部内容。
            </text>
          </view>

          <view class="section">
            <text class="section-title">1.适用范围</text>
            <text class="text">
              (a)在您注册本应用app帐号时，您根据app要求提供的个人
            </text>
          </view>

          <view class="section">
            <text class="text">
              (b)在您使用本应用网络服务，或访问本应用平台网页时,本应用自动接收并记录的您的浏览器和计算机上的信息，包括但不限于您的IP地址、浏览器的类型、使用的语言、访问日期和时间、软硬件特征信息及您需求的网页记录等数据;(c)本应用通过合法途径从商业伙伴处取得的用户个人数
            </text>
          </view>

          <view class="section">
            <text class="text">
              (d)本应用严禁用户发布不良信息，如裸露、色情和亵渎内容，发布的内容我们会进行审核，一经发现不良信息，会禁用该用户的所有权限，予以封号处理。
            </text>
          </view>

          <view class="section">
            <text class="section-title">2.适用范围</text>
            <text class="text">
              (a)为了提供包括但不限于如下功能，我们需要访问您的
            </text>
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
});

// 返回
const goBack = () => {
  uni.navigateBack();
};

onLoad(() => {
  // 页面加载时可以做一些初始化操作
});
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: #ffffff;
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
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 20rpx;
}

.icon-menu, .icon-help {
  font-size: 44rpx;
  color: #1f1f1f;
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

/* 页面标题 */
.page-title {
  font-size: 40rpx;
  font-weight: 600;
  color: #1f1f1f;
  text-align: center;
  margin-bottom: 48rpx;
}

/* 文章内容 */
.article {
  font-size: 28rpx;
  line-height: 1.8;
  color: #333;
}

.paragraph {
  margin-bottom: 32rpx;
}

.section {
  margin-bottom: 32rpx;
}

.section-title {
  display: block;
  font-size: 32rpx;
  font-weight: 600;
  color: #1f1f1f;
  margin-bottom: 16rpx;
}

.text {
  color: #333;
  text-align: justify;
  word-break: break-all;
  line-height: 1.8;
}
</style>
