<template>
  <view class="page">
    <!-- 自定义导航栏 -->
    <view class="navbar" :style="{ paddingTop: data.statusBarHeight + 'px' }">
      <view class="navbar-content">
        <view class="nav-left" @click="goBack">
          <text class="back-icon">‹</text>
        </view>
        <view class="nav-title">用户服务协议</view>
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
        <view class="page-title">用户服务协议</view>

        <!-- 正文 -->
        <view class="article">
          <view class="paragraph">
            <text class="text">
              欢迎您使用《回响用户协议》APP（下文简称为"本应用"）。本应用由西安昆明池景区运营管理有限公司管理并运营，以下简称为"我们"。在使用本应用之前，请您务必仔细阅读并充分理解本协议的全部内容。
            </text>
          </view>

          <view class="section">
            <text class="section-title">1. 协议的接受</text>
            <text class="text">
              (a) 当您下载、安装、启动、浏览、注册或以其他任何方式使用本应用时，即表示您已充分阅读、理解并同意接受本协议的全部内容。
            </text>
          </view>

          <view class="section">
            <text class="text">
              (b) 如果您不同意本协议的任何内容，或者无法准确理解我们对条款的解释，请不要进行后续操作。
            </text>
          </view>

          <view class="section">
            <text class="section-title">2. 服务内容</text>
            <text class="text">
              (a) 本应用提供社交互动和学习辅助功能，旨在帮助用户提升沟通技巧和社交能力。
            </text>
          </view>

          <view class="section">
            <text class="text">
              (b) 我们保留随时修改、中断或终止部分或全部服务的权利，无需对用户或第三方承担任何责任。
            </text>
          </view>

          <view class="section">
            <text class="section-title">3. 用户账号</text>
            <text class="text">
              (a) 用户在使用本应用服务时，需要注册一个账号。用户应当提供真实、准确、最新和完整的个人信息。
            </text>
          </view>

          <view class="section">
            <text class="text">
              (b) 用户应当妥善保管自己的账号和密码，不得将账号出借、转让、出售或以其他方式提供给第三方使用。
            </text>
          </view>

          <view class="section">
            <text class="section-title">4. 用户行为规范</text>
            <text class="text">
              (a) 用户在使用本应用服务时，应当遵守中华人民共和国相关法律法规，不得利用本应用从事违法违规活动。
            </text>
          </view>

          <view class="section">
            <text class="text">
              (b) 用户不得发布任何违法、有害、威胁、辱骂、骚扰、侵权、诽谤、粗俗、淫秽或其他不良信息。
            </text>
          </view>

          <view class="section">
            <text class="text">
              (c) 用户应当尊重其他用户的权利，不得侵犯他人的隐私权、名誉权、知识产权等合法权益。
            </text>
          </view>

          <view class="section">
            <text class="section-title">5. 知识产权</text>
            <text class="text">
              (a) 本应用所包含的全部内容，包括但不限于文字、图片、音频、视频、软件、程序、版面设计等，均归我们或相关权利人所有。
            </text>
          </view>

          <view class="section">
            <text class="text">
              (b) 未经我们书面许可，任何人不得擅自复制、修改、传播、展示本应用的内容，或将其用于商业目的。
            </text>
          </view>

          <view class="section">
            <text class="section-title">6. 免责声明</text>
            <text class="text">
              (a) 本应用提供的服务仅供学习和参考，不构成任何专业建议。
            </text>
          </view>

          <view class="section">
            <text class="text">
              (b) 我们不对用户使用本应用服务所产生的任何直接、间接、偶然、特殊或后果性的损害承担责任。
            </text>
          </view>

          <view class="section">
            <text class="text">
              (c) 因不可抗力、计算机病毒、黑客攻击、系统不稳定、网络故障等原因导致的服务中断或数据丢失，我们不承担责任。
            </text>
          </view>

          <view class="section">
            <text class="section-title">7. 协议的修改</text>
            <text class="text">
              我们有权根据实际情况随时修改本协议的内容。修改后的协议一经在本应用公布，立即自动生效。如果您不同意修改后的内容，请立即停止使用本应用。
            </text>
          </view>

          <view class="section">
            <text class="section-title">8. 法律适用与争议解决</text>
            <text class="text">
              本协议的订立、执行、解释及争议的解决均应适用中华人民共和国法律。因本协议产生的争议，双方应友好协商解决；协商不成的，任何一方均可向我们所在地有管辖权的人民法院提起诉讼。
            </text>
          </view>

          <view class="section last-section">
            <text class="text highlight">
              再次感谢您选择使用本应用！如有任何问题或建议，请通过应用内的反馈功能与我们联系。
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

.last-section {
  margin-top: 48rpx;
  padding-top: 32rpx;
  border-top: 1rpx solid #f0f0f0;
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

.text.highlight {
  color: #8b5cf6;
  font-weight: 500;
}
</style>
