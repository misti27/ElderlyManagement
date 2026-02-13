-- 创建数据库
CREATE DATABASE IF NOT EXISTS elderly_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE elderly_db;

-- 1. elderly_user（老年人信息表）
-- 用于存储被监测老年人的基本信息，它的主键为用户编号。
CREATE TABLE IF NOT EXISTS elderly_user (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '用户编号',
    username VARCHAR(50) UNIQUE COMMENT '登录账号(Web端补充)',
    password VARCHAR(255) COMMENT '登录密码(Web端补充)',
    avatar VARCHAR(255) COMMENT '头像URL(Web端补充)',
    name VARCHAR(32) NOT NULL COMMENT '姓名',
    gender VARCHAR(2) COMMENT '性别',
    phone VARCHAR(11) COMMENT '联系电话',
    emergency_phone VARCHAR(11) COMMENT '紧急联系人电话',
    address VARCHAR(255) COMMENT '居住地址',
    health_status INT COMMENT '基础健康状况(1:健康, 2:亚健康, 3:高风险)',
    height DECIMAL(5,2) COMMENT '身高',
    weight DECIMAL(5,2) COMMENT '体重',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建/注册时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '最后修改时间'
);

-- 2. guardian_user（监护人表）
-- 用于存储老年人监护人的信息，它的主键为用户编号。
CREATE TABLE IF NOT EXISTS guardian_user (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '用户编号',
    username VARCHAR(50) UNIQUE COMMENT '登录账号(Web端补充)',
    password VARCHAR(255) COMMENT '登录密码(Web端补充)',
    avatar VARCHAR(255) COMMENT '头像URL(Web端补充)',
    name VARCHAR(32) NOT NULL COMMENT '姓名',
    phone VARCHAR(11) COMMENT '联系电话',
    email VARCHAR(50) COMMENT '邮箱(Web端补充)',
    relationship VARCHAR(20) COMMENT '与老年人关系(主要关系)',
    elderly_id BIGINT COMMENT '关联老年人 ID (主要关联)',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建/注册时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '最后修改时间',
    FOREIGN KEY (elderly_id) REFERENCES elderly_user(id) ON DELETE SET NULL
);

-- 3. elderly_guardian_relation（监护关系表）
-- 处理多对多关系：一个老人可能有多个监护人，一个监护人也可能监护多个老人
CREATE TABLE IF NOT EXISTS elderly_guardian_relation (
    relation_id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键',
    elderly_id BIGINT NOT NULL COMMENT '老人ID',
    guardian_id BIGINT NOT NULL COMMENT '监护人ID',
    relationship VARCHAR(20) COMMENT '关系（父子、护工等）',
    priority INT DEFAULT 0 COMMENT '报警通知优先级(数字越小优先级越高)',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (elderly_id) REFERENCES elderly_user(id) ON DELETE CASCADE,
    FOREIGN KEY (guardian_id) REFERENCES guardian_user(id) ON DELETE CASCADE
);

-- 4. monitoring_device（监测设备表）
-- 用于存储监测设备的基本信息。
CREATE TABLE IF NOT EXISTS monitoring_device (
    device_id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '设备的唯一标识符',
    device_name VARCHAR(50) COMMENT '设备名',
    device_type VARCHAR(30) COMMENT '设备类型',
    brand VARCHAR(30) COMMENT '设备品牌',
    elderly_id BIGINT COMMENT '所属老年人 ID',
    battery_level INT COMMENT '电量百分比(0-100)',
    status INT DEFAULT 1 COMMENT '设备状态(1:正常, 0:异常)',
    bind_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '绑定时间',
    is_online INT DEFAULT 0 COMMENT '在线状态(0=离线,1=在线)',
    last_online_time DATETIME COMMENT '最后在线时间',
    FOREIGN KEY (elderly_id) REFERENCES elderly_user(id) ON DELETE SET NULL
);

-- 5. sensor_data（传感器数据表）
-- 用于存储传感器的基本信息。
CREATE TABLE IF NOT EXISTS sensor_data (
    sensor_id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '传感器的唯一标识符',
    sensor_name VARCHAR(50) COMMENT '传感器名',
    sensor_type VARCHAR(30) COMMENT '传感器类型',
    device_id BIGINT NOT NULL COMMENT '绑定的设备编号',
    acceleration_x DECIMAL(10,2) COMMENT 'X轴加速度',
    acceleration_y DECIMAL(10,2) COMMENT 'Y轴加速度',
    acceleration_z DECIMAL(10,2) COMMENT 'Z轴加速度',
    gyro_x DECIMAL(10,2) COMMENT 'X轴角速度',
    gyro_y DECIMAL(10,2) COMMENT 'Y轴角速度',
    gyro_z DECIMAL(10,2) COMMENT 'Z轴角速度',
    roll DECIMAL(10,2) COMMENT '翻滚角',
    pitch DECIMAL(10,2) COMMENT '俯仰角',
    yaw DECIMAL(10,2) COMMENT '偏航角',
    motion_state INT COMMENT '运动状态',
    confidence INT COMMENT '算法置信度',
    collect_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '采集时间',
    FOREIGN KEY (device_id) REFERENCES monitoring_device(device_id) ON DELETE CASCADE
);

-- 6. health_data（健康监测数据表）
-- 用于存储老年人的健康监测数据。
CREATE TABLE IF NOT EXISTS health_data (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键',
    elderly_id BIGINT NOT NULL COMMENT '关联老年人 ID',
    device_id BIGINT COMMENT '关联设备 ID',
    blood_pressure_sys INT COMMENT '收缩压(Web端补充常用字段)',
    blood_pressure_dia INT COMMENT '舒张压(Web端补充常用字段)',
    blood_oxygen INT COMMENT '血氧(Web端补充常用字段)',
    activity_status INT COMMENT '运动状态',
    is_fall TINYINT(1) DEFAULT 0 COMMENT '是否发生跌倒',
    fall_type VARCHAR(20) COMMENT '跌倒类型',
    upload_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '上传时间',
    FOREIGN KEY (elderly_id) REFERENCES elderly_user(id) ON DELETE CASCADE,
    FOREIGN KEY (device_id) REFERENCES monitoring_device(device_id) ON DELETE SET NULL
);

-- 7. location_data（位置信息表）
-- 用于存储老年人的位置信息。
CREATE TABLE IF NOT EXISTS location_data (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键',
    elderly_id BIGINT NOT NULL COMMENT '关联老年人 ID',
    device_id BIGINT COMMENT '关联设备 ID',
    longitude DECIMAL(10,6) COMMENT '经度',
    latitude DECIMAL(10,6) COMMENT '纬度',
    location_desc VARCHAR(255) COMMENT '位置描述',
    upload_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '上传时间',
    FOREIGN KEY (elderly_id) REFERENCES elderly_user(id) ON DELETE CASCADE,
    FOREIGN KEY (device_id) REFERENCES monitoring_device(device_id) ON DELETE SET NULL
);

-- 8. alert_record（告警记录表）
-- 用于存储系统产生的各类告警记录。
CREATE TABLE IF NOT EXISTS alert_record (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键',
    elderly_id BIGINT NOT NULL COMMENT '关联老年人 ID',
    alert_type VARCHAR(30) COMMENT '告警类型(如: 跌倒, SOS)',
    alert_level INT COMMENT '告警等级(1:低, 2:中, 3:高)',
    alert_content VARCHAR(255) COMMENT '告警内容',
    alert_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '告警时间',
    alert_status INT DEFAULT 0 COMMENT '告警状态(0:未处理, 1:已确认, 2:已解决)',
    location_desc VARCHAR(255) COMMENT '报警位置描述',
    confirm_time DATETIME COMMENT '确认时间',
    confirm_id BIGINT COMMENT '确认人 ID',
    resolved_time DATETIME COMMENT '处理/归档时间',
    resolved_id BIGINT COMMENT '处理人 ID',
    handle_note TEXT COMMENT '处理备注',
    FOREIGN KEY (elderly_id) REFERENCES elderly_user(id) ON DELETE CASCADE
);

-- 9. contact_log（联系记录表）
-- 记录监护人与老人之间的联系历史
CREATE TABLE IF NOT EXISTS contact_log (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键',
    elderly_id BIGINT NOT NULL COMMENT '关联老年人 ID',
    guardian_id BIGINT NOT NULL COMMENT '关联监护人 ID',
    contact_type VARCHAR(20) COMMENT '联系类型(电话, 视频, 短信)',
    contact_content VARCHAR(255) COMMENT '联系内容',
    contact_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '联系时间',
    contact_result VARCHAR(50) COMMENT '联系结果(接通, 未接, 拒接)',
    FOREIGN KEY (elderly_id) REFERENCES elderly_user(id) ON DELETE CASCADE,
    FOREIGN KEY (guardian_id) REFERENCES guardian_user(id) ON DELETE CASCADE
);

-- 10. admin_user 
-- 为了方便系统管理，建议增加一个管理员表
CREATE TABLE IF NOT EXISTS admin_user (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(50),
    role VARCHAR(20) DEFAULT 'admin',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 11. elderly_status_log (老人状态日志表 - 原始高频数据)
-- 记录老人每一时刻的状态变化，用于后续分析和聚合
CREATE TABLE IF NOT EXISTS elderly_status_log (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    elderly_id BIGINT NOT NULL,
    device_id VARCHAR(50) COMMENT '设备ID (deviceId)',
    state VARCHAR(20) COMMENT '状态代码 (state): falling, standing, sitting, still, walking, jogging, running, upstairs, downstairs',
    state_name VARCHAR(20) COMMENT '状态名称 (stateName): 摔倒, 站立, 坐下, 静止, 正常行走, 慢跑, 快跑, 上楼, 下楼',
    is_dangerous TINYINT(1) DEFAULT 0 COMMENT '是否危险 (dangerous)',
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '时间戳 (timestamp)',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (elderly_id) REFERENCES elderly_user(id) ON DELETE CASCADE
);

-- 12. elderly_activity_record (老人活动记录表 - 聚合统计数据)
-- 根据 status_log 聚合生成，用于前端历史轨迹展示 (Start -> End)
CREATE TABLE IF NOT EXISTS elderly_activity_record (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    elderly_id BIGINT NOT NULL,
    state VARCHAR(20) COMMENT '状态代码',
    state_name VARCHAR(20) COMMENT '状态名称',
    is_dangerous TINYINT(1) DEFAULT 0,
    start_time DATETIME,
    end_time DATETIME,
    duration_seconds INT COMMENT '持续时长(秒)',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (elderly_id) REFERENCES elderly_user(id) ON DELETE CASCADE
);

-- ==========================================
-- 插入测试数据 (Based on Web Mock Data)
-- ==========================================

-- 1. 管理员
INSERT INTO admin_user (username, password, name) VALUES ('admin', '123456', '系统管理员');

-- 2. 老人数据 (参考 MOCK_USERS)
INSERT INTO elderly_user (id, username, password, name, gender, phone, emergency_phone, address, health_status, height, weight, avatar) 
VALUES 
(1, 'elderly01', '123456', '张建国', '男', '13800138000', '13900001111', '北京市朝阳区朝阳公园路1号', 1, 175.0, 70.0, 'https://picsum.photos/100/100?random=1'),
(2, 'elderly02', '123456', '李秀英', '女', '13800138001', '13900002222', '北京市海淀区中关村大街', 2, 160.0, 55.0, 'https://picsum.photos/100/100?random=2'),
(3, 'elderly03', '123456', '王大爷', '男', '13800138002', '13900003333', '北京市西城区幸福养老院', 3, 168.0, 65.0, 'https://picsum.photos/100/100?random=3'),
(4, 'elderly04', '123456', '陈奶奶', '女', '13800138003', '13900004444', '上海市徐汇区康平路', 1, 155.0, 50.0, 'https://picsum.photos/100/100?random=4'),
(5, 'elderly05', '123456', '赵铁柱', '男', '13800138004', '13900005555', '广州市天河区珠江新城', 2, 180.0, 75.0, 'https://picsum.photos/100/100?random=5');

-- 3. 监护人数据 (参考 MOCK_GUARDIANS)
INSERT INTO guardian_user (id, username, password, name, phone, avatar) 
VALUES 
(1, 'guardian01', '123456', '张晓明', '15011112222', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix'),
(2, 'guardian02', '123456', '王爱军', '15033334444', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka'),
(3, 'guardian03', '123456', '幸福养老院护工组', '010-88889999', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Worker');

-- 4. 监护关系 (参考 MOCK_RELATIONS)
INSERT INTO elderly_guardian_relation (elderly_id, guardian_id, relationship, priority) VALUES 
(1, 1, '子女', 1), -- 张建国 - 张晓明
(3, 2, '子女', 1), -- 王大爷 - 王爱军
(3, 3, '护工', 2); -- 王大爷 - 护工组

-- 5. 设备数据 (参考 MOCK_DEVICES)
INSERT INTO monitoring_device (device_id, device_name, device_type, brand, elderly_id, battery_level, is_online, bind_time) 
VALUES 
(1, 'iPhone 15 Pro', '手机', 'Apple', 1, 85, 1, '2024-01-15'),
(2, '华为 Mate 60', '手机', 'Huawei', 2, 100, 1, '2024-02-20'),
(3, '小米 14', '手机', 'Xiaomi', 3, 15, 1, '2024-03-10'),
(4, '荣耀 Magic 6', '手机', 'Honor', NULL, 90, 0, NULL),
(5, 'OPPO Find X7', '手机', 'OPPO', 4, 45, 1, '2024-04-01'),
(6, 'Vivo X100', '手机', 'Vivo', 5, 72, 1, '2024-04-15');


-- 7. 告警记录 (参考 MOCK_ALERTS)
-- location_desc 字段已在表定义中包含，直接插入数据
INSERT INTO alert_record (elderly_id, alert_type, alert_level, alert_content, alert_status, alert_time, location_desc, handle_note, resolved_time) 
VALUES 
-- 王大爷 跌倒 (未处理 -> 处理中/已解决)
(3, '跌倒', 3, '检测到前摔', 0, DATE_SUB(NOW(), INTERVAL 1 HOUR), '幸福养老院', NULL, NULL),
-- 王大爷 电量低 (已解决)
(3, '电量低', 2, '手机电量低于15%', 2, DATE_SUB(NOW(), INTERVAL 1 DAY), '幸福养老院', '已通知老人充电', DATE_SUB(NOW(), INTERVAL 23 HOUR)),
-- 张建国 围栏报警 (已解决)
(1, '围栏报警', 1, '离开安全围栏区域', 2, DATE_SUB(NOW(), INTERVAL 2 DAY), '朝阳公园路1号', '误报，老人只是在散步', DATE_SUB(NOW(), INTERVAL 47 HOUR)),
-- 赵铁柱 SOS (已确认)
(5, 'SOS', 3, '触发紧急求救(SOS)', 1, DATE_SUB(NOW(), INTERVAL 3 DAY), '珠江新城', '正在联系救护车', NULL),
-- 王大爷 疑似跌倒 (已解决 - 历史久远)
(3, '跌倒', 3, '疑似跌倒', 2, DATE_SUB(NOW(), INTERVAL 30 DAY), '幸福养老院食堂', '虚惊一场，只是蹲下捡东西', DATE_SUB(NOW(), INTERVAL 29 DAY));

-- 8. 历史轨迹数据
-- 状态: 摔倒、站立、坐下、静止、正常行走、慢跑、快跑、上楼、下楼
INSERT INTO elderly_activity_record (elderly_id, state, state_name, is_dangerous, start_time, end_time) 
VALUES 
(3, 'still', '静止', 0, CONCAT(CURDATE(), ' 07:00:00'), CONCAT(CURDATE(), ' 07:30:00')),
(3, 'standing', '站立', 0, CONCAT(CURDATE(), ' 07:30:00'), CONCAT(CURDATE(), ' 07:45:00')),
(3, 'walking', '正常行走', 0, CONCAT(CURDATE(), ' 07:45:00'), CONCAT(CURDATE(), ' 08:15:00')),
(3, 'upstairs', '上楼', 0, CONCAT(CURDATE(), ' 08:15:00'), CONCAT(CURDATE(), ' 08:20:00')),
(3, 'sitting', '坐下', 0, CONCAT(CURDATE(), ' 08:20:00'), CONCAT(CURDATE(), ' 09:00:00')),
(3, 'downstairs', '下楼', 0, CONCAT(CURDATE(), ' 09:00:00'), CONCAT(CURDATE(), ' 09:05:00')),
(3, 'jogging', '慢跑', 0, CONCAT(CURDATE(), ' 09:05:00'), CONCAT(CURDATE(), ' 09:35:00')),
(3, 'standing', '站立', 0, CONCAT(CURDATE(), ' 09:35:00'), CONCAT(CURDATE(), ' 09:40:00')),
(3, 'running', '快跑', 0, CONCAT(CURDATE(), ' 09:40:00'), CONCAT(CURDATE(), ' 09:45:00')), -- 模拟短暂快跑
(3, 'falling', '摔倒', 1, CONCAT(CURDATE(), ' 09:45:00'), CONCAT(CURDATE(), ' 09:45:10')), -- 危险事件
(3, 'sitting', '坐下', 0, CONCAT(CURDATE(), ' 09:45:10'), CONCAT(CURDATE(), ' 10:30:00')), -- 摔倒后坐下休息
(3, 'still', '静止', 0, CONCAT(CURDATE(), ' 10:30:00'), CONCAT(CURDATE(), ' 12:00:00'));
