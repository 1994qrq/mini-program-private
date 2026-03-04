<template>
  <md-page title="说明" notDescribe>
    <view class="container">
      <rich-text :nodes="data.nodes" />
    </view>
  </md-page>
</template>

<script lang="ts" setup>
import { reactive } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import api from '@/api';
import { routePathModule, taskModule } from '@/utils/data';

const data = reactive({
  routeKey: '',
  nodes: '',
});

/**
 * 接口相关
 */
const fetchModuleExt = async (moduleCode: string) => {
  try {
    const res = await api.common.moduleExt({ extType: 2, moduleCode });
    data.nodes = res.data;
  } catch (error) {
    console.log(error);
  }
};

onLoad(option => {
  // 优先使用URL参数中的pageTitle
  if (option?.pageTitle) {
    const pageTitle = decodeURIComponent(option.pageTitle as string);
    console.log('从URL参数获取页面标题：', pageTitle);

    // 根据页面标题映射到模块代码（支持多种标题格式）
    const titleToModuleMap: Record<string, string> = {
      '图文模块': taskModule['图文模块'],
      '图文': taskModule['图文模块'],
      '线下模块': taskModule['线下模块'],
      '线下': taskModule['线下模块'],
      '问诊模块': taskModule['问诊模块'],
      '问诊': taskModule['问诊模块'],
      '定制模块': taskModule['定制模块'],
      '定制': taskModule['定制模块'],
      '陌生模块': taskModule['陌生模块'],
      '陌生': taskModule['陌生模块'],
      '熟悉模块': taskModule['熟悉模块'],
      '熟悉': taskModule['熟悉模块'],
      '不熟模块': taskModule['不熟模块'],
      '不熟': taskModule['不熟模块'],
      '超熟模块': taskModule['超熟模块'],
      '超熟': taskModule['超熟模块'],
      '免费模块': taskModule['免费模块'],
      '免费': taskModule['免费模块'],
    };

    const moduleCode = titleToModuleMap[pageTitle];
    if (moduleCode) {
      console.log('根据标题获取到模块代码：', moduleCode);
      fetchModuleExt(moduleCode);
      return;
    }
  }

  // 如果没有URL参数，使用原有的路径推断逻辑
  let pages = getCurrentPages();
  let prevPage = pages?.[pages.length - 2];
  let prevPath = prevPage?.route;

  if (prevPath && !data.routeKey) {
    let pathList = prevPath?.split('/');
    let key = pathList[pathList.length - 2];
    data.routeKey = key;

    let moduleCode = '';

    // 特殊处理stepTask情况，需要从上一页面的参数中获取module参数
    if (key === 'stepTask') {
      // 尝试从上一页面的参数中获取module信息
      const prevPageOptions = prevPage?.options;
      if (prevPageOptions && prevPageOptions.module) {
        const moduleName = prevPageOptions.module as string;
        moduleCode = taskModule[moduleName as keyof typeof taskModule] || taskModule['熟悉模块'];
        console.log('从stepTask页面参数获取模块：', moduleName, 'moduleCode:', moduleCode);
      } else {
        // 如果无法获取，使用默认的熟悉模块
        moduleCode = taskModule['熟悉模块'];
        console.log('stepTask无法获取module参数，使用默认熟悉模块');
      }
    } else {
      // 其他情况使用原有逻辑
      moduleCode = routePathModule[key] || '';
    }

    console.log('获取上一个页面路由关键词：', key, 'moduleCode:', moduleCode);

    if (moduleCode) {
      fetchModuleExt(moduleCode);
    }
  }
});
</script>

<style lang="scss" scoped>
.container {
  padding: 20rpx;
  box-sizing: border-box;
}
</style>
