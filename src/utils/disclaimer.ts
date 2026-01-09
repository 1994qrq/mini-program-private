/**
 * 免责声明本地存储管理
 */

const DISCLAIMER_STORAGE_KEY = 'disclaimer_agreed';

/**
 * 检查用户是否已同意免责声明
 */
export function hasUserAgreedDisclaimer(): boolean {
  try {
    return uni.getStorageSync(DISCLAIMER_STORAGE_KEY) === true;
  } catch (error) {
    console.error('获取免责声明状态失败:', error);
    return false;
  }
}

/**
 * 设置用户同意免责声明状态
 */
export function setUserAgreedDisclaimer(agreed: boolean): void {
  try {
    uni.setStorageSync(DISCLAIMER_STORAGE_KEY, agreed);
  } catch (error) {
    console.error('保存免责声明状态失败:', error);
  }
}

/**
 * 清除免责声明状态（用于测试或重置）
 */
export function clearDisclaimerAgreement(): void {
  try {
    uni.removeStorageSync(DISCLAIMER_STORAGE_KEY);
  } catch (error) {
    console.error('清除免责声明状态失败:', error);
  }
}