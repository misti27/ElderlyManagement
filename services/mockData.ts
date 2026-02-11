
import { User, ElderlyStatus, Alert, AlertType, AlertLevel, AlertStatus, DashboardStats, ActivityStatus, FallType, Guardian, GuardianRelation, Device, HealthArchive } from '../types';

// 模拟数据库表
export let MOCK_USERS: User[] = [
  { id: 'u1', name: '张建国', gender: '男', phone: '13800138000', emergency_phone: '13900001111', address: '北京市朝阳区朝阳公园路1号', health_status: 1, height: 175, weight: 70, bindDeviceId: 'dev_001', avatarUrl: 'https://picsum.photos/100/100?random=1' },
  { id: 'u2', name: '李秀英', gender: '女', phone: '13800138001', emergency_phone: '13900002222', address: '北京市海淀区中关村大街', health_status: 2, height: 160, weight: 55, bindDeviceId: 'dev_002', avatarUrl: 'https://picsum.photos/100/100?random=2' },
  { id: 'u3', name: '王大爷', gender: '男', phone: '13800138002', emergency_phone: '13900003333', address: '北京市西城区幸福养老院', health_status: 3, height: 168, weight: 65, bindDeviceId: 'dev_003', avatarUrl: 'https://picsum.photos/100/100?random=3' },
  { id: 'u4', name: '陈奶奶', gender: '女', phone: '13800138003', emergency_phone: '13900004444', address: '上海市徐汇区康平路', health_status: 1, height: 155, weight: 50, bindDeviceId: 'dev_005', avatarUrl: 'https://picsum.photos/100/100?random=4' },
  { id: 'u5', name: '赵铁柱', gender: '男', phone: '13800138004', emergency_phone: '13900005555', address: '广州市天河区珠江新城', health_status: 2, height: 180, weight: 75, bindDeviceId: 'dev_006', avatarUrl: 'https://picsum.photos/100/100?random=5' },
];

export let MOCK_DEVICES: Device[] = [
  { device_id: 'dev_001', device_name: 'iPhone 15 Pro', device_type: '手机', brand: 'Apple', elderly_id: 'u1', battery_level: 85, status: 0, is_online: true, bind_time: '2024-01-15' },
  { device_id: 'dev_002', device_name: '华为 Mate 60', device_type: '手机', brand: 'Huawei', elderly_id: 'u2', battery_level: 100, status: 0, is_online: true, bind_time: '2024-02-20' },
  { device_id: 'dev_003', device_name: '小米 14', device_type: '手机', brand: 'Xiaomi', elderly_id: 'u3', battery_level: 15, status: 0, is_online: true, bind_time: '2024-03-10' },
  { device_id: 'dev_004', device_name: '荣耀 Magic 6', device_type: '手机', brand: 'Honor', elderly_id: null, battery_level: 90, status: 0, is_online: false },
  { device_id: 'dev_005', device_name: 'OPPO Find X7', device_type: '手机', brand: 'OPPO', elderly_id: 'u4', battery_level: 45, status: 0, is_online: true, bind_time: '2024-04-01' },
  { device_id: 'dev_006', device_name: 'Vivo X100', device_type: '手机', brand: 'Vivo', elderly_id: 'u5', battery_level: 72, status: 0, is_online: true, bind_time: '2024-04-15' },
];

export let MOCK_RELATIONS: GuardianRelation[] = [
  { relation_id: 'r1', elderly_id: 'u1', guardian_id: 'g1', relationship: '子女', priority: 1 },
  { relation_id: 'r2', elderly_id: 'u3', guardian_id: 'g2', relationship: '子女', priority: 1 },
  { relation_id: 'r3', elderly_id: 'u3', guardian_id: 'g3', relationship: '护工', priority: 2 },
];

export let MOCK_GUARDIANS: Guardian[] = [
  { id: 'g1', name: '张晓明', phone: '15011112222', create_time: '2024-01-01', update_time: '2024-01-01', avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix' },
  { id: 'g2', name: '王爱军', phone: '15033334444', create_time: '2024-02-01', update_time: '2024-02-01', avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka' },
  { id: 'g3', name: '幸福养老院护工组', phone: '010-88889999', create_time: '2023-12-15', update_time: '2024-01-10', avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Worker' },
];

export const assignDeviceToElderly = (deviceId: string, elderlyId: string | null) => {
    const device = MOCK_DEVICES.find(d => d.device_id === deviceId);
    if (!device) return;
    if (device.elderly_id) {
        const oldUser = MOCK_USERS.find(u => u.id === device.elderly_id);
        if (oldUser) oldUser.bindDeviceId = undefined;
    }
    device.elderly_id = elderlyId;
    device.bind_time = elderlyId ? new Date().toISOString().split('T')[0] : undefined;
    if (elderlyId) {
        const newUser = MOCK_USERS.find(u => u.id === elderlyId);
        if (newUser) {
            if (newUser.bindDeviceId && newUser.bindDeviceId !== deviceId) {
                const otherDevice = MOCK_DEVICES.find(d => d.device_id === newUser.bindDeviceId);
                if (otherDevice) otherDevice.elderly_id = null;
            }
            newUser.bindDeviceId = deviceId;
        }
    }
};

export const updateDevice = (deviceId: string, updates: Partial<Device>) => {
    const index = MOCK_DEVICES.findIndex(d => d.device_id === deviceId);
    if (index !== -1) {
        const oldElderlyId = MOCK_DEVICES[index].elderly_id;
        MOCK_DEVICES[index] = { ...MOCK_DEVICES[index], ...updates };
        if (updates.elderly_id !== undefined && updates.elderly_id !== oldElderlyId) {
            assignDeviceToElderly(deviceId, updates.elderly_id);
        }
    }
};

export const associateGuardianToElderly = (guardianId: string, elderlyId: string, relationship: string = '亲属') => {
    const exists = MOCK_RELATIONS.find(r => r.guardian_id === guardianId && r.elderly_id === elderlyId);
    if (exists) {
        exists.relationship = relationship;
        return;
    }
    MOCK_RELATIONS.push({
        relation_id: `r${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        elderly_id: elderlyId,
        guardian_id: guardianId,
        relationship,
        priority: 1
    });
};

export const removeGuardianRelation = (relationId: string) => {
    const index = MOCK_RELATIONS.findIndex(r => r.relation_id === relationId);
    if (index !== -1) {
        MOCK_RELATIONS.splice(index, 1);
    }
};

export let MOCK_HEALTH_ARCHIVES: Record<string, HealthArchive> = {
  u1: { disease_history: '高血压、轻微糖尿病', allergy_info: '无', regular_medication: '降压药', last_checkup_time: '2024-03-01' },
  u2: { disease_history: '心脏搭桥术后', allergy_info: '青霉素过敏', regular_medication: '阿司匹林', last_checkup_time: '2024-02-15' },
  u3: { disease_history: '慢性支气管炎', allergy_info: '无', regular_medication: '氨溴索', last_checkup_time: '2024-04-10' },
};

export let MOCK_STATUSES: Record<string, ElderlyStatus> = {
  u1: { userId: 'u1', deviceId: 'dev_001', activityStatus: ActivityStatus.SITTING, fallType: FallType.NONE, location: { latitude: 39.9, longitude: 116.4, address: '朝阳公园路' }, isFall: false, batteryLevel: 85, isOnline: true, timestamp: Date.now() },
  u2: { userId: 'u2', deviceId: 'dev_002', activityStatus: ActivityStatus.STILL, fallType: FallType.NONE, location: { latitude: 39.95, longitude: 116.3, address: '中关村大街' }, isFall: false, batteryLevel: 100, isOnline: true, timestamp: Date.now() },
  u3: { userId: 'u3', deviceId: 'dev_003', activityStatus: ActivityStatus.FALLEN, fallType: FallType.FORWARD, location: { latitude: 39.88, longitude: 116.35, address: '幸福养老院' }, isFall: true, batteryLevel: 15, isOnline: true, timestamp: Date.now() },
};

export const getStats = (): DashboardStats => ({
  totalElderly: MOCK_USERS.length,
  activeDevices: MOCK_DEVICES.filter(d => d.is_online).length,
  todayAlerts: 5,
  pendingAlerts: 2
});

export const getHistoryStats = (userId: string, range: string) => {
    const baseValue = range === 'month' ? 1000 : range === 'week' ? 200 : 30;
    const userAlerts = MOCK_ALERTS.filter(a => a.userId === userId);
    
    return {
        totalAlerts: userAlerts.length,
        statusDistribution: [
            { name: '静止', value: Math.floor(baseValue * 0.6), color: '#1e293b' },
            { name: '坐下', value: Math.floor(baseValue * 0.25), color: '#3b82f6' },
            { name: '行走', value: Math.floor(baseValue * 0.1), color: '#10b981' },
            { name: '其他', value: Math.floor(baseValue * 0.05), color: '#94a3b8' },
        ],
        alerts: userAlerts
    };
};

export const MOCK_ALERTS: Alert[] = [
    { id: 'a1', userId: 'u3', userName: '王大爷', type: AlertType.FALL, level: AlertLevel.HIGH, status: AlertStatus.PENDING, message: '检测到前摔', location: '幸福养老院', timestamp: Date.now() - 3600000 },
    { id: 'a2', userId: 'u3', userName: '王大爷', type: AlertType.BATTERY_LOW, level: AlertLevel.MEDIUM, status: AlertStatus.RESOLVED, message: '手机电量低于15%', location: '幸福养老院', timestamp: Date.now() - 86400000 },
    { id: 'a3', userId: 'u1', userName: '张建国', type: AlertType.GEOFENCE, level: AlertLevel.LOW, status: AlertStatus.RESOLVED, message: '离开安全围栏区域', location: '朝阳公园路1号', timestamp: Date.now() - 172800000 },
    { id: 'a4', userId: 'u5', userName: '赵铁柱', type: AlertType.SOS, level: AlertLevel.HIGH, status: AlertStatus.CONFIRMED, message: '触发紧急求救(SOS)', location: '珠江新城', timestamp: Date.now() - 259200000 },
    { id: 'a5', userId: 'u3', userName: '王大爷', type: AlertType.FALL, level: AlertLevel.HIGH, status: AlertStatus.RESOLVED, message: '疑似跌倒', location: '幸福养老院食堂', timestamp: Date.now() - 500000000 },
];

export const updateAlertStatus = (id: string, status: AlertStatus, resolvedBy: string) => {
    const alert = MOCK_ALERTS.find(a => a.id === id);
    if (alert) {
        alert.status = status;
        alert.resolvedBy = resolvedBy;
        alert.resolvedAt = Date.now();
    }
};

export const addUser = (user: User) => {
    const newUser = { ...user, id: `u${MOCK_USERS.length + 1}`, avatarUrl: `https://picsum.photos/100/100?random=${MOCK_USERS.length + 1}` };
    MOCK_USERS.push(newUser);
    return newUser;
};

export const updateUser = (id: string, updates: Partial<User>) => {
    const index = MOCK_USERS.findIndex(u => u.id === id);
    if (index !== -1) {
        MOCK_USERS[index] = { ...MOCK_USERS[index], ...updates };
    }
};

export const deleteUser = (id: string) => {
    const index = MOCK_USERS.findIndex(u => u.id === id);
    if (index !== -1) {
        const userId = MOCK_USERS[index].id;
        const dev = MOCK_DEVICES.find(d => d.elderly_id === userId);
        if (dev) dev.elderly_id = null;
        MOCK_USERS.splice(index, 1);
    }
};

export const getHealthArchive = (userId: string): HealthArchive | undefined => {
    return MOCK_HEALTH_ARCHIVES[userId];
};

export const updateHealthArchive = (userId: string, archive: Partial<HealthArchive>) => {
    if (!MOCK_HEALTH_ARCHIVES[userId]) {
        MOCK_HEALTH_ARCHIVES[userId] = { disease_history: '', allergy_info: '', regular_medication: '', last_checkup_time: '' };
    }
    MOCK_HEALTH_ARCHIVES[userId] = { ...MOCK_HEALTH_ARCHIVES[userId], ...archive };
};

export const getHealthReport = (userId: string) => {
    return {
        summary: "老人整体节律稳定。今日上午有两次简短走动，大部分时间处于静止或坐姿。睡眠质量良好，未发现异常长时间静止报警。",
        archive: getHealthArchive(userId) || { disease_history: '', allergy_info: '', regular_medication: '', last_checkup_time: '' },
        activityTimeline: [
            { status: ActivityStatus.STILL, time: '00:00', duration: '7.5小时' },
            { status: ActivityStatus.STANDING, time: '07:30', duration: '15分钟' },
            { status: ActivityStatus.WALKING, time: '07:45', duration: '20分钟' },
            { status: ActivityStatus.SITTING, time: '08:05', duration: '40分钟' },
            { status: ActivityStatus.STILL, time: '08:45', duration: '1.5小时' },
            { status: ActivityStatus.WALKING, time: '10:15', duration: '30分钟' },
            { status: ActivityStatus.SITTING, time: '10:45', duration: '1小时' },
            { status: ActivityStatus.STILL, time: '11:45', duration: '2小时' },
            { status: ActivityStatus.SITTING, time: '13:45', duration: '45分钟' },
            { status: ActivityStatus.STILL, time: '14:30', duration: '1.5小时' },
            { status: ActivityStatus.WALKING, time: '16:00', duration: '15分钟' },
            { status: ActivityStatus.SITTING, time: '16:15', duration: '2小时' },
            { status: ActivityStatus.STILL, time: '18:15', duration: '5.5小时' },
        ]
    };
};

export const getElderlyForGuardian = (guardianId: string) => {
    const relations = MOCK_RELATIONS.filter(r => r.guardian_id === guardianId);
    return relations.map(r => {
        const user = MOCK_USERS.find(u => u.id === r.elderly_id);
        return user ? { ...user, relationship: r.relationship, relation_id: r.relation_id } : null;
    }).filter(Boolean);
};

export const addGuardian = (data: Partial<Guardian>) => {
    const newG: Guardian = {
        id: `g${MOCK_GUARDIANS.length + 1}`,
        name: data.name || '',
        phone: data.phone || '',
        avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${Math.random()}`,
        create_time: new Date().toISOString().split('T')[0],
        update_time: new Date().toISOString().split('T')[0]
    };
    MOCK_GUARDIANS.push(newG);
    return newG;
};

export const updateGuardian = (id: string, updates: Partial<Guardian>) => {
    const index = MOCK_GUARDIANS.findIndex(g => g.id === id);
    if (index !== -1) {
        MOCK_GUARDIANS[index] = { ...MOCK_GUARDIANS[index], ...updates, update_time: new Date().toISOString().split('T')[0] };
    }
};

export const deleteGuardian = (id: string) => {
    const index = MOCK_GUARDIANS.findIndex(g => g.id === id);
    if (index !== -1) {
        MOCK_GUARDIANS.splice(index, 1);
        const rels = MOCK_RELATIONS.filter(r => r.guardian_id === id);
        rels.forEach(r => {
             const idx = MOCK_RELATIONS.findIndex(rr => rr.relation_id === r.relation_id);
             if (idx !== -1) MOCK_RELATIONS.splice(idx, 1);
        });
    }
};
