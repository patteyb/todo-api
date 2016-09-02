var bcrypt = require('bcryptjs');
var _ = require('underscore');

module.exports = function (sequelize, DataTypes) {
	return sequelize.define('user', {
		email: {
			type: DataTypes.STRING,
			allowNull: false,
			unique: true,
			validate: {
				isEmail: true
			}
		},
        salt: { // This field is to strengthen a given password by putting random numbers at the end of each pwd
            type: DataTypes.STRING
        },
        password_hash: {
            type: DataTypes.STRING
        },
		password: {
			type: DataTypes.VIRTUAL, // not stored on dbase but is accessible
			allowNull: false,
			validate: {
				len: [7, 100]
			},
            set: function(value) { // value is password
                var salt = bcrypt.genSaltSync(10);
                var hashedPwd = bcrypt.hashSync(value, salt);

                this.setDataValue('password', value);
                this.setDataValue('salt', salt);
                this.setDataValue('password_hash', hashedPwd);
            }
		}
	}, {
		hooks: {
			beforeValidate: function (user, options) {
				// user.email
				if (typeof user.email === 'string') {
					user.email = user.email.toLowerCase();
				}
			}
		},
		instanceMethods: {
			toPublicJSON: function() {
				var json = this.toJSON();
				return _.pick(json, 'id', 'email', 'createdAt', 'updatedAt');
			}
		}
	});
};


