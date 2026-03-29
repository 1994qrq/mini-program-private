<template>
	<md-page title="您咨询">
		<view class="container">
			<block v-for="item in data.list" :key="item.id">
				<bc-qa-item :item="item"></bc-qa-item>
			</block>
			<bc-bottom-bar rightBtn okText="提交" @ok="handleSubmit" showBack="false" />
		</view>
	</md-page>
</template>

<script setup lang="ts">
import { reactive } from 'vue';
const data = reactive({
	list: [
		{ id: 1, title: 'NO.1', content: '这是一个问题，一个问题一个问题一个问题一个问题一个问题一个问题一个问题一个问题一个问题一个问题一个问题一个问题' },
		{ id: 2, title: 'NO.2', content: '这是一个问题，一个问题一个问题一个问题一个问题一个问题一个问题一个问题一个问题一个问题一个问题一个问题一个问题' },
		{ id: 3, title: 'NO.3', content: '这是一个问题，一个问题一个问题一个问题一个问题一个问题一个问题一个问题一个问题一个问题一个问题一个问题一个问题' },
	],
});

const handleSubmit =() => {
	uni.navigateTo({
		url:'/pages/sub-page/chaoshu/analysis'
	})
}
</script>

<style lang="scss" scoped>
</style>
