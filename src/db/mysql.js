const Mysql = require('mysql2/promise');
const { appConfig } = require('../config/appConfig');

const pool = Mysql.createPool({
    connectionLimit: 10,
    host: appConfig.host,
    user: appConfig.user,
    database: appConfig.database,
    password: appConfig.password
});

const executeMethod = async (query, params) => {
    try {
        const [results, fields] = await pool.execute(query, params);
        return results
    } catch (error) {
        console.error('Error executing database method:', error);
        throw error;
    }
}

module.exports = executeMethod;