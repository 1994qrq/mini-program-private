<template>
  <uni-nav-bar
    :color="color"
    backgroundColor="transparent"
    @clickLeft="customLeft"
    :fixed="fixed"
    statusBar
    :left-icon="showLeft ? leftIcon : ''"
    :border="false">
    <view class="title">{{ title }}</view>
  </uni-nav-bar>
  <!-- 问号图片 -->
  <view v-if="!notDescribe" class="wenhao">
    <md-icon name="wenhao" width="60" height="60" @click="handleJump"></md-icon>
  </view>
  <!-- 提示弹窗 -->
  <md-dialog ref="popup" @ok="handleOk">
    <view>您未完成问卷填写，请确认是否要返回</view>
  </md-dialog>
</template>

<script setup lang="ts">
import _ from 'lodash';
import { ref } from 'vue';

interface PropsType {
  color?: string;
  title?: string;
  leftIcon?: string;
  showLeft?: boolean;
  fixed?: boolean;
  notDescribe?: boolean;
}

// 接收props
let props = withDefaults(defineProps<PropsType>(), {
  title: '',
  leftIcon: 'left',
  showLeft: true,
  fixed: true,
  notDescribe: false,
});

const popup = ref(null);

const handleJump = () => {
  uni.navigateTo({
    url: '/pages/sub-page/describe/wenhao',
  });
};

const handleOk = () => {
  uni.reLaunch({
    url: uni.getStorageSync('backRoute'),
  });
  uni.removeStorageSync('backRoute');
};

// 返回 【click】
let customLeft = () => {
  console.log('[md-nav-bar] 返回按钮被点击');
  
  // 如果有记录，则用记录的记录的跳转路由
  if (uni.getStorageSync('backRoute')) {
    console.log('[md-nav-bar] 有backRoute记录，显示弹窗');
    popup.value!.open();
    return;
  }
  if (!props.showLeft || !props.leftIcon) {
    console.log('[md-nav-bar] showLeft或leftIcon为false，直接返回');
    return;
  }
  
  // 特殊处理：如果是熟悉模块的round页面，强制返回到list页面
  const currentPage = getCurrentPages();
  console.log('[md-nav-bar] 当前页面栈:', currentPage.map(p => p.route));
  
  const currentRoute = currentPage[currentPage.length - 1]?.route;
  console.log('[md-nav-bar] 当前路由:', currentRoute);
  
  if (currentRoute && currentRoute.includes('stepTask/list')) {
    console.log('[md-nav-bar] 当前在任务列表页，跳转首页');
    uni.switchTab({
      url: '/pages/index/index'
    });
    return;
  }

  if (currentRoute && currentRoute.includes('stepTask/round')) {
    console.log('[md-nav-bar] 检测到stepTask/round页面');
    // 检查当前页面参数，如果是熟悉模块，返回到熟悉模块列表
    const options = currentPage[currentPage.length - 1]?.options;
    console.log('[md-nav-bar] 当前页面参数:', options);
    
    if (options && options.module === '熟悉模块') {
      console.log('[md-nav-bar] 熟悉模块round页面，尝试返回已有list页面');
      const listIndex = currentPage.findIndex(p => p.route === 'pages/sub-page/stepTask/list');
      if (listIndex >= 0) {
        const delta = currentPage.length - listIndex - 1;
        console.log('[md-nav-bar] 找到列表页，delta:', delta);
        if (delta > 0) {
          uni.navigateBack({ delta });
        } else {
          console.log('[md-nav-bar] 当前已在列表页，忽略');
        }
      } else {
        console.log('[md-nav-bar] 页面栈没有列表页，使用navigateTo跳转');
        uni.navigateTo({
          url: '/pages/sub-page/stepTask/list?module=熟悉模块'
        });
      }
      return;
    } else {
      console.log('[md-nav-bar] 不是熟悉模块，继续原有逻辑');
    }
  }
  
  //获取路由
  let routes = getCurrentPages();
  // 去重
  let uniqueRoutes = _.uniqBy(routes, 'route');
  console.log('[md-nav-bar] 去重后路由:', uniqueRoutes.map(r => r.route));
  console.log('[md-nav-bar] 路由数量:', uniqueRoutes.length);
  
  // 说明不是刷新，分享等单个路由。
  if (uniqueRoutes && uniqueRoutes.length > 1) {
    // 如果路由栈只有两个路由，则跳到一级路由
    if (uniqueRoutes.length == 2) {
      console.log('[md-nav-bar] 路由栈只有2个，跳转到第一个路由:', uniqueRoutes[0].route);
      uni.switchTab({
        url: '/' + uniqueRoutes[0].route,
      });
    } else {
      console.log('[md-nav-bar] 路由栈有多个，执行navigateBack');
      uni.navigateBack();
    }
    return;
  }
  console.log('[md-nav-bar] 路由栈只有1个，跳转到首页');
  uni.reLaunch({
    url: '/pages/index/index',
  });
};
</script>

<style lang="scss" scoped>
.wenhao {
  position: fixed;
  right: 50rpx;
  bottom: 20%;
  z-index: 98;
}
.title {
  font-size: 32rpx;
  line-height: 44px;
  width: 100%;
  text-align: center;
}
</style>
