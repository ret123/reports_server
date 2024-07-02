const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('reports', 'root', '', {
  host: 'localhost',
  dialect: 'mysql',
  port: '4306'
});

module.exports = sequelize;
