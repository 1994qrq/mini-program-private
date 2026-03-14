<template>
  <md-page title="手机号登录">
    <view class="container">
      <!-- 授权登录 -->
      <view>
        <button class="phone-btn btn" open-type="getPhoneNumber" @getphonenumber="decryptPhoneNumber">
          手机号码一键登录
        </button>
      </view>
    </view>

    <!-- 免责声明弹窗 -->
    <DisclaimerModal
      :visible="showDisclaimer"
      @agree="handleDisclaimerAgree"
      @disagree="handleDisclaimerDisagree"
    />

    <!-- 用户名设置弹窗 -->
    <md-dialog
      ref="nicknameDialog"
      title="设置用户名"
      @ok="handleNicknameOk"
      @cancel="handleNicknameCancel">
      <view class="nickname-input-wrapper">
        <view class="input-label">请设置您的用户名</view>
        <uni-easyinput
          v-model="data.nickname"
          primaryColor="#827afd"
          :styles="{
            borderColor: '#827afd',
          }"
          :maxlength="20"
          placeholder="请输入用户名"></uni-easyinput>
        <view class="input-tip">默认使用微信昵称，您也可以自定义</view>
      </view>
    </md-dialog>
  </md-page>
</template>

<script lang="ts" setup>
import { reactive, ref } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
// 接口
import api from '@/api/index';
// 免责声明组件
import DisclaimerModal from '@/components/DisclaimerModal.vue';
// 免责声明工具
import { hasUserAgreedDisclaimer, setUserAgreedDisclaimer } from '@/utils/disclaimer';
// 内容库数据同步工具
import { syncContentLibrary } from '@/utils/content-library-sync';

const data = reactive<any>({
  userId: null,
  configInfo: {},
  isLoadingUserId: false, // 是否正在获取 userId
  nickname: '', // 用户名
  phoneCode: '', // 手机号授权码
  wxUserInfo: null, // 微信用户信息
});

const showDisclaimer = ref(false); // 是否显示免责声明弹窗
const nicknameDialog = ref(null); // 用户名设置弹窗

// 等待 userId 获取完成（最多等待10秒）
const waitForUserId = async (): Promise<boolean> => {
  const maxWaitTime = 10000; // 最多等待10秒
  const checkInterval = 100; // 每100ms检查一次
  let waited = 0;

  while (!data.userId && waited < maxWaitTime) {
    await new Promise(resolve => setTimeout(resolve, checkInterval));
    waited += checkInterval;
  }

  return !!data.userId;
};

// 获取微信用户信息
const getWxUserInfo = async () => {
  try {
    const res = await uni.getUserProfile({
      desc: '用于完善用户资料',
    });
    data.wxUserInfo = res.userInfo;
    data.nickname = res.userInfo.nickName || '';
    console.log('[getWxUserInfo] 获取微信用户信息成功:', data.wxUserInfo);
  } catch (error) {
    console.error('[getWxUserInfo] 获取微信用户信息失败:', error);
    // 如果获取失败，使用默认昵称
    data.nickname = '用户' + Math.floor(Math.random() * 10000);
  }
};

// 授权手机号回调
async function decryptPhoneNumber(e: any) {
  console.log('[decryptPhoneNumber] 开始处理手机号授权', e.detail);

  // 首先检查免责声明
  if (!hasUserAgreedDisclaimer()) {
    console.log('[decryptPhoneNumber] 用户尚未同意免责声明，显示弹窗');
    showDisclaimer.value = true;
    return;
  }

  // 如果 userId 还没获取到，显示加载提示并等待
  if (!data.userId) {
    console.log('[decryptPhoneNumber] userId 为空，等待获取...');
    uni.showLoading({ title: '正在登录...', mask: true });

    const success = await waitForUserId();
    uni.hideLoading();

    if (!success) {
      console.error('[decryptPhoneNumber] 等待 userId 超时');
      uni.showToast({ title: '登录超时，请重试', icon: 'none' });
      return;
    }

    console.log('[decryptPhoneNumber] userId 获取成功:', data.userId);
  }

  // 保存手机号授权码
  data.phoneCode = e.detail.code;

  // 先尝试直接登录，看看是否是老用户
  console.log('[decryptPhoneNumber] 尝试直接登录...');
  uni.showLoading({ title: '登录中...', mask: true });

  try {
    const res = await api.common.getPhoneNumber({
      code: data.phoneCode,
      userId: data.userId,
    });

    console.log('[decryptPhoneNumber] 登录成功，token:', res.data);
    uni.setStorageSync('token', res.data);
    uni.setStorageSync('isRefresh', 1);

    // 登录成功后，同步内容库数据
    try {
      console.log('[decryptPhoneNumber] 开始同步内容库数据...');
      await syncContentLibrary(false);
      console.log('[decryptPhoneNumber] 内容库数据同步成功');
    } catch (syncError) {
      console.error('[decryptPhoneNumber] 内容库数据同步失败:', syncError);
    }

    // 获取用户信息，检查是否有昵称
    try {
      const userInfoRes = await api.common.info();
      console.log('[decryptPhoneNumber] ========== 用户信息检查 ==========');
      console.log('[decryptPhoneNumber] 完整用户信息:', JSON.stringify(userInfoRes.data));

      // 检查用户信息中是否有昵称字段
      // 优先使用后端返回的 nickname，如果没有则检查本地存储
      const backendNickname = userInfoRes.data?.nickname;
      const localNickname = uni.getStorageSync('userNickname');

      console.log('[decryptPhoneNumber] 后端昵称:', backendNickname);
      console.log('[decryptPhoneNumber] 本地昵称:', localNickname);

      const hasNickname = backendNickname || localNickname;
      console.log('[decryptPhoneNumber] 是否有昵称:', hasNickname);

      if (hasNickname) {
        console.log('[decryptPhoneNumber] ✓ 老用户，已有昵称:', hasNickname);
        uni.hideLoading();

        // 如果后端有昵称但本地没有，同步到本地
        if (backendNickname && !localNickname) {
          console.log('[decryptPhoneNumber] 同步后端昵称到本地');
          uni.setStorageSync('userNickname', backendNickname);
        }

        // 返回上一页或跳转到首页
        const pages = getCurrentPages();
        if (pages && pages.length > 1) {
          console.log('[decryptPhoneNumber] 返回上一页');
          uni.navigateBack({ delta: 1 });
        } else {
          console.log('[decryptPhoneNumber] 跳转到首页');
          uni.switchTab({ url: '/pages/task/index' });
        }
        return;
      } else {
        console.log('[decryptPhoneNumber] ✗ 新用户，需要设置昵称');
        uni.hideLoading();

        // 获取微信用户信息并显示用户名设置弹窗
        await getWxUserInfo();
        nicknameDialog.value?.open();
      }
    } catch (infoError) {
      console.error('[decryptPhoneNumber] ========== 获取用户信息失败 ==========');
      console.error('[decryptPhoneNumber] 错误:', infoError);
      uni.hideLoading();

      // 如果获取用户信息失败，检查本地是否有昵称
      const localNickname = uni.getStorageSync('userNickname');
      console.log('[decryptPhoneNumber] 本地昵称（失败情况）:', localNickname);

      if (localNickname) {
        console.log('[decryptPhoneNumber] 本地有昵称，直接跳转');
        const pages = getCurrentPages();
        if (pages && pages.length > 1) {
          uni.navigateBack({ delta: 1 });
        } else {
          uni.switchTab({ url: '/pages/task/index' });
        }
      } else {
        console.log('[decryptPhoneNumber] 本地无昵称，显示设置弹窗');
        // 为了安全起见，还是显示昵称设置弹窗
        await getWxUserInfo();
        nicknameDialog.value?.open();
      }
    }
  } catch (loginError) {
    console.error('[decryptPhoneNumber] 登录失败:', loginError);
    uni.hideLoading();
    uni.showToast({ title: '登录失败，请重试', icon: 'none' });
  }
}

// 用户名设置确认
const handleNicknameOk = async () => {
  console.log('[handleNicknameOk] 开始处理昵称确认');
  console.log('[handleNicknameOk] 当前昵称值:', data.nickname);
  console.log('[handleNicknameOk] 昵称类型:', typeof data.nickname);

  if (!data.nickname || data.nickname.trim() === '') {
    console.log('[handleNicknameOk] 昵称为空，提示用户');
    uni.showToast({
      title: '请输入用户名',
      icon: 'none',
    });
    return;
  }

  const trimmedNickname = data.nickname.trim();
  console.log('[handleNicknameOk] 处理后的昵称:', trimmedNickname);

  // 显示加载提示
  uni.showLoading({
    title: '保存中...',
    mask: true
  });

  try {
    // 调用后端接口更新昵称
    console.log('[handleNicknameOk] 调用后端接口更新昵称');
    await api.common.updateNickname({ nickName: trimmedNickname });
    console.log('[handleNicknameOk] 后端昵称更新成功');

    // 保存用户名到本地存储
    uni.setStorageSync('userNickname', trimmedNickname);
    console.log('[handleNicknameOk] 昵称已保存到本地存储');

    // 验证是否保存成功
    const savedNickname = uni.getStorageSync('userNickname');
    console.log('[handleNicknameOk] 验证保存结果:', savedNickname);

    uni.hideLoading();

    // 关闭弹窗
    nicknameDialog.value?.close();
    console.log('[handleNicknameOk] 弹窗已关闭');

    // 显示成功提示
    uni.showToast({
      title: '设置成功',
      icon: 'success',
      duration: 1500
    });

    // 延迟跳转，让用户看到成功提示
    setTimeout(() => {
      // 返回上一页或跳转到首页
      const pages = getCurrentPages();
      console.log('[handleNicknameOk] 当前页面栈长度:', pages.length);

      if (pages && pages.length > 1) {
        console.log('[handleNicknameOk] 返回上一页');
        uni.navigateBack({ delta: 1 });
      } else {
        console.log('[handleNicknameOk] 跳转到首页');
        uni.switchTab({ url: '/pages/task/index' });
      }
    }, 1500);

  } catch (error) {
    console.error('[handleNicknameOk] 更新昵称失败:', error);
    uni.hideLoading();

    // 即使后端更新失败，也保存到本地
    uni.setStorageSync('userNickname', trimmedNickname);
    console.log('[handleNicknameOk] 后端更新失败，但已保存到本地');

    // 关闭弹窗
    nicknameDialog.value?.close();

    // 显示警告提示
    uni.showToast({
      title: '设置成功（本地）',
      icon: 'none',
      duration: 2000
    });

    // 延迟跳转
    setTimeout(() => {
      const pages = getCurrentPages();
      if (pages && pages.length > 1) {
        uni.navigateBack({ delta: 1 });
      } else {
        uni.switchTab({ url: '/pages/task/index' });
      }
    }, 2000);
  }
};


// 用户名设置取消
const handleNicknameCancel = () => {
  data.nickname = '';
  data.phoneCode = '';
};

/**
 * 接口相关
 */
// 微信登录获取user_wx_id
const fetchWxLogin = async (code: string) => {
  data.isLoadingUserId = true;
  try {
    const res = await api.common.login({ code });
    data.userId = res.data;
    console.log('[fetchWxLogin] 成功获取 userId:', data.userId);
  } catch (e) {
    console.error('[fetchWxLogin] 获取 userId 失败:', e);
    uni.showToast({ title: '微信登录失败，请重试', icon: 'none' });
  } finally {
    data.isLoadingUserId = false;
  }
};

// 免责声明处理函数
const handleDisclaimerAgree = () => {
  console.log('[handleDisclaimerAgree] 用户同意免责声明');
  setUserAgreedDisclaimer(true);
  showDisclaimer.value = false;

  // 显示同意成功的提示
  uni.showToast({
    title: '感谢您的信任！',
    icon: 'success',
    duration: 2000
  });
};

const handleDisclaimerDisagree = () => {
  console.log('[handleDisclaimerDisagree] 用户不同意免责声明');
  setUserAgreedDisclaimer(false);
  showDisclaimer.value = false;

  // 显示不同意后的提示，并阻止继续登录
  uni.showModal({
    title: '提示',
    content: '很抱歉，您需要同意用户协议才能继续使用我们的服务。感谢您的理解。',
    showCancel: false,
    confirmText: '知道了',
    success: () => {
      // 用户点击确定后，可以选择退出小程序或停留在当前页面
      console.log('[handleDisclaimerDisagree] 用户确认不同意，阻止登录流程');
    }
  });
};

// 授权手机登录
const fetchAuthMobileLogin = async (code: string, nickname: string) => {
  try {
    console.log('[fetchAuthMobileLogin] 开始获取手机号，userId:', data.userId, 'code:', code, 'nickname:', nickname);

    const res = await api.common.getPhoneNumber({
      code,
      userId: data.userId,
      // TODO: 如果后端支持，可以在这里传递 nickname
      // nickname: nickname,
    });

    console.log('[fetchAuthMobileLogin] 获取手机号成功，token:', res.data);
    uni.setStorageSync('token', res.data);
    // 保存用户名到本地存储（如果后端不支持，可以先存本地）
    uni.setStorageSync('userNickname', nickname);
    // 返回的页面执行刷新
    uni.setStorageSync('isRefresh', 1);

    // 登录成功后，同步内容库数据
    try {
      console.log('[fetchAuthMobileLogin] 开始同步内容库数据...');
      await syncContentLibrary(false); // false 表示替换模式，获取最新数据
      console.log('[fetchAuthMobileLogin] 内容库数据同步成功');
    } catch (syncError) {
      // 同步失败不影响登录流程，只记录错误
      console.error('[fetchAuthMobileLogin] 内容库数据同步失败:', syncError);
      // 可选：显示提示
      // uni.showToast({ title: '数据同步失败，请稍后重试', icon: 'none', duration: 2000 });
    }

    // 返回上一页；如果当前是第一个页面（无返回栈），跳转到首页 Tab
    const pages = getCurrentPages();
    if (pages && pages.length > 1) {
      uni.navigateBack({ delta: 1 });
    } else {
      // 注意：switchTab 只能跳转到 tabBar 页面
      uni.switchTab({ url: '/pages/task/index' });
    }
  } catch (e) {
    console.error('[fetchAuthMobileLogin] 获取手机号失败:', e);
    uni.showToast({ title: '获取手机号失败，请重试', icon: 'none' });
  }
};

onLoad(() => {
  // 检查用户是否已同意免责声明
  if (!hasUserAgreedDisclaimer()) {
    console.log('[onLoad] 用户尚未同意免责声明，显示弹窗');
    showDisclaimer.value = true;
  }

  uni.login({
    provider: 'weixin', //使用微信登录
    success: function (res) {
      console.log(res);
      // data.LoginCode = res.code;
      fetchWxLogin(res.code);
    },
  });
});
</script>

<style lang="scss" scoped>
.container {
  padding: 30rpx;
  .phone-btn {
    margin: 0;
    width: 694rpx;
    height: 88rpx;
    border-radius: 20rpx;
    font-size: 34rpx;
  }
  .title {
    color: $title;
    font-size: 40rpx;
    text-align: center;
    margin-bottom: 60rpx;
  }
  .line {
    height: 1rpx;
    background: #cccccc;
  }
  .btn {
    margin-top: 100rpx;
  }
}

.nickname-input-wrapper {
  padding: 20rpx 0;
  .input-label {
    font-size: 28rpx;
    color: #333;
    margin-bottom: 20rpx;
    font-weight: 500;
  }
  .input-tip {
    font-size: 24rpx;
    color: #999;
    margin-top: 16rpx;
    line-height: 1.5;
  }
}
</style>
