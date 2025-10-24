<template>
  <md-page :title="taskName || '对话页面'">
    <view class="container">
      <!-- 搜索框 -->
      <view v-if="showSearch" class="search-wrap m-bottom-30">
        <md-icon class="wenhao" name="wenhao" width="48" height="48" @click="handleWenhao"></md-icon>
        <view class="search flex-c m-right-12">
          <input 
            v-model="searchKeyword" 
            placeholder="请输入对方的问题" 
            class="m-left-20 input" 
            placeholder-style="color: #7A59ED;" 
          />
        </view>
        <md-icon name="search_btn" width="76" height="76" @click="handleSearch"></md-icon>
      </view>

      <!-- 状态栏 -->
      <view class="status-bar m-bottom-20">
        <text>阶段：{{ stageIndex }}</text>
        <text class="m-left-12">｜</text>
        <text>回合：{{ roundIndex || '-' }}</text>
        <text class="m-left-12">｜</text>
        <text>步骤：{{ stepLabel }}</text>
        <text class="m-left-12">｜</text>
        <text style="color: #ff6b6b; font-weight: bold;">积分：{{ stageScore }}</text>
      </view>

      <!-- 大CD倒计时页面 -->
      <view v-if="currentView === 'big_cd'" class="big-cd-view">
        <view class="cd-title">{{ cdTitle }}</view>
        <bc-countdown 
          size="large" 
          :time="cdEndTime" 
          desc="倒计时结束后将继续对话"
          @timeup="onCdTimeup" 
        />
        
        <!-- 对方找按钮（大CD期间显示） -->
        <view 
          v-if="showOpponentFindButton"
          class="opponent-find-btn"
          :class="{ disabled: !opponentFindEnabled }"
          @click="handleOpponentFind"
        >
          <view class="btn-text">对方找</view>
          <view v-if="!opponentFindEnabled" class="btn-countdown">
            {{ opponentFindCountdown }}秒后可用
          </view>
        </view>
      </view>

      <!-- Z倒计时页面 -->
      <view v-else-if="currentView === 'z'" class="z-view">
        <view class="z-circle" @click="handleZClick">Z</view>
        <bc-countdown 
          size="medium" 
          :time="zEndTime" 
          desc="倒计时结束后，将回复新内容"
          @timeup="onZTimeup" 
        />
        <view class="z-tip">倒计时期间，您可以自由在微信上发送内容</view>
        
        <!-- Z期间也可以显示对方找按钮 -->
        <view 
          v-if="showOpponentFindButton"
          class="opponent-find-bar"
          :class="{ disabled: !opponentFindEnabled }"
          @click="handleOpponentFind"
        >
          对方找
        </view>
      </view>

      <!-- D模式页面 -->
      <view v-else-if="currentView === 'd'" class="d-view">
        <view class="d-circle" @click="handleDClick">D</view>
        <view class="d-tip">点击D按钮，程序将给出一条新的内容</view>
      </view>

      <!-- 正常内容显示 -->
      <view v-else-if="currentView === 'content'" class="content-view">
        <!-- 内容列表 -->
        <view v-if="contentList.length > 0" class="content-list">
          <view 
            v-for="(item, index) in contentList" 
            :key="index"
            class="content-item"
            :class="{ selected: selectedContentIndex === index }"
          >
            <view class="content-text">{{ item.text }}</view>
            <view 
              class="copy-btn"
              :class="{ disabled: copyDisabled || selectedContentIndex !== null && selectedContentIndex !== index }"
              @click="handleCopy(item, index)"
            >
              {{ getCopyButtonText(item, index) }}
            </view>
          </view>
        </view>

        <!-- 空状态 -->
        <view v-else class="empty-state">
          <text>暂无内容</text>
        </view>
      </view>

      <!-- 阶段CD倒计时 -->
      <view v-else-if="currentView === 'stage_cd'" class="stage-cd-view">
        <view class="cd-title">阶段间倒计时</view>
        <bc-countdown 
          size="large" 
          :time="stageCdEndTime" 
          desc="倒计时结束后将进入下一阶段"
          @timeup="onStageCdTimeup" 
        />
      </view>
    </view>

    <!-- 对方找弹窗 -->
    <md-dialog 
      ref="opponentDialog" 
      title="对方找内容" 
      :width="730" 
      hideOk 
      cancelText="关闭"
      @cancel="handleCloseOpponentDialog"
    >
      <!-- 倒计时提示 -->
      <view v-if="opponentCopyCountdown > 0" class="countdown-tip">
        <view class="countdown-text">倒计时结束后，复制按钮将变为可点击</view>
        <view class="countdown-number">{{ opponentCopyCountdown }}秒</view>
      </view>

      <!-- 对方找内容列表 -->
      <view class="opponent-content-list">
        <view 
          v-for="(item, index) in opponentContentList" 
          :key="index"
          class="opponent-content-item"
        >
          <view class="content-text">{{ item.text }}</view>
          <view 
            class="copy-btn"
            :class="{ disabled: opponentCopyCountdown > 0 }"
            @click="handleCopyOpponent(item, index)"
          >
            复制
          </view>
        </view>
      </view>
    </md-dialog>

    <!-- 搜索结果弹窗 -->
    <md-dialog 
      ref="searchDialog" 
      title="搜索结果" 
      :width="730" 
      hideOk 
      cancelText="关闭"
      @cancel="handleCloseSearchDialog"
    >
      <view v-if="searchResults.length > 0" class="search-results">
        <view 
          v-for="(item, index) in searchResults" 
          :key="index"
          class="search-result-item"
        >
          <view class="result-title">{{ item.title }}</view>
          <view class="result-content">{{ item.content }}</view>
          <view 
            class="copy-btn"
            :class="{ disabled: searchCopyDisabled }"
            @click="handleCopySearch(item, index)"
          >
            复制
          </view>
        </view>
      </view>
      <view v-else class="empty-state">
        <text>未找到相关内容</text>
      </view>
    </md-dialog>
  </md-page>
</template>

<script setup lang="ts">
import { reactive, ref, computed, onMounted, onUnmounted } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { 
  initFamiliarLocal, 
  getTask, 
  copySegment, 
  onZEnter, 
  onDEnter,
  updateLastAction,
  addPoint,
  finishCurrentLibNode,
  enterRoundBigCd,
  enterStageCd,
  onOpponentFindClick,
  searchQA
} from '@/utils/familiar-local';

// 数据
const taskId = ref('');
const taskName = ref('');
const task = ref<any>(null);

// 视图状态
const currentView = ref<'content' | 'z' | 'd' | 'big_cd' | 'stage_cd'>('content');
const contentList = ref<any[]>([]);
const selectedContentIndex = ref<number | null>(null);
const copyDisabled = ref(false);

// 倒计时
const cdEndTime = ref('');
const cdTitle = ref('');
const zEndTime = ref('');
const stageCdEndTime = ref('');

// 对方找
const showOpponentFindButton = ref(false);
const opponentFindEnabled = ref(false);
const opponentFindCountdown = ref(0);
const opponentContentList = ref<any[]>([]);
const opponentCopyCountdown = ref(0);
const opponentDialog = ref<any>(null);

// 搜索
const showSearch = ref(true);
const searchKeyword = ref('');
const searchResults = ref<any[]>([]);
const searchCopyDisabled = ref(false);
const searchDialog = ref<any>(null);

// 计算属性
const stageIndex = computed(() => task.value?.stageIndex || 0);
const roundIndex = computed(() => task.value?.roundIndex || 0);
const stageScore = computed(() => task.value?.stageScore || 0);
const stepLabel = computed(() => {
  if (currentView.value === 'big_cd') return '回合CD';
  if (currentView.value === 'stage_cd') return '阶段CD';
  if (currentView.value === 'z') return 'Z倒计时';
  if (currentView.value === 'd') return 'D模式';
  return '对话中';
});

// 页面加载
onLoad((options: any) => {
  console.log('[round-local] onLoad:', options);
  taskId.value = options.taskId;
  taskName.value = options.taskName || '对话页面';
  
  if (taskId.value) {
    loadTaskData();
  } else {
    uni.showToast({ title: '任务ID缺失', icon: 'error' });
    setTimeout(() => uni.navigateBack(), 2000);
  }
});

// 加载任务数据
const loadTaskData = () => {
  initFamiliarLocal();
  task.value = getTask(taskId.value);
  
  if (!task.value) {
    uni.showToast({ title: '任务不存在', icon: 'error' });
    setTimeout(() => uni.navigateBack(), 2000);
    return;
  }
  
  taskName.value = task.value.name;
  console.log('[loadTaskData] 任务数据:', task.value);
  
  // 根据任务状态决定显示什么
  checkTaskStatus();
};

// 检查任务状态
const checkTaskStatus = () => {
  const now = Date.now();
  
  // 检查阶段CD
  if (task.value.stageCdUnlockAt && now < task.value.stageCdUnlockAt) {
    currentView.value = 'stage_cd';
    stageCdEndTime.value = new Date(task.value.stageCdUnlockAt).toISOString();
    return;
  }
  
  // 检查回合CD
  if (task.value.roundCdUnlockAt && now < task.value.roundCdUnlockAt) {
    currentView.value = 'big_cd';
    cdEndTime.value = new Date(task.value.roundCdUnlockAt).toISOString();
    cdTitle.value = '下次聊天开启倒计时';
    checkOpponentFindStatus();
    return;
  }
  
  // 检查Z倒计时
  if (task.value.zUnlockAt && now < task.value.zUnlockAt) {
    currentView.value = 'z';
    zEndTime.value = new Date(task.value.zUnlockAt).toISOString();
    checkOpponentFindStatus();
    return;
  }
  
  // 检查D模式
  if (task.value.dMode) {
    currentView.value = 'd';
    return;
  }
  
  // 正常内容显示
  currentView.value = 'content';
  loadCurrentContent();
};

// 加载当前内容
const loadCurrentContent = () => {
  // TODO: 实现内容加载逻辑
  console.log('[loadCurrentContent] 加载内容');
};

// 复制按钮文本
const getCopyButtonText = (item: any, index: number) => {
  if (copyDisabled.value) return '冷却中...';
  if (selectedContentIndex.value !== null && selectedContentIndex.value !== index) return '已选其他';
  return '复制';
};

// 处理复制
const handleCopy = (item: any, index: number) => {
  if (copyDisabled.value || (selectedContentIndex.value !== null && selectedContentIndex.value !== index)) {
    return;
  }
  
  console.log('[handleCopy] 复制内容:', item);
  // TODO: 实现复制逻辑
};

// 处理Z点击
const handleZClick = () => {
  uni.showToast({ title: '倒计时结束后，将回复新内容', icon: 'none' });
};

// 处理D点击
const handleDClick = () => {
  console.log('[handleDClick] 点击D按钮');
  // TODO: 实现D点击逻辑
};

// 处理对方找
const handleOpponentFind = () => {
  if (!opponentFindEnabled.value) {
    uni.showToast({ title: '对方找按钮暂不可用', icon: 'none' });
    return;
  }
  
  console.log('[handleOpponentFind] 点击对方找');
  // TODO: 实现对方找逻辑
};

// 处理搜索
const handleSearch = () => {
  if (!searchKeyword.value.trim()) {
    uni.showToast({ title: '请输入搜索内容', icon: 'none' });
    return;
  }
  
  console.log('[handleSearch] 搜索:', searchKeyword.value);
  // TODO: 实现搜索逻辑
};

// 问号说明
const handleWenhao = () => {
  uni.navigateTo({ url: '/pages/sub-page/describe/wenhao' });
};

// 倒计时结束回调
const onCdTimeup = () => {
  console.log('[onCdTimeup] 回合CD结束');
  loadTaskData();
};

const onZTimeup = () => {
  console.log('[onZTimeup] Z倒计时结束');
  loadTaskData();
};

const onStageCdTimeup = () => {
  console.log('[onStageCdTimeup] 阶段CD结束');
  loadTaskData();
};

// 检查对方找状态
const checkOpponentFindStatus = () => {
  // TODO: 实现对方找状态检查
};

// 关闭弹窗
const handleCloseOpponentDialog = () => {
  opponentDialog.value?.close();
};

const handleCloseSearchDialog = () => {
  searchDialog.value?.close();
};

// 复制对方找内容
const handleCopyOpponent = (item: any, index: number) => {
  if (opponentCopyCountdown.value > 0) return;
  console.log('[handleCopyOpponent] 复制对方找内容:', item);
  // TODO: 实现复制逻辑
};

// 复制搜索结果
const handleCopySearch = (item: any, index: number) => {
  if (searchCopyDisabled.value) return;
  console.log('[handleCopySearch] 复制搜索结果:', item);
  // TODO: 实现复制逻辑
};
</script>

<style lang="scss" scoped>
.container {
  padding: 30rpx;
  min-height: 100vh;
}

.status-bar {
  font-size: 24rpx;
  color: #666;
  line-height: 1.6;
}

.big-cd-view,
.stage-cd-view {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60rpx 0;
  
  .cd-title {
    font-size: 32rpx;
    font-weight: bold;
    color: #333;
    margin-bottom: 40rpx;
  }
}

.z-view,
.d-view {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60rpx 0;
  
  .z-circle,
  .d-circle {
    width: 200rpx;
    height: 200rpx;
    border-radius: 50%;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: #fff;
    font-size: 80rpx;
    font-weight: bold;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 40rpx;
    cursor: pointer;
    transition: transform 0.2s;
    
    &:active {
      transform: scale(0.95);
    }
  }
  
  .z-tip,
  .d-tip {
    font-size: 28rpx;
    color: #666;
    margin-top: 20rpx;
    text-align: center;
  }
}

.content-view {
  .content-list {
    .content-item {
      background: #fff;
      border-radius: 16rpx;
      padding: 30rpx;
      margin-bottom: 20rpx;
      box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.08);
      
      &.selected {
        border: 2rpx solid #667eea;
      }
      
      .content-text {
        font-size: 28rpx;
        color: #333;
        line-height: 1.6;
        margin-bottom: 20rpx;
      }
      
      .copy-btn {
        background: #667eea;
        color: #fff;
        padding: 16rpx 40rpx;
        border-radius: 8rpx;
        font-size: 26rpx;
        text-align: center;
        cursor: pointer;
        
        &.disabled {
          background: #ccc;
          cursor: not-allowed;
        }
      }
    }
  }
}

.opponent-find-btn,
.opponent-find-bar {
  margin-top: 40rpx;
  background: #667eea;
  color: #fff;
  padding: 24rpx 60rpx;
  border-radius: 12rpx;
  font-size: 30rpx;
  text-align: center;
  cursor: pointer;
  
  &.disabled {
    background: #ccc;
    cursor: not-allowed;
  }
}

.empty-state {
  text-align: center;
  padding: 100rpx 0;
  color: #999;
  font-size: 28rpx;
}
</style>

