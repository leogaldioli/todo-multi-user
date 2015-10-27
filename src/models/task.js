var Waterline = require('waterline');

module.exports = Waterline.Collection.extend({

  identity:   'task',
  tableName:  'task',
  connection: 'default',

  attributes: {

    id:         {type: 'integer', primaryKey: true, autoIncrement: true},
    name:       {type: 'string'},
    done:       {type: 'boolean'},
    created_at: {type: 'datetime'},
    updated_at: {type: 'datetime'}
  }

});
