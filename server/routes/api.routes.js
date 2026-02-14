const sequelize = require("../db");
const express = require("express");
const router = express.Router();
const { QueryTypes } = require("sequelize");

// Helper to get current user ID based on token
// For this simple implementation, we assume hardcoded IDs if token is present
const getContext = (req) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader) return { role: 'guest' };

    if (authHeader.includes('mock-elderly')) {
        return { role: 'elderly', id: 1 }; // Hardcoded to ID 1 (张建国)
    }
    if (authHeader.includes('mock-guardian')) {
        return { role: 'guardian', id: 1 }; // Hardcoded to ID 1 (张晓明)
    }
    return { role: 'guest' };
};

// ==========================================
// Auth Routes
// ==========================================

router.post("/auth/login/elderly", async (req, res) => {
    const { phone } = req.body;
    // In real app, verify code. Here just find user by phone or default to ID 1
    try {
        let user = await sequelize.query("SELECT * FROM elderly_user WHERE phone = ?", {
            replacements: [phone],
            type: QueryTypes.SELECT
        });

        if (user.length === 0) {
            // Fallback for demo if phone doesn't match
            user = await sequelize.query("SELECT * FROM elderly_user WHERE id = 1", { type: QueryTypes.SELECT });
        }

        const u = user[0];
        res.json({
            token: `mock-elderly-token-${Date.now()}`,
            user: {
                id: u.id.toString(), // App expects string ID
                name: u.name,
                phone: u.phone,
                role: 'elderly',
                // Additional fields for profile
                age: 75, // Mock age
                emergencyPhone: u.emergency_phone,
                avatarUrl: u.avatar,
                address: u.address
            }
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.post("/auth/login/guardian", async (req, res) => {
    const { phone } = req.body;
    try {
        let user = await sequelize.query("SELECT * FROM guardian_user WHERE phone = ?", {
            replacements: [phone],
            type: QueryTypes.SELECT
        });

        if (user.length === 0) {
            user = await sequelize.query("SELECT * FROM guardian_user WHERE id = 1", { type: QueryTypes.SELECT });
        }

        const u = user[0];
        res.json({
            token: `mock-guardian-token-${Date.now()}`,
            user: {
                id: u.id.toString(),
                name: u.name,
                phone: u.phone,
                role: 'guardian'
            }
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// ==========================================
// Elderly Routes
// ==========================================

router.get("/elderly/profile", async (req, res) => {
    const ctx = getContext(req);
    if (ctx.role !== 'elderly') return res.status(401).send("Unauthorized");

    try {
        const users = await sequelize.query("SELECT * FROM elderly_user WHERE id = ?", {
            replacements: [ctx.id],
            type: QueryTypes.SELECT
        });
        const u = users[0];
        res.json({
            id: u.id.toString(),
            name: u.name,
            age: 75,
            phone: u.phone,
            emergencyPhone: u.emergency_phone,
            avatarUrl: u.avatar,
            address: u.address
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.get("/elderly/guardians", async (req, res) => {
    const ctx = getContext(req);
    if (ctx.role !== 'elderly') return res.status(401).send("Unauthorized");

    try {
        const guardians = await sequelize.query(`
            SELECT g.id, g.name, g.phone, g.avatar as avatarUrl, r.relationship as relation 
            FROM guardian_user g 
            JOIN elderly_guardian_relation r ON g.id = r.guardian_id 
            WHERE r.elderly_id = ?
        `, {
            replacements: [ctx.id],
            type: QueryTypes.SELECT
        });

        // Convert IDs to string
        const result = guardians.map(g => ({ ...g, id: g.id.toString() }));
        res.json(result);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.post("/elderly/status", async (req, res) => {
    const ctx = getContext(req);
    if (ctx.role !== 'elderly') return res.status(401).send("Unauthorized");

    const { status, location } = req.body;
    // Map status string to int if needed, but DB uses int? 
    // Wait, DB `health_data` has `activity_status INT`. App sends string enum '跌倒', '静止'.
    // We need to map string to int or change DB to VARCHAR.
    // The init.sql has `activity_status INT`.
    // Let's assume we change DB or map it here.
    // Simple mapping:
    const statusMap = { '跌倒': 1, '静止': 2, '坐下': 3, '站立': 4, '正常行走': 5, '慢跑': 6, '快跑': 7, '上楼': 8, '下楼': 9 };
    const statusInt = statusMap[status] || 0;

    try {
        await sequelize.query(`
            INSERT INTO health_data (elderly_id, activity_status, upload_time) 
            VALUES (?, ?, NOW())
        `, {
            replacements: [ctx.id, statusInt],
            type: QueryTypes.INSERT
        });

        // If status is '跌倒', also trigger alert
        if (status === '跌倒') {
            await sequelize.query(`
                INSERT INTO alert_record (elderly_id, alert_type, alert_level, alert_content, alert_status, location_desc)
                VALUES (?, '跌倒报警', 3, '检测到老人跌倒', 0, ?)
             `, {
                replacements: [ctx.id, location || '未知位置']
            });
        }

        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.post("/elderly/location", async (req, res) => {
    const ctx = getContext(req);
    if (ctx.role !== 'elderly') return res.status(401).send("Unauthorized");

    const { latitude, longitude, address } = req.body;
    try {
        await sequelize.query(`
            INSERT INTO location_data (elderly_id, latitude, longitude, location_desc)
            VALUES (?, ?, ?, ?)
        `, {
            replacements: [ctx.id, latitude, longitude, address],
            type: QueryTypes.INSERT
        });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.post("/elderly/sos", async (req, res) => {
    const ctx = getContext(req);
    if (ctx.role !== 'elderly') return res.status(401).send("Unauthorized");

    try {
        // Get latest location
        const locs = await sequelize.query("SELECT location_desc FROM location_data WHERE elderly_id = ? ORDER BY upload_time DESC LIMIT 1", {
            replacements: [ctx.id],
            type: QueryTypes.SELECT
        });
        const location = locs.length > 0 ? locs[0].location_desc : '未知位置';

        await sequelize.query(`
            INSERT INTO alert_record (elderly_id, alert_type, alert_level, alert_content, alert_status, location_desc)
            VALUES (?, '紧急呼叫', 3, '老人发起SOS求救', 0, ?)
        `, {
            replacements: [ctx.id, location],
            type: QueryTypes.INSERT
        });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.get("/elderly/guardians", async (req, res) => {
    const ctx = getContext(req);
    if (ctx.role !== 'elderly') return res.status(401).send("Unauthorized");

    try {
        const guardians = await sequelize.query(`
            SELECT g.id, g.name, g.phone, g.avatar,
                   r.elderly_alias as relation_desc,
                   r.relationship as original_relation
            FROM guardian_user g
            JOIN elderly_guardian_relation r ON g.id = r.guardian_id
            WHERE r.elderly_id = ?
        `, {
            replacements: [ctx.id],
            type: QueryTypes.SELECT
        });

        const result = guardians.map(g => ({
            id: g.id.toString(),
            name: g.name,
            phone: g.phone,
            relation: g.relation_desc || g.original_relation || '亲属',
            avatarUrl: g.avatar
        }));

        res.json(result);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.post("/elderly/bind", async (req, res) => {
    const ctx = getContext(req);
    if (ctx.role !== 'elderly') return res.status(401).send("Unauthorized");
    
    const { phone } = req.body;
    if (!phone) return res.status(400).send("Missing phone");

    try {
        const guardian = await sequelize.query("SELECT * FROM guardian_user WHERE phone = ?", {
            replacements: [phone],
            type: QueryTypes.SELECT
        });
        
        if (guardian.length === 0) {
            return res.status(404).json({ success: false, message: "该手机号未注册" });
        }

        const guardianId = guardian[0].id;

        const existing = await sequelize.query(
            "SELECT * FROM elderly_guardian_relation WHERE guardian_id = ? AND elderly_id = ?",
            {
                replacements: [guardianId, ctx.id],
                type: QueryTypes.SELECT
            }
        );

        if (existing.length > 0) {
            return res.status(400).json({ success: false, message: "已经绑定该监护人" });
        }

        await sequelize.query(
            "INSERT INTO elderly_guardian_relation (guardian_id, elderly_id, relationship, guardian_alias, elderly_alias, priority) VALUES (?, ?, ?, ?, ?, ?)",
            {
                replacements: [guardianId, ctx.id, '亲属', '亲属', '监护人', 1],
                type: QueryTypes.INSERT
            }
        );

        res.json({ success: true, message: "绑定成功" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: err.message });
    }
});

router.post("/elderly/unbind", async (req, res) => {
    const ctx = getContext(req);
    if (ctx.role !== 'elderly') return res.status(401).send("Unauthorized");

    const { guardianId } = req.body;
    if (!guardianId) return res.status(400).send("Missing guardianId");

    try {
        await sequelize.query(
            "DELETE FROM elderly_guardian_relation WHERE guardian_id = ? AND elderly_id = ?",
            {
                replacements: [guardianId, ctx.id],
                type: QueryTypes.DELETE
            }
        );
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: err.message });
    }
});

router.post("/elderly/update_relation", async (req, res) => {
    const ctx = getContext(req);
    if (ctx.role !== 'elderly') return res.status(401).send("Unauthorized");

    const { guardianId, guardianAlias, elderlyAlias } = req.body;
    if (!guardianId) return res.status(400).send("Missing parameters");

    try {
        await sequelize.query(
            "UPDATE elderly_guardian_relation SET guardian_alias = ?, elderly_alias = ? WHERE guardian_id = ? AND elderly_id = ?",
            {
                replacements: [guardianAlias, elderlyAlias, guardianId, ctx.id],
                type: QueryTypes.UPDATE
            }
        );
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: err.message });
    }
});

router.get("/guardian/elderly", async (req, res) => {
    const ctx = getContext(req);
    if (ctx.role !== 'guardian') return res.status(401).send("Unauthorized");

    try {
        // Complex query to get elderly info + latest device status + location + latest activity status
        const elderlyList = await sequelize.query(`
            SELECT e.id, e.name, e.avatar as avatarUrl, e.phone,
                   l.location_desc as currentLocation,
                   l.latitude, l.longitude,
                   act.state_name as currentStatus,
                   r.guardian_alias as relation_desc,
                   r.relationship as original_relation
            FROM elderly_user e
            JOIN elderly_guardian_relation r ON e.id = r.elderly_id
            LEFT JOIN (
                SELECT elderly_id, location_desc, latitude, longitude 
                FROM location_data 
                WHERE id IN (SELECT MAX(id) FROM location_data GROUP BY elderly_id)
            ) l ON e.id = l.elderly_id
            LEFT JOIN (
                SELECT elderly_id, state_name
                FROM elderly_activity_record
                WHERE id IN (SELECT MAX(id) FROM elderly_activity_record GROUP BY elderly_id)
            ) act ON e.id = act.elderly_id
            WHERE r.guardian_id = ?
        `, {
            replacements: [ctx.id],
            type: QueryTypes.SELECT
        });

        // Map to Types.ts interface
        const result = elderlyList.map(e => ({
            id: e.id.toString(),
            name: e.name,
            age: 75,
            relation: e.relation_desc || e.original_relation || '亲属', // Map relationship
            avatarUrl: e.avatarUrl,
            phone: e.phone,
            currentStatus: e.currentStatus || '静止',
            currentLocation: e.currentLocation || '未知位置',
            locationCoords: {
                latitude: e.latitude || 39.9,
                longitude: e.longitude || 116.4
            },
            device: {
                deviceId: 'dev001',
                name: '智能手表',
                batteryLevel: 80,
                isOnline: true,
                lastOnlineTime: new Date().toISOString()
            }
        }));

        res.json(result);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.get("/guardian/elderly/:id", async (req, res) => {
    const ctx = getContext(req);
    if (ctx.role !== 'guardian') return res.status(401).send("Unauthorized");
    const elderlyId = req.params.id;

    try {
        const users = await sequelize.query("SELECT * FROM elderly_user WHERE id = ?", {
            replacements: [elderlyId],
            type: QueryTypes.SELECT
        });

        if (users.length === 0) return res.status(404).send("Not found");

        const e = users[0];

        // Fetch latest location
        const locs = await sequelize.query("SELECT * FROM location_data WHERE elderly_id = ? ORDER BY upload_time DESC LIMIT 1", {
            replacements: [elderlyId],
            type: QueryTypes.SELECT
        });
        const loc = locs[0] || {};

        res.json({
            id: e.id.toString(),
            name: e.name,
            age: 75,
            avatarUrl: e.avatar,
            phone: e.phone,
            currentStatus: '静止',
            currentLocation: loc.location_desc || '未知位置',
            locationCoords: {
                latitude: loc.latitude || 39.9,
                longitude: loc.longitude || 116.4
            },
            device: {
                deviceId: 'dev001',
                name: '智能手表',
                batteryLevel: 85,
                isOnline: true,
                lastOnlineTime: new Date().toISOString()
            }
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.get("/guardian/alerts", async (req, res) => {
    const ctx = getContext(req);
    if (ctx.role !== 'guardian') return res.status(401).send("Unauthorized");

    const { elderlyId, date } = req.query; // Get filters from query params

    try {
        let query = `
            SELECT a.id, a.alert_type as type, a.alert_time as time, a.alert_content as description, 
                   a.alert_status, a.alert_level, a.location_desc, e.name as elderlyName, e.id as elderlyId
            FROM alert_record a
            JOIN elderly_user e ON a.elderly_id = e.id
            JOIN elderly_guardian_relation r ON e.id = r.elderly_id
            WHERE r.guardian_id = ?
        `;

        const replacements = [ctx.id];

        // Filter by Elderly
        if (elderlyId && elderlyId !== 'all') {
            query += ` AND a.elderly_id = ?`;
            replacements.push(elderlyId);
        }

        // Filter by Date (YYYY-MM-DD)
        if (date) {
            console.log(`[Alerts] Querying date: ${date}`);
            const startDate = `${date} 00:00:00`;
            const endDate = `${date} 23:59:59`;
            query += ` AND a.alert_time BETWEEN ? AND ?`;
            replacements.push(startDate);
            replacements.push(endDate);
        }

        query += ` ORDER BY a.alert_time DESC`;

        const alerts = await sequelize.query(query, {
            replacements: replacements,
            type: QueryTypes.SELECT
        });

        const result = alerts.map(a => ({
            id: a.id.toString(),
            elderlyId: a.elderlyId ? a.elderlyId.toString() : undefined,
            type: a.type,
            elderlyName: a.elderlyName,
            time: new Date(a.time).toLocaleString('zh-CN', { hour12: false }),
            description: a.description,
            location: a.location_desc || '未知位置',
            level: a.alert_level || 1, // Default Low
            status: a.alert_status || 0 // Default Unprocessed
        }));

        res.json(result);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.get("/stats/history/:elderlyId", async (req, res) => {
    const ctx = getContext(req);
    // Allow guardian or the elderly themselves
    if (ctx.role !== 'guardian' && ctx.role !== 'elderly') return res.status(401).send("Unauthorized");

    const elderlyId = req.params.elderlyId;
    const date = req.query.date; // Optional: YYYY-MM-DD

    console.log(`[History] Fetching for Elder ${elderlyId} on Date ${date}`);

    try {
        let query = "";
        let replacements = [];

        if (elderlyId === 'all') {
            if (ctx.role !== 'guardian') return res.status(403).send("Only guardians can view all");

            query = `
                    SELECT ar.id, ar.elderly_id, ar.state, ar.state_name, ar.start_time, ar.end_time, ar.is_dangerous, eu.name as elderly_name
                    FROM elderly_activity_record ar
                    JOIN elderly_user eu ON ar.elderly_id = eu.id
                    JOIN elderly_guardian_relation gr ON eu.id = gr.elderly_id
                    WHERE gr.guardian_id = ?
                `;
            replacements = [ctx.id];
        } else {
            query = `
                    SELECT id, state, state_name, start_time, end_time, is_dangerous
                    FROM elderly_activity_record
                    WHERE elderly_id = ?
                `;
            replacements = [elderlyId];
        }

        if (date) {
            console.log(`[History] Querying date: ${date} for elderly: ${elderlyId}`);

            const startDate = `${date} 00:00:00`;
            const endDate = `${date} 23:59:59`;

            if (elderlyId === 'all') {
                query += " AND ar.start_time BETWEEN ? AND ?";
            } else {
                query += " AND start_time BETWEEN ? AND ?";
            }
            replacements.push(startDate);
            replacements.push(endDate);

            // Timeline order
            if (elderlyId === 'all') {
                query += " ORDER BY ar.start_time ASC";
            } else {
                query += " ORDER BY start_time ASC";
            }
        } else {
            // Recent records
            if (elderlyId === 'all') {
                query += " ORDER BY ar.start_time DESC LIMIT 50";
            } else {
                query += " ORDER BY start_time DESC LIMIT 50";
            }
        }

        const history = await sequelize.query(query, {
            replacements: replacements,
            type: QueryTypes.SELECT
        });

        console.log(`[History] Found ${history.length} records`);

        // Map to HistoryRecord interface
        const result = history.map(h => {
            const start = new Date(h.start_time);
            const end = new Date(h.end_time);
            const durationMs = end.getTime() - start.getTime();
            const durationMin = Math.floor(durationMs / 60000);

            // Format duration string
            let durationStr = '';
            if (durationMin < 60) {
                durationStr = `${durationMin}分钟`;
            } else {
                const hrs = Math.floor(durationMin / 60);
                const mins = durationMin % 60;
                durationStr = `${hrs}小时${mins}分`;
            }

            // Format start time HH:mm
            const startTimeStr = start.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false });
            const endTimeStr = end.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false });

            return {
                id: h.id.toString(),
                elderlyId: h.elderly_id ? h.elderly_id.toString() : undefined,
                elderlyName: h.elderly_name, // Will be undefined for single query, which is fine
                status: h.state_name,
                startTime: startTimeStr,
                endTime: endTimeStr,
                duration: durationStr
            };
        });

        res.json(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
});

router.post("/guardian/bind", async (req, res) => {
    const ctx = getContext(req);
    if (ctx.role !== 'guardian') return res.status(401).send("Unauthorized");

    const { phone } = req.body;
    if (!phone) return res.status(400).send("Missing phone");

    try {
        // Check if elderly exists by phone
        const elderly = await sequelize.query("SELECT * FROM elderly_user WHERE phone = ?", {
            replacements: [phone],
            type: QueryTypes.SELECT
        });

        if (elderly.length === 0) {
            return res.status(404).json({ success: false, message: "该手机号未注册" });
        }

        const elderlyId = elderly[0].id;

        // Check if already bound
        const existing = await sequelize.query(
            "SELECT * FROM elderly_guardian_relation WHERE guardian_id = ? AND elderly_id = ?",
            {
                replacements: [ctx.id, elderlyId],
                type: QueryTypes.SELECT
            }
        );

        if (existing.length > 0) {
            return res.status(400).json({ success: false, message: "已经绑定该用户" });
        }

        // Bind
        await sequelize.query(
            "INSERT INTO elderly_guardian_relation (guardian_id, elderly_id, relationship, guardian_alias, elderly_alias, priority) VALUES (?, ?, ?, ?, ?, ?)",
            {
                replacements: [ctx.id, elderlyId, '亲属', '长辈', '亲属', 1],
                type: QueryTypes.INSERT
            }
        );

        res.json({ success: true, message: "绑定成功" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: err.message });
    }
});

router.post("/guardian/unbind", async (req, res) => {
    const ctx = getContext(req);
    if (ctx.role !== 'guardian') return res.status(401).send("Unauthorized");

    const { elderlyId } = req.body;
    if (!elderlyId) return res.status(400).send("Missing elderlyId");

    try {
        await sequelize.query(
            "DELETE FROM elderly_guardian_relation WHERE guardian_id = ? AND elderly_id = ?",
            {
                replacements: [ctx.id, elderlyId],
                type: QueryTypes.DELETE
            }
        );
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: err.message });
    }
});

router.post("/guardian/update_relation", async (req, res) => {
    const ctx = getContext(req);
    if (ctx.role !== 'guardian') return res.status(401).send("Unauthorized");

    const { elderlyId, guardianAlias, elderlyAlias } = req.body;
    if (!elderlyId) return res.status(400).send("Missing parameters");

    try {
        await sequelize.query(
            "UPDATE elderly_guardian_relation SET guardian_alias = ?, elderly_alias = ? WHERE guardian_id = ? AND elderly_id = ?",
            {
                replacements: [guardianAlias, elderlyAlias, ctx.id, elderlyId],
                type: QueryTypes.UPDATE
            }
        );
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: err.message });
    }
});

// ==========================================
// Debug Routes
// ==========================================
router.get("/debug/seed", async (req, res) => {
    try {
        // Clean up old data for these users to avoid duplicates
        await sequelize.query("DELETE FROM elderly_activity_record WHERE elderly_id IN (1, 2)", { type: QueryTypes.DELETE });

        const users = [
            {
                id: 1,
                name: "张建国",
                activities: [
                    // Yesterday
                    { state: 'still', name: '静止', start: '-1d 06:00', end: '-1d 07:00' },
                    { state: 'standing', name: '站立', start: '-1d 07:00', end: '-1d 07:15' },
                    { state: 'walking', name: '正常行走', start: '-1d 07:15', end: '-1d 08:00' }, // Morning walk
                    { state: 'sitting', name: '坐下', start: '-1d 08:00', end: '-1d 09:00' }, // Breakfast
                    { state: 'walking', name: '正常行走', start: '-1d 09:00', end: '-1d 10:00' }, // Park
                    { state: 'sitting', name: '坐下', start: '-1d 10:00', end: '-1d 12:00' }, // TV
                    { state: 'still', name: '静止', start: '-1d 12:00', end: '-1d 14:00' }, // Nap
                    { state: 'standing', name: '站立', start: '-1d 14:00', end: '-1d 14:10' },
                    { state: 'walking', name: '正常行走', start: '-1d 14:10', end: '-1d 15:00' },
                    // Today
                    { state: 'still', name: '静止', start: '0d 06:00', end: '0d 07:30' },
                    { state: 'walking', name: '正常行走', start: '0d 07:30', end: '0d 08:30' },
                    { state: 'sitting', name: '坐下', start: '0d 08:30', end: '0d 10:00' },
                    { state: 'walking', name: '正常行走', start: '0d 10:00', end: '0d 11:00' },
                ]
            },
            {
                id: 2,
                name: "李秀英",
                activities: [
                    // Yesterday
                    { state: 'still', name: '静止', start: '-1d 05:00', end: '-1d 06:30' },
                    { state: 'sitting', name: '坐下', start: '-1d 06:30', end: '-1d 08:00' },
                    { state: 'walking', name: '正常行走', start: '-1d 08:00', end: '-1d 09:00' }, // Grocery
                    { state: 'upstairs', name: '上楼', start: '-1d 09:00', end: '-1d 09:10' },
                    { state: 'sitting', name: '坐下', start: '-1d 09:10', end: '-1d 12:00' },
                    { state: 'still', name: '静止', start: '-1d 12:00', end: '-1d 13:30' },
                    // Today
                    { state: 'still', name: '静止', start: '0d 05:00', end: '0d 07:00' },
                    { state: 'walking', name: '正常行走', start: '0d 07:00', end: '0d 08:00' },
                    { state: 'sitting', name: '坐下', start: '0d 08:00', end: '0d 10:30' },
                    { state: 'standing', name: '站立', start: '0d 10:30', end: '0d 10:45' },
                    { state: 'downstairs', name: '下楼', start: '0d 10:45', end: '0d 11:00' },
                ]
            }
        ];

        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        const formatDate = (date) => date.toISOString().split('T')[0];
        const todayStr = formatDate(today);
        const yesterdayStr = formatDate(yesterday);

        const parseTime = (offsetStr) => {
            const [dayOffset, time] = offsetStr.split(' ');
            const baseDate = dayOffset === '-1d' ? yesterdayStr : todayStr;
            return `${baseDate} ${time}:00`;
        };

        const values = [];
        for (const user of users) {
            for (const act of user.activities) {
                const startTime = parseTime(act.start);
                const endTime = parseTime(act.end);
                values.push(`(${user.id}, '${act.state}', '${act.name}', 0, '${startTime}', '${endTime}')`);
            }
        }

        const query = `
            INSERT INTO elderly_activity_record 
            (elderly_id, state, state_name, is_dangerous, start_time, end_time) 
            VALUES 
            ${values.join(',\n')}
        `;

        await sequelize.query(query, { type: QueryTypes.INSERT });
        res.json({ message: `Successfully inserted ${values.length} records.` });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
