<script setup lang="ts">
import { onLaunch, onShow, onHide } from '@dcloudio/uni-app';
import api from '@/api';
import { saveContentLibraryData, formatContentLibraryData } from '@/utils/content-library-storage';

onLaunch(async () => {
	console.log("App Launch");

	// 程序启动时获取内容库数据
	try {
		console.log('开始调用 getAllContent 接口...');
		const res = await api.four.getAllContent();
		console.log('接口返回完整数据:', res);

		if (res && res.data) {
			console.log('原始数据:', res.data);
			console.log('数据类型:', typeof res.data, '是否为数组:', Array.isArray(res.data));

			// 格式化并保存数据到本地存储
			const formattedData = formatContentLibraryData(res.data);
			console.log('格式化后的数据:', formattedData);

			const saveResult = saveContentLibraryData(formattedData);
			console.log('保存结果:', saveResult);

			if (saveResult) {
				console.log('✅ 内容库数据加载成功，共', formattedData.length, '条');
			} else {
				console.error('❌ 数据保存失败');
			}
		} else {
			console.warn('⚠️ 接口返回数据为空');
		}
	} catch (error) {
		console.error('❌ 获取内容库数据失败:', error);
	}
});

onShow(() => {
	// console.log("App Show");
});
onHide(() => {
	// console.log("App Hide");
});
</script>
<style lang="scss">
@import '~@/styles/index.scss';
/*每个页面公共css */

page {
	font-size: 24rpx;
	color: $title;
}

/* 全局 image 标签样式 - 使图片在缩放时保持像素风格 */
image,
img {
	// image-rendering: pixelated;
		image-rendering: -moz-crisp-edges;
		image-rendering: crisp-edges;
}
</style>
