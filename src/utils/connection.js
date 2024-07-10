const { Sequelize } = require('sequelize');
const yaml = require('yaml');
const fs = require('fs');


const file = fs.readFileSync('src/reportConfig.yaml', 'utf8');
const config = yaml.parse(file);

const { host, port: dbPort, dialect, database, username, password } = config.db;


const sequelize = new Sequelize(database, username, password || '', {
  host: host,
  dialect: dialect,
  port: dbPort,
 });

sequelize.authenticate()
  .then(() => {
    console.log('Connection has been established successfully.');
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });

module.exports = sequelize;
