
import { Elderly, AlertRecord, HistoryRecord, ActivityStatus, AlertType, AlertLevel, AlertStatus } from '../model/Types';

export class MockData {
  static elderlyList: Elderly[] = [
    {
      id: 'e001',
      name: '张建国',
      age: 76,
      avatarUrl: 'app.media.ic_public_user',
      phone: '13800138000',
      currentStatus: ActivityStatus.WALKING,
      currentLocation: '北京市朝阳区幸福养老社区3号楼附近',
      locationCoords: { latitude: 39.9, longitude: 116.4 },
      device: {
        deviceId: 'd001',
        name: '智能手环 S1',
        batteryLevel: 85,
        isOnline: true,
        lastOnlineTime: '刚刚'
      }
    },
    {
      id: 'e002',
      name: '李秀英',
      age: 72,
      avatarUrl: 'app.media.ic_public_user',
      phone: '13800138001',
      currentStatus: ActivityStatus.SITTING,
      currentLocation: '家中',
      locationCoords: { latitude: 39.91, longitude: 116.41 },
      device: {
        deviceId: 'd002',
        name: '智能拐杖 Pro',
        batteryLevel: 45,
        isOnline: true,
        lastOnlineTime: '10分钟前'
      }
    }
  ];

  static alerts: AlertRecord[] = [
    {
      id: 'a001',
      elderlyId: 'e001',
      type: AlertType.SOS,
      elderlyName: '张建国',
      time: '2023-10-27 14:30',
      description: '老人触发了紧急呼叫',
      location: '北京市朝阳区幸福养老社区3号楼附近',
      level: AlertLevel.HIGH,
      status: AlertStatus.UNPROCESSED
    },
    {
      id: 'a002',
      elderlyId: 'e002',
      type: AlertType.LOW_BATTERY,
      elderlyName: '李秀英',
      time: '2023-10-26 09:15',
      description: '设备电量低于 20%',
      location: '家中',
      level: AlertLevel.LOW,
      status: AlertStatus.RESOLVED
    }
  ];

  static history: HistoryRecord[] = [
    { id: 'h1', status: ActivityStatus.WALKING, startTime: '14:00', endTime: '14:30', duration: '30分钟' },
    { id: 'h2', status: ActivityStatus.SITTING, startTime: '12:30', endTime: '14:00', duration: '1小时30分' },
    { id: 'h3', status: ActivityStatus.STILL, startTime: '12:00', endTime: '12:30', duration: '30分钟' },
    { id: 'h4', status: ActivityStatus.WALKING, startTime: '10:00', endTime: '12:00', duration: '2小时' }
  ];
}
