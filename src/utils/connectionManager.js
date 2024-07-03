const { DataTypes } = require('sequelize');
const sequelize = require('./connection');

const getDynamicModel = async (tableName) => {
  try {
    // Check if the model already exists in Sequelize
    if (sequelize.models[tableName]) {
      return sequelize.models[tableName];
    }

    // Otherwise, define and synchronize the model dynamically
    const Model = sequelize.define(tableName, {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      // Define other attributes as needed
    });

    // Synchronize the model with the database
    await Model.sync();

    // Return the dynamically defined model
    return Model;
  } catch (error) {
    console.error('Error retrieving dynamic model:', error);
    throw error; // Handle or re-throw the error as needed
  }
};

module.exports = getDynamicModel;
