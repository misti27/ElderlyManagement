
export enum ActivityStatus {
  FALLEN = '跌倒',
  STILL = '静止',
  SITTING = '坐下',
  STANDING = '站立',
  WALKING = '正常行走',
  JOGGING = '慢跑',
  RUNNING = '快跑',
  GOING_UPSTAIRS = '上楼',
  GOING_DOWNSTAIRS = '下楼',
  UNKNOWN = '未知'
}

export interface User {
  id: string;
  name: string;
  age: number;
  phone: string;
  emergencyPhone: string;
  avatarUrl: string;
  address: string;
}

export interface Guardian {
  id: string;
  name: string;
  phone: string;
  relation: string;
  avatarUrl: string;
}

export interface DeviceInfo {
  deviceId: string;
  batteryLevel: number;
  isCharging: boolean;
  model: string;
}
