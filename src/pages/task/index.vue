<template>
	<md-page title="任务列表" :showLeft="false">
		<view class="container">
			<view class="list" v-for="item in data.list" :key="item.taskId" @click="handleJump">
				<md-icon type="bg" name="lv" width="67.5" height="75"></md-icon>
				<view class="right m-left-20">
					<view class="top-row m-bottom-12">
						<view class="title fs-32 font-bold">{{ item.taskName }}</view>
						<view class="btn full">特权</view>
					</view>
					<view class="date-wrap flex-l m-bottom-28" v-if="item.endTime && String(item.endTime).trim()">
						<text class="label">下回合开启时间：</text>
						<text class="date font-bold">{{ item.endTime }}</text>
					</view>
					<view class="bottom">
						<view class="btn">重置</view>
						<view class="btn" @click.stop="handleDelete(item.taskId)">删除</view>
						<view class="btn active" @click.stop="handleRenew(item.taskId)">充值</view>
					</view>
				</view>
			</view>
		</view>
	</md-page>
	<bottom-tab-bar :current="0" />
</template>

<script setup lang="ts">
import { reactive } from 'vue';
import { onLoad, onShow } from '@dcloudio/uni-app';
// 接口
import { initFamiliarLocal, listTasks, createTask, deleteTask, renewTask } from '@/utils/familiar-local';


const data = reactive<any>({
  list: [],
});

const handleJump = () => {
  uni.navigateTo({
    url: '/pages/sub-page/task/list',
  });
};

const fetchTaskList = async () => {
  initFamiliarLocal();
  let lt = listTasks();
  // 首次无任务，自动创建一个示例订单，便于立刻看到效果
  if (!lt || lt.length === 0) {
    const created = createTask({ name: '测试订单', durationDays: 5 });
    if (created.ok) {
      lt = listTasks();
      uni.showToast({ title: '已创建示例订单', icon: 'none' });
    }
  }
  // 映射为现有模板字段，避免改动模板
  data.list = (lt || []).map((i) => ({
    taskId: i.id,
    taskName: i.name,
    endTime: i.countdownEndAt ? new Date(i.countdownEndAt).toLocaleString() : '',
  }));
};

const handleDelete = (id: string) => {
  deleteTask(id);
  uni.showToast({ title: '已删除', icon: 'none' });
  fetchTaskList();
};

const handleRenew = (id: string) => {
  const r = renewTask(id, 5, 46);
  uni.showToast({ title: r.success ? '续时成功' : (r.reason || '续时失败'), icon: r.success ? 'success' : 'none' });
  fetchTaskList();
};

onLoad(() => {
  fetchTaskList();
});

// 进入页面（包含从登录页跳转回来）时刷新一次
onShow(() => {
  fetchTaskList();
});

</script>

<style lang="scss" scoped>
.container {
	padding: 30rpx;
	min-height: 100vh;
	box-sizing: border-box;
	background: linear-gradient(180deg, #eef0ff 0%, #f6f7ff 60%, #ffffff 100%);
	.list {
		width: 100%;
		background: #ffffff;
		border-radius: 24rpx;
		box-shadow: 0 12rpx 32rpx rgba(36,36,36,0.08);
		display: flex;
		align-items: flex-start;
		padding: 24rpx 32rpx 24rpx 24rpx; /* 右侧留更多内边距 */
		box-sizing: border-box;
		overflow: hidden; /* 防止子元素超出圆角边框 */
		&:not(:last-of-type) {
			margin-bottom: 20rpx;
		}
		.btn {
			width: 112rpx;
			height: 56rpx;
			line-height: 56rpx;
			text-align: center;
			border-radius: 20rpx;
			border: 1rpx solid $title;
			&.active {
				color: $theme-color;
				border-color: $theme-color;
			}
			&.full {
				border: 0;
				background-color: $theme-color;
				color: white;
			}
		}
		.right {
			flex: 1;
			display: flex;
			flex-direction: column;
			justify-content: space-between;
			.top-row {
				display: flex;
				align-items: center;
				justify-content: space-between;
				:deep(.btn) {
					margin-left: 24rpx;
					flex-shrink: 0;
				}
			}
			.date-wrap {
				display: flex;
				align-items: center;
				gap: 8rpx;
				white-space: normal; /* 单独一行显示，不与特权同一行 */
				flex-wrap: wrap;
				.label {
					color: #9aa0a6;
				}
				.date {
					color: $title;
				}
			}

			.bottom {
				display: flex;
				justify-content: flex-end;
				.btn:not(:last-of-type) {
					margin-right: 20rpx;
				}
			}
		}
	}
}
</style>
