var Waterline = require('waterline');

module.exports = Waterline.Collection.extend({

  identity:   'task_user',
  tableName:  'task_user',
  connection: 'default',

  attributes: {

    id:         {type: 'integer', primaryKey: true, autoIncrement: true},
    user_id:    {type: 'integer'},
    task_id:    {type: 'integer'},
    role:       {type: 'string'},
    created_at: {type: 'datetime'},
    updated_at: {type: 'datetime'}

  }

});
