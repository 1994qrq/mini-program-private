/**
 * 内容分段解析工具
 * 统一处理@、///、LL等分段符号
 */

export interface ParsedContent {
  type: string;
  text: string;
  stepDetailId: string;
}

export interface ParseOptions {
  segmentsCopied?: number; // 已复制的段落数
  isLeaving?: boolean; // 是否是离库内容
  nodeType?: string; // 节点类型
  prefix?: string; // stepDetailId前缀
}

/**
 * 解析内容文本，支持@、///、LL分段
 * @param text 原始文本
 * @param options 解析选项
 * @returns 解析后的内容列表
 */
export function parseContent(text: string, options: ParseOptions = {}): ParsedContent[] {
  const {
    segmentsCopied = 0,
    isLeaving = false,
    nodeType = 'content',
    prefix = 'content'
  } = options;

  if (!text) return [];

  // 清除FF标记
  const cleanText = text.replace(/FF/g, '');

  // 特殊情况：离库且全是LL（无@和///），整段按LL拆分
  if (isLeaving && cleanText.includes('LL') && !cleanText.includes('///') && !cleanText.includes('@')) {
    const parallelSegments = cleanText
      .split('LL')
      .map((s: string) => s.trim())
      .filter((s: string) => s.length > 0);

    return parallelSegments.map((segment: string, index: number) => ({
      type: nodeType,
      text: segment,
      stepDetailId: `${prefix}_leaving_ll_${index}`,
    }));
  }

  // 通用逻辑：先按@分段，再处理当前段中的///或LL
  const segments = cleanText
    .split('@')
    .map((s: string) => s.trim())
    .filter((s: string) => s.length > 0);

  const totalSegments = segments.length;
  const segIndex = totalSegments > 0 ? Math.min(Math.max(segmentsCopied, 0), totalSegments - 1) : 0;
  const currentSegment = segments[segIndex] || '';

  // 检查当前段是否包含///并行
  if (currentSegment.includes('///')) {
    const parallelSegments = currentSegment
      .split('///')
      .map((s: string) => s.replace(/^[（(]/, '').replace(/[）)]$/, '').trim())
      .filter((s: string) => s.length > 0);

    return parallelSegments.map((segment: string, index: number) => ({
      type: nodeType,
      text: segment,
      stepDetailId: `${prefix}_parallel_${segIndex}_${index}`,
    }));
  }

  // 检查当前段是否包含LL并行
  if (currentSegment.includes('LL')) {
    const parallelSegments = currentSegment
      .split('LL')
      .map((s: string) => s.trim())
      .filter((s: string) => s.length > 0);

    return parallelSegments.map((segment: string, index: number) => ({
      type: nodeType,
      text: segment,
      stepDetailId: `${prefix}_parallel_ll_${segIndex}_${index}`,
    }));
  }

  // 普通内容：仅返回当前段落
  return [{
    type: nodeType,
    text: currentSegment,
    stepDetailId: `${prefix}_seg_${segIndex}`,
  }];
}

/**
 * 计算文本的总段落数（按@分段）
 * @param text 原始文本
 * @returns 总段落数
 */
export function getTotalSegments(text: string): number {
  if (!text) return 0;
  const cleanText = text.replace(/FF/g, '');
  const segments = cleanText
    .split('@')
    .map((s: string) => s.trim())
    .filter((s: string) => s.length > 0);
  return segments.length || 1;
}

/**
 * 检查文本是否包含特殊符号
 * @param text 文本内容
 * @returns 包含的特殊符号
 */
export function checkSpecialSymbols(text: string): {
  hasEndSymbol: boolean; // &符号，表示结束
  hasScoreSymbol: boolean; // ++符号，表示加分
  hasAZ: boolean; // AZ标记
  hasAD: boolean; // AD标记
} {
  return {
    hasEndSymbol: text.includes('&'),
    hasScoreSymbol: text.includes('++'),
    hasAZ: text.includes('AZ'),
    hasAD: text.includes('AD'),
  };
}

/**
 * 清除文本中的特殊符号
 * @param text 原始文本
 * @returns 清除后的文本
 */
export function cleanSpecialSymbols(text: string): string {
  return text
    .replace(/&/g, '')
    .replace(/\+\+/g, '')
    .replace(/AZ/g, '')
    .replace(/AD/g, '')
    .replace(/FF/g, '')
    .trim();
}
