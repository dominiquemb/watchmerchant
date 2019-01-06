const sequelize = require('sequelize');
const uuid = require('uuid');

module.exports = function(db, DataTypes) {
    const tableName = 'imports';
    const fields = {
        id: {
            type: sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        uuid: sequelize.STRING,
        reconciled: {
            type: sequelize.BOOLEAN,
            defaultValue: false,
            allowNull: false,
        },
        advertCount: sequelize.INTEGER,
    };
    const options = {
        indexes: [{
            fields: ['uuid', 'reconciled'],
        }],
        hooks: {
            afterValidate: (i, options) => {
                i.uuid = uuid.v4();
            },
        },
    };
    const Import = db.define(tableName, fields, options);
    Import.associate = (models) => {
        Import.belongsTo(models.users, { as: 'seller' });
        Import.belongsTo(models.users, { as: 'uploader' });
        Import.hasMany(models.adverts);
        Import.hasMany(models.brands);
        Import.hasMany(models.products);
    };
    return Import;
};
