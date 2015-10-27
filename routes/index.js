var express = require('express');
var router = express.Router();
var task = require('../src/controllers/task');
var user = require('../src/controllers/user');

/* GET home page. */
router.get('/', function(req, res, next) {
	if (!req.session.user) {
  	return res.sendfile('gui/login.html');
	} else {
		return res.sendfile('gui/app.html');
	}
});

router.post('/user/login', user.login);

router.use(require('../src/polices/isLogged'));

router.post('/user/logout', user.logout);

router.post('/task', task.save);
router.put('/task', task.update);
router.delete('/task', task.delete);
router.get('/task', task.getAll);
router.get('/task/:id', task.get);
router.post('/task/changerole', task.changeRole);

router.post('/user', user.save);
router.put('/user', user.update);
router.delete('/user', user.delete);
router.get('/user', user.getAll);
router.get('/user/:id', user.get);


module.exports = router;