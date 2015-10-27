var Waterline = require('waterline');
var bcrypt = require('bcryptjs');
var crypto = require('crypto');

module.exports = Waterline.Collection.extend({

  identity:   'user',
  tableName:  'user',
  connection: 'default',

  attributes: {

    id:         {type: 'integer', primaryKey: true, autoIncrement: true},
    name:       {type: 'string'},
    email:      {type: 'string'},
    token:      {type: 'string'},
    password:    {type: 'string'},
    created_at: {type: 'datetime'},
    updated_at: {type: 'datetime'},
   
    toJSON: function() {
      var obj = this.toObject();
      delete obj.password;
      return obj;
    }

  },

  beforeValidate: function(values, next) {
    var User = MODELS.user;

    if (!values.email) {
      return next('Email deve ser informado');
    }

    if (!values.name) {
      return next('Nome deve ser informado');
    }

    if (!values.password) {
      return next('Senha deve ser informada');
    }

    if (values.id) {
      queryUniqueEmail = {id: {not: values.id}, email: values.email};
    } else {
      queryUniqueEmail = {email: values.email};
    }
    User.find(queryUniqueEmail, function(err, user) {
      if (err) return next(err);
      if (user && user.length > 0) {
        next('Este email já está sendo utilizado.');
      } else {
        next();
      }
    });
  },

  _updatePassword: function(password) {
    if (password.length === 60) return password;
    return bcrypt.hashSync(password);
  },

  beforeCreate: function(values, callback) {
    values.password = this._updatePassword(values.password);
    values.token = crypto.createHash('md5').update(values.email).digest('hex');
    callback();
  },

  beforeUpdate: function(values, callback) {
    values.password = this._updatePassword(values.password);
    callback();
  }

});
