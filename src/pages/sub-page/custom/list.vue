<template>
  <md-page
    title="定制模块"
    bgType="dark"
    isBtn
    :subHead="40"
    :btnTextItems="[{ text: '创建定制服务', key: 'create' }]"
    @btnClick="bottomBtnClick">
    <template #head>
      <view class="flex-l" style="justify-content: flex-end">
        <view class="flex flex-b p-right-30" style="width: calc(50% + 10rpx)">
          <md-icon type="bg" name="custom_icon" width="80" height="80" circle></md-icon>
          <bc-tequan />
        </view>
      </view>
    </template>
    <view class="desc flex">
      <view class="gantanhao flex-c">!</view>
      <view class="flex-1">定制功能区别于问诊功能，提供更具针对性和可操作性的全套方案。</view>
    </view>
    <view
      class="container"
      :style="{ height: `calc(100vh - (env(safe-area-inset-top) + 44px + ${data.statusBarHeight}))` }">
      <block v-for="item in data.list" :key="item.taskId">
        <bc-task-item
          :item="item"
          desc="方法建议保留时间倒计时:"
          @click="() => handleJump(item)"
          @swipeClick="onSwipeClick"
          bgType="dark"
          tag="定"></bc-task-item>
      </block>
      <mescroll-empty v-if="data.list.length == 0"></mescroll-empty>
    </view>
    <!-- 创建弹窗 -->
    <md-dialog ref="popup" @ok="handleOk" @cancel="handleCancel" title="创建定制服务">
      <uni-easyinput
        v-model="data.value"
        primaryColor="#827afd"
        :styles="{
          borderColor: '#827afd',
        }"
        :maxlength="6"
        placeholder="请输入名称"></uni-easyinput>
    </md-dialog>
  </md-page>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import type { BtnTextItem } from '@/components/md-ui/components/md-page/md-page.vue';
// 接口
import api from '@/api';
import type { Task } from '@/api/data';
// 工具
import { Toast } from '@/utils/util';
// 字典
import { taskModule } from '@/utils/data';

const data = reactive<any>({
  statusBarHeight: uni.getWindowInfo().statusBarHeight + 'px', // 手机头部状态栏高度
  list: [],
  value: '',
  loading: false, // 创建任务的加载状态
});
const popup = ref(null);

const onSwipeClick = () => {
  getTaskList();
};

const handleOk = () => {
  // 防止重复点击
  if (data.loading) {
    return;
  }

  if (!data.value) {
    Toast('请输入任务名称');
    return;
  }
  fetchCreateTask({ taskName: data.value });
};

const handleCancel = () => {
  data.value = '';
};

const bottomBtnClick = (info: { item: BtnTextItem }) => {
  const { key } = info.item;
  if (key === 'create') {
    popup.value!.open();
  }
};

const handleJump = (item: Task.List.Data) => {
  let url = '';
  let params = `taskId=${item.taskId}&taskName=${item.taskName}`;
  if (item.taskStatus === 20) {
    // 20-问题已提交
    url = `/pages/sub-page/custom/analysis?${params}`;
  } else if (item.taskStatus === 30) {
    // 30-问题答案已给出
    url = `/pages/sub-page/custom/scheme?${params}`;
  } else if (item.taskStatus >= 50) {
    // 50-二次提交的问题等待回复，51-二次提交的问题回复中，52-二次提交的问题回复完成
    url = `/pages/sub-page/custom/detail?${params}&taskStatus=${item.taskStatus}`;
  } else {
    // 10-初始化
    url = `/pages/sub-page/custom/questionnaire?${params}`;
  }
  uni.navigateTo({
    url,
  });
};

/**
 * 接口相关
 */
const getTaskList = async () => {
  try {
    const res = await api.task.list({
      moduleCode: taskModule['定制模块'],
    });
    data.list = res.data;
  } catch (error) {}
};

// 创建任务
const fetchCreateTask = async (params: Pick<Task.Create.Body, 'taskName'>) => {
  // 设置加载状态
  data.loading = true;
  uni.showLoading({
    title: '创建中...',
    mask: true, // 显示透明蒙层，防止触摸穿透
  });

  try {
    const res = await api.task.createTask({ ...params, moduleCode: taskModule['定制模块'] });

    // 关闭弹窗
    popup.value?.close();
    handleCancel();

    // 跳转到问卷页面
    uni.navigateTo({
      url: `/pages/sub-page/custom/questionnaire?taskId=${res.data?.taskId}&taskName=${params?.taskName}`,
    });
  } catch (error) {
    console.error('创建定制任务失败:', error);
    // 如果失败，提示用户
    Toast('创建失败，请重试');
  } finally {
    // 无论成功还是失败，都要关闭加载状态
    data.loading = false;
    uni.hideLoading();
  }
};

onShow(() => {
  getTaskList();
});
</script>

<style lang="scss" scoped>
.desc {
  width: calc(100% - 60rpx);
  height: 90rpx;
  background: linear-gradient(355.37deg, #eafb27 3.73%, #fef8f4 109.09%);
  font-size: 24rpx;
  margin: 20rpx auto 0;
  padding: 10rpx 20rpx;
  box-sizing: border-box;
  border-radius: 16rpx;
  .gantanhao {
    height: 26rpx;
    width: 26rpx;
    background: #f1b238;
    border-radius: 50%;
    color: white;
    margin-right: 20rpx;
    margin-top: 6rpx;
  }
}
.container {
  height: calc(100vh - $safe-bottom - 74rpx - 16rpx);
  padding: 30rpx;
  box-sizing: border-box;
  background: #333;
}
</style>
