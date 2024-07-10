const { DataTypes } = require('sequelize');
const sequelize = require('./connection');

const getDynamicModel = async (tableName) => {
  try {
   
    if (sequelize.models[tableName]) {
      return sequelize.models[tableName];
    }

 
    const Model = sequelize.define(tableName, {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
    
    });

  
    await Model.sync();

   
    return Model;
  } catch (error) {
    console.error('Error retrieving dynamic model:', error);
    throw error; 
  }
};

module.exports = getDynamicModel;
