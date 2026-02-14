const sequelize = require('./db');

async function run() {
    try {
        console.log('Adding guardian_alias column...');
        await sequelize.query("ALTER TABLE elderly_guardian_relation ADD COLUMN guardian_alias VARCHAR(50) DEFAULT NULL COMMENT 'How guardian sees elderly (e.g. Father)'");
        console.log('guardian_alias added.');
    } catch (e) {
        console.log('Error adding guardian_alias (might exist):', e.message);
    }

    try {
        console.log('Adding elderly_alias column...');
        await sequelize.query("ALTER TABLE elderly_guardian_relation ADD COLUMN elderly_alias VARCHAR(50) DEFAULT NULL COMMENT 'How elderly sees guardian (e.g. Son)'");
        console.log('elderly_alias added.');
    } catch (e) {
        console.log('Error adding elderly_alias (might exist):', e.message);
    }
    
    // Copy existing relationship to guardian_alias as fallback
    try {
        console.log('Migrating data...');
        await sequelize.query("UPDATE elderly_guardian_relation SET guardian_alias = relationship WHERE guardian_alias IS NULL");
    } catch (e) {
        console.log('Error migrating data:', e.message);
    }

    process.exit();
}

run();
