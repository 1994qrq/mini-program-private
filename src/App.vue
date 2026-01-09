<script setup lang="ts">
import { onLaunch, onShow, onHide } from '@dcloudio/uni-app';
onLaunch(() => {
	// console.log("App Launch");
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
