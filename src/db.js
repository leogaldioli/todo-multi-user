var fs = require('fs');
var Waterline = require('waterline');

var orm = new Waterline();
var adapterName = 'mysql';

var adapter = null;

try {
  adapter = require('sails-' + adapterName);
} catch (err) {
  console.log('Module not found: sails-' + adapterName);
  process.exit(1);
}

var adapters = {
  'default': adapter
};

var connections = {
  'default':  {
    adapter: 'mysql',
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'todo',
    charset: 'utf8',
    collation: 'utf8_general_ci'
  }
};

adapters[adapterName] = adapter;

var dbConfig = {
  adapters: adapters,
  connections: connections,
  defaults: {
    migrate: 'safe',
    autoPK: false,
    autoCreatedAt: false,
    autoUpdatedAt: false
  }
};

_.each(fs.readdirSync(__dirname + '/models/'), function(file) {
  if (!file.match('.js')) return;
  console.log('Loading model: ' + file);
  orm.loadCollection(require('./models/' + file));
});

module.exports = function(callback) {
  orm.initialize(dbConfig, function(err, models) {
    if (err) return callback(err);
    global.MODELS = models.collections;
    callback();
  });
};