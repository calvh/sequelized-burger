module.exports = (sequelize, DataTypes) => {
  const Burger = sequelize.define(
    "burger",
    {
      burger_name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: "Text cannot be empty.",
          },
          len: {
            args: [1, 50],
            msg: "Maximum text length exceeded.",
          },
        },
      },
    },
    {
      underscored: true,
    }
  );

  Burger.associate = models => {
    models.burger.belongsToMany(models.customer, {
      through: "devoured",
    });
  };

  return Burger;
};
