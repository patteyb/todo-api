module.exports = function(sequelize, DataTypes) {
    return sequelize.define('todo', {
        task: {
            type: DataTypes.STRING,
            allowNull: false, 
            validate: {
                len: [1, 250] // string longer than 1 char but less than 250
            }
        },
        completed: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        }
    });
};


