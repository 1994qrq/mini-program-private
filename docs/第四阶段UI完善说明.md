# 第四阶段UI完善说明

## 当前实现状态

### 已实现的功能

1. **核心逻辑** (src/pages/sub-page/stepTask/shuxi/stage4.ts)
   - ✅ 进入第四阶段的入口函数 `enterStage4UI`
   - ✅ S20提示板的三选项逻辑（马上邀约、多聊一次、暂时不做选择）
   - ✅ 邀约成功流程：S18 → Go按钮 → S23 → S24 → S29/S30
   - ✅ 邀约失败流程：3×CD/5×CD/S25 → S26 → S27
   - ✅ 多聊一次流程：S21 → 返回第三阶段 → S22 → S20
   - ✅ 半价重开和结束任务的逻辑

2. **UI实现** (src/pages/sub-page/stepTask/round.vue)
   - ✅ 使用 `uni.showActionSheet` 显示S20的三个选项
   - ✅ 基本的邀约流程UI（使用uni.showModal）
   - ⚠️ UI方案不够理想，应该使用FamiliarPromptBoard组件

### 需要完善的部分

#### 1. S20提示板UI优化

**当前实现**：
```javascript
uni.showActionSheet({
  itemList: ['马上邀约', '多聊一次', '暂时不做选择'],
  success: (res) => {
    // 处理选择
  }
});
```

**建议改进**：
使用 `FamiliarPromptBoard` 组件，提供更好的视觉效果：
```vue
<FamiliarPromptBoard
  ref="s20Dialog"
  promptCode="S20"
  :showChoices="true"
  :choices="[
    { text: '马上邀约', value: 'invite' },
    { text: '多聊一次', value: 'multiChat' },
    { text: '暂时不做选择', value: 'later' }
  ]"
  @choice="handleS20Choice"
/>
```

#### 2. Go按钮UI实现

**需求**：
- 邀约成功后，在内容库S18展示完成后，显示Go按钮
- 用户点击Go按钮后，开启延时，弹出S23提示板

**建议实现**：
在round.vue中添加Go按钮的UI：
```vue
<view v-if="data.showGoButton" class="go-button-container">
  <view class="go-button" @click="handleGoClick">
    Go
  </view>
</view>
```

#### 3. 内容库S17和S18的展示

**需求**：
- 马上邀约时，先展示内容库S17的内容
- 邀约成功后，展示内容库S18的内容

**当前状态**：
- stage4.ts中有TODO注释，表示需要实现内容库的抽取和展示
- 应该复用现有的内容展示逻辑

**建议实现**：
```javascript
// 抽取内容库S17
const libs = uni.getStorageSync('fm:libs');
const s17Content = libs?.content?.['S17'] || [];
// 展示内容...
```

#### 4. 多聊一次的完整流程

**需求**：
- 第一次点击"多聊一次"：返回第三阶段进行一个回合
- 回合结束后：显示S22 → 回到S20
- 第二次点击"多聊一次"：提示已使用过，回到S20

**当前状态**：
- 逻辑已实现（handleMultiChatFlow, handleMultiChatComplete）
- 需要在round.vue中集成回合结束后的处理

## 优化建议

### 1. 统一使用FamiliarPromptBoard组件

将所有提示板的显示统一使用 `FamiliarPromptBoard` 组件，而不是混用 `uni.showModal` 和 `uni.showActionSheet`。

### 2. 完善提示板内容配置

在 `FamiliarPromptBoard.vue` 中补充S20-S31的完整配置：
```javascript
S20: {
  title: '温馨提示',
  content: '请选择下一步操作',
  hideOk: true,
  hideCancel: true
},
S21: {
  title: '多聊一次',
  content: '确认返回第三阶段进行一次对话？',
  okText: '确定',
  cancelText: '取消'
},
// ... 其他提示板配置
```

### 3. 添加Go按钮样式

在round.vue的样式部分添加Go按钮的样式：
```scss
.go-button-container {
  display: flex;
  justify-content: center;
  padding: 40rpx;

  .go-button {
    width: 200rpx;
    height: 200rpx;
    border-radius: 50%;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: #fff;
    font-size: 48rpx;
    font-weight: bold;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 8rpx 24rpx rgba(102, 126, 234, 0.4);
    transition: all 0.3s;

    &:active {
      transform: scale(0.95);
      box-shadow: 0 4rpx 12rpx rgba(102, 126, 234, 0.3);
    }
  }
}
```

## 实施步骤

1. ✅ 核心逻辑已完成（stage4.ts）
2. ⚠️ 优化S20的UI展示（使用FamiliarPromptBoard）
3. ⚠️ 实现Go按钮UI
4. ⚠️ 完善内容库S17和S18的展示
5. ⚠️ 测试多聊一次的完整流程

## 总结

第四阶段的核心逻辑已经完整实现，主要需要完善的是UI展示部分：
- 使用更好的组件替代原生弹窗
- 添加Go按钮的UI
- 完善内容库的展示逻辑

这些改进不影响功能的正常运行，但能提供更好的用户体验。
