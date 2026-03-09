import { Elderly, AlertRecord, HistoryRecord, ActivityStatus, AlertType, AlertLevel, AlertStatus } from '../model/Types';

export class MockData {
  static userProfile = {
    name: '模拟用户',
    phone: '18812345678',
    isVibrationEnabled: true,
    isSmsEnabled: true
  };

  // 家属关系表：监护人对长辈的称呼 <-> 长辈对监护人的称呼
  static relations = [
    {
      id: 'r001',
      guardianId: 'g001',       // 当前登录监护人
      elderlyId: 'e001',
      guardianAlias: '父亲',    // 监护人界面显示（我叫他"父亲"）
      elderlyAlias: '儿子'      // 长辈界面显示（他叫我"儿子"）
    },
    {
      id: 'r002',
      guardianId: 'g001',
      elderlyId: 'e002',
      guardianAlias: '母亲',
      elderlyAlias: '儿子'
    }
  ];

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
        name: '华为 P70',
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
        name: '华为 Mate70',
        batteryLevel: 45,
        isOnline: true,
        lastOnlineTime: '10分钟前'
      }
    }
  ];

  static alerts: AlertRecord[] = [
    // ── 2026-03-01 ──
    {
      id: 'a001',
      elderlyId: 'e001',
      type: AlertType.SOS,
      elderlyName: '张建国',
      time: '2026-03-01 08:47',
      description: '老人触发了紧急呼叫',
      location: '北京市朝阳区幸福养老社区3号楼附近',
      level: AlertLevel.HIGH,
      status: AlertStatus.RESOLVED
    },
    {
      id: 'a002',
      elderlyId: 'e001',
      type: AlertType.LOW_BATTERY,
      elderlyName: '张建国',
      time: '2026-03-01 17:22',
      description: '设备电量低于 20%，请及时充电',
      location: '北京市朝阳区幸福养老社区3号楼',
      level: AlertLevel.LOW,
      status: AlertStatus.RESOLVED
    },
    {
      id: 'a003',
      elderlyId: 'e002',
      type: AlertType.FALL,
      elderlyName: '李秀英',
      time: '2026-03-01 10:12',
      description: '检测到疑似跌倒事件，请立即确认',
      location: '家中客厅',
      level: AlertLevel.HIGH,
      status: AlertStatus.RESOLVED
    },
    {
      id: 'a004',
      elderlyId: 'e002',
      type: AlertType.LOW_BATTERY,
      elderlyName: '李秀英',
      time: '2026-03-01 20:30',
      description: '设备电量低于 15%',
      location: '家中',
      level: AlertLevel.LOW,
      status: AlertStatus.RESOLVED
    },
    // ── 2026-03-02 ──
    {
      id: 'a005',
      elderlyId: 'e001',
      type: AlertType.GEOFENCE,
      elderlyName: '张建国',
      time: '2026-03-02 09:05',
      description: '老人离开了设定的安全区域',
      location: '北京市朝阳区望京街道',
      level: AlertLevel.MEDIUM,
      status: AlertStatus.CONFIRMED
    },
    {
      id: 'a006',
      elderlyId: 'e001',
      type: AlertType.SOS,
      elderlyName: '张建国',
      time: '2026-03-02 15:33',
      description: '老人触发了紧急呼叫',
      location: '北京市朝阳区望京公园内',
      level: AlertLevel.HIGH,
      status: AlertStatus.UNPROCESSED
    },
    {
      id: 'a007',
      elderlyId: 'e002',
      type: AlertType.FALL,
      elderlyName: '李秀英',
      time: '2026-03-02 13:08',
      description: '检测到疑似跌倒事件，请立即确认',
      location: '家中走廊',
      level: AlertLevel.HIGH,
      status: AlertStatus.RESOLVED
    },
    {
      id: 'a008',
      elderlyId: 'e002',
      type: AlertType.FALL,
      elderlyName: '李秀英',
      time: '2026-03-02 18:52',
      description: '检测到疑似跌倒事件，请立即确认',
      location: '家中卧室',
      level: AlertLevel.HIGH,
      status: AlertStatus.UNPROCESSED
    }
  ];

  // 模拟秒级检测（startTime/endTime 精确到秒），段长数秒~数分钟
  // mergeRecords() 会将连续相同状态自动合并后再展示
  static history: HistoryRecord[] = [

    // ──── 张建国 2026-03-01 凌晨 ────
    { id: 'e1_d1_e01', elderlyId: 'e001', date: '2026-03-01', status: ActivityStatus.STILL,           startTime: '00:00:00', endTime: '01:30:00', duration: '1小时30分' },
    { id: 'e1_d1_e02', elderlyId: 'e001', date: '2026-03-01', status: ActivityStatus.STANDING,        startTime: '01:30:00', endTime: '01:31:20', duration: '1分20秒' },
    { id: 'e1_d1_e03', elderlyId: 'e001', date: '2026-03-01', status: ActivityStatus.WALKING,         startTime: '01:31:20', endTime: '01:33:30', duration: '2分10秒' },
    { id: 'e1_d1_e04', elderlyId: 'e001', date: '2026-03-01', status: ActivityStatus.STANDING,        startTime: '01:33:30', endTime: '01:34:20', duration: '50秒' },
    { id: 'e1_d1_e05', elderlyId: 'e001', date: '2026-03-01', status: ActivityStatus.WALKING,         startTime: '01:34:20', endTime: '01:36:00', duration: '1分40秒' },
    { id: 'e1_d1_e06', elderlyId: 'e001', date: '2026-03-01', status: ActivityStatus.STILL,           startTime: '01:36:00', endTime: '03:10:00', duration: '1小时34分' },
    { id: 'e1_d1_e07', elderlyId: 'e001', date: '2026-03-01', status: ActivityStatus.STANDING,        startTime: '03:10:00', endTime: '03:11:05', duration: '1分5秒' },
    { id: 'e1_d1_e08', elderlyId: 'e001', date: '2026-03-01', status: ActivityStatus.WALKING,         startTime: '03:11:05', endTime: '03:13:20', duration: '2分15秒' },
    { id: 'e1_d1_e09', elderlyId: 'e001', date: '2026-03-01', status: ActivityStatus.STANDING,        startTime: '03:13:20', endTime: '03:14:10', duration: '50秒' },
    { id: 'e1_d1_e10', elderlyId: 'e001', date: '2026-03-01', status: ActivityStatus.WALKING,         startTime: '03:14:10', endTime: '03:15:40', duration: '1分30秒' },
    { id: 'e1_d1_e11', elderlyId: 'e001', date: '2026-03-01', status: ActivityStatus.STILL,           startTime: '03:15:40', endTime: '05:00:00', duration: '1小时44分20秒' },
    { id: 'e1_d1_e12', elderlyId: 'e001', date: '2026-03-01', status: ActivityStatus.STANDING,        startTime: '05:00:00', endTime: '05:01:10', duration: '1分10秒' },
    { id: 'e1_d1_e13', elderlyId: 'e001', date: '2026-03-01', status: ActivityStatus.WALKING,         startTime: '05:01:10', endTime: '05:04:00', duration: '2分50秒' },
    { id: 'e1_d1_e14', elderlyId: 'e001', date: '2026-03-01', status: ActivityStatus.SITTING,         startTime: '05:04:00', endTime: '05:30:00', duration: '26分' },
    { id: 'e1_d1_e15', elderlyId: 'e001', date: '2026-03-01', status: ActivityStatus.WALKING,         startTime: '05:30:00', endTime: '05:33:20', duration: '3分20秒' },
    { id: 'e1_d1_e16', elderlyId: 'e001', date: '2026-03-01', status: ActivityStatus.STILL,           startTime: '05:33:20', endTime: '06:00:00', duration: '26分40秒' },
    // ════════════════════════════════════════
    // 张建国  2026-03-01
    // 清晨起床 → 晨练 → 早饭 → 上午活动 → 午休 → 下午散步 → 晚饭 → 就寝
    // ════════════════════════════════════════
    { id: 'e1_d1_001', elderlyId: 'e001', date: '2026-03-01', status: ActivityStatus.STILL,           startTime: '06:00:00', endTime: '06:00:45', duration: '45秒' },
    { id: 'e1_d1_002', elderlyId: 'e001', date: '2026-03-01', status: ActivityStatus.STANDING,        startTime: '06:00:45', endTime: '06:01:30', duration: '45秒' },
    { id: 'e1_d1_003', elderlyId: 'e001', date: '2026-03-01', status: ActivityStatus.WALKING,         startTime: '06:01:30', endTime: '06:04:00', duration: '2分30秒' },
    { id: 'e1_d1_004', elderlyId: 'e001', date: '2026-03-01', status: ActivityStatus.STILL,           startTime: '06:04:00', endTime: '06:06:10', duration: '2分10秒' },
    { id: 'e1_d1_005', elderlyId: 'e001', date: '2026-03-01', status: ActivityStatus.WALKING,         startTime: '06:06:10', endTime: '06:08:00', duration: '1分50秒' },
    { id: 'e1_d1_006', elderlyId: 'e001', date: '2026-03-01', status: ActivityStatus.STANDING,        startTime: '06:08:00', endTime: '06:09:00', duration: '1分' },
    // 晨练出门
    { id: 'e1_d1_007', elderlyId: 'e001', date: '2026-03-01', status: ActivityStatus.WALKING,         startTime: '06:09:00', endTime: '06:14:30', duration: '5分30秒' },
    { id: 'e1_d1_008', elderlyId: 'e001', date: '2026-03-01', status: ActivityStatus.JOGGING,         startTime: '06:14:30', endTime: '06:22:00', duration: '7分30秒' },
    { id: 'e1_d1_009', elderlyId: 'e001', date: '2026-03-01', status: ActivityStatus.WALKING,         startTime: '06:22:00', endTime: '06:24:40', duration: '2分40秒' },
    { id: 'e1_d1_010', elderlyId: 'e001', date: '2026-03-01', status: ActivityStatus.JOGGING,         startTime: '06:24:40', endTime: '06:31:00', duration: '6分20秒' },
    { id: 'e1_d1_011', elderlyId: 'e001', date: '2026-03-01', status: ActivityStatus.RUNNING,         startTime: '06:31:00', endTime: '06:33:30', duration: '2分30秒' },
    { id: 'e1_d1_012', elderlyId: 'e001', date: '2026-03-01', status: ActivityStatus.JOGGING,         startTime: '06:33:30', endTime: '06:38:00', duration: '4分30秒' },
    { id: 'e1_d1_013', elderlyId: 'e001', date: '2026-03-01', status: ActivityStatus.WALKING,         startTime: '06:38:00', endTime: '06:41:20', duration: '3分20秒' },
    { id: 'e1_d1_014', elderlyId: 'e001', date: '2026-03-01', status: ActivityStatus.STILL,           startTime: '06:41:20', endTime: '06:43:00', duration: '1分40秒' },
    { id: 'e1_d1_015', elderlyId: 'e001', date: '2026-03-01', status: ActivityStatus.GOING_UPSTAIRS,  startTime: '06:43:00', endTime: '06:44:10', duration: '1分10秒' },
    { id: 'e1_d1_016', elderlyId: 'e001', date: '2026-03-01', status: ActivityStatus.WALKING,         startTime: '06:44:10', endTime: '06:46:00', duration: '1分50秒' },
    // 早饭
    { id: 'e1_d1_017', elderlyId: 'e001', date: '2026-03-01', status: ActivityStatus.SITTING,         startTime: '06:46:00', endTime: '07:10:00', duration: '24分' },
    { id: 'e1_d1_018', elderlyId: 'e001', date: '2026-03-01', status: ActivityStatus.STANDING,        startTime: '07:10:00', endTime: '07:11:20', duration: '1分20秒' },
    { id: 'e1_d1_019', elderlyId: 'e001', date: '2026-03-01', status: ActivityStatus.WALKING,         startTime: '07:11:20', endTime: '07:14:00', duration: '2分40秒' },
    { id: 'e1_d1_020', elderlyId: 'e001', date: '2026-03-01', status: ActivityStatus.GOING_UPSTAIRS,  startTime: '07:14:00', endTime: '07:15:05', duration: '1分5秒' },
    { id: 'e1_d1_021', elderlyId: 'e001', date: '2026-03-01', status: ActivityStatus.SITTING,         startTime: '07:15:05', endTime: '08:00:00', duration: '44分55秒' },
    // 上午外出
    { id: 'e1_d1_022', elderlyId: 'e001', date: '2026-03-01', status: ActivityStatus.STANDING,        startTime: '08:00:00', endTime: '08:01:10', duration: '1分10秒' },
    { id: 'e1_d1_023', elderlyId: 'e001', date: '2026-03-01', status: ActivityStatus.GOING_DOWNSTAIRS,startTime: '08:01:10', endTime: '08:02:20', duration: '1分10秒' },
    { id: 'e1_d1_024', elderlyId: 'e001', date: '2026-03-01', status: ActivityStatus.WALKING,         startTime: '08:02:20', endTime: '08:10:00', duration: '7分40秒' },
    { id: 'e1_d1_025', elderlyId: 'e001', date: '2026-03-01', status: ActivityStatus.STILL,           startTime: '08:10:00', endTime: '08:12:30', duration: '2分30秒' },
    { id: 'e1_d1_026', elderlyId: 'e001', date: '2026-03-01', status: ActivityStatus.WALKING,         startTime: '08:12:30', endTime: '08:20:00', duration: '7分30秒' },
    { id: 'e1_d1_027', elderlyId: 'e001', date: '2026-03-01', status: ActivityStatus.JOGGING,         startTime: '08:20:00', endTime: '08:25:00', duration: '5分' },
    { id: 'e1_d1_028', elderlyId: 'e001', date: '2026-03-01', status: ActivityStatus.WALKING,         startTime: '08:25:00', endTime: '08:45:00', duration: '20分' },
    { id: 'e1_d1_029', elderlyId: 'e001', date: '2026-03-01', status: ActivityStatus.SITTING,         startTime: '08:45:00', endTime: '09:30:00', duration: '45分' },
    { id: 'e1_d1_030', elderlyId: 'e001', date: '2026-03-01', status: ActivityStatus.WALKING,         startTime: '09:30:00', endTime: '09:40:00', duration: '10分' },
    { id: 'e1_d1_031', elderlyId: 'e001', date: '2026-03-01', status: ActivityStatus.GOING_UPSTAIRS,  startTime: '09:40:00', endTime: '09:41:15', duration: '1分15秒' },
    { id: 'e1_d1_032', elderlyId: 'e001', date: '2026-03-01', status: ActivityStatus.WALKING,         startTime: '09:41:15', endTime: '09:43:00', duration: '1分45秒' },
    { id: 'e1_d1_033', elderlyId: 'e001', date: '2026-03-01', status: ActivityStatus.SITTING,         startTime: '09:43:00', endTime: '10:30:00', duration: '47分' },
    { id: 'e1_d1_034', elderlyId: 'e001', date: '2026-03-01', status: ActivityStatus.STANDING,        startTime: '10:30:00', endTime: '10:31:20', duration: '1分20秒' },
    { id: 'e1_d1_035', elderlyId: 'e001', date: '2026-03-01', status: ActivityStatus.WALKING,         startTime: '10:31:20', endTime: '10:36:00', duration: '4分40秒' },
    { id: 'e1_d1_036', elderlyId: 'e001', date: '2026-03-01', status: ActivityStatus.STILL,           startTime: '10:36:00', endTime: '10:38:00', duration: '2分' },
    { id: 'e1_d1_037', elderlyId: 'e001', date: '2026-03-01', status: ActivityStatus.WALKING,         startTime: '10:38:00', endTime: '10:45:00', duration: '7分' },
    // 午饭 + 午休
    { id: 'e1_d1_038', elderlyId: 'e001', date: '2026-03-01', status: ActivityStatus.SITTING,         startTime: '10:45:00', endTime: '11:15:00', duration: '30分' },
    { id: 'e1_d1_039', elderlyId: 'e001', date: '2026-03-01', status: ActivityStatus.STANDING,        startTime: '11:15:00', endTime: '11:16:10', duration: '1分10秒' },
    { id: 'e1_d1_040', elderlyId: 'e001', date: '2026-03-01', status: ActivityStatus.WALKING,         startTime: '11:16:10', endTime: '11:18:00', duration: '1分50秒' },
    { id: 'e1_d1_041', elderlyId: 'e001', date: '2026-03-01', status: ActivityStatus.GOING_UPSTAIRS,  startTime: '11:18:00', endTime: '11:19:05', duration: '1分5秒' },
    { id: 'e1_d1_042', elderlyId: 'e001', date: '2026-03-01', status: ActivityStatus.STILL,           startTime: '11:19:05', endTime: '13:00:00', duration: '1小时40分55秒' },
    // 下午散步
    { id: 'e1_d1_043', elderlyId: 'e001', date: '2026-03-01', status: ActivityStatus.STANDING,        startTime: '13:00:00', endTime: '13:01:30', duration: '1分30秒' },
    { id: 'e1_d1_044', elderlyId: 'e001', date: '2026-03-01', status: ActivityStatus.GOING_DOWNSTAIRS,startTime: '13:01:30', endTime: '13:02:45', duration: '1分15秒' },
    { id: 'e1_d1_045', elderlyId: 'e001', date: '2026-03-01', status: ActivityStatus.WALKING,         startTime: '13:02:45', endTime: '13:18:00', duration: '15分15秒' },
    { id: 'e1_d1_046', elderlyId: 'e001', date: '2026-03-01', status: ActivityStatus.JOGGING,         startTime: '13:18:00', endTime: '13:24:00', duration: '6分' },
    { id: 'e1_d1_047', elderlyId: 'e001', date: '2026-03-01', status: ActivityStatus.WALKING,         startTime: '13:24:00', endTime: '13:35:00', duration: '11分' },
    { id: 'e1_d1_048', elderlyId: 'e001', date: '2026-03-01', status: ActivityStatus.SITTING,         startTime: '13:35:00', endTime: '14:10:00', duration: '35分' },
    { id: 'e1_d1_049', elderlyId: 'e001', date: '2026-03-01', status: ActivityStatus.WALKING,         startTime: '14:10:00', endTime: '14:28:00', duration: '18分' },
    { id: 'e1_d1_050', elderlyId: 'e001', date: '2026-03-01', status: ActivityStatus.GOING_UPSTAIRS,  startTime: '14:28:00', endTime: '14:29:10', duration: '1分10秒' },
    { id: 'e1_d1_051', elderlyId: 'e001', date: '2026-03-01', status: ActivityStatus.SITTING,         startTime: '14:29:10', endTime: '16:00:00', duration: '1小时30分50秒' },
    // 傍晚
    { id: 'e1_d1_052', elderlyId: 'e001', date: '2026-03-01', status: ActivityStatus.STANDING,        startTime: '16:00:00', endTime: '16:01:00', duration: '1分' },
    { id: 'e1_d1_053', elderlyId: 'e001', date: '2026-03-01', status: ActivityStatus.WALKING,         startTime: '16:01:00', endTime: '16:08:00', duration: '7分' },
    { id: 'e1_d1_054', elderlyId: 'e001', date: '2026-03-01', status: ActivityStatus.STILL,           startTime: '16:08:00', endTime: '16:10:20', duration: '2分20秒' },
    { id: 'e1_d1_055', elderlyId: 'e001', date: '2026-03-01', status: ActivityStatus.WALKING,         startTime: '16:10:20', endTime: '16:22:00', duration: '11分40秒' },
    { id: 'e1_d1_056', elderlyId: 'e001', date: '2026-03-01', status: ActivityStatus.SITTING,         startTime: '16:22:00', endTime: '17:30:00', duration: '1小时8分' },
    { id: 'e1_d1_057', elderlyId: 'e001', date: '2026-03-01', status: ActivityStatus.GOING_DOWNSTAIRS,startTime: '17:30:00', endTime: '17:31:15', duration: '1分15秒' },
    { id: 'e1_d1_058', elderlyId: 'e001', date: '2026-03-01', status: ActivityStatus.WALKING,         startTime: '17:31:15', endTime: '17:40:00', duration: '8分45秒' },
    { id: 'e1_d1_059', elderlyId: 'e001', date: '2026-03-01', status: ActivityStatus.SITTING,         startTime: '17:40:00', endTime: '18:30:00', duration: '50分' },
    { id: 'e1_d1_060', elderlyId: 'e001', date: '2026-03-01', status: ActivityStatus.STANDING,        startTime: '18:30:00', endTime: '18:31:10', duration: '1分10秒' },
    { id: 'e1_d1_061', elderlyId: 'e001', date: '2026-03-01', status: ActivityStatus.WALKING,         startTime: '18:31:10', endTime: '18:38:00', duration: '6分50秒' },
    { id: 'e1_d1_062', elderlyId: 'e001', date: '2026-03-01', status: ActivityStatus.GOING_UPSTAIRS,  startTime: '18:38:00', endTime: '18:39:10', duration: '1分10秒' },
    { id: 'e1_d1_063', elderlyId: 'e001', date: '2026-03-01', status: ActivityStatus.SITTING,         startTime: '18:39:10', endTime: '20:00:00', duration: '1小时20分50秒' },
    { id: 'e1_d1_064', elderlyId: 'e001', date: '2026-03-01', status: ActivityStatus.STILL,           startTime: '20:00:00', endTime: '23:59:59', duration: '3小时59分59秒' },

    // ──── 张建国 2026-03-02 凌晨 ────
    { id: 'e1_d2_e01', elderlyId: 'e001', date: '2026-03-02', status: ActivityStatus.STILL,           startTime: '00:00:00', endTime: '02:00:00', duration: '2小时' },
    { id: 'e1_d2_e02', elderlyId: 'e001', date: '2026-03-02', status: ActivityStatus.STANDING,        startTime: '02:00:00', endTime: '02:01:10', duration: '1分10秒' },
    { id: 'e1_d2_e03', elderlyId: 'e001', date: '2026-03-02', status: ActivityStatus.WALKING,         startTime: '02:01:10', endTime: '02:03:30', duration: '2分20秒' },
    { id: 'e1_d2_e04', elderlyId: 'e001', date: '2026-03-02', status: ActivityStatus.STANDING,        startTime: '02:03:30', endTime: '02:04:15', duration: '45秒' },
    { id: 'e1_d2_e05', elderlyId: 'e001', date: '2026-03-02', status: ActivityStatus.WALKING,         startTime: '02:04:15', endTime: '02:06:00', duration: '1分45秒' },
    { id: 'e1_d2_e06', elderlyId: 'e001', date: '2026-03-02', status: ActivityStatus.STILL,           startTime: '02:06:00', endTime: '04:20:00', duration: '2小时14分' },
    { id: 'e1_d2_e07', elderlyId: 'e001', date: '2026-03-02', status: ActivityStatus.STANDING,        startTime: '04:20:00', endTime: '04:21:10', duration: '1分10秒' },
    { id: 'e1_d2_e08', elderlyId: 'e001', date: '2026-03-02', status: ActivityStatus.WALKING,         startTime: '04:21:10', endTime: '04:23:40', duration: '2分30秒' },
    { id: 'e1_d2_e09', elderlyId: 'e001', date: '2026-03-02', status: ActivityStatus.SITTING,         startTime: '04:23:40', endTime: '04:50:00', duration: '26分20秒' },
    { id: 'e1_d2_e10', elderlyId: 'e001', date: '2026-03-02', status: ActivityStatus.WALKING,         startTime: '04:50:00', endTime: '04:52:30', duration: '2分30秒' },
    { id: 'e1_d2_e11', elderlyId: 'e001', date: '2026-03-02', status: ActivityStatus.STILL,           startTime: '04:52:30', endTime: '06:00:00', duration: '1小时7分30秒' },
    // ════════════════════════════════════════
    // 张建国  2026-03-02
    // ════════════════════════════════════════
    { id: 'e1_d2_001', elderlyId: 'e001', date: '2026-03-02', status: ActivityStatus.STILL,           startTime: '06:00:00', endTime: '06:01:10', duration: '1分10秒' },
    { id: 'e1_d2_002', elderlyId: 'e001', date: '2026-03-02', status: ActivityStatus.STANDING,        startTime: '06:01:10', endTime: '06:02:00', duration: '50秒' },
    { id: 'e1_d2_003', elderlyId: 'e001', date: '2026-03-02', status: ActivityStatus.WALKING,         startTime: '06:02:00', endTime: '06:05:30', duration: '3分30秒' },
    { id: 'e1_d2_004', elderlyId: 'e001', date: '2026-03-02', status: ActivityStatus.GOING_DOWNSTAIRS,startTime: '06:05:30', endTime: '06:06:40', duration: '1分10秒' },
    { id: 'e1_d2_005', elderlyId: 'e001', date: '2026-03-02', status: ActivityStatus.WALKING,         startTime: '06:06:40', endTime: '06:12:00', duration: '5分20秒' },
    { id: 'e1_d2_006', elderlyId: 'e001', date: '2026-03-02', status: ActivityStatus.JOGGING,         startTime: '06:12:00', endTime: '06:20:00', duration: '8分' },
    { id: 'e1_d2_007', elderlyId: 'e001', date: '2026-03-02', status: ActivityStatus.RUNNING,         startTime: '06:20:00', endTime: '06:23:30', duration: '3分30秒' },
    { id: 'e1_d2_008', elderlyId: 'e001', date: '2026-03-02', status: ActivityStatus.JOGGING,         startTime: '06:23:30', endTime: '06:30:00', duration: '6分30秒' },
    { id: 'e1_d2_009', elderlyId: 'e001', date: '2026-03-02', status: ActivityStatus.WALKING,         startTime: '06:30:00', endTime: '06:36:00', duration: '6分' },
    { id: 'e1_d2_010', elderlyId: 'e001', date: '2026-03-02', status: ActivityStatus.STILL,           startTime: '06:36:00', endTime: '06:38:20', duration: '2分20秒' },
    { id: 'e1_d2_011', elderlyId: 'e001', date: '2026-03-02', status: ActivityStatus.GOING_UPSTAIRS,  startTime: '06:38:20', endTime: '06:39:30', duration: '1分10秒' },
    { id: 'e1_d2_012', elderlyId: 'e001', date: '2026-03-02', status: ActivityStatus.SITTING,         startTime: '06:39:30', endTime: '07:05:00', duration: '25分30秒' },
    { id: 'e1_d2_013', elderlyId: 'e001', date: '2026-03-02', status: ActivityStatus.STANDING,        startTime: '07:05:00', endTime: '07:06:10', duration: '1分10秒' },
    { id: 'e1_d2_014', elderlyId: 'e001', date: '2026-03-02', status: ActivityStatus.WALKING,         startTime: '07:06:10', endTime: '07:10:00', duration: '3分50秒' },
    { id: 'e1_d2_015', elderlyId: 'e001', date: '2026-03-02', status: ActivityStatus.SITTING,         startTime: '07:10:00', endTime: '08:00:00', duration: '50分' },
    // 外出（地理围栏报警在09:05）
    { id: 'e1_d2_016', elderlyId: 'e001', date: '2026-03-02', status: ActivityStatus.GOING_DOWNSTAIRS,startTime: '08:00:00', endTime: '08:01:10', duration: '1分10秒' },
    { id: 'e1_d2_017', elderlyId: 'e001', date: '2026-03-02', status: ActivityStatus.WALKING,         startTime: '08:01:10', endTime: '08:12:00', duration: '10分50秒' },
    { id: 'e1_d2_018', elderlyId: 'e001', date: '2026-03-02', status: ActivityStatus.JOGGING,         startTime: '08:12:00', endTime: '08:18:30', duration: '6分30秒' },
    { id: 'e1_d2_019', elderlyId: 'e001', date: '2026-03-02', status: ActivityStatus.WALKING,         startTime: '08:18:30', endTime: '08:30:00', duration: '11分30秒' },
    { id: 'e1_d2_020', elderlyId: 'e001', date: '2026-03-02', status: ActivityStatus.SITTING,         startTime: '08:30:00', endTime: '09:00:00', duration: '30分' },
    { id: 'e1_d2_021', elderlyId: 'e001', date: '2026-03-02', status: ActivityStatus.WALKING,         startTime: '09:00:00', endTime: '09:20:00', duration: '20分' },
    { id: 'e1_d2_022', elderlyId: 'e001', date: '2026-03-02', status: ActivityStatus.JOGGING,         startTime: '09:20:00', endTime: '09:28:00', duration: '8分' },
    { id: 'e1_d2_023', elderlyId: 'e001', date: '2026-03-02', status: ActivityStatus.WALKING,         startTime: '09:28:00', endTime: '09:40:00', duration: '12分' },
    { id: 'e1_d2_024', elderlyId: 'e001', date: '2026-03-02', status: ActivityStatus.STILL,           startTime: '09:40:00', endTime: '09:42:30', duration: '2分30秒' },
    { id: 'e1_d2_025', elderlyId: 'e001', date: '2026-03-02', status: ActivityStatus.WALKING,         startTime: '09:42:30', endTime: '10:00:00', duration: '17分30秒' },
    { id: 'e1_d2_026', elderlyId: 'e001', date: '2026-03-02', status: ActivityStatus.SITTING,         startTime: '10:00:00', endTime: '11:00:00', duration: '1小时' },
    { id: 'e1_d2_027', elderlyId: 'e001', date: '2026-03-02', status: ActivityStatus.WALKING,         startTime: '11:00:00', endTime: '11:12:00', duration: '12分' },
    { id: 'e1_d2_028', elderlyId: 'e001', date: '2026-03-02', status: ActivityStatus.GOING_UPSTAIRS,  startTime: '11:12:00', endTime: '11:13:10', duration: '1分10秒' },
    { id: 'e1_d2_029', elderlyId: 'e001', date: '2026-03-02', status: ActivityStatus.SITTING,         startTime: '11:13:10', endTime: '12:30:00', duration: '1小时16分50秒' },
    { id: 'e1_d2_030', elderlyId: 'e001', date: '2026-03-02', status: ActivityStatus.STILL,           startTime: '12:30:00', endTime: '14:00:00', duration: '1小时30分' },
    { id: 'e1_d2_031', elderlyId: 'e001', date: '2026-03-02', status: ActivityStatus.STANDING,        startTime: '14:00:00', endTime: '14:01:20', duration: '1分20秒' },
    { id: 'e1_d2_032', elderlyId: 'e001', date: '2026-03-02', status: ActivityStatus.GOING_DOWNSTAIRS,startTime: '14:01:20', endTime: '14:02:30', duration: '1分10秒' },
    { id: 'e1_d2_033', elderlyId: 'e001', date: '2026-03-02', status: ActivityStatus.WALKING,         startTime: '14:02:30', endTime: '14:20:00', duration: '17分30秒' },
    { id: 'e1_d2_034', elderlyId: 'e001', date: '2026-03-02', status: ActivityStatus.JOGGING,         startTime: '14:20:00', endTime: '14:26:00', duration: '6分' },
    { id: 'e1_d2_035', elderlyId: 'e001', date: '2026-03-02', status: ActivityStatus.WALKING,         startTime: '14:26:00', endTime: '14:40:00', duration: '14分' },
    // SOS 报警在 15:33
    { id: 'e1_d2_036', elderlyId: 'e001', date: '2026-03-02', status: ActivityStatus.SITTING,         startTime: '14:40:00', endTime: '15:30:00', duration: '50分' },
    { id: 'e1_d2_037', elderlyId: 'e001', date: '2026-03-02', status: ActivityStatus.STANDING,        startTime: '15:30:00', endTime: '15:31:00', duration: '1分' },
    { id: 'e1_d2_038', elderlyId: 'e001', date: '2026-03-02', status: ActivityStatus.WALKING,         startTime: '15:31:00', endTime: '15:40:00', duration: '9分' },
    { id: 'e1_d2_039', elderlyId: 'e001', date: '2026-03-02', status: ActivityStatus.STILL,           startTime: '15:40:00', endTime: '15:42:10', duration: '2分10秒' },
    { id: 'e1_d2_040', elderlyId: 'e001', date: '2026-03-02', status: ActivityStatus.WALKING,         startTime: '15:42:10', endTime: '16:00:00', duration: '17分50秒' },
    { id: 'e1_d2_041', elderlyId: 'e001', date: '2026-03-02', status: ActivityStatus.GOING_UPSTAIRS,  startTime: '16:00:00', endTime: '16:01:10', duration: '1分10秒' },
    { id: 'e1_d2_042', elderlyId: 'e001', date: '2026-03-02', status: ActivityStatus.SITTING,         startTime: '16:01:10', endTime: '17:30:00', duration: '1小时28分50秒' },
    { id: 'e1_d2_043', elderlyId: 'e001', date: '2026-03-02', status: ActivityStatus.WALKING,         startTime: '17:30:00', endTime: '17:40:00', duration: '10分' },
    { id: 'e1_d2_044', elderlyId: 'e001', date: '2026-03-02', status: ActivityStatus.SITTING,         startTime: '17:40:00', endTime: '18:40:00', duration: '1小时' },
    { id: 'e1_d2_045', elderlyId: 'e001', date: '2026-03-02', status: ActivityStatus.WALKING,         startTime: '18:40:00', endTime: '18:48:00', duration: '8分' },
    { id: 'e1_d2_046', elderlyId: 'e001', date: '2026-03-02', status: ActivityStatus.GOING_UPSTAIRS,  startTime: '18:48:00', endTime: '18:49:10', duration: '1分10秒' },
    { id: 'e1_d2_047', elderlyId: 'e001', date: '2026-03-02', status: ActivityStatus.SITTING,         startTime: '18:49:10', endTime: '20:00:00', duration: '1小时10分50秒' },
    { id: 'e1_d2_048', elderlyId: 'e001', date: '2026-03-02', status: ActivityStatus.STILL,           startTime: '20:00:00', endTime: '23:59:59', duration: '3小时59分59秒' },

    // ──── 李秀英 2026-03-01 凌晨 ────
    { id: 'e2_d1_e01', elderlyId: 'e002', date: '2026-03-01', status: ActivityStatus.STILL,           startTime: '00:00:00', endTime: '02:30:00', duration: '2小时30分' },
    { id: 'e2_d1_e02', elderlyId: 'e002', date: '2026-03-01', status: ActivityStatus.STANDING,        startTime: '02:30:00', endTime: '02:31:20', duration: '1分20秒' },
    { id: 'e2_d1_e03', elderlyId: 'e002', date: '2026-03-01', status: ActivityStatus.WALKING,         startTime: '02:31:20', endTime: '02:34:00', duration: '2分40秒' },
    { id: 'e2_d1_e04', elderlyId: 'e002', date: '2026-03-01', status: ActivityStatus.STANDING,        startTime: '02:34:00', endTime: '02:34:50', duration: '50秒' },
    { id: 'e2_d1_e05', elderlyId: 'e002', date: '2026-03-01', status: ActivityStatus.WALKING,         startTime: '02:34:50', endTime: '02:36:30', duration: '1分40秒' },
    { id: 'e2_d1_e06', elderlyId: 'e002', date: '2026-03-01', status: ActivityStatus.STILL,           startTime: '02:36:30', endTime: '04:45:00', duration: '2小时8分30秒' },
    { id: 'e2_d1_e07', elderlyId: 'e002', date: '2026-03-01', status: ActivityStatus.STANDING,        startTime: '04:45:00', endTime: '04:46:10', duration: '1分10秒' },
    { id: 'e2_d1_e08', elderlyId: 'e002', date: '2026-03-01', status: ActivityStatus.WALKING,         startTime: '04:46:10', endTime: '04:48:30', duration: '2分20秒' },
    { id: 'e2_d1_e09', elderlyId: 'e002', date: '2026-03-01', status: ActivityStatus.SITTING,         startTime: '04:48:30', endTime: '05:15:00', duration: '26分30秒' },
    { id: 'e2_d1_e10', elderlyId: 'e002', date: '2026-03-01', status: ActivityStatus.WALKING,         startTime: '05:15:00', endTime: '05:17:20', duration: '2分20秒' },
    { id: 'e2_d1_e11', elderlyId: 'e002', date: '2026-03-01', status: ActivityStatus.STILL,           startTime: '05:17:20', endTime: '06:00:00', duration: '42分40秒' },
    // ════════════════════════════════════════
    // 李秀英  2026-03-01
    // 跌倒事件在 10:12
    // ════════════════════════════════════════
    { id: 'e2_d1_001', elderlyId: 'e002', date: '2026-03-01', status: ActivityStatus.STILL,           startTime: '06:00:00', endTime: '06:02:00', duration: '2分' },
    { id: 'e2_d1_002', elderlyId: 'e002', date: '2026-03-01', status: ActivityStatus.STANDING,        startTime: '06:02:00', endTime: '06:03:10', duration: '1分10秒' },
    { id: 'e2_d1_003', elderlyId: 'e002', date: '2026-03-01', status: ActivityStatus.WALKING,         startTime: '06:03:10', endTime: '06:07:00', duration: '3分50秒' },
    { id: 'e2_d1_004', elderlyId: 'e002', date: '2026-03-01', status: ActivityStatus.SITTING,         startTime: '06:07:00', endTime: '07:00:00', duration: '53分' },
    { id: 'e2_d1_005', elderlyId: 'e002', date: '2026-03-01', status: ActivityStatus.STANDING,        startTime: '07:00:00', endTime: '07:01:20', duration: '1分20秒' },
    { id: 'e2_d1_006', elderlyId: 'e002', date: '2026-03-01', status: ActivityStatus.WALKING,         startTime: '07:01:20', endTime: '07:08:00', duration: '6分40秒' },
    { id: 'e2_d1_007', elderlyId: 'e002', date: '2026-03-01', status: ActivityStatus.JOGGING,         startTime: '07:08:00', endTime: '07:15:30', duration: '7分30秒' },
    { id: 'e2_d1_008', elderlyId: 'e002', date: '2026-03-01', status: ActivityStatus.WALKING,         startTime: '07:15:30', endTime: '07:22:00', duration: '6分30秒' },
    { id: 'e2_d1_009', elderlyId: 'e002', date: '2026-03-01', status: ActivityStatus.GOING_UPSTAIRS,  startTime: '07:22:00', endTime: '07:23:15', duration: '1分15秒' },
    { id: 'e2_d1_010', elderlyId: 'e002', date: '2026-03-01', status: ActivityStatus.SITTING,         startTime: '07:23:15', endTime: '08:10:00', duration: '46分45秒' },
    { id: 'e2_d1_011', elderlyId: 'e002', date: '2026-03-01', status: ActivityStatus.STANDING,        startTime: '08:10:00', endTime: '08:11:00', duration: '1分' },
    { id: 'e2_d1_012', elderlyId: 'e002', date: '2026-03-01', status: ActivityStatus.WALKING,         startTime: '08:11:00', endTime: '08:16:00', duration: '5分' },
    { id: 'e2_d1_013', elderlyId: 'e002', date: '2026-03-01', status: ActivityStatus.SITTING,         startTime: '08:16:00', endTime: '09:30:00', duration: '1小时14分' },
    { id: 'e2_d1_014', elderlyId: 'e002', date: '2026-03-01', status: ActivityStatus.WALKING,         startTime: '09:30:00', endTime: '09:38:00', duration: '8分' },
    { id: 'e2_d1_015', elderlyId: 'e002', date: '2026-03-01', status: ActivityStatus.STILL,           startTime: '09:38:00', endTime: '09:40:30', duration: '2分30秒' },
    { id: 'e2_d1_016', elderlyId: 'e002', date: '2026-03-01', status: ActivityStatus.WALKING,         startTime: '09:40:30', endTime: '09:50:00', duration: '9分30秒' },
    { id: 'e2_d1_017', elderlyId: 'e002', date: '2026-03-01', status: ActivityStatus.GOING_DOWNSTAIRS,startTime: '09:50:00', endTime: '09:51:10', duration: '1分10秒' },
    { id: 'e2_d1_018', elderlyId: 'e002', date: '2026-03-01', status: ActivityStatus.WALKING,         startTime: '09:51:10', endTime: '10:00:00', duration: '8分50秒' },
    { id: 'e2_d1_019', elderlyId: 'e002', date: '2026-03-01', status: ActivityStatus.JOGGING,         startTime: '10:00:00', endTime: '10:06:00', duration: '6分' },
    { id: 'e2_d1_020', elderlyId: 'e002', date: '2026-03-01', status: ActivityStatus.WALKING,         startTime: '10:06:00', endTime: '10:12:00', duration: '6分' },
    // 跌倒事件
    { id: 'e2_d1_021', elderlyId: 'e002', date: '2026-03-01', status: ActivityStatus.FALLEN,          startTime: '10:12:00', endTime: '10:14:30', duration: '2分30秒' },
    { id: 'e2_d1_022', elderlyId: 'e002', date: '2026-03-01', status: ActivityStatus.STILL,           startTime: '10:14:30', endTime: '10:17:00', duration: '2分30秒' },
    { id: 'e2_d1_023', elderlyId: 'e002', date: '2026-03-01', status: ActivityStatus.STANDING,        startTime: '10:17:00', endTime: '10:18:10', duration: '1分10秒' },
    { id: 'e2_d1_024', elderlyId: 'e002', date: '2026-03-01', status: ActivityStatus.WALKING,         startTime: '10:18:10', endTime: '10:25:00', duration: '6分50秒' },
    { id: 'e2_d1_025', elderlyId: 'e002', date: '2026-03-01', status: ActivityStatus.GOING_UPSTAIRS,  startTime: '10:25:00', endTime: '10:26:15', duration: '1分15秒' },
    { id: 'e2_d1_026', elderlyId: 'e002', date: '2026-03-01', status: ActivityStatus.SITTING,         startTime: '10:26:15', endTime: '12:00:00', duration: '1小时33分45秒' },
    { id: 'e2_d1_027', elderlyId: 'e002', date: '2026-03-01', status: ActivityStatus.WALKING,         startTime: '12:00:00', endTime: '12:08:00', duration: '8分' },
    { id: 'e2_d1_028', elderlyId: 'e002', date: '2026-03-01', status: ActivityStatus.SITTING,         startTime: '12:08:00', endTime: '13:10:00', duration: '1小时2分' },
    { id: 'e2_d1_029', elderlyId: 'e002', date: '2026-03-01', status: ActivityStatus.STILL,           startTime: '13:10:00', endTime: '14:30:00', duration: '1小时20分' },
    { id: 'e2_d1_030', elderlyId: 'e002', date: '2026-03-01', status: ActivityStatus.STANDING,        startTime: '14:30:00', endTime: '14:31:20', duration: '1分20秒' },
    { id: 'e2_d1_031', elderlyId: 'e002', date: '2026-03-01', status: ActivityStatus.WALKING,         startTime: '14:31:20', endTime: '14:40:00', duration: '8分40秒' },
    { id: 'e2_d1_032', elderlyId: 'e002', date: '2026-03-01', status: ActivityStatus.JOGGING,         startTime: '14:40:00', endTime: '14:47:00', duration: '7分' },
    { id: 'e2_d1_033', elderlyId: 'e002', date: '2026-03-01', status: ActivityStatus.WALKING,         startTime: '14:47:00', endTime: '15:00:00', duration: '13分' },
    { id: 'e2_d1_034', elderlyId: 'e002', date: '2026-03-01', status: ActivityStatus.SITTING,         startTime: '15:00:00', endTime: '16:30:00', duration: '1小时30分' },
    { id: 'e2_d1_035', elderlyId: 'e002', date: '2026-03-01', status: ActivityStatus.WALKING,         startTime: '16:30:00', endTime: '16:40:00', duration: '10分' },
    { id: 'e2_d1_036', elderlyId: 'e002', date: '2026-03-01', status: ActivityStatus.GOING_DOWNSTAIRS,startTime: '16:40:00', endTime: '16:41:10', duration: '1分10秒' },
    { id: 'e2_d1_037', elderlyId: 'e002', date: '2026-03-01', status: ActivityStatus.WALKING,         startTime: '16:41:10', endTime: '16:50:00', duration: '8分50秒' },
    { id: 'e2_d1_038', elderlyId: 'e002', date: '2026-03-01', status: ActivityStatus.SITTING,         startTime: '16:50:00', endTime: '18:10:00', duration: '1小时20分' },
    { id: 'e2_d1_039', elderlyId: 'e002', date: '2026-03-01', status: ActivityStatus.WALKING,         startTime: '18:10:00', endTime: '18:18:00', duration: '8分' },
    { id: 'e2_d1_040', elderlyId: 'e002', date: '2026-03-01', status: ActivityStatus.GOING_UPSTAIRS,  startTime: '18:18:00', endTime: '18:19:15', duration: '1分15秒' },
    { id: 'e2_d1_041', elderlyId: 'e002', date: '2026-03-01', status: ActivityStatus.SITTING,         startTime: '18:19:15', endTime: '19:50:00', duration: '1小时30分45秒' },
    { id: 'e2_d1_042', elderlyId: 'e002', date: '2026-03-01', status: ActivityStatus.STILL,           startTime: '19:50:00', endTime: '23:59:59', duration: '4小时9分59秒' },

    // ──── 李秀英 2026-03-02 凌晨 ────
    { id: 'e2_d2_e01', elderlyId: 'e002', date: '2026-03-02', status: ActivityStatus.STILL,           startTime: '00:00:00', endTime: '01:50:00', duration: '1小时50分' },
    { id: 'e2_d2_e02', elderlyId: 'e002', date: '2026-03-02', status: ActivityStatus.STANDING,        startTime: '01:50:00', endTime: '01:51:10', duration: '1分10秒' },
    { id: 'e2_d2_e03', elderlyId: 'e002', date: '2026-03-02', status: ActivityStatus.WALKING,         startTime: '01:51:10', endTime: '01:53:40', duration: '2分30秒' },
    { id: 'e2_d2_e04', elderlyId: 'e002', date: '2026-03-02', status: ActivityStatus.STANDING,        startTime: '01:53:40', endTime: '01:54:30', duration: '50秒' },
    { id: 'e2_d2_e05', elderlyId: 'e002', date: '2026-03-02', status: ActivityStatus.WALKING,         startTime: '01:54:30', endTime: '01:56:10', duration: '1分40秒' },
    { id: 'e2_d2_e06', elderlyId: 'e002', date: '2026-03-02', status: ActivityStatus.STILL,           startTime: '01:56:10', endTime: '03:40:00', duration: '1小时43分50秒' },
    { id: 'e2_d2_e07', elderlyId: 'e002', date: '2026-03-02', status: ActivityStatus.STANDING,        startTime: '03:40:00', endTime: '03:41:10', duration: '1分10秒' },
    { id: 'e2_d2_e08', elderlyId: 'e002', date: '2026-03-02', status: ActivityStatus.WALKING,         startTime: '03:41:10', endTime: '03:43:30', duration: '2分20秒' },
    { id: 'e2_d2_e09', elderlyId: 'e002', date: '2026-03-02', status: ActivityStatus.SITTING,         startTime: '03:43:30', endTime: '04:10:00', duration: '26分30秒' },
    { id: 'e2_d2_e10', elderlyId: 'e002', date: '2026-03-02', status: ActivityStatus.WALKING,         startTime: '04:10:00', endTime: '04:12:20', duration: '2分20秒' },
    { id: 'e2_d2_e11', elderlyId: 'e002', date: '2026-03-02', status: ActivityStatus.STILL,           startTime: '04:12:20', endTime: '06:00:00', duration: '1小时47分40秒' },
    // ════════════════════════════════════════
    // 李秀英  2026-03-02
    // 跌倒在 13:08 和 18:52
    // ════════════════════════════════════════
    { id: 'e2_d2_001', elderlyId: 'e002', date: '2026-03-02', status: ActivityStatus.STILL,           startTime: '06:00:00', endTime: '06:02:30', duration: '2分30秒' },
    { id: 'e2_d2_002', elderlyId: 'e002', date: '2026-03-02', status: ActivityStatus.STANDING,        startTime: '06:02:30', endTime: '06:03:40', duration: '1分10秒' },
    { id: 'e2_d2_003', elderlyId: 'e002', date: '2026-03-02', status: ActivityStatus.WALKING,         startTime: '06:03:40', endTime: '06:08:00', duration: '4分20秒' },
    { id: 'e2_d2_004', elderlyId: 'e002', date: '2026-03-02', status: ActivityStatus.SITTING,         startTime: '06:08:00', endTime: '07:00:00', duration: '52分' },
    { id: 'e2_d2_005', elderlyId: 'e002', date: '2026-03-02', status: ActivityStatus.STANDING,        startTime: '07:00:00', endTime: '07:01:10', duration: '1分10秒' },
    { id: 'e2_d2_006', elderlyId: 'e002', date: '2026-03-02', status: ActivityStatus.WALKING,         startTime: '07:01:10', endTime: '07:09:00', duration: '7分50秒' },
    { id: 'e2_d2_007', elderlyId: 'e002', date: '2026-03-02', status: ActivityStatus.JOGGING,         startTime: '07:09:00', endTime: '07:17:00', duration: '8分' },
    { id: 'e2_d2_008', elderlyId: 'e002', date: '2026-03-02', status: ActivityStatus.WALKING,         startTime: '07:17:00', endTime: '07:25:00', duration: '8分' },
    { id: 'e2_d2_009', elderlyId: 'e002', date: '2026-03-02', status: ActivityStatus.GOING_UPSTAIRS,  startTime: '07:25:00', endTime: '07:26:10', duration: '1分10秒' },
    { id: 'e2_d2_010', elderlyId: 'e002', date: '2026-03-02', status: ActivityStatus.SITTING,         startTime: '07:26:10', endTime: '09:00:00', duration: '1小时33分50秒' },
    { id: 'e2_d2_011', elderlyId: 'e002', date: '2026-03-02', status: ActivityStatus.WALKING,         startTime: '09:00:00', endTime: '09:10:00', duration: '10分' },
    { id: 'e2_d2_012', elderlyId: 'e002', date: '2026-03-02', status: ActivityStatus.STILL,           startTime: '09:10:00', endTime: '09:12:20', duration: '2分20秒' },
    { id: 'e2_d2_013', elderlyId: 'e002', date: '2026-03-02', status: ActivityStatus.WALKING,         startTime: '09:12:20', endTime: '09:22:00', duration: '9分40秒' },
    { id: 'e2_d2_014', elderlyId: 'e002', date: '2026-03-02', status: ActivityStatus.SITTING,         startTime: '09:22:00', endTime: '10:30:00', duration: '1小时8分' },
    { id: 'e2_d2_015', elderlyId: 'e002', date: '2026-03-02', status: ActivityStatus.STANDING,        startTime: '10:30:00', endTime: '10:31:20', duration: '1分20秒' },
    { id: 'e2_d2_016', elderlyId: 'e002', date: '2026-03-02', status: ActivityStatus.GOING_DOWNSTAIRS,startTime: '10:31:20', endTime: '10:32:30', duration: '1分10秒' },
    { id: 'e2_d2_017', elderlyId: 'e002', date: '2026-03-02', status: ActivityStatus.WALKING,         startTime: '10:32:30', endTime: '10:45:00', duration: '12分30秒' },
    { id: 'e2_d2_018', elderlyId: 'e002', date: '2026-03-02', status: ActivityStatus.JOGGING,         startTime: '10:45:00', endTime: '10:52:00', duration: '7分' },
    { id: 'e2_d2_019', elderlyId: 'e002', date: '2026-03-02', status: ActivityStatus.WALKING,         startTime: '10:52:00', endTime: '11:05:00', duration: '13分' },
    { id: 'e2_d2_020', elderlyId: 'e002', date: '2026-03-02', status: ActivityStatus.SITTING,         startTime: '11:05:00', endTime: '12:30:00', duration: '1小时25分' },
    { id: 'e2_d2_021', elderlyId: 'e002', date: '2026-03-02', status: ActivityStatus.WALKING,         startTime: '12:30:00', endTime: '12:38:00', duration: '8分' },
    { id: 'e2_d2_022', elderlyId: 'e002', date: '2026-03-02', status: ActivityStatus.STILL,           startTime: '12:38:00', endTime: '12:40:30', duration: '2分30秒' },
    { id: 'e2_d2_023', elderlyId: 'e002', date: '2026-03-02', status: ActivityStatus.WALKING,         startTime: '12:40:30', endTime: '12:50:00', duration: '9分30秒' },
    { id: 'e2_d2_024', elderlyId: 'e002', date: '2026-03-02', status: ActivityStatus.GOING_UPSTAIRS,  startTime: '12:50:00', endTime: '12:51:10', duration: '1分10秒' },
    { id: 'e2_d2_025', elderlyId: 'e002', date: '2026-03-02', status: ActivityStatus.WALKING,         startTime: '12:51:10', endTime: '12:55:00', duration: '3分50秒' },
    // 跌倒事件一
    { id: 'e2_d2_026', elderlyId: 'e002', date: '2026-03-02', status: ActivityStatus.FALLEN,          startTime: '13:08:00', endTime: '13:11:00', duration: '3分' },
    { id: 'e2_d2_027', elderlyId: 'e002', date: '2026-03-02', status: ActivityStatus.STILL,           startTime: '13:11:00', endTime: '13:14:00', duration: '3分' },
    { id: 'e2_d2_028', elderlyId: 'e002', date: '2026-03-02', status: ActivityStatus.STANDING,        startTime: '13:14:00', endTime: '13:15:10', duration: '1分10秒' },
    { id: 'e2_d2_029', elderlyId: 'e002', date: '2026-03-02', status: ActivityStatus.WALKING,         startTime: '13:15:10', endTime: '13:22:00', duration: '6分50秒' },
    { id: 'e2_d2_030', elderlyId: 'e002', date: '2026-03-02', status: ActivityStatus.SITTING,         startTime: '13:22:00', endTime: '15:00:00', duration: '1小时38分' },
    { id: 'e2_d2_031', elderlyId: 'e002', date: '2026-03-02', status: ActivityStatus.WALKING,         startTime: '15:00:00', endTime: '15:12:00', duration: '12分' },
    { id: 'e2_d2_032', elderlyId: 'e002', date: '2026-03-02', status: ActivityStatus.JOGGING,         startTime: '15:12:00', endTime: '15:18:00', duration: '6分' },
    { id: 'e2_d2_033', elderlyId: 'e002', date: '2026-03-02', status: ActivityStatus.WALKING,         startTime: '15:18:00', endTime: '15:30:00', duration: '12分' },
    { id: 'e2_d2_034', elderlyId: 'e002', date: '2026-03-02', status: ActivityStatus.GOING_DOWNSTAIRS,startTime: '15:30:00', endTime: '15:31:15', duration: '1分15秒' },
    { id: 'e2_d2_035', elderlyId: 'e002', date: '2026-03-02', status: ActivityStatus.WALKING,         startTime: '15:31:15', endTime: '15:42:00', duration: '10分45秒' },
    { id: 'e2_d2_036', elderlyId: 'e002', date: '2026-03-02', status: ActivityStatus.SITTING,         startTime: '15:42:00', endTime: '17:00:00', duration: '1小时18分' },
    { id: 'e2_d2_037', elderlyId: 'e002', date: '2026-03-02', status: ActivityStatus.WALKING,         startTime: '17:00:00', endTime: '17:10:00', duration: '10分' },
    { id: 'e2_d2_038', elderlyId: 'e002', date: '2026-03-02', status: ActivityStatus.GOING_UPSTAIRS,  startTime: '17:10:00', endTime: '17:11:20', duration: '1分20秒' },
    { id: 'e2_d2_039', elderlyId: 'e002', date: '2026-03-02', status: ActivityStatus.SITTING,         startTime: '17:11:20', endTime: '18:30:00', duration: '1小时18分40秒' },
    { id: 'e2_d2_040', elderlyId: 'e002', date: '2026-03-02', status: ActivityStatus.STANDING,        startTime: '18:30:00', endTime: '18:31:10', duration: '1分10秒' },
    { id: 'e2_d2_041', elderlyId: 'e002', date: '2026-03-02', status: ActivityStatus.WALKING,         startTime: '18:31:10', endTime: '18:40:00', duration: '8分50秒' },
    // 跌倒事件二
    { id: 'e2_d2_042', elderlyId: 'e002', date: '2026-03-02', status: ActivityStatus.FALLEN,          startTime: '18:52:00', endTime: '18:55:00', duration: '3分' },
    { id: 'e2_d2_043', elderlyId: 'e002', date: '2026-03-02', status: ActivityStatus.STILL,           startTime: '18:55:00', endTime: '18:58:00', duration: '3分' },
    { id: 'e2_d2_044', elderlyId: 'e002', date: '2026-03-02', status: ActivityStatus.STANDING,        startTime: '18:58:00', endTime: '18:59:10', duration: '1分10秒' },
    { id: 'e2_d2_045', elderlyId: 'e002', date: '2026-03-02', status: ActivityStatus.WALKING,         startTime: '18:59:10', endTime: '19:05:00', duration: '5分50秒' },
    { id: 'e2_d2_046', elderlyId: 'e002', date: '2026-03-02', status: ActivityStatus.SITTING,         startTime: '19:05:00', endTime: '20:00:00', duration: '55分' },
    { id: 'e2_d2_047', elderlyId: 'e002', date: '2026-03-02', status: ActivityStatus.STILL,           startTime: '20:00:00', endTime: '23:59:59', duration: '3小时59分59秒' }
  ];
}
