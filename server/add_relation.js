const sequelize = require('./db');

async function addRelation() {
    try {
        await sequelize.authenticate();
        console.log("Connected.");
        
        // Check if relation exists
        const [results] = await sequelize.query("SELECT * FROM elderly_guardian_relation WHERE elderly_id = 2 AND guardian_id = 1");
        if (results.length > 0) {
            console.log("Relation already exists.");
        } else {
            await sequelize.query("INSERT INTO elderly_guardian_relation (elderly_id, guardian_id, relationship, priority) VALUES (2, 1, '子女', 1)");
            console.log("Added relation: Guardian 1 -> Elderly 2 (李秀英)");
        }
    } catch (e) {
        console.error("Error:", e.message);
    } finally {
        await sequelize.close();
    }
}

addRelation();