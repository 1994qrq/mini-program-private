/**
 * 本地数据云端同步工具
 * 功能：操作完成后防抖上传本地数据到服务器，启动时从服务器下载恢复
 */

import api from '@/api';

const BASE_URL = process.env.VUE_APP_BASEHOST;
const UPLOAD_PATH = '/admin-api/infra/user-file/upload';
const DOWNLOAD_PATH_PREFIX = '/admin-api/infra/file/1/get/';
const BACKUP_FILE_NAME = 'local_data_backup.json';
const DEBOUNCE_MS = 3000; // 3秒防抖
const MAX_UPLOAD_BYTES = 800 * 1024; // 小程序端同步文件大小保护阈值

// 需要同步的存储键前缀
const SYNC_PREFIXES = [
  'fm:', 'super:', 'free:', 'um:', 'sm:',
  'familiar_',
];

// 排除的键（系统级，不需要同步）
// content_library_data 体积过大，且可通过接口重新同步，不参与云端备份
const EXCLUDE_KEYS = [
  'token',
  'disclaimer_agreed',
  'content_library_data',
  'fm:libs',
  'super:libs',
  'free:libs',
  'um:libs',
  'sm:libs',
];

let _debounceTimer: ReturnType<typeof setTimeout> | null = null;
let _userId: number | null = null;
let _uploading = false;
let _restoring = false; // 标记是否正在恢复数据

// --- userId 缓存 ---

async function getUserId(): Promise<number | null> {
  console.log('[DataSync] getUserId 被调用，当前缓存:', _userId);
  if (_userId) return _userId;
  try {
    console.log('[DataSync] 开始调用 api.common.info()');
    const res = await api.common.info();
    console.log('[DataSync] api.common.info() 返回:', res);
    if (res?.data?.userId) {
      _userId = res.data.userId;
      console.log('[DataSync] userId 获取成功:', _userId);
      return _userId;
    }
  } catch (e) {
    console.error('[DataSync] 获取userId失败:', e);
  }
  return null;
}

// --- 数据收集与恢复 ---

/** 判断某个 key 是否属于需要同步的范围 */
function shouldSyncKey(key: string): boolean {
  if (EXCLUDE_KEYS.includes(key)) return false;
  return SYNC_PREFIXES.some(prefix => key.startsWith(prefix));
}

/** 收集所有需要同步的本地数据 */
function collectAllData(): Record<string, any> {
  const result: Record<string, any> = {};
  try {
    const info = uni.getStorageInfoSync();
    const keys: string[] = info.keys || [];
    for (const key of keys) {
      if (shouldSyncKey(key)) {
        try {
          result[key] = uni.getStorageSync(key);
        } catch {}
      }
    }
  } catch (e) {
    console.error('[DataSync] 收集数据失败:', e);
  }
  return result;
}

/** 清空所有需要同步的本地数据 */
function clearAllSyncData(): void {
  _restoring = true; // 标记开始清空，禁用上传触发
  try {
    const info = uni.getStorageInfoSync();
    const keys: string[] = info.keys || [];
    let clearedCount = 0;
    for (const key of keys) {
      if (shouldSyncKey(key)) {
        try {
          uni.removeStorageSync(key);
          clearedCount++;
        } catch {}
      }
    }
    console.log('[DataSync] 本地数据清空完成，共清除', clearedCount, '个键');

    // 触发数据同步完成事件，通知界面刷新
    uni.$emit('dataSyncCompleted', { action: 'clear' });
  } catch (e) {
    console.error('[DataSync] 清空数据失败:', e);
  } finally {
    _restoring = false; // 清空完成，重新启用上传触发
  }
}

/** 将服务器数据恢复到本地存储 */
function restoreAllData(data: Record<string, any>): void {
  _restoring = true; // 标记开始恢复，禁用上传触发
  try {
    for (const [key, value] of Object.entries(data)) {
      try {
        uni.setStorageSync(key, value);
      } catch {}
    }
    console.log('[DataSync] 数据恢复完成，共', Object.keys(data).length, '个键');

    // 触发数据同步完成事件，通知界面刷新
    uni.$emit('dataSyncCompleted', { action: 'restore' });
  } finally {
    _restoring = false; // 恢复完成，重新启用上传触发
  }
}

// --- 上传 ---

/** 将数据写入临时文件并上传到服务器 */
async function uploadData(): Promise<boolean> {
  if (_uploading) return false;
  _uploading = true;

  try {
    const userId = await getUserId();
    if (!userId) {
      console.warn('[DataSync] 无法获取userId，跳过上传');
      return false;
    }

    const allData = collectAllData();
    const keys = Object.keys(allData);
    const jsonStr = JSON.stringify(allData);
    console.log('[DataSync] 准备上传，键数量:', keys.length, '数据大小:', jsonStr.length, '字节');

    if (jsonStr.length > MAX_UPLOAD_BYTES) {
      console.warn('[DataSync] 同步数据过大，跳过本次上传', {
        size: jsonStr.length,
        limit: MAX_UPLOAD_BYTES,
        keys,
      });
      return false;
    }

    // 写入临时文件
    const fs = uni.getFileSystemManager();
    const tempPath = `${uni.env.USER_DATA_PATH}/${BACKUP_FILE_NAME}`;

    try {
      // 先删除旧备份文件，尽量释放 USER_DATA_PATH 配额
      fs.unlinkSync(tempPath);
    } catch {}

    try {
      fs.writeFileSync(tempPath, jsonStr, 'utf-8');
    } catch (err) {
      console.warn('[DataSync] 写入临时同步文件失败，跳过本次上传', err);
      return false;
    }

    // 上传文件
    return new Promise<boolean>((resolve) => {
      uni.uploadFile({
        url: `${BASE_URL}${UPLOAD_PATH}`,
        filePath: tempPath,
        name: 'file',
        header: { Authorization: uni.getStorageSync('token') },
        formData: { userId: String(userId) },
        success: (res) => {
          try {
            const data = JSON.parse(res.data);
            if (res.statusCode >= 200 && res.statusCode < 300 && data.code === 0) {
              console.log('[DataSync] 上传成功:', data.data);
              resolve(true);
            } else {
              console.error('[DataSync] 上传失败:', data);
              resolve(false);
            }
          } catch {
            console.error('[DataSync] 解析上传响应失败');
            resolve(false);
          }
        },
        fail: (err) => {
          console.error('[DataSync] 上传请求失败:', err);
          resolve(false);
        },
      });
    });
  } catch (e) {
    console.warn('[DataSync] 上传异常，已跳过本次同步:', e);
    return false;
  } finally {
    _uploading = false;
  }
}

// --- 下载 ---

/** 从服务器下载数据并恢复到本地存储 */
export async function downloadAndRestore(): Promise<boolean> {
  console.log('[DataSync] downloadAndRestore 开始执行');
  try {
    const userId = await getUserId();
    console.log('[DataSync] getUserId 返回:', userId);
    if (!userId) {
      console.warn('[DataSync] 无法获取userId，跳过下载');
      return false;
    }

    const url = `${BASE_URL}${DOWNLOAD_PATH_PREFIX}${userId}/${BACKUP_FILE_NAME}`;
    console.log('[DataSync] 开始下载数据，URL:', url);

    return new Promise<boolean>((resolve) => {
      uni.downloadFile({
        url,
        header: { Authorization: uni.getStorageSync('token') },
        success: (res) => {
          console.log('[DataSync] 下载响应 statusCode:', res.statusCode);
          if (res.statusCode === 200 && res.tempFilePath) {
            try {
              const fs = uni.getFileSystemManager();
              const content = fs.readFileSync(res.tempFilePath, 'utf-8') as string;
              const data = JSON.parse(content);
              restoreAllData(data);
              console.log('[DataSync] 下载并恢复成功');
              resolve(true);
            } catch (e) {
              console.error('[DataSync] 解析下载数据失败:', e);
              resolve(false);
            }
          } else {
            // 服务器端没有文件（404或其他非200状态），清空本地数据
            console.warn('[DataSync] 服务器无备份文件（状态码:', res.statusCode, '），清空本地数据');
            clearAllSyncData();
            resolve(true); // 清空成功也返回true
          }
        },
        fail: (err) => {
          console.error('[DataSync] 下载请求失败:', err);
          // 网络错误不清空本地数据，保留现有数据
          resolve(false);
        },
      });
    });
  } catch (e) {
    console.error('[DataSync] 下载异常:', e);
    return false;
  }
}

// --- 防抖触发 ---

/**
 * 触发数据同步（防抖）
 * 在各模块 save 操作后调用，3秒内多次调用只执行一次上传
 */
export function triggerSync(): void {
  // 正在恢复数据时不触发上传
  if (_restoring) return;

  // 未登录不同步
  if (!uni.getStorageSync('token')) return;

  // 微信小程序端 USER_DATA_PATH 容量很小，当前同步方案依赖临时写文件，容易触发存储配额异常。
  // 先在小程序端关闭自动上传，保留本地存储与启动恢复逻辑，避免每次业务操作都刷错误日志。
  // 后续如需支持小程序端云同步，建议改为分片/接口直传而不是本地临时文件上传。
  // #ifdef MP-WEIXIN
  return;
  // #endif

  if (_debounceTimer) clearTimeout(_debounceTimer);
  _debounceTimer = setTimeout(() => {
    _debounceTimer = null;
    uploadData().catch((e) => console.error('[DataSync] 防抖上传失败:', e));
  }, DEBOUNCE_MS);
}

/**
 * 应用启动时同步：从服务器下载最新数据
 * 在 App.vue onLaunch 中调用
 */
export async function syncOnLaunch(): Promise<void> {
  console.log('[DataSync] syncOnLaunch 被调用');
  console.log('[DataSync] 应用启动，开始同步数据...');
  try {
    const result = await downloadAndRestore();
    console.log('[DataSync] downloadAndRestore 返回:', result);
  } catch (e) {
    console.error('[DataSync] syncOnLaunch 异常:', e);
  }
}

/** 清除 userId 缓存（登出时调用） */
export function clearSyncCache(): void {
  _userId = null;
  if (_debounceTimer) {
    clearTimeout(_debounceTimer);
    _debounceTimer = null;
  }
}
