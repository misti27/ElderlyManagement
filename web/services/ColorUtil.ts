import { ActivityStatus } from '../types';

// 定义颜色常量
export const COLORS = {
  DANGER: '#EF4444',     // 红色，用于“跌倒”等危险状态
  WARNING: '#F59E0B',    // 橙色，用于“静止不动”等警告状态
  SUCCESS: '#10B981',    // 绿色，用于“正常行走”等良好状态
  PRIMARY: '#3B82F6',    // 蓝色，用于“上下楼”等一般活动状态
  INFO: '#6B7280',      // 灰色，用于“未知”或一般信息
};

// 创建状态到颜色的映射
const statusColorMap: Record<ActivityStatus | string, string> = {
  [ActivityStatus.FALLEN]: COLORS.DANGER,
  [ActivityStatus.STILL]: COLORS.WARNING,
  [ActivityStatus.SITTING]: COLORS.SUCCESS,
  [ActivityStatus.STANDING]: COLORS.SUCCESS,
  [ActivityStatus.WALKING]: COLORS.SUCCESS,
  [ActivityStatus.JOGGING]: COLORS.PRIMARY,
  [ActivityStatus.RUNNING]: COLORS.PRIMARY,
  [ActivityStatus.GOING_UPSTAIRS]: COLORS.PRIMARY,
  [ActivityStatus.GOING_DOWNSTAIRS]: COLORS.PRIMARY,
  [ActivityStatus.UNKNOWN]: COLORS.INFO,
};

/**
 * 根据活动状态获取对应的十六进制颜色代码。
 * @param status 活动状态枚举值或字符串。
 * @returns 返回颜色代码字符串。
 */
export function getActivityColor(status: ActivityStatus | string): string {
  return statusColorMap[status] || COLORS.INFO;
}
