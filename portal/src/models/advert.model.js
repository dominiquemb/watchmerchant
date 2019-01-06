const sequelize = require('sequelize');

module.exports = function(db, DataTypes) {
    const tableName = 'adverts';
    const fields = {
        id: {
            type: sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        price: sequelize.INTEGER,
        isNew: sequelize.BOOLEAN,
        box: sequelize.BOOLEAN,
        papers: sequelize.BOOLEAN,
        condition: sequelize.INTEGER,
        serviced: sequelize.BOOLEAN,
        warranty: sequelize.INTEGER,
        finance: sequelize.BOOLEAN,
        description: sequelize.TEXT,
        gemstones: sequelize.BOOLEAN,
        active: {
            type: sequelize.BOOLEAN,
            defaultValue: true,
            allowNull: false,
        },
        sold: {
            type: sequelize.BOOLEAN,
            defaultValue: false,
            allowNull: false
        }
    };
    const options = {
        indexes: [
            {
                fields: ['active', 'sold'],
            },
        ],
    };
    const Advert = db.define(tableName, fields, options);
    Advert.associate = (models) => {
        Advert.belongsTo(models.products);
        Advert.belongsTo(models.imports);
        Advert.belongsTo(models.users, { as: 'seller' });
        Advert.belongsTo(models.imports);
        Advert.hasMany(models.advertImages, { as: 'images' });
    };

    Advert.prototype.markAsSold = function() {
        return this.update({
            sold: true
        });
    }

    return Advert;
};
