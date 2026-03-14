<template>
  <md-dialog 
    ref="dialog" 
    :title="promptTitle" 
    :width="730"
    :hideOk="hideOk"
    :hideCancel="hideCancel"
    :okText="okText"
    :cancelText="cancelText"
    @ok="handleOk"
    @cancel="handleCancel"
  >
    <view class="prompt-content">
      <view class="prompt-text">{{ promptContent }}</view>
      
      <!-- S7/S15/S25等需要选择的提示板 -->
      <view v-if="showChoices" class="prompt-choices">
        <view 
          v-for="(choice, index) in choices" 
          :key="index"
          class="choice-btn"
          @click="handleChoice(choice.value)"
        >
          {{ choice.text }}
        </view>
      </view>
    </view>
  </md-dialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

interface Props {
  promptCode: string;  // 提示板编号，如 S1, S2, S7, S15 等
  showChoices?: boolean;  // 是否显示选择按钮
  choices?: Array<{ text: string; value: string }>;  // 选择项
}

const props = withDefaults(defineProps<Props>(), {
  showChoices: false,
  choices: () => []
});

const emit = defineEmits<{
  (e: 'ok'): void;
  (e: 'cancel'): void;
  (e: 'choice', value: string): void;
}>();

const dialog = ref<any>(null);

// 提示板内容配置
const promptConfig: Record<string, { title: string; content: string; hideOk?: boolean; hideCancel?: boolean; okText?: string; cancelText?: string }> = {
  // 阶段0提示板
  S1: {
    title: '温馨提示',
    content: '建议您先获取对方的联系方式后再继续',
    hideCancel: true,
    okText: '确定'
  },
  S2: {
    title: '温馨提示',
    content: '请保持耐心，接下来将进入9-10天的等待期',
    hideCancel: true,
    okText: '确定'
  },
  S3: {
    title: '温馨提示',
    content: '请您做好准备后再开始',
    hideCancel: true,
    okText: '确定'
  },
  S4: {
    title: '温馨提示',
    content: '很好！接下来将进入正式阶段，请继续保持',
    hideCancel: true,
    okText: '确定'
  },
  
  // 第一阶段提示板
  S5: {
    title: '熟悉提示',
    content: '恭喜进入第一阶段！接下来将进行6个回合的互动，每个回合都很重要。请根据内容库提示与对方保持良好沟通，积累足够的积分后即可进入下一阶段。',
    hideCancel: true,
    okText: '开始第一阶段'
  },
  S6: {
    title: '温馨提示',
    content: '您已完成前4个回合，目前得分情况需要关注。第5回合是关键节点，请认真对待每一次互动。',
    hideCancel: true,
    okText: '我知道了'
  },
  S7: {
    title: '温馨提示',
    content: '您的得分与前三回合相同，进展较慢。是否继续坚持当前策略？选择"坚持"将继续第6回合，选择"放弃"将结束任务。',
    okText: '坚持',
    cancelText: '放弃'
  },
  S8: {
    title: '温馨提示',
    content: '您选择了放弃坚持。任务即将结束，您可以稍后重新开始新的任务。',
    hideCancel: true,
    okText: '确定'
  },
  S9: {
    title: '确认结束',
    content: '确定要结束当前任务吗？结束后将无法恢复当前进度。',
    okText: '确定结束',
    cancelText: '再想想'
  },
  
  // 第二阶段提示板
  S10: {
    title: '温馨提示',
    content: '恭喜进入第二阶段特殊回合a！这是一个关键回合，请仔细阅读内容库提示，把握好这次机会。',
    hideCancel: true,
    okText: '开始特殊回合'
  },
  S11: {
    title: '温馨提示',
    content: '特殊回合a的得分不理想，是否继续坚持？选择"坚持"将进入15天倒计时，选择"放弃"将结束任务。',
    okText: '坚持',
    cancelText: '放弃'
  },
  S12: {
    title: '温馨提示',
    content: '您选择了放弃坚持。任务即将结束，期待您下次再来挑战。',
    hideCancel: true,
    okText: '确定'
  },
  S13: {
    title: '温馨提示',
    content: '接下来将进入15天倒计时等待期。倒计时结束后，系统会询问是否有"对方找"的情况。请耐心等待并保持关注。',
    hideCancel: true,
    okText: '我知道了'
  },
  S14: {
    title: '任务结束',
    content: '很遗憾，本次任务未能成功完成。感谢您的参与，您可以选择重新开始或查看其他任务。',
    hideCancel: true,
    okText: '确定'
  },
  
  // 第三阶段提示板
  S15: {
    title: '温馨提示',
    content: '本回合得分未达到预期标准。是否继续坚持？选择"坚持"将继续下一回合，选择"放弃"可以选择半价重开。',
    okText: '坚持',
    cancelText: '放弃'
  },
  S16: {
    title: '温馨提示',
    content: '您可以选择半价重开任务（仅需69心币，获得5天新任务），或者直接结束任务。半价重开将保留您的问卷答案，但所有进度将重置。',
    okText: '半价重开',
    cancelText: '结束任务'
  },
  S17: {
    title: '温馨提示',
    content: '恭喜进入特殊回合b！这是第三阶段的关键回合，请认真对待。根据内容库提示与对方互动，争取获得更高分数。',
    hideCancel: true,
    okText: '开始特殊回合'
  },
  S18: {
    title: '温馨提示',
    content: '请确认：在本回合中，是否有"对方主动找您"的情况？（回合数≥4时询问）',
    okText: '有对方找',
    cancelText: '没有'
  },
  S19: {
    title: '对方找回复',
    content: '太好了！对方主动找您说明进展顺利。以下是建议的回复内容，请复制后使用：\n\n[这里显示内容库中的回复模板]',
    hideCancel: true,
    okText: '我知道了'
  },
  
  // 第四阶段提示板
  S20: {
    title: '温馨提示',
    content: '恭喜进入第四阶段！现在您可以选择：\n\n1. 马上邀约：直接向对方发出邀约\n2. 多聊一次：返回第三阶段再进行一个回合（仅限一次）\n3. 暂时不做选择：稍后再决定\n\n请根据当前情况做出选择。',
    hideOk: true,
    hideCancel: true
  },
  S21: {
    title: '温馨提示',
    content: '您已选择"多聊一次"。接下来将返回第三阶段进行一个额外回合，完成后会再次回到第四阶段。注意：此功能仅可使用一次。',
    hideCancel: true,
    okText: '确定'
  },
  S22: {
    title: '温馨提示',
    content: '多聊一次回合已完成！现在您可以重新选择下一步操作。',
    hideCancel: true,
    okText: '返回选择'
  },
  S23: {
    title: '温馨提示',
    content: '邀约成功！请等待对方确认。在等待期间，任务将进入延时状态。您可以选择关闭任务或继续等待。',
    hideCancel: true,
    okText: '我知道了'
  },
  S24: {
    title: '温馨提示',
    content: '是否关闭当前任务？\n\n选择"关闭任务"：任务将结束\n选择"放弃关闭"：任务继续，可使用搜索问答功能',
    okText: '关闭任务',
    cancelText: '放弃关闭'
  },
  S25: {
    title: '温馨提示',
    content: '邀约已失败超过2次。您可以选择：\n\n1. 进行指导：查看邀约技巧和建议\n2. 关闭任务：结束当前任务\n\n建议先查看指导内容，提升邀约成功率。',
    hideOk: true,
    hideCancel: true
  },
  S26: {
    title: '邀约指导',
    content: '邀约技巧建议：\n\n1. 选择合适的时机，避免对方忙碌时段\n2. 用词真诚自然，不要过于正式\n3. 提供具体的时间和地点选项\n4. 给对方留有选择余地\n5. 保持轻松愉快的语气\n\n查看完毕后，您可以选择关闭任务或继续尝试。',
    okText: '关闭任务',
    cancelText: '继续尝试'
  },
  S27: {
    title: '温馨提示',
    content: '您可以选择半价重启任务（仅需69心币，获得5天新任务），或者直接结束任务。半价重启将保留您的问卷答案，但所有进度将重置。',
    okText: '半价重启',
    cancelText: '结束任务'
  },
  S28: {
    title: '温馨提示',
    content: '半价重启成功！新任务已创建（有效期5天）。您的问卷答案已保留，其他进度已重置。祝您本次任务顺利！',
    hideCancel: true,
    okText: '开始新任务'
  },
  S29: {
    title: '确认关闭',
    content: '确定要关闭任务吗？关闭后任务将结束，无法恢复当前进度。',
    hideCancel: true,
    okText: '确定关闭'
  },
  S30: {
    title: '温馨提示',
    content: '任务将继续进行。在任务有效期内，您可以随时使用搜索问答功能获取帮助。',
    hideCancel: true,
    okText: '我知道了'
  },
  S31_1: {
    title: '熟悉一阶段提示',
    content: '这是第一阶段的补充提示信息。请根据实际情况调整您的沟通策略。',
    hideCancel: true,
    okText: '确定'
  }
};

// 计算属性
const config = computed(() => promptConfig[props.promptCode] || {
  title: '温馨提示',
  content: '提示内容',
  hideCancel: true,
  okText: '确定'
});

const promptTitle = computed(() => config.value.title);
const promptContent = computed(() => config.value.content);
const hideOk = computed(() => config.value.hideOk || false);
const hideCancel = computed(() => config.value.hideCancel || false);
const okText = computed(() => config.value.okText || '确定');
const cancelText = computed(() => config.value.cancelText || '取消');

// 方法
const show = () => {
  dialog.value?.show();
};

const close = () => {
  dialog.value?.close();
};

const handleOk = () => {
  emit('ok');
  close();
};

const handleCancel = () => {
  emit('cancel');
  close();
};

const handleChoice = (value: string) => {
  emit('choice', value);
  close();
};

// 暴露方法
defineExpose({
  show,
  close
});
</script>

<style lang="scss" scoped>
.prompt-content {
  padding: 20rpx;
  
  .prompt-text {
    font-size: 28rpx;
    color: #333;
    line-height: 1.6;
    text-align: center;
    margin-bottom: 30rpx;
  }
  
  .prompt-choices {
    display: flex;
    flex-direction: column;
    gap: 20rpx;
    
    .choice-btn {
      background: #667eea;
      color: #fff;
      padding: 24rpx;
      border-radius: 12rpx;
      font-size: 28rpx;
      text-align: center;
      cursor: pointer;
      transition: all 0.3s;
      
      &:active {
        background: #5568d3;
        transform: scale(0.98);
      }
    }
  }
}
</style>

