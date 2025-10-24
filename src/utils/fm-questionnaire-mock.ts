// 注入熟悉模块问卷的本地 Mock，结构与后端一致
export function ensureQuestionnaireMock() {
  try {
    const libs = uni.getStorageSync('fm:libs') || {};
    const has = Array.isArray(libs?.questionnaire?.apiMock) && libs.questionnaire.apiMock.length > 0;
    if (has) return;

    const apiMock = [
      {
        stageId: 65,
        stageName: "熟悉零阶段-问卷",
        moduleCode: "familiar_module",
        questionVoList: [
          {
            questionId: 45,
            questionTitle: "夏天夏天悄悄来临留下小秘密",
            questionType: 1,
            questionNum: 1,
            optionContentList: [
              { id: 66, optionContent: "春天", optionIntegral: 0 },
              { id: 78, optionContent: "夏天", optionIntegral: 0 },
              { id: 79, optionContent: "秋天", optionIntegral: 0 },
              { id: 80, optionContent: "冬天", optionIntegral: 0 },
              { id: 81, optionContent: "不确定", optionIntegral: 0 }
            ]
          },
          {
            questionId: 53,
            questionTitle: "你们目前的关系如何？",
            questionType: 1,
            questionNum: 2,
            optionContentList: [
              { id: 1, optionContent: "完全陌生，没有联系方式", optionIntegral: 0 },
              { id: 2, optionContent: "有联系方式，但很少联系", optionIntegral: 4 },
              { id: 3, optionContent: "偶尔会聊天，关系一般", optionIntegral: 5 },
              { id: 4, optionContent: "经常聊天，关系较好", optionIntegral: 7 },
              { id: 5, optionContent: "关系很好，但不够亲密", optionIntegral: 4 }
            ]
          },
          {
            questionId: 54,
            questionTitle: "你们是否有过深入的交流或共同经历？",
            questionType: 1,
            questionNum: 3,
            optionContentList: [
              { id: 1, optionContent: "从未有过深入交流", optionIntegral: 0 },
              { id: 2, optionContent: "只有简单的寒暄", optionIntegral: 0 },
              { id: 3, optionContent: "有过一些深入的话题", optionIntegral: 6 },
              { id: 4, optionContent: "有过多次深入交流", optionIntegral: 10 },
              { id: 5, optionContent: "有很多共同经历和回忆", optionIntegral: 10 }
            ]
          },
          {
            questionId: 55,
            questionTitle: "你希望和对方发展到什么程度？",
            questionType: 1,
            questionNum: 4,
            optionContentList: [
              { id: 1, optionContent: "普通朋友", optionIntegral: 0 },
              { id: 2, optionContent: "好朋友", optionIntegral: 0 },
              { id: 3, optionContent: "亲密朋友", optionIntegral: 0 },
              { id: 4, optionContent: "恋人关系", optionIntegral: 0 },
              { id: 5, optionContent: "长期伴侣", optionIntegral: 0 }
            ]
          },
          {
            questionId: 56,
            questionTitle: "你认为对方对你的态度如何？",
            questionType: 1,
            questionNum: 5,
            optionContentList: [
              { id: 1, optionContent: "不太关注", optionIntegral: 0 },
              { id: 2, optionContent: "普通朋友态度", optionIntegral: 0 },
              { id: 3, optionContent: "比较友好", optionIntegral: 0 },
              { id: 4, optionContent: "很友好，可能有好感", optionIntegral: 0 },
              { id: 5, optionContent: "明显有好感", optionIntegral: 0 }
            ]
          }
        ]
      }
    ];

    const nextLibs = { ...libs, questionnaire: { ...(libs.questionnaire || {}), apiMock } };
    uni.setStorageSync('fm:libs', nextLibs);
    console.log('[QuestionnaireMock] injected apiMock into fm:libs.questionnaire');
  } catch (e) {
    console.error('[QuestionnaireMock] ensureQuestionnaireMock error:', e);
  }
}