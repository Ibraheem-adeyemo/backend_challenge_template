module.exports = (sequelize, DataTypes) => {
  const Review = sequelize.define(
    'Review',
    {
      review_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      customer_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      product_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      review: {
        type: DataTypes.STRING,
        defaultValue: 'No review',
      },
      rating: {
        type: DataTypes.INTEGER,
      },
      created_on: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      timestamps: false,
      tableName: 'review',
    }
  );

  Review.associate = ({ Customer, Product }) => {
    Review.belongsTo(Customer, {
      foreignKey: 'customer_id',
    });

    Review.belongsTo(Product, {
      foreignKey: 'product_id',
    });
  };

  return Review;
};
