module.exports = (sequelize, DataTypes) => {
  const Devoured = sequelize.define(
    "devoured",
    {
      total_devoured: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
      }
    },
    {
      underscored: true,
      freezeTableName: true
    }
  );

  return Devoured;
};
