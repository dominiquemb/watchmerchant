const sequelize = require('sequelize');
const slugify = require('slugify');

module.exports = function(db, DataTypes) {
    const tableName = 'brands';
    const fields = {
        id: {
            type: sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        name: {
            type: sequelize.STRING,
            allowNull: false,
        },
        slug: {
            type: sequelize.STRING,
            allowNull: false,
        },
    };
    const options = {
        indexes: [{
            fields: ['name'],
            unique: true,
        }, {
            fields: ['slug'],
            unique: true,
        }],
        hooks: {
            beforeValidate: (b, options) => {
                b.slug = slugify(b.name, { lower: true });
            },
        },
    };

    const Brand = db.define(tableName, fields, options);
    Brand.associate = (models) => {
        Brand.belongsTo(models.imports);
    };
    return Brand;
};
