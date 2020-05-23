module.exports = (sequelize, DataTypes) => {
  const Customer = sequelize.define(
    "customer",
    {
      customer_name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: "Text cannot be empty.",
          },
          len: {
            args: [1, 20],
            msg: "Maximum text length exceeded.",
          },
        },
      },
    },
    {
      underscored: true,
    }
  );

  Customer.associate = models => {
    models.customer.belongsToMany(models.burger, {
      through: "devoured",
    });
  };

  return Customer;
};
