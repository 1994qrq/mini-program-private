<template>
  <md-page title="图文" :subHead="40">
    <template #head>
      <view class="flex-l" style="justify-content: flex-end">
        <view class="flex flex-b p-right-30" style="width: calc(50% + 10rpx)">
          <md-icon type="bg" name="image_text_icon" width="60" height="60"></md-icon>
          <bc-tequan />
        </view>
      </view>
    </template>
    <view class="container">
      <!-- 图文说明 -->
      <block v-if="data?.describe">
        <bc-img-text-item
          :item="{
            title: '图文说明',
            content: data.describe,
            type: 'text',
          }"></bc-img-text-item>
      </block>
      <!-- 正常图文内容 -->
      <block v-for="item in data.list" :key="item">
        <bc-img-text-item
          disabled
          :item="{ ...item, title: item.title }"></bc-img-text-item>
      </block>
      <view class="bottom-btn">
        <view class="btn" @click="handleClick">开启图文权限</view>
      </view>
    </view>
    <!-- 创建弹窗 -->
    <md-dialog 
      ref="popup" 
      @ok="handleOk" 
      @cancel="handleCancel"
      :okText="popupInfo?.okText"
      :cancelText="popupInfo?.cancelText">
      <view class="pupup-content">{{ popupInfo.text }}</view>
    </md-dialog>
  </md-page>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue';
import { onShow } from '@dcloudio/uni-app';
// 接口
import api from '@/api';
import type { Task, Common } from '@/api/data';
// 工具
import { taskModule, payModule } from '@/utils/data';

const data = reactive<any>({
  describe: '', // 图文说明
  list: [],
  value: '',
});

// 添加用户信息
const userInfo = ref<Common.Info.Data>();
const popup = ref<any>(null);
const popupInfo = ref<{ type: 'create' | 'recharge'; okText?: string; text?: string; cancelText?: string }>({
  type: 'create',
});

const handleOk = () => {
  // 充值
  if (popupInfo.value.type === 'recharge') {
    // 跳转充值页面
    uni.navigateTo({
      url: '/pages/recharge/index',
    });
  } else {
    // 创建任务
    fetchCreateTask({ taskName: '图文用户问答' });
  }
  popup.value!.close();
};

const handleClick = async () => {
  try {
    // 1. 获取用户余额信息
    await getUserInfo();
    
    // 2. 检查余额是否充足
    const isBalanceSufficient = await checkVirtualCoin();
    
    if (!isBalanceSufficient) {
      // 余额不足
      popupInfo.value = { 
        type: 'recharge', 
        text: '您的余额不足，请充值后开通图文权限', 
        okText: '去充值',
        cancelText: '取消'
      };
    } else {
      // 余额充足，确认开通
      popupInfo.value = { 
        type: 'create', 
        text: '是否确认开通图文权限并进入用户问答界面？',
        okText: '确定',
        cancelText: '取消'
      };
    }
    popup.value!.open();
  } catch (error) {
    uni.showToast({
      title: '获取用户信息失败',
      icon: 'none'
    });
  }
};

// 添加取消按钮处理
const handleCancel = () => {
  popup.value!.close();
};

/**
 * 接口相关
 */
// 获取用户信息
const getUserInfo = async () => {
  try {
    const res = await api.common.info();
    userInfo.value = res.data;
  } catch (error) {
    throw error;
  }
};

// 检查虚拟币是否充足
const checkVirtualCoin = async () => {
  try {
    const res = await api.common.checkVirtualCoin({ payScene: payModule['图文一阶段付费'] });
    return res.data;
  } catch (error) {
    return false;
  }
};

// 查询图文列表
const getList = async () => {
  try {
    const res = await api.task.moduleImg();
    data.list = res.data?.moduleImgVoList.map(item => ({
      ...item,
      title: item?.title || '图文内容',
      content: item.imgContent,
      imgs: item.imgUrlList,
      type: 'img_text',
      dataType: item.type,
    }));
    data.describe = res.data?.describe || '';
  } catch (error) {}
};

// 创建任务
const fetchCreateTask = async (params: Pick<Task.Create.Body, 'taskName'>) => {
  try {
    const res = await api.task.createTask({ ...params, moduleCode: taskModule['图文模块'] });
    uni.navigateTo({
      url: `/pages/sub-page/image-text/problem?taskId=${res.data?.taskId}&taskName=${params?.taskName}`,
    });
  } catch (error) {}
};

onShow(() => {
  getList();
  getUserInfo(); // 页面显示时获取用户信息
});
</script>

<style lang="scss" scoped>
.container {
  padding: 30rpx;
  padding-bottom: calc($safe-bottom + 120rpx);
  .bottom-btn {
    width: 100%;
    padding: 20rpx;
    box-sizing: border-box;
    position: fixed;
    bottom: $safe-bottom;
    left: 0;
    // background: white;
    box-shadow: 0 0 20rpx 0 #ebebeb80;
    z-index: 98;
    gap: 20rpx;
    display: flex;
    justify-content: space-between;
    & > .btn {
      width: 100%;
      height: 72rpx;
      line-height: 70rpx;
      text-align: center;
      border-radius: 16rpx;
      font-size: 32rpx;
      background: radial-gradient(100% 12158.24% at 99.42% 0%, #f9753d 0%, #f8a04f 48.44%, #f7b261 100%)
          /* warning: gradient uses a rotation that is not supported by CSS and may not behave as expected */,
        radial-gradient(100% 12158.24% at 99.42% 0%, #f8ad3c 0%, #f0c778 48.44%, #ffd18d 100%)
          /* warning: gradient uses a rotation that is not supported by CSS and may not behave as expected */,
        radial-gradient(100% 12158.24% at 99.42% 0%, #faa580 0%, #fc983c 48.44%, #f08f1d 100%)
          /* warning: gradient uses a rotation that is not supported by CSS and may not behave as expected */;
      color: white;
    }
  }
}

.pupup-content {
  padding: 20rpx;
}
</style>
