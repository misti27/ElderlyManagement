
const { Sequelize } = require('sequelize');
const dbConfig = require('./config/db.config.js');

const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
    host: dbConfig.HOST,
    dialect: dbConfig.dialect,
    operatorsAliases: false,
    pool: {
        max: dbConfig.pool.max,
        min: dbConfig.pool.min,
        acquire: dbConfig.pool.acquire,
        idle: dbConfig.pool.idle
    },
    logging: false
});

async function checkData() {
    try {
        await sequelize.authenticate();
        console.log('Connection has been established successfully.');

        // Query elderly_guardian_relation
        const relations = await sequelize.query("SELECT * FROM elderly_guardian_relation", { type: Sequelize.QueryTypes.SELECT });
        console.log('Relations:', JSON.stringify(relations, null, 2));

        // Query guardian_user
        const guardians = await sequelize.query("SELECT * FROM guardian_user", { type: Sequelize.QueryTypes.SELECT });
        console.log('Guardians:', JSON.stringify(guardians, null, 2));

        // Query elderly_user
        const elderly = await sequelize.query("SELECT * FROM elderly_user", { type: Sequelize.QueryTypes.SELECT });
        console.log('Elderly:', JSON.stringify(elderly, null, 2));

    } catch (error) {
        console.error('Unable to connect to the database:', error);
    } finally {
        await sequelize.close();
    }
}

checkData();
