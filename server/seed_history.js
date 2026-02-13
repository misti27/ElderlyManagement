const sequelize = require('./db');
const { QueryTypes, Sequelize } = require('sequelize');
require('dotenv').config();

async function connectWithRetry() {
    const host = "127.0.0.1";
    // Try '1234' which we know works
    try {
        const seq1234 = new Sequelize(
            process.env.DB_NAME || "elderly_db",
            "root",
            "1234",
            {
                host: host,
                dialect: "mysql",
                logging: false,
                timezone: '+08:00'
            }
        );
        await seq1234.authenticate();
        console.log("Connected with 'root' / '1234'.");
        return seq1234;
    } catch (e) {
        console.log("'root' / '1234' failed:", e.message);
        throw e;
    }
}

async function seedHistory() {
    let db;
    try {
        db = await connectWithRetry();
        
        // Ensure table exists
        const createTableSQL = `
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
        );`;
        await db.query(createTableSQL);

        // Clean up old data for these users
        await db.query("DELETE FROM elderly_activity_record WHERE elderly_id IN (1, 2)", { type: QueryTypes.DELETE });

        const elderlyIds = [1, 2];
        const values = [];

        // Helper to format date as YYYY-MM-DD using local time
        const getLocalDateStr = (date) => {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        };

        const now = new Date();
        
        // Loop last 30 days
        for (let i = 0; i < 30; i++) {
            const date = new Date(now);
            date.setDate(date.getDate() - i);
            const dateStr = getLocalDateStr(date);

            for (const eid of elderlyIds) {
                // Routine for each day
                // 1. Sleep (00:00 - 06:00)
                values.push(`(${eid}, 'still', '静止', 0, '${dateStr} 00:00:00', '${dateStr} 06:00:00', 21600)`);
                
                // 2. Morning Walk (06:00 - 07:00)
                values.push(`(${eid}, 'walking', '正常行走', 0, '${dateStr} 06:00:00', '${dateStr} 07:00:00', 3600)`);
                
                // 3. Breakfast (07:00 - 08:00)
                values.push(`(${eid}, 'sitting', '坐下', 0, '${dateStr} 07:00:00', '${dateStr} 08:00:00', 3600)`);

                // 4. Activity (08:00 - 10:00) - varies
                if (i % 2 === 0) {
                     values.push(`(${eid}, 'walking', '公园散步', 0, '${dateStr} 08:00:00', '${dateStr} 10:00:00', 7200)`);
                } else {
                     values.push(`(${eid}, 'sitting', '看电视', 0, '${dateStr} 08:00:00', '${dateStr} 10:00:00', 7200)`);
                }

                // 5. Rest of day (10:00 - 23:59) - simplified
                values.push(`(${eid}, 'still', '静止', 0, '${dateStr} 10:00:00', '${dateStr} 23:59:59', 50399)`);
            }
        }

        // Insert in batches of 100 to avoid query size limits
        const batchSize = 100;
        for (let i = 0; i < values.length; i += batchSize) {
            const batch = values.slice(i, i + batchSize);
            const query = `
                INSERT INTO elderly_activity_record 
                (elderly_id, state, state_name, is_dangerous, start_time, end_time, duration_seconds) 
                VALUES 
                ${batch.join(',\n')}
            `;
            await db.query(query, { type: QueryTypes.INSERT });
            console.log(`Inserted batch ${i / batchSize + 1}`);
        }
        
        console.log(`Successfully inserted ${values.length} records.`);

    } catch (error) {
        console.error("Error seeding history:", error);
    } finally {
        if (db) await db.close();
    }
}

seedHistory();