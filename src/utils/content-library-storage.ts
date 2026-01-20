import type { Four } from '@/api/data';

/**
 * 内容库数据存储键
 */
const CONTENT_LIBRARY_KEY = 'content_library_data';

/**
 * 保存内容库数据到本地存储
 */
export const saveContentLibraryData = (data: Four.GetAllContent.Data) => {
  try {
    console.log('📝 准备保存数据到本地存储...');
    console.log('📝 数据内容:', data);
    console.log('📝 数据长度:', data.length);

    const jsonString = JSON.stringify(data);
    console.log('📝 JSON字符串长度:', jsonString.length);

    uni.setStorageSync(CONTENT_LIBRARY_KEY, jsonString);
    console.log('✅ 数据已写入本地存储，键名:', CONTENT_LIBRARY_KEY);

    // 验证是否写入成功
    const savedData = uni.getStorageSync(CONTENT_LIBRARY_KEY);
    console.log('✅ 验证读取成功:', savedData ? '有数据' : '无数据');

    return true;
  } catch (error) {
    console.error('❌ 保存内容库数据失败:', error);
    return false;
  }
};

/**
 * 从本地存储获取内容库数据
 */
export const getContentLibraryData = (): Four.GetAllContent.Data | null => {
  try {
    const dataStr = uni.getStorageSync(CONTENT_LIBRARY_KEY);
    if (dataStr) {
      return JSON.parse(dataStr);
    }
    return null;
  } catch (error) {
    console.error('获取内容库数据失败:', error);
    return null;
  }
};

/**
 * 清除内容库数据
 */
export const clearContentLibraryData = () => {
  try {
    uni.removeStorageSync(CONTENT_LIBRARY_KEY);
    console.log('内容库数据已清除');
    return true;
  } catch (error) {
    console.error('清除内容库数据失败:', error);
    return false;
  }
};

/**
 * 格式化内容库数据为可读格式
 * 将接口数据转换为易于使用的格式
 */
export const formatContentLibraryData = (data: Four.GetAllContent.Data) => {
  console.log('🔄 开始格式化数据...');
  const formatted = data.map(item => ({
    id: item.id,
    warehouseId: item.warehouseId,
    contentCode: item.contentCode,
    contentDetail: item.contentDetail,
    contentType: item.contentType,
    status: item.status,
    type: item.type,
  }));

  console.log('✅ 格式化完成，共', formatted.length, '条数据');
  return formatted;
};

/**
 * 验证并打印本地存储的内容库数据
 * 用于调试和验证数据是否正确保存
 */
export const verifyContentLibraryData = () => {
  console.log('🔍 开始验证本地存储数据...');

  try {
    const data = getContentLibraryData();

    if (!data) {
      console.warn('⚠️ 本地存储中没有内容库数据');
      return false;
    }

    console.log('✅ 找到内容库数据');
    console.log('📊 数据条数:', data.length);
    console.log('📊 前3条数据示例:', data.slice(0, 3));

    return true;
  } catch (error) {
    console.error('❌ 验证失败:', error);
    return false;
  }
};
