<template>
  <view class="page-wrap" :style="`background-image: url(${data.bottom_bg}); background-repeat: no-repeat; background-size: cover; background-position: center bottom;`">
    <md-page
      :title="data.title">
    <template #head>
      <view>
        <view class="flex-l" style="justify-content: flex-end">
          <view class="flex flex-b p-right-30" style="width: calc(50% + 10rpx)">
            <!-- <md-icon type="bg" name="chaoshu_icon" width="80" height="80" circle></md-icon> -->
             <view></view>
            <bc-tequan />
          </view>
        </view>
        <bc-title-text text="对于比较复杂的用户问题，用户可以选择问诊功能，进行咨询的人工服务。" />
      </view>
    </template>
    <view class="container">
      <block v-for="item in data.list" :key="item.id">
        <bc-task-item
          :item="item"
          :desc="roundDesc(item.taskStatus)"
          @click="() => handleJump(item)"
          @swipeClick="onSwipeClick"></bc-task-item>
      </block>
      <mescroll-empty v-if="data.list.length == 0"></mescroll-empty>
    </view>
    <!-- 创建弹窗 -->
    <md-dialog :title="`创建${data.title.slice(0, 2)}任务`" ref="popup" @ok="handleOk" @cancel="handleCancel">
      <!-- :maxlength="6" -->
      <uni-easyinput
        v-model="data.value"
        primaryColor="#827afd"
        :styles="{
          borderColor: '#827afd',
        }"
        placeholder="请输入名称"></uni-easyinput>
    </md-dialog>
    <!-- 自定义底部创建免费任务按钮 -->
    <template #footer>
      <view class="mf-footer">
        <view class="mf-btn" @click="openCreateDialog">
          <image class="mf-bg" :src="footerConfig.bg" mode="widthFix" />
          <view class="mf-text">
            <text class="mf-plus">＋</text>
            <text class="mf-label">{{ footerConfig.label }}</text>
          </view>
        </view>
      </view>
    </template>
    </md-page>

  </view>
</template>

<script setup lang="ts">
import { onLoad } from '@dcloudio/uni-app';
import { reactive, ref, computed } from 'vue';
// 接口
import api from '@/api';
import type { Four, Task } from '@/api/data';
// 工具
import { taskModule } from '@/utils/data';
import type { taskModuleKey } from '@/utils/data';
import { hasItTimeOut, Toast, convertToBase64 } from '@/utils/util';
import { question3 } from './shuxi/stage0';
import { getTaskDetail } from '@/utils/api';

const data = reactive<any>({
  title: '',
  list: [],
  module: '',
  value: '',
  bottom_bg: '',
});
const popup = ref<any>(null);


const footerConfig = computed(() => {
  if (data.title.includes('超熟')) return { bg: '/static/images/chaoshu.png', label: '创建超熟任务' };
  if (data.title.includes('熟悉')) return { bg: '/static/images/shuxi.png', label: '创建熟悉任务' };
  if (data.title.includes('不熟')) return { bg: '/static/images/bushu.png', label: '创建不熟任务' };
  if (data.title.includes('陌生')) return { bg: '/static/images/mosheng.png', label: '创建陌生任务' };
  if (data.title.includes('免费')) return { bg: '/static/images/mianfei.png', label: '创建免费任务' };
  return { bg: '/static/images/mianfei.png', label: '创建免费任务' };
});

const roundDesc = (status: number) => {
  if ([61, 62].includes(status)) {
    return '下次聊天开启倒计时';
  } else if (status === 63) {
    return 'Z倒计时';
  } else if (status === 65) {
    return '对方找倒计时';
  }
  return '聊天任务进行中';
};

const handleOk = () => {
  if (!data.value) {
    Toast('请输入任务名称');
    return;
  }
  fetchCreateTask({ taskName: data.value });
};

const handleCancel = () => {
  data.value = '';
};

const openCreateDialog = () => {
  const inst: any = popup.value;
  if (inst && typeof inst.open === 'function') {
    inst.open();
  } else {
    // 等待下一帧再尝试，避免未挂载时点击
    setTimeout(() => {
      const again: any = popup.value;
      if (again && typeof again.open === 'function') {
        again.open();
      } else {
        Toast('弹窗暂未就绪，请稍后再试');
      }
    }, 0);
  }
};


const handleJump = async (item: Task.List.Data & Four.GetTaskDetail.Data) => {
  if (item.stepType === 'familiar_s2') {
    // 获取目标时间是否超时
    const _hasItTimeOut = hasItTimeOut(item?.endTime);
    // 如果时间倒计时未结束，则不让点击
    if (!_hasItTimeOut) {
      return;
    }
    question3({
      taskId: item.taskId,
      specialStepId: item.specialStepId,
    });
  }
  // if (item.stepType === 'familiar_s4') {
  // }
  // 跳转对方主动找页面
  uni.redirectTo({ url: '/pages/sub-page/stepTask/round?module=熟悉模块&taskId=' + item.taskId });
  // shuxiModule({
  //   isScoreFlag: 0,
  //   taskId: item.taskId,
  //   endTime: item.endTime,
  //   // stepType: item.stepType,
  // });
  // const data = await fetchGetTaskDetail(item.taskId);
  // uni.navigateTo({
  //   url: '/pages/sub-page/stepTask/problem',
  // });
};

const onSwipeClick = () => {
  getTaskList();
};

/**
 * 接口相关
 */
// 获取任务列表
const getTaskList = async (module?: any) => {
  try {
    const res = await api.task.list({
      moduleCode: module || data.module,
    });
    const list = [];
    for (let item of res?.data || []) {
      // 获取任务详情
      const detail = await getTaskDetail(item.taskId);
      list.push({ ...item, ...detail });
    }
    data.list = list;
  } catch (error) {}
};

// 创建任务
const fetchCreateTask = async (params: Pick<Task.Create.Body, 'taskName'>) => {
  try {
    const res = await api.task.createTask({ ...params, moduleCode: data.module });
    // 只有【熟悉模块】和【超熟模块】才有问卷
    if (['熟悉模块', '超熟模块'].includes(data.title)) {
      uni.navigateTo({
        url: `/pages/sub-page/stepTask/questionnaire?taskId=${res.data?.taskId}&taskName=${params?.taskName}&module=${data.title}`,
      });
    }
    handleCancel();
  } catch (error) {}
};

onLoad(async (options: any) => {
  const module = options?.module as taskModuleKey;
  data.module = taskModule[module];
  data.title = module;
  await getTaskList(taskModule[module]);
  data.bottom_bg = await convertToBase64('/static/images/page_bottom_bg.png');

});
</script>

<style lang="scss" scoped>
.container {
  padding: 180rpx 30rpx 30rpx;
  box-sizing: border-box;
}

/* 底部免费按钮 */
.mf-footer {
  position: fixed;
  left: 0; right: 0; bottom: 0;
  padding: 16rpx 30rpx;
  padding-bottom: calc(env(safe-area-inset-bottom) + 16rpx);
  box-sizing: border-box;
  z-index: 99;
}

/* 页面底部背景 */
.page-wrap { position: relative; min-height: 100vh; }

.mf-btn { width: 100%; position: relative; }
.mf-bg { width: 100%; display: block; }
.mf-text { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; transform: translateY(20rpx); }
.mf-plus { color: #fff; font-size: 40rpx; font-weight: 700; margin-right: 12rpx; line-height: 1; }
.mf-label { color: #fff; font-size: 32rpx; font-weight: 600; line-height: 1; }

</style>
