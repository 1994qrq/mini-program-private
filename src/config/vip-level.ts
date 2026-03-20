/**
 * VIP等级配置
 *
 * 等级规则：按累计充值的心币数量计算
 * 注意：这里的 requirement 是心币数量，不是人民币金额
 */

export interface VipLevelRule {
  level: number;        // 等级（0-7）
  requirement: number;  // 所需累计心币数量
  label: string;        // 等级标签
  description: string;  // 等级描述
  benefits?: string;    // 等级权益说明
}

/**
 * VIP等级规则配置
 * 按累计充值的心币数量计算等级
 */
export const VIP_LEVEL_RULES: VipLevelRule[] = [
  {
    level: 0,
    requirement: 0,
    label: '游客/来宾',
    description: '默认等级',
    benefits: '可访问免费模块'
  },
  {
    level: 1,
    requirement: 1000,
    label: 'vip',  // VIP1 显示为 "vip"
    description: '累计充值 ≥ 1000心币',
    benefits: '开放陌生、不熟、熟悉模块'
  },
  {
    level: 2,
    requirement: 5000,
    label: '会员2',  // VIP2 显示为 "会员2"
    description: '累计充值 ≥ 5000心币',
    benefits: '开放超熟模块'
  },
  {
    level: 3,
    requirement: 10000,
    label: '会员3',  // VIP3 显示为 "会员3"
    description: '累计充值 ≥ 10000心币',
    benefits: '开放图文模块'
  },
  {
    level: 4,
    requirement: 50000,
    label: '会员4',  // VIP4 显示为 "会员4"
    description: '累计充值 ≥ 50000心币',
    benefits: '开放问诊模块'
  },
  {
    level: 5,
    requirement: 100000,
    label: '会员5',  // VIP5 显示为 "会员5"
    description: '累计充值 ≥ 100000心币',
    benefits: '开放定制模块'
  },
  {
    level: 6,
    requirement: 500000,
    label: '会员6',  // VIP6 显示为 "会员6"
    description: '累计充值 ≥ 500000心币',
    benefits: '开放线下模块'
  },
  {
    level: 7,
    requirement: 1000000,
    label: '会员7',  // VIP7 显示为 "会员7"
    description: '累计充值 ≥ 1000000心币',
    benefits: '全部模块开放，尊享特权'
  }
];

/**
 * 根据累计充值的心币数量计算等级
 * @param accumulateVirtual 累计充值的心币数量
 * @returns 对应的VIP等级（0-7）
 */
export function calculateLevel(accumulateVirtual: number): number {
  // 从高到低遍历，找到第一个满足条件的等级
  for (let i = VIP_LEVEL_RULES.length - 1; i >= 0; i--) {
    if (accumulateVirtual >= VIP_LEVEL_RULES[i].requirement) {
      return VIP_LEVEL_RULES[i].level;
    }
  }
  return 0;
}

/**
 * 计算距离下一级所需的心币数量
 * @param currentLevel 当前等级
 * @param currentVirtual 当前累计心币数量
 * @returns 距离下一级所需的心币数量，如果已达到最高等级则返回0
 */
export function getNextLevelVirtual(currentLevel: number, currentVirtual: number): number {
  const nextLevel = currentLevel + 1;

  // 如果已达到最高等级
  if (nextLevel >= VIP_LEVEL_RULES.length) {
    return 0;
  }

  const nextRequirement = VIP_LEVEL_RULES[nextLevel].requirement;
  return Math.max(0, nextRequirement - currentVirtual);
}

/**
 * 获取指定等级的规则信息
 * @param level 等级（0-7）
 * @returns 等级规则信息，如果等级不存在则返回undefined
 */
export function getLevelRule(level: number): VipLevelRule | undefined {
  return VIP_LEVEL_RULES.find(rule => rule.level === level);
}

/**
 * 获取所有等级规则
 * @returns 所有等级规则数组
 */
export function getAllLevelRules(): VipLevelRule[] {
  return VIP_LEVEL_RULES;
}

/**
 * 格式化心币数量显示
 * @param virtual 心币数量
 * @returns 格式化后的字符串（带千分位）
 */
export function formatVirtual(virtual: number): string {
  if (!virtual && virtual !== 0) return '0';
  return virtual.toLocaleString('zh-CN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  });
}
