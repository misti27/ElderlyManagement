const sequelize = require('./db');

async function checkData() {
    try {
        await sequelize.authenticate();
        console.log("Connected.");

        // Check records for ID 2
        const [results] = await sequelize.query("SELECT id, elderly_id, state_name, start_time, end_time FROM elderly_activity_record WHERE elderly_id = 2 ORDER BY start_time DESC LIMIT 10");
        console.log("Recent records for ID 2:", JSON.stringify(results, null, 2));

        // Check what DATE() returns for these
        if (results.length > 0) {
            const [dateCheck] = await sequelize.query(`SELECT start_time, DATE(start_time) as date_val FROM elderly_activity_record WHERE id = ${results[0].id}`);
            console.log("Date check for latest record:", dateCheck);
        }

    } catch (e) {
        console.error("Error:", e.message);
    } finally {
        await sequelize.close();
    }
}

checkData();