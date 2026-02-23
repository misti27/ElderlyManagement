import { ActivityStatus } from '../model/Types';

// 1. 使用 class 配合 static readonly 定义颜色常量（这是 ArkTS 最推荐的常量定义规范）
export class StatusColors {
  static readonly DANGER: string = '#EF4444';   // 红色 - 警报/危险
  static readonly HIGH: string = '#F59E0B';     // 橙色 - 高强度活动
  static readonly NORMAL: string = '#67C23A';   // 绿色 - 正常活动
  static readonly CALM: string = '#3b64cc';     // 蓝色 - 基础姿态
  static readonly IDLE: string = '#6B7280';     // 灰色 - 静止无活动
}

// 2. 使用 Map 替代对象字面量做字典（解决 Duplicate property 报错，且符合 ArkTS 规范）
const statusColorMap = new Map<string, string>([
  // 危险状态
  [ActivityStatus.FALLEN as string, StatusColors.DANGER],
  ['跌倒', StatusColors.DANGER],
  ['摔倒', StatusColors.DANGER],

  // 高强度活动
  [ActivityStatus.RUNNING as string, StatusColors.HIGH],
  ['快跑', StatusColors.HIGH],
  [ActivityStatus.JOGGING as string, StatusColors.HIGH],
  ['慢跑', StatusColors.HIGH],

  // 中低强度/正常活动
  [ActivityStatus.WALKING as string, StatusColors.NORMAL],
  ['正常行走', StatusColors.NORMAL],
  [ActivityStatus.GOING_UPSTAIRS as string, StatusColors.NORMAL], // 已修复这里的拼写错误
  ['上楼', StatusColors.NORMAL],
  [ActivityStatus.GOING_DOWNSTAIRS as string, StatusColors.NORMAL],
  ['下楼', StatusColors.NORMAL],

  // 基础姿态
  [ActivityStatus.SITTING as string, StatusColors.CALM],
  ['坐下', StatusColors.CALM],
  [ActivityStatus.STANDING as string, StatusColors.CALM],
  ['站立', StatusColors.CALM],

  // 静止状态
  [ActivityStatus.STILL as string, StatusColors.IDLE],
  ['静止', StatusColors.IDLE]
]);

// 3. 导出获取颜色的工具函数
export function getActivityColor(status: string): string {
  // 从 Map 获取对应的颜色，如果不存在（返回 undefined），则使用备用颜色 CALM
  return statusColorMap.get(status) ?? StatusColors.CALM;
}