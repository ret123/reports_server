const { DataTypes } = require('sequelize');
const sequelize = require('./connection');



const getDynamicModel = async (tableName) => {
  const columns = await sequelize.query(
    `SELECT COLUMN_NAME, DATA_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = '${tableName}'`,
    { type: sequelize.QueryTypes.SELECT }
  );

  const attributes = {};
  columns.forEach((column) => {
    attributes[column.COLUMN_NAME] = {
      type: DataTypes[column.DATA_TYPE.toUpperCase()] || DataTypes.STRING,
      allowNull: true,
    };
  });

  return sequelize.define(tableName, attributes, {
    tableName,
    timestamps: false,
  });
};

module.exports = getDynamicModel;
