
const sequelize = require('./db');

async function seed() {
    try {
        console.log("Seeding alerts...");
        
        // Alert 1: Unprocessed High Level (SOS) for Elderly 1 (Zhang Jianguo)
        await sequelize.query(`
            INSERT INTO alert_record (elderly_id, alert_type, alert_time, alert_content, alert_status, alert_level, location_desc)
            VALUES (1, 'SOS', NOW(), '老人触发了紧急呼叫', 0, 3, '公园北门附近')
        `);

        // Alert 2: Unprocessed Medium Level (Fall) for Elderly 2 (Li Xiuying)
        // Assuming Elderly 2 exists. If not, this might fail or just insert. 
        // Based on mock data in app, we have multiple elderly. In DB, we usually have id 1, 2.
        await sequelize.query(`
            INSERT INTO alert_record (elderly_id, alert_type, alert_time, alert_content, alert_status, alert_level, location_desc)
            VALUES (2, 'FALL', NOW(), '检测到跌倒', 0, 2, '家中客厅')
        `);

         // Alert 3: Processed Low Level (Battery)
        await sequelize.query(`
            INSERT INTO alert_record (elderly_id, alert_type, alert_time, alert_content, alert_status, alert_level, location_desc)
            VALUES (1, 'LOW_BATTERY', DATE_SUB(NOW(), INTERVAL 1 HOUR), '电量过低', 2, 1, '家中')
        `);
        
        // Alert 4: Unprocessed High Level (Heart Rate)
        await sequelize.query(`
            INSERT INTO alert_record (elderly_id, alert_type, alert_time, alert_content, alert_status, alert_level, location_desc)
            VALUES (1, 'ABNORMAL_HEART_RATE', DATE_SUB(NOW(), INTERVAL 30 MINUTE), '心率异常 (120bpm)', 0, 3, '公园长椅')
        `);

        console.log("Seeded alerts successfully.");
    } catch (err) {
        console.error("Seed failed:", err);
    } finally {
        await sequelize.close();
    }
}

seed();
