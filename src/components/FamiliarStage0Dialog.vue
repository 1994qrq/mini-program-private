<template>
  <view>
    <!-- 问1：是否有联系方式 -->
    <uni-popup ref="question1Popup" type="dialog">
      <uni-popup-dialog
        mode="base"
        title="温馨提示"
        :content="QUESTION_1_CONTENT"
        :before-close="true"
        @close="onQuestion1Cancel"
        @confirm="onQuestion1Confirm">
        <template #default>
          <view class="dialog-content">
            <view class="question-text">{{ QUESTION_1_CONTENT }}</view>
            <view class="button-group">
              <button class="dialog-btn dialog-btn-cancel" @click="onQuestion1Cancel">否</button>
              <button class="dialog-btn dialog-btn-confirm" @click="onQuestion1Confirm">是</button>
            </view>
          </view>
        </template>
      </uni-popup-dialog>
    </uni-popup>

    <!-- 问2：是否准备好 -->
    <uni-popup ref="question2Popup" type="dialog">
      <uni-popup-dialog
        mode="base"
        title="温馨提示"
        :content="QUESTION_2_CONTENT"
        :before-close="true"
        @close="onQuestion2Cancel"
        @confirm="onQuestion2Confirm">
        <template #default>
          <view class="dialog-content">
            <view class="question-text">{{ QUESTION_2_CONTENT }}</view>
            <view class="button-group">
              <button class="dialog-btn dialog-btn-cancel" @click="onQuestion2Cancel">否</button>
              <button class="dialog-btn dialog-btn-confirm" @click="onQuestion2Confirm">是</button>
            </view>
          </view>
        </template>
      </uni-popup-dialog>
    </uni-popup>

    <!-- 问3：是否完成第一阶段 -->
    <uni-popup ref="question3Popup" type="dialog">
      <uni-popup-dialog
        mode="base"
        title="温馨提示"
        :content="QUESTION_3_CONTENT"
        :before-close="true"
        @close="onQuestion3Cancel"
        @confirm="onQuestion3Confirm">
        <template #default>
          <view class="dialog-content">
            <view class="question-text">{{ QUESTION_3_CONTENT }}</view>
            <view class="button-group">
              <button class="dialog-btn dialog-btn-cancel" @click="onQuestion3Cancel">否</button>
              <button class="dialog-btn dialog-btn-confirm" @click="onQuestion3Confirm">是</button>
            </view>
          </view>
        </template>
      </uni-popup-dialog>
    </uni-popup>

    <!-- 提示板S1：没有联系方式 -->
    <uni-popup ref="tipsS1Popup" type="dialog">
      <uni-popup-dialog
        mode="base"
        title="温馨提示"
        content="建议您先获取对方的联系方式后再继续"
        @confirm="onTipsS1Confirm">
      </uni-popup-dialog>
    </uni-popup>

    <!-- 提示板S2：准备好开始 -->
    <uni-popup ref="tipsS2Popup" type="dialog">
      <uni-popup-dialog
        mode="base"
        title="温馨提示"
        content="请保持耐心，接下来将进入9-10天的等待期"
        @confirm="onTipsS2Confirm">
      </uni-popup-dialog>
    </uni-popup>

    <!-- 提示板S3：未准备好 -->
    <uni-popup ref="tipsS3Popup" type="dialog">
      <uni-popup-dialog
        mode="base"
        title="温馨提示"
        content="请您做好准备后再开始"
        @confirm="onTipsS3Confirm">
      </uni-popup-dialog>
    </uni-popup>

    <!-- 提示板S4：完成等待期 -->
    <uni-popup ref="tipsS4Popup" type="dialog">
      <uni-popup-dialog
        mode="base"
        title="温馨提示"
        content="很好！接下来将进入正式阶段，请继续保持"
        @confirm="onTipsS4Confirm">
      </uni-popup-dialog>
    </uni-popup>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { getTask } from '@/utils/familiar-local';

const QUESTION_1_CONTENT = '有对方微信或其他线上可交流方式吗？';
const QUESTION_2_CONTENT = '需要让对方见不到您20天左右。其中前10天左右什么也不用做，后10天左右请根据之后指引操作，确定可以开始并准备好之后请选"是"（即是否准备好）';
const QUESTION_3_CONTENT = '请确定完成第一阶段，即倒计时结束前未与对方见面或主动联系，是或否？';

const emit = defineEmits<{
  question1Result: [result: 'yes' | 'no'];
  question2Result: [result: 'yes' | 'no'];
  question3Result: [result: 'yes' | 'no'];
  showTipsS1: [];
  showTipsS2: [];
  showTipsS3: [];
  showTipsS4: [];
  tipsS1Confirmed: [];
  tipsS2Confirmed: [];
  tipsS3Confirmed: [];
  tipsS4Confirmed: [];
}>();

const question1Popup = ref<any>(null);
const question2Popup = ref<any>(null);
const question3Popup = ref<any>(null);
const tipsS1Popup = ref<any>(null);
const tipsS2Popup = ref<any>(null);
const tipsS3Popup = ref<any>(null);
const tipsS4Popup = ref<any>(null);

let currentTaskId = '';

// ==================== 问1 ====================
const showQuestion1 = (taskId: string) => {
  currentTaskId = taskId;
  question1Popup.value?.open();
};

const onQuestion1Confirm = () => {
  question1Popup.value?.close();
  const t = getTask(currentTaskId);
  if (t) {
    t.askFlow = { ...(t.askFlow || {}), ask1: '是' };
    uni.setStorageSync(`fm:task:${currentTaskId}`, t);
  }
  emit('question1Result', 'yes');
};

const onQuestion1Cancel = () => {
  question1Popup.value?.close();
  const t = getTask(currentTaskId);
  if (t) {
    t.askFlow = { ...(t.askFlow || {}), ask1: '否' };
    uni.setStorageSync(`fm:task:${currentTaskId}`, t);
  }
  emit('question1Result', 'no');
};

// ==================== 问2 ====================
const showQuestion2 = (taskId: string) => {
  currentTaskId = taskId;
  question2Popup.value?.open();
};

const onQuestion2Confirm = () => {
  question2Popup.value?.close();
  const t = getTask(currentTaskId);
  if (t) {
    t.askFlow = { ...(t.askFlow || {}), ask2: '是' };
    uni.setStorageSync(`fm:task:${currentTaskId}`, t);
  }
  emit('question2Result', 'yes');
};

const onQuestion2Cancel = () => {
  question2Popup.value?.close();
  const t = getTask(currentTaskId);
  if (t) {
    t.askFlow = { ...(t.askFlow || {}), ask2: '否' };
    uni.setStorageSync(`fm:task:${currentTaskId}`, t);
  }
  emit('question2Result', 'no');
};

// ==================== 问3 ====================
const showQuestion3 = (taskId: string) => {
  currentTaskId = taskId;
  question3Popup.value?.open();
};

const onQuestion3Confirm = () => {
  question3Popup.value?.close();
  const t = getTask(currentTaskId);
  if (t) {
    t.askFlow = { ...(t.askFlow || {}), ask3: '是' };
    uni.setStorageSync(`fm:task:${currentTaskId}`, t);
  }
  emit('question3Result', 'yes');
};

const onQuestion3Cancel = () => {
  question3Popup.value?.close();
  const t = getTask(currentTaskId);
  if (t) {
    t.askFlow = { ...(t.askFlow || {}), ask3: '否' };
    uni.setStorageSync(`fm:task:${currentTaskId}`, t);
  }
  emit('question3Result', 'no');
};

// ==================== 提示板 ====================
const showTipsS1 = (taskId: string) => {
  currentTaskId = taskId;
  const t = getTask(taskId);
  if (t) {
    t.prompts = { ...(t.prompts || {}), S1: { shown: true, at: Date.now() } };
    uni.setStorageSync(`fm:task:${taskId}`, t);
  }
  emit('showTipsS1');
  tipsS1Popup.value?.open();
};

const onTipsS1Confirm = () => {
  tipsS1Popup.value?.close();
  emit('tipsS1Confirmed');
};

const showTipsS2 = (taskId: string) => {
  currentTaskId = taskId;
  const t = getTask(taskId);
  if (t) {
    t.prompts = { ...(t.prompts || {}), S2: { shown: true, at: Date.now() } };
    uni.setStorageSync(`fm:task:${taskId}`, t);
  }
  emit('showTipsS2');
  tipsS2Popup.value?.open();
};

const onTipsS2Confirm = () => {
  tipsS2Popup.value?.close();
  emit('tipsS2Confirmed');
};

const showTipsS3 = (taskId: string) => {
  currentTaskId = taskId;
  const t = getTask(taskId);
  if (t) {
    t.prompts = { ...(t.prompts || {}), S3: { shown: true, at: Date.now() } };
    uni.setStorageSync(`fm:task:${taskId}`, t);
  }
  emit('showTipsS3');
  tipsS3Popup.value?.open();
};

const onTipsS3Confirm = () => {
  tipsS3Popup.value?.close();
  emit('tipsS3Confirmed');
};

const showTipsS4 = (taskId: string) => {
  currentTaskId = taskId;
  const t = getTask(taskId);
  if (t) {
    t.prompts = { ...(t.prompts || {}), S4: { shown: true, at: Date.now() } };
    uni.setStorageSync(`fm:task:${taskId}`, t);
  }
  emit('showTipsS4');
  tipsS4Popup.value?.open();
};

const onTipsS4Confirm = () => {
  tipsS4Popup.value?.close();
  emit('tipsS4Confirmed');
};

// ==================== 暴露方法 ====================
defineExpose({
  showQuestion1,
  showQuestion2,
  showQuestion3,
  showTipsS1,
  showTipsS2,
  showTipsS3,
  showTipsS4,
});
</script>

<style lang="scss" scoped>
.dialog-content {
  padding: 20rpx;
}

.question-text {
  font-size: 28rpx;
  line-height: 1.6;
  color: #333;
  margin-bottom: 30rpx;
  text-align: center;
}

.button-group {
  display: flex;
  justify-content: space-around;
  gap: 20rpx;
}

.dialog-btn {
  flex: 1;
  height: 80rpx;
  line-height: 80rpx;
  border-radius: 40rpx;
  font-size: 28rpx;
  font-weight: 600;
  border: none;
}

.dialog-btn-cancel {
  background-color: #f5f5f5;
  color: #666;
}

.dialog-btn-confirm {
  background-color: #827afd;
  color: #fff;
}
</style>

