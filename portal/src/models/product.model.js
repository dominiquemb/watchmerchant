const sequelize = require('sequelize');
const slugify = require('slugify');

module.exports = function(db, DataTypes) {
    const tableName = 'products';
    const fields = {
        id: {
            type: sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        model: sequelize.STRING,
        slug: {
            type: sequelize.STRING,
            allowNull: false,
        },
        manufacturerRef: sequelize.STRING,
        year: {
            type: sequelize.INTEGER,
            allowNull: true,
        },
        gender: sequelize.ENUM('male', 'female'), // eslint-disable-line new-cap
        movement: sequelize.ENUM('automatic', 'manual'), // eslint-disable-line new-cap
        caseMaterial: sequelize.STRING,
        caseDiameter: sequelize.INTEGER,
        dialColour: sequelize.STRING,
        strap: sequelize.STRING,
    };
    const options = {
        indexes: [
            {
                fields: ['slug'],
                unique: true,
            },
        ],
        hooks: {
            beforeValidate: (p, options) => {
                p.slug = slugify(`${p.model.toLowerCase()} ${p.manufacturerRef}`);
            },
        },
    };
    const Product = db.define(tableName, fields, options);
    Product.associate = (models) => {
        Product.hasMany(models.adverts);
        Product.belongsTo(models.brands);
        Product.belongsTo(models.imports);
    };
    return Product;
};
