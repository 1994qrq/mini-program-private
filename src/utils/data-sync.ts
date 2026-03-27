/**
 * 本地数据云端同步工具
 * 功能：操作完成后防抖上传本地数据到服务器，启动时从服务器下载恢复
 */

import api from '@/api';

const BASE_URL = process.env.VUE_APP_BASEHOST;
const UPLOAD_PATH = '/admin-api/infra/user-file/upload';
const DOWNLOAD_PATH_PREFIX = '/admin-api/infra/file/1/get/';
const LEGACY_BACKUP_FILE_NAME = 'local_data_backup.json';
const MANIFEST_FILE_NAME = 'local_data_manifest.json';
const BACKUP_FILE_PREFIX = 'local_data_backup';
const BACKUP_VERSION = 2;
const DEBOUNCE_MS = 3000; // 3秒防抖
const MAX_UPLOAD_BYTES = 200 * 1024; // 单个分片大小保护阈值

const SYNC_GROUPS = [
  {
    name: 'fm',
    exact: ['fm:tasks', 'fm:settings', 'fm:stateVersion'],
    prefixes: ['fm:task:', 'fm:clipboard:'],
  },
  {
    name: 'um',
    exact: ['um:tasks', 'um:settings'],
    prefixes: ['um:task:'],
  },
  {
    name: 'sm',
    exact: ['sm:tasks', 'sm:settings'],
    prefixes: ['sm:task:', 'sm:clipboard:'],
  },
  {
    name: 'permissions',
    exact: ['imageTextSpecialPermission'],
    prefixes: [],
  },
] as const;

type SyncGroupName = typeof SYNC_GROUPS[number]['name'];

type ManifestShard = {
  name: SyncGroupName;
  fileName: string;
  keyCount: number;
  size: number;
};

type BackupManifest = {
  version: number;
  userId: number;
  updatedAt: string;
  shards: ManifestShard[];
};

type DownloadResult = {
  found: boolean;
  data?: any;
  statusCode?: number;
  error?: boolean;
};

// 排除的键（系统级，不需要同步）
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

function getGroupConfig(name: SyncGroupName) {
  return SYNC_GROUPS.find((group) => group.name === name)!;
}

function shouldExcludeKey(key: string): boolean {
  return EXCLUDE_KEYS.includes(key);
}

function shouldIncludeKeyInGroup(groupName: SyncGroupName, key: string): boolean {
  if (shouldExcludeKey(key)) return false;
  const group = getGroupConfig(groupName);
  if (group.exact.includes(key)) return true;
  return group.prefixes.some((prefix) => key.startsWith(prefix));
}

function getShardFileName(groupName: SyncGroupName): string {
  return `${BACKUP_FILE_PREFIX}_${groupName}.json`;
}

function collectGroupData(groupName: SyncGroupName): Record<string, any> {
  const result: Record<string, any> = {};
  try {
    const info = uni.getStorageInfoSync();
    const keys: string[] = info.keys || [];
    for (const key of keys) {
      if (shouldIncludeKeyInGroup(groupName, key)) {
        try {
          result[key] = uni.getStorageSync(key);
        } catch {}
      }
    }
  } catch (e) {
    console.error(`[DataSync] 收集分片 ${groupName} 数据失败:`, e);
  }
  return result;
}

function clearGroupData(groupName: SyncGroupName): void {
  const group = getGroupConfig(groupName);
  try {
    const info = uni.getStorageInfoSync();
    const keys: string[] = info.keys || [];
    for (const key of keys) {
      if (shouldExcludeKey(key)) continue;
      if (group.exact.includes(key) || group.prefixes.some((prefix) => key.startsWith(prefix))) {
        try {
          uni.removeStorageSync(key);
        } catch {}
      }
    }
  } catch (e) {
    console.error(`[DataSync] 清理分片 ${groupName} 失败:`, e);
  }
}

function clearAllSyncData(): void {
  _restoring = true;
  try {
    for (const group of SYNC_GROUPS) {
      clearGroupData(group.name);
    }
    console.log('[DataSync] 本地同步数据清空完成');
    uni.$emit('dataSyncCompleted', { action: 'clear' });
  } catch (e) {
    console.error('[DataSync] 清空数据失败:', e);
  } finally {
    _restoring = false;
  }
}

function restoreGroupData(groupName: SyncGroupName, data: Record<string, any>): void {
  clearGroupData(groupName);
  for (const [key, value] of Object.entries(data || {})) {
    try {
      uni.setStorageSync(key, value);
    } catch {}
  }
}

function restoreAllDataByGroups(groupDataMap: Partial<Record<SyncGroupName, Record<string, any>>>): void {
  _restoring = true;
  try {
    for (const group of SYNC_GROUPS) {
      restoreGroupData(group.name, groupDataMap[group.name] || {});
    }
    console.log('[DataSync] 分片数据恢复完成');
    uni.$emit('dataSyncCompleted', { action: 'restore' });
  } finally {
    _restoring = false;
  }
}

function removeLocalBackupFiles(): void {
  try {
    const fs = uni.getFileSystemManager();
    const files = [
      LEGACY_BACKUP_FILE_NAME,
      MANIFEST_FILE_NAME,
      ...SYNC_GROUPS.map((group) => getShardFileName(group.name)),
    ];
    files.forEach((fileName) => {
      try {
        fs.unlinkSync(`${uni.env.USER_DATA_PATH}/${fileName}`);
      } catch {}
    });
  } catch (e) {
    console.warn('[DataSync] 清理本地备份文件失败:', e);
  }
}

async function uploadSingleFile(userId: number, fileName: string, content: string): Promise<boolean> {
  if (content.length > MAX_UPLOAD_BYTES) {
    console.warn('[DataSync] 单个分片过大，跳过上传', { fileName, size: content.length, limit: MAX_UPLOAD_BYTES });
    return false;
  }

  const fs = uni.getFileSystemManager();
  const tempPath = `${uni.env.USER_DATA_PATH}/${fileName}`;

  try {
    fs.unlinkSync(tempPath);
  } catch {}

  try {
    fs.writeFileSync(tempPath, content, 'utf-8');
  } catch (err) {
    console.warn('[DataSync] 写入分片文件失败，跳过本次上传', { fileName, err });
    return false;
  }

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
            console.log('[DataSync] 分片上传成功:', fileName);
            resolve(true);
          } else {
            console.error('[DataSync] 分片上传失败:', { fileName, data });
            resolve(false);
          }
        } catch {
          console.error('[DataSync] 解析分片上传响应失败:', fileName);
          resolve(false);
        }
      },
      fail: (err) => {
        console.error('[DataSync] 分片上传请求失败:', { fileName, err });
        resolve(false);
      },
    });
  });
}

async function uploadData(): Promise<boolean> {
  if (_uploading) return false;
  _uploading = true;

  try {
    const userId = await getUserId();
    if (!userId) {
      console.warn('[DataSync] 无法获取userId，跳过上传');
      return false;
    }

    removeLocalBackupFiles();

    const manifest: BackupManifest = {
      version: BACKUP_VERSION,
      userId,
      updatedAt: new Date().toISOString(),
      shards: [],
    };

    for (const group of SYNC_GROUPS) {
      const data = collectGroupData(group.name);
      const jsonStr = JSON.stringify(data);
      const fileName = getShardFileName(group.name);
      console.log('[DataSync] 准备上传分片:', group.name, '键数量:', Object.keys(data).length, '数据大小:', jsonStr.length, '字节');

      const ok = await uploadSingleFile(userId, fileName, jsonStr);
      if (!ok) {
        console.warn('[DataSync] 分片上传中断:', group.name);
        return false;
      }

      manifest.shards.push({
        name: group.name,
        fileName,
        keyCount: Object.keys(data).length,
        size: jsonStr.length,
      });
    }

    const manifestOk = await uploadSingleFile(userId, MANIFEST_FILE_NAME, JSON.stringify(manifest));
    if (!manifestOk) {
      console.warn('[DataSync] manifest 上传失败');
      return false;
    }

    console.log('[DataSync] 分片上传完成，共', manifest.shards.length, '个分片');
    return true;
  } catch (e) {
    console.warn('[DataSync] 上传异常，已跳过本次同步:', e);
    return false;
  } finally {
    _uploading = false;
  }
}

async function downloadAndParseFile(userId: number, fileName: string): Promise<DownloadResult> {
  const url = `${BASE_URL}${DOWNLOAD_PATH_PREFIX}${userId}/${fileName}`;
  return new Promise((resolve) => {
    uni.downloadFile({
      url,
      header: { Authorization: uni.getStorageSync('token') },
      success: (res) => {
        if (res.statusCode === 404) {
          resolve({ found: false, statusCode: res.statusCode });
          return;
        }
        if (res.statusCode !== 200 || !res.tempFilePath) {
          resolve({ found: false, statusCode: res.statusCode, error: true });
          return;
        }
        try {
          const fs = uni.getFileSystemManager();
          const content = fs.readFileSync(res.tempFilePath, 'utf-8') as string;
          resolve({ found: true, data: JSON.parse(content), statusCode: res.statusCode });
        } catch (e) {
          console.error('[DataSync] 解析下载分片失败:', { fileName, e });
          resolve({ found: false, statusCode: res.statusCode, error: true });
        }
      },
      fail: (err) => {
        console.error('[DataSync] 下载请求失败:', { fileName, err });
        resolve({ found: false, error: true });
      },
    });
  });
}

export async function downloadAndRestore(): Promise<boolean> {
  console.log('[DataSync] downloadAndRestore 开始执行');
  try {
    const userId = await getUserId();
    console.log('[DataSync] getUserId 返回:', userId);
    if (!userId) {
      console.warn('[DataSync] 无法获取userId，跳过下载');
      return false;
    }

    const manifestResult = await downloadAndParseFile(userId, MANIFEST_FILE_NAME);
    if (!manifestResult.found) {
      if (manifestResult.error) {
        console.warn('[DataSync] manifest 下载异常，保留本地同步数据');
        return false;
      }
      console.warn('[DataSync] 服务器无 manifest，清空本地同步数据');
      clearAllSyncData();
      return true;
    }

    const manifest = manifestResult.data as BackupManifest;
    if (!manifest || !Array.isArray(manifest.shards)) {
      console.warn('[DataSync] manifest 内容异常，保留本地同步数据');
      return false;
    }

    const groupDataMap: Partial<Record<SyncGroupName, Record<string, any>>> = {};

    for (const group of SYNC_GROUPS) {
      const shard = manifest.shards.find((item) => item.name === group.name);
      if (!shard) {
        groupDataMap[group.name] = {};
        continue;
      }
      const shardResult = await downloadAndParseFile(userId, shard.fileName);
      if (shardResult.error) {
        console.warn('[DataSync] 分片下载异常，保留本地同步数据', { groupName: group.name, fileName: shard.fileName });
        return false;
      }
      groupDataMap[group.name] = shardResult.found && shardResult.data ? shardResult.data : {};
    }

    restoreAllDataByGroups(groupDataMap);
    console.log('[DataSync] 下载并恢复成功');
    return true;
  } catch (e) {
    console.error('[DataSync] 下载异常:', e);
    return false;
  }
}

export function triggerSync(): void {
  if (_restoring) return;
  if (!uni.getStorageSync('token')) return;

  if (_debounceTimer) clearTimeout(_debounceTimer);
  _debounceTimer = setTimeout(() => {
    _debounceTimer = null;
    uploadData().catch((e) => console.error('[DataSync] 防抖上传失败:', e));
  }, DEBOUNCE_MS);
}

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

export function clearSyncCache(): void {
  _userId = null;
  if (_debounceTimer) {
    clearTimeout(_debounceTimer);
    _debounceTimer = null;
  }
}
