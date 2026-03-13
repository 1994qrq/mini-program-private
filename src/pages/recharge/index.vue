<template>
  <md-page title="会员充值">
    <view class="container">
      <view class="info m-bottom-40">
        <view class="info-left">
          <!-- 金额 -->
          <view>心币余额</view>
          <view class="flex-l">
            <image class="bag-icon" src="/static/icons/bag.png" mode="aspectFit" />
            <view class="m-left-8">{{ data.info?.remainingVirtual || 0 }}</view>
          </view>
        </view>
        <!-- 会员等级 -->
        <view class="info-right" v-if="data.info?.userLevel >= 0">
          <!-- 如果是游客/来宾（等级0），显示升级提示 -->
          <view v-if="data.info?.userLevel === 0" class="guest-upgrade-tip">
            充值{{ data.minRechargeForMember }}心币升级为会员
          </view>
          <!-- 如果是会员，显示会员等级 -->
          <template v-else>
            <bc-vip :level="data.info?.userLevel" />
            <view class="upgrade-tip">
              <!-- 距离下一等级会员还差{{ data.info?.nextLevelGold || 0 }}个心币 -->
            </view>
          </template>
        </view>
      </view>
      <view class="list">
        <block v-for="item in data.list" :key="item.gold">
          <view
            :class="['item', data.current === item.gold ? 'active' : '']"
            hover-class="hover-gray"
            :hover-start-time="20"
            :hover-stay-time="70"
            @click="() => handleSelect(item)">
            <view>{{ item.gold }}心币</view>
            <view class="price">￥{{ item.price }}</view>
          </view>
        </block>
        <view
          :class="['item', data.isCustom ? 'active' : '']"
          hover-class="hover-gray"
          :hover-start-time="20"
          :hover-stay-time="70"
          @click="() => handleSelect('custom')">自定义</view>
      </view>

      <!-- 自定义金额输入框 -->
      <view class="custom-input-wrapper" v-if="data.isCustom">
        <view class="input-label">自定义金额</view>
        <view class="input-box">
          <view class="input-prefix">￥</view>
          <uni-easyinput
            ref="customInputRef"
            v-model="data.customPrice"
            type="number"
            placeholder="最低充值1元"
            :styles="{
              borderColor: '#7A59ED',
              backgroundColor: '#f9f9ff',
            }"
            :maxlength="10"
            @input="handleCustomInput" />
          <view class="input-suffix">元</view>
        </view>
        <view class="input-tip">最低充值1元，最高充值999,999元</view>
      </view>
      <!-- 协议 及 充值按钮 -->
      <view class="bottom-btns">
        <view class="m-bottom-20">
          <cc-protocolBox
            :agree="data.agree"
            :protocolArr="data.protocolArr"
            @click="data.agree = !data.agree"
            @protocolClick="protocolClick" />
        </view>
        <md-button title="充值" @click="handlePay" />
      </view>
    </view>
  </md-page>
  <!-- 底部背景图 -->
<!-- 使用直接 URL 而非 base64 -->
<div class="bottom_bg" :style="{ backgroundImage: 'url(/static/images/page_bottom_bg.png)' }"></div>
</template>

<script setup lang="ts">
import { reactive, ref, nextTick } from 'vue';
import { onLoad, onShow } from '@dcloudio/uni-app';
import { convertToBase64 } from '@/utils/util';
import api from '@/api';

const data = reactive<any>({
  bottom_bg: '',
  list: [
    { gold: 1156, price: 68 },
    { gold: 1632, price: 96 },
    { gold: 2856, price: 168 },
    { gold: 5542, price: 326 },
    { gold: 9996, price: 588 },
    { gold: 15572, price: 916 },
    { gold: 18666, price: 1098 },
  ],
  current: null,
  currentPrice: null,
  // 自定义相关
  isCustom: false,
  customAmount: '',
  customPrice: '',
  // 协议
  agree: false,
  protocolArr: ['《会员协议》', '《隐私政策》'],
  // 会员信息
  info: {},
  // 升级为会员所需的最低心币数（示例值，可根据实际情况调整）
  minRechargeForMember: 1000,
});

// 自定义金额输入框ref
const customInputRef = ref();

// 协议点击回调
const protocolClick = (tag: string) => {
  console.log('点击协议序列 = ' + tag);
};
// 格式化金额
const formatMoney = (money: number): string => {
  if (!money) return '0';
  return money.toLocaleString('zh-CN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  });
};
// 自定义金额输入处理
const handleCustomInput = (value: any) => {
  console.log('[自定义金额] 输入事件触发，原始值:', value);
  console.log('[自定义金额] 当前 customPrice:', data.customPrice);

  // uni-easyinput 的 @input 事件直接传递值，不是事件对象
  // 由于使用了 v-model，data.customPrice 已经被自动更新
  // 这里直接使用 data.customPrice
  const inputValue = String(data.customPrice || '');
  console.log('[自定义金额] 处理后的值:', inputValue);

  // 只保留数字和小数点
  const numericValue = inputValue.replace(/[^\d.]/g, '');
  console.log('[自定义金额] 数字值:', numericValue);

  // 限制最大金额
  const maxAmount = 999999;
  if (numericValue && parseFloat(numericValue) > maxAmount) {
    console.log('[自定义金额] 超过最大金额限制:', parseFloat(numericValue));
    uni.showToast({
      title: `充值金额不能超过${maxAmount}元`,
      icon: 'none',
      duration: 2000
    });
    data.customPrice = String(maxAmount);
    data.currentPrice = maxAmount;
    console.log('[自定义金额] 设置为最大金额:', maxAmount);
    return;
  }

  data.customPrice = numericValue;

  // 更新当前价格为输入的金额
  if (numericValue && parseFloat(numericValue) > 0) {
    data.currentPrice = parseFloat(numericValue);
    console.log('[自定义金额] 更新 currentPrice:', data.currentPrice);
  } else {
    data.currentPrice = null;
    console.log('[自定义金额] currentPrice 设置为 null');
  }
};

const handleSelect = (item: any) => {
  if (item === 'custom') {
    console.log('[选择金额] 选择自定义');
    data.isCustom = true;
    data.current = null;
    data.currentPrice = data.customPrice ? parseFloat(data.customPrice) : null;
    console.log('[选择金额] 自定义模式 - customPrice:', data.customPrice, 'currentPrice:', data.currentPrice);
    // 延迟聚焦到输入框
    nextTick(() => {
      setTimeout(() => {
        const inputRef = customInputRef.value;
        if (inputRef && typeof inputRef.focus === 'function') {
          inputRef.focus();
          console.log('[选择金额] 输入框已聚焦');
        }
      }, 100);
    });
  } else {
    // 选择固定金额
    console.log('[选择金额] 选择固定套餐 - 心币:', item.gold, '价格:', item.price);
    data.isCustom = false;
    data.current = item.gold;
    data.currentPrice = item.price;
    data.customPrice = ''; // 清空自定义输入
    console.log('[选择金额] 固定模式 - current:', data.current, 'currentPrice:', data.currentPrice);
  }
};

const handlePay = async () => {
  // 检查是否选择了金额
  if (!data.current && (!data.isCustom || !data.customPrice)) {
    uni.showToast({
      title: '请选择或输入充值金额',
      icon: 'none',
    });
    return;
  }
  if (!data.agree) {
    uni.showToast({
      title: '请先同意协议',
      icon: 'none',
    });
    return;
  }
  // console.log('充值');
  fetchGetPrePayData();
};

/**
 * 接口相关
 */
// 获取会员信息
const getVipInfo = async () => {
  try {
    const res = await api.common.info();
    data.info = res.data;
    console.log('[充值页] 获取会员信息成功，当前等级:', data.info?.userLevel, '心币余额:', data.info?.remainingVirtual);
  } catch (error) {
    console.error('[充值页] 获取会员信息失败:', error);
  }
};

// 支付
const fetchGetPrePayData = async () => {
  try {
    console.log('[充值] ========== 开始获取支付信息 ==========');
    console.log('[充值] 是否自定义:', data.isCustom);
    console.log('[充值] 选中的套餐金额:', data.current);
    console.log('[充值] 自定义金额输入:', data.customPrice);
    console.log('[充值] 当前价格:', data.currentPrice);

    // 验证金额
    if (!data.currentPrice || data.currentPrice <= 0) {
      console.error('[充值] 金额无效:', data.currentPrice);
      uni.showToast({
        title: '请输入有效的充值金额',
        icon: 'none',
        duration: 2000
      });
      return;
    }

    // 验证最低充值金额
    if (data.currentPrice < 1) {
      console.error('[充值] 金额低于最低限制:', data.currentPrice);
      uni.showToast({
        title: '最低充值1元',
        icon: 'none',
        duration: 2000
      });
      return;
    }

    console.log('[充值] 调用 getPrePayData 接口，金额:', data.currentPrice);

    const res = await api.common.getPrePayData({
      amount: data.currentPrice, // 使用当前选中的金额
    });

    console.log('[充值] getPrePayData 接口响应:', res);

    if (!res.data) {
      console.error('[充值] 接口返回数据为空');
      uni.showToast({
        title: '获取支付信息失败',
        icon: 'none',
        duration: 2000
      });
      return;
    }

    console.log('[充值] 支付参数:', {
      nonceStr: res.data.nonceStr,
      package: res.data.packageInfo,
      signType: res.data.signType,
      timeStamp: res.data.timeStamp,
      paySign: res.data.paySign ? '已设置' : '未设置'
    });

    // 调起微信支付
    uni.requestPayment({
      provider: 'wxpay',
      orderInfo: {},
      nonceStr: res.data?.nonceStr, // 随机字符串
      package: res.data?.packageInfo, // 固定值
      signType: res.data?.signType,
      timeStamp: String(res.data?.timeStamp), // 时间戳（单位：秒）
      paySign: res.data?.paySign, // 签名，这里用的 MD5/RSA 签名
      async success() {
        console.log('[充值] ========== 支付成功回调开始 ==========');
        console.log('[充值] 支付成功，开始刷新用户信息');
        console.log('[充值] 充值金额:', data.currentPrice, '元');

        // 显示加载提示
        uni.showLoading({
          title: '处理中...',
          mask: true
        });

        // 延迟2秒后刷新用户信息，等待后端处理完成
        console.log('[充值] 等待2秒，让后端处理支付回调...');
        await new Promise(resolve => setTimeout(resolve, 2000));

        // 支付成功后，多次刷新用户信息以确保获取到最新数据
        let retryCount = 0;
        const maxRetries = 5; // 增加到5次重试
        let userLevel = 0;
        let prevLevel = data.info?.userLevel || 0;
        let prevBalance = data.info?.remainingVirtual || 0;
        let prevAccumulate = data.info?.accumulateMoney || 0;

        console.log('[充值] 支付前状态:');
        console.log('[充值]   - 等级: VIP', prevLevel);
        console.log('[充值]   - 余额:', prevBalance);
        console.log('[充值]   - 累计充值:', prevAccumulate, '元');

        // 记录是否有数据更新
        let hasDataUpdated = false;

        while (retryCount < maxRetries) {
          console.log('[充值] ========== 第', retryCount + 1, '次刷新 ==========');
          await getVipInfo();

          userLevel = data.info?.userLevel || 0;
          const currentBalance = data.info?.remainingVirtual || 0;
          const currentAccumulate = data.info?.accumulateMoney || 0;

          console.log('[充值] 刷新后状态:');
          console.log('[充值]   - 等级: VIP', userLevel, prevLevel !== userLevel ? `(变化: ${prevLevel} → ${userLevel})` : '(未变化)');
          console.log('[充值]   - 余额:', currentBalance, prevBalance !== currentBalance ? `(变化: ${prevBalance} → ${currentBalance})` : '(未变化)');
          console.log('[充值]   - 累计充值:', currentAccumulate, '元', prevAccumulate !== currentAccumulate ? `(变化: ${prevAccumulate} → ${currentAccumulate})` : '(未变化)');

          // 检查是否有任何数据更新
          const hasAnyUpdate = userLevel !== prevLevel || currentBalance !== prevBalance || currentAccumulate !== prevAccumulate;

          if (hasAnyUpdate) {
            hasDataUpdated = true;
            // 更新前一次的值，用于下次比较
            prevLevel = userLevel;
            prevBalance = currentBalance;
            prevAccumulate = currentAccumulate;
          }

          if (userLevel >= 1) {
            // 已经升级为会员，退出循环
            console.log('[充值] ✓ 已升级为会员，退出刷新循环');
            break;
          }

          if (hasAnyUpdate) {
            console.log('[充值] ⚠️ 数据已更新但等级仍为0，可能是后端升级逻辑问题');
            // 如果数据已更新但等级仍为0，再多等待一次看看是否会升级
            if (retryCount < maxRetries - 1) {
              console.log('[充值] 数据已更新，再等待2秒看是否会升级...');
              await new Promise(resolve => setTimeout(resolve, 2000));
            }
          } else {
            console.log('[充值] ⚠️ 数据未更新，后端可能还在处理中');
            // 等待1秒后重试
            if (retryCount < maxRetries - 1) {
              console.log('[充值] 等待1秒后重试...');
              await new Promise(resolve => setTimeout(resolve, 1000));
            }
          }
          retryCount++;
        }

        console.log('[充值] ========== 刷新完成 ==========');
        console.log('[充值] 最终等级: VIP', userLevel);
        console.log('[充值] 最终余额:', data.info?.remainingVirtual || 0);
        console.log('[充值] 最终累计:', data.info?.accumulateMoney || 0, '元');
        console.log('[充值] 数据是否更新:', hasDataUpdated ? '是' : '否');

        // 设置刷新标志，让其他页面知道需要刷新
        uni.setStorageSync('isRefresh', 1);

        uni.hideLoading();

        let message = '';
        let showDebugTip = false;

        if (userLevel >= 1) {
          message = '充值成功！您已成为会员';
        } else if (hasDataUpdated) {
          message = '充值成功！但会员等级未更新，请稍后刷新查看';
          showDebugTip = true;
        } else {
          message = '充值成功！数据正在处理中，请稍后刷新查看';
          showDebugTip = true;
        }

        if (userLevel < 1 && data.info?.accumulateMoney && data.info.accumulateMoney >= 10) {
          console.log('[充值] ❌ 异常: 累计充值已达标但等级未提升');
          console.log('[充值] 建议: 请联系后端检查升级逻辑');
          showDebugTip = true;
        }

        uni.showModal({
          title: '提示',
          content: message + (showDebugTip ? '\n\n如需排查问题，可访问调试页面查看详情' : ''),
          showCancel: showDebugTip,
          cancelText: '查看调试',
          confirmText: '确定',
          success(res) {
            if (res.cancel && showDebugTip) {
              // 跳转到调试页面
              console.log('[充值] 用户选择查看调试页面');
              uni.navigateTo({
                url: '/pages/debug-recharge-level'
              });
            } else {
              console.log('[充值] 用户点击确定，返回上一页');
              // 返回上一页，上一页会通过 onShow 刷新数据
              uni.navigateBack();
            }
          },
        });

        console.log('[充值] ========== 支付成功回调结束 ==========');
      },
      fail(e) {
        console.log('支付失败:', e);
        uni.showToast({
          title: '支付失败',
          icon: 'none',
          duration: 2000
        });
      },
    });
  } catch (error: any) {
    console.error('[充值] ========== 获取支付信息失败 ==========');
    console.error('[充值] 错误对象:', error);
    console.error('[充值] 错误消息:', error.message);
    console.error('[充值] 错误堆栈:', error.stack);

    // 尝试解析错误信息
    let errorMessage = '获取支付信息失败';

    if (error.data && error.data.message) {
      errorMessage = error.data.message;
      console.error('[充值] 后端返回错误:', errorMessage);
    } else if (error.message) {
      errorMessage = error.message;
      console.error('[充值] 错误信息:', errorMessage);
    }

    // 检查是否是网络错误
    if (error.errMsg && error.errMsg.includes('request:fail')) {
      errorMessage = '网络请求失败，请检查网络连接';
      console.error('[充值] 网络错误');
    }

    // 检查是否是参数错误
    if (errorMessage.includes('amount') || errorMessage.includes('金额')) {
      errorMessage = '充值金额格式错误，请重新输入';
      console.error('[充值] 金额参数错误');
    }

    uni.showToast({
      title: errorMessage,
      icon: 'none',
      duration: 3000
    });

    console.error('[充值] ========== 错误处理结束 ==========');
  }
};

onLoad(async () => {
  // 检查是否已登录
  const token = uni.getStorageSync('token');
  if (!token) {
    // 未登录，跳转到登录页
    uni.showModal({
      title: '提示',
      content: '请先登录',
      showCancel: false,
      confirmText: '去登录',
      success: () => {
        uni.redirectTo({
          url: '/pages/login/index',
        });
      },
    });
    return;
  }

  // 底部图片加载
  data.bottom_bg = await convertToBase64('/static/images/page_bottom_bg.png');
});

onShow(() => {
  console.log('[充值页] onShow 触发');

  // 检查是否已登录
  const token = uni.getStorageSync('token');
  if (!token) {
    console.log('[充值页] 用户未登录，跳转到登录页');
    uni.redirectTo({
      url: '/pages/login/index',
    });
    return;
  }

  // 检查是否有刷新标志（从其他页面返回时）
  const needRefresh = uni.getStorageSync('needRefreshRecharge');
  if (needRefresh) {
    console.log('[充值页] 检测到刷新标志，强制刷新用户信息');
    uni.removeStorageSync('needRefreshRecharge');
  }

  getVipInfo();
});
</script>

<style lang="scss" scoped>
.container {
  padding: 20px;
  padding-bottom: calc(200rpx + $safe-bottom);
  min-height: 100vh;
  box-sizing: border-box;
}
  .info {
    background-color: #f5ee9e;
    padding: 26rpx;
    border-radius: 16rpx;
    display: flex;
    justify-content: space-between;
    font-size: 40rpx;
    &-left {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      flex: 1;
      gap: 12rpx;

      .upgrade-tip {
        font-size: 24rpx;           /* 原来是 10rpx，太小了，改为 24rpx 更清晰 */
        color: #8B4513;
        font-weight: 300;
        margin-left: 58rpx;
        line-height: 1.4;
        letter-spacing: 1rpx;       /* 增加字间距，提升可读性 */
        opacity: 0.9;              /* 稍微降低透明度，避免过于突兀 */
      }
    }
    &-right {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      justify-content: center;

      .guest-upgrade-tip {
        font-size: 26rpx;
        color: #d97706;
        font-weight: 600;
        padding: 12rpx 20rpx;
        background: rgba(255, 255, 255, 0.8);
        border-radius: 12rpx;
        text-align: center;
        line-height: 1.4;
        box-shadow: 0 4rpx 12rpx rgba(217, 119, 6, 0.15);
      }
    }
  }

  // bag 图标样式
  .bag-icon {
    width: 50rpx;
    height: 50rpx;
    display: block;
  }
  .list {
    display: flex;
    gap: 40rpx;
    font-size: 34rpx;
    text-align: center;
    flex-wrap: wrap;
    margin-bottom: 20rpx;
  }

  // 自定义金额输入框样式 - 美化版
  .custom-input-wrapper {
    width: 100%;
    padding: 20rpx 30rpx;
    box-sizing: border-box;
    background: #ffffff;
    border-radius: 20rpx;
    box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.08);
    margin-bottom: 40rpx;

    .input-label {
      font-size: 32rpx;
      color: #333333;
      margin-bottom: 24rpx;
      font-weight: 600;
      text-align: center;
      letter-spacing: 1rpx;
    }

    .input-box {
      display: flex;
      align-items: center;
      background: linear-gradient(135deg, #f8faff 0%, #f0f2ff 100%);
      border: 3rpx solid #e8eaff;
      border-radius: 20rpx;
      padding: 24rpx 30rpx;
      box-sizing: border-box;
      position: relative;
      transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);

      &:focus-within {
        border-color: #7A59ED;
        background: linear-gradient(135deg, #fafaff 0%, #f5f7ff 100%);
        box-shadow: 0 8rpx 32rpx rgba(122, 89, 237, 0.15),
                    0 0 0 8rpx rgba(122, 89, 237, 0.08);
        transform: translateY(-2rpx);

        .input-prefix, .input-suffix {
          color: #7A59ED;
        }
      }

      .input-prefix {
        font-size: 36rpx;
        font-weight: 700;
        color: #666666;
        margin-right: 16rpx;
        user-select: none;
        transition: color 0.4s;
      }

      .input-suffix {
        font-size: 36rpx;
        font-weight: 700;
        color: #666666;
        margin-left: 16rpx;
        user-select: none;
        transition: color 0.4s;
      }

      :deep(.uni-easyinput__content) {
        flex: 1;
        position: relative;

        &::after {
          content: '';
          position: absolute;
          left: 0;
          top: 50%;
          transform: translateY(-50%);
          width: 2rpx;
          height: 30rpx;
          background: linear-gradient(180deg, rgba(122, 89, 237, 0.2) 0%, rgba(122, 89, 237, 0) 100%);
        }
      }

      :deep(.uni-easyinput__content-input) {
        font-size: 36rpx;
        font-weight: 700;
        color: #333333;
        text-align: center;
        padding: 0 20rpx;
        letter-spacing: 2rpx;
        background: transparent;

        &::placeholder {
          color: #999999;
          font-weight: 400;
          letter-spacing: 0;
        }

        &:focus {
          outline: none;
        }
      }

      .input-tip {
        font-size: 24rpx;
        color: #999999;
        text-align: center;
        margin-top: 20rpx;
        padding: 8rpx 20rpx;
        background: rgba(255, 255, 255, 0.7);
        border-radius: 12rpx;
        display: inline-block;
      }

      &.error {
        border-color: #ff6b6b;
        background: linear-gradient(135deg, #fff5f5 0%, #ffe0e0 100%);

        .input-prefix, .input-suffix {
          color: #ff6b6b;
        }
      }
    }
  }
  .item {
    width: 190rpx;
    display: flex;
    flex-direction: column;
    align-content: center;
    padding: 20rpx 4rpx;
    box-sizing: border-box;
    border-radius: 16rpx;
    box-shadow: 0 8rpx 8rpx 0 #00000040;
    &.active {
      background: #7A59ED;
      color: white;
    }
    .price {
      font-weight: bold;
    }
  }

  .bottom-btns {
    width: 100%;
    position: fixed;
    bottom: 0;
    left: 0;
    padding: 40rpx 40rpx calc($safe-bottom + 40rpx);
    box-sizing: border-box;
    z-index: 10;
  }

.bottom_bg {
  background-repeat: no-repeat;
  background-size: cover;
  background-position: center bottom;
  width: 100%;
  height: 100vh;
  position: fixed;
  bottom: 0;
  left: 0;
  z-index: -1;
  pointer-events: none;
}
</style>
