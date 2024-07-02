const dbConfig = require('../config/config')


const { Sequelize, DataTypes } = require('sequelize');

const sequelize = new Sequelize(
    process.env.MYSQL_DATABASE_DEV,
    process.env.MYSQL_USER_DEV,
    process.env.MYSQL_PASSWORD_DEV, {
    host: dbConfig.host,
    port: process.env.MYSQL_PORT_DEV,
    dialect: 'mysql',
    operatorAliases: false,

    // pool: {
    //     max: dbConfig.pool.max,
    //     min: dbConfig.pool.min,
    //     acquire: dbConfig.pool.acquire,
    //     idle: dbConfig.pool.idle
    // }
}
)

sequelize.authenticate()
    .then(() => {
        console.log('DB connected...');
    })
    .catch(err => {
        console.log();
    })

const db = {}

db.Sequelize = Sequelize
db.sequelize = sequelize


db.users = require('./user.js')(sequelize, DataTypes)
db.UserToken = require('./user_token.js')(sequelize, DataTypes)

module.exports = db
