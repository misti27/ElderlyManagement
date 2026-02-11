
// 对应数据库表: elderly_user
export interface User {
  id: string;
  name: string;
  gender: '男' | '女';
  phone: string;
  emergency_phone: string;
  address: string;
  health_status: 1 | 2 | 3;
  height: number;
  weight: number;
  create_time?: string;
  bindDeviceId?: string;
  avatarUrl?: string;
  role?: 'elderly';
}

// B) Guardian_user (监护人表)
export interface Guardian {
  id: string;
  name: string;
  phone: string;
  avatarUrl?: string;
  create_time: string;
  update_time: string;
}

// C) elderly_guardian_relation (监护关系表)
export interface GuardianRelation {
  relation_id: string;
  elderly_id: string;
  guardian_id: string;
  relationship: string; // 父子、护工、配偶等
  priority: number; // 报警优先级
}

// D) monitoring_device (监测设备表)
export interface Device {
  device_id: string;
  device_name: string;
  device_type: string;
  brand: string;
  elderly_id: string | null; // 所属老人ID
  battery_level: number;
  status: number; // 0:正常, 1:故障
  bind_time?: string;
  is_online: boolean;
  last_online_time?: string;
}

export enum ActivityStatus {
  FALLEN = 'fallen',
  STILL = 'still',
  SITTING = 'sitting',
  STANDING = 'standing',
  WALKING = 'walking',
  JOGGING = 'jogging',
  RUNNING = 'running',
  GOING_UPSTAIRS = 'upstairs',
  GOING_DOWNSTAIRS = 'downstairs',
  UNKNOWN = 'unknown'
}

export const ACTIVITY_LABELS: Record<ActivityStatus, string> = {
  [ActivityStatus.FALLEN]: '跌倒',
  [ActivityStatus.STILL]: '静止',
  [ActivityStatus.SITTING]: '坐下',
  [ActivityStatus.STANDING]: '站立',
  [ActivityStatus.WALKING]: '正常行走',
  [ActivityStatus.JOGGING]: '慢跑',
  [ActivityStatus.RUNNING]: '快跑',
  [ActivityStatus.GOING_UPSTAIRS]: '上楼',
  [ActivityStatus.GOING_DOWNSTAIRS]: '下楼',
  [ActivityStatus.UNKNOWN]: '未知'
};

// 跌倒类型定义 (由于手机传感器特性，仍保留分类供详细参考)
export enum FallType {
  NONE = 0,      // 未跌倒
  FORWARD = 1,   // 前摔
  BACKWARD = 2,  // 后摔
  SIDEWAY = 3,   // 侧摔
  UNKNOWN = 4    // 未知跌倒
}

export const FALL_TYPE_LABELS: Record<FallType, string> = {
  [FallType.NONE]: '正常',
  [FallType.FORWARD]: '前摔',
  [FallType.BACKWARD]: '后摔',
  [FallType.SIDEWAY]: '侧摔',
  [FallType.UNKNOWN]: '未知跌倒'
};

export interface LocationData {
  latitude: number;
  longitude: number;
  address?: string;
}

export interface ElderlyStatus {
  userId: string;
  deviceId: string;
  activityStatus: ActivityStatus;
  fallType: FallType;
  location: LocationData;
  isFall: boolean;
  batteryLevel: number;
  isOnline: boolean;
  timestamp: number;
}

export enum AlertType {
  FALL = 'FALL',
  BATTERY_LOW = 'BATTERY_LOW',
  SOS = 'SOS',
  GEOFENCE = 'GEOFENCE',
  // Added HEART_RATE_ABNORMAL to fix compilation errors in AlertCenter.tsx
  HEART_RATE_ABNORMAL = 'HEART_RATE_ABNORMAL'
}

export enum AlertLevel {
  LOW = 1,
  MEDIUM = 2,
  HIGH = 3,
}

export enum AlertStatus {
  PENDING = 0,
  CONFIRMED = 1,
  RESOLVED = 2,
}

export interface Alert {
  id: string;
  userId: string;
  userName: string;
  type: AlertType;
  level: AlertLevel;
  status: AlertStatus;
  message: string;
  location: string;
  timestamp: number;
  resolvedAt?: number;
  resolvedBy?: string;
}

export interface DashboardStats {
  totalElderly: number;
  activeDevices: number;
  todayAlerts: number;
  pendingAlerts: number;
}

export interface ActivityTimelineItem {
  status: ActivityStatus;
  time: string;
  duration: string;
}

export interface HealthReport {
  summary: string;
  activityTimeline: ActivityTimelineItem[];
  dailyStats: {
    date: string;
    step_count: number;
    avg_heart_rate: number;
    sleep_hours: number;
  }[];
}

export interface SystemAnalysis {
  alertTypeDistribution: { name: string; value: number }[];
  movementIntensityStats: { name: string; intensity: number; upstairs: number }[];
  sensorQuality: { label: string; value: string; color: string }[];
}

export interface HistoryStats {
  totalAlerts: number;
  statusDistribution: {
    name: string;
    value: number;
    color: string;
  }[];
  alerts: Alert[];
}
