
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

export enum AlertType {
  FALL = '跌倒报警',
  HEART_RATE = '心率异常',
  GEOFENCE = '离开安全区域',
  SOS = '紧急呼叫',
  LOW_BATTERY = '电量过低'
}

export interface DeviceInfo {
  deviceId: string;
  name: string;
  batteryLevel: number;
  isOnline: boolean;
  lastOnlineTime: string;
}

export interface Elderly {
  id: string;
  name: string;
  age: number;
  avatarUrl: string;
  phone: string;
  currentStatus: ActivityStatus;
  currentLocation: string; // "北京市朝阳区..."
  locationCoords: { latitude: number, longitude: number };
  device: DeviceInfo;
}

export interface AlertRecord {
  id: string;
  type: AlertType;
  elderlyName: string;
  time: string;
  description: string;
  isRead: boolean;
}

export interface HistoryRecord {
  id: string;
  status: ActivityStatus;
  startTime: string;
  duration: string; // "30分钟"
}
