<template>
  <md-page title="问诊模块">
    <template #head>
      <view>
        <view class="head-actions">
          <bc-tequan />
        </view>
        <bc-title-text text="对于比较复杂的用户问题，用户可以选择问诊功能，进行咨询的人工服务。" />
      </view>
    </template>
    <view class="container">
      <block v-for="item in data.list" :key="item.taskId">
        <bc-task-item
          :item="item"
          desc="详细方案回复3内容显示倒计时:"
          bgType="wenzhen"
          tag="问"
          @click="() => handleJump(item)"
          @swipeClick="onSwipeClick"></bc-task-item>
      </block>
      <mescroll-empty v-if="data.list.length == 0"></mescroll-empty>
    </view>
    <!-- 创建弹窗 -->
    <md-dialog ref="popup" @ok="handleOk" @cancel="handleCancel" title="创建问诊分析">
      <uni-easyinput
        v-model="data.value"
        primaryColor="#827afd"
        :styles="{
          borderColor: '#827afd',
        }"
        :maxlength="6"
        placeholder="请输入名称"></uni-easyinput>
    </md-dialog>

    <!-- 底部自定义创建按钮（与线下页保持一致风格） -->
    <template #footer>
      <view class="mf-footer">
        <view class="mf-btn" @click="openCreateDialog">
          <image class="mf-bg" src="@/static/images/xianxia.png" mode="widthFix" />
          <view class="mf-text">
            <image class="mf-logo" src="/static/images/wenzhenicon.png" mode="aspectFit" />
            <text class="mf-plus">＋</text>
            <text class="mf-label">创建问诊分析</text>
          </view>
        </view>
      </view>
    </template>
  </md-page>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import type { BtnTextItem } from '@/components/md-ui/components/md-page/md-page.vue';
// 接口
import api from '@/api/index';
import type { Task } from '@/api/data';
// 工具
import { Toast } from '@/utils/util';
// 字典
import { taskModule } from '@/utils/data';

const data = reactive<any>({
  list: [],
  value: '',
  loading: false, // 添加加载状态标志
  isDeleting: false, // 添加删除标志位，防止删除时触发跳转
});
const popup = ref<any>(null);

const onSwipeClick = (taskId?: string) => {
  // 设置删除标志，防止触发跳转
  data.isDeleting = true;

  // 立即从列表中移除该任务
  if (taskId) {
    data.list = data.list.filter((item: any) => String(item.taskId) !== String(taskId));
  }

  // 异步刷新列表
  getTaskList();

  // 延迟重置删除标志
  setTimeout(() => {
    data.isDeleting = false;
  }, 500);
};

const handleOk = () => {
  console.log('ok', data.value);
  if (!data.value) {
    Toast('请输入任务名称');
    return;
  }
  // 防止重复提交
  if (data.loading) {
    return;
  }
  fetchCreateTask({ taskName: data.value });
};

const handleCancel = () => {
  data.value = '';
};

const openCreateDialog = () => {
  popup.value?.open?.();
};

const bottomBtnClick = (info: { item: BtnTextItem }) => {
  const { key } = info.item;
  if (key === 'create') {
    popup.value!.open();
  }
};

const handleJump = (item: Task.List.Data) => {
  // 如果正在删除，不执行跳转
  if (data.isDeleting) {
    return;
  }

  let url = '';
  let params = `taskId=${item.taskId}&taskName=${item.taskName}`;
  if (item.taskStatus === 20) {
    // 20-问题已提交
    url = `/pages/sub-page/wenzhen/analysis?${params}`;
  } else if (item.taskStatus === 30) {
    // 30-问题答案已给出
    url = `/pages/sub-page/wenzhen/scheme?${params}`;
  } else if (item.taskStatus >= 50) {
    // 50-二次提交的问题等待回复，51-二次提交的问题回复中，52-二次提交的问题回复完成
    url = `/pages/sub-page/wenzhen/detail?${params}&taskStatus=${item.taskStatus}`;
  } else {
    // 10-初始化
    url = `/pages/sub-page/wenzhen/questionnaire?${params}`;
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
      moduleCode: taskModule['问诊模块'],
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
    const res = await api.task.createTask({ ...params, moduleCode: taskModule['问诊模块'] });

    // 关闭弹窗
    popup.value?.close();
    handleCancel();

    // 跳转到问卷页面
    uni.navigateTo({
      url: `/pages/sub-page/wenzhen/questionnaire?taskId=${res.data?.taskId}&taskName=${params?.taskName}`,
    });
  } catch (error) {
    console.error('创建问诊任务失败:', error);
    Toast('创建失败，请重试');
  } finally {
    // 无论成功还是失败，都要关闭加载状态
    data.loading = false;
    uni.hideLoading();
  }
};

onShow(() => {
  // 检查是否已登录
  const token = uni.getStorageSync('token');
  if (!token) {
    console.log('[问诊模块] 用户未登录，跳转到登录页');
    uni.navigateTo({
      url: '/pages/login/index',
    });
    return;
  }

  getTaskList();
});
</script>

<style lang="scss" scoped>
.container {
  padding: 180rpx 30rpx 30rpx;
  box-sizing: border-box;
}

/* 头部右侧“特权”固定在最右，不随滚动 */
.head-actions {
  display: flex;
  justify-content: flex-end;
  padding: 0 30rpx;
}

/* 底部固定大按钮（与线下页保持一致风格） */
.mf-footer {
  position: fixed;
  left: 0; right: 0; bottom: 0;
  padding: 16rpx 30rpx;
  padding-bottom: calc(env(safe-area-inset-bottom) + 16rpx);
  box-sizing: border-box;
  z-index: 99;
}
.mf-btn { width: 100%; position: relative; }
.mf-bg { width: 100%; display: block; }
.mf-text {
  position: absolute; inset: 0;
  display: flex; align-items: center; justify-content: center;
  // transform: translateY(20rpx);
  text-align: center;
}
.mf-logo {
  width: 88rpx;
  height: 88rpx;
  margin-right: 16rpx;
  display: block;
  background-color: transparent !important;
}
.mf-plus { color: #fff; font-size: 40rpx; font-weight: 700; margin-right: 12rpx; line-height: 1; }
.mf-label { color: #fff; font-size: 32rpx; font-weight: 600; line-height: 1; white-space: nowrap; }
</style>
