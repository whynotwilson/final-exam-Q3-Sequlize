'use strict';
module.exports = (sequelize, DataTypes) => {
  const Record = sequelize.define('Record', {
    name: DataTypes.STRING,
    amount: DataTypes.SMALLINT,
    date: DataTypes.DATE,
    category: DataTypes.STRING,
    merchant: DataTypes.STRING
  }, {});
  Record.associate = function (models) {
    Record.belongsTo(models.User)
  };
  return Record;
};