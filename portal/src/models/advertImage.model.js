const sequelize = require('sequelize');

module.exports = function(db, DataTypes) {
    const tableName = 'advertImages';
    const fields = {
        id: {
            type: sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        url: sequelize.STRING,
    };
    const options = {};
    const AdvertImage = db.define(tableName, fields, options);
    AdvertImage.associate = (models) => {
        AdvertImage.belongsTo(models.adverts);
    };

    return AdvertImage;
};
