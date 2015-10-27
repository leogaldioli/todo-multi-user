var User = MODELS.user;
var bcrypt = require('bcryptjs');

module.exports.save = function (req, res, next) {
	var user = {
		name: req.body.name,
		password: req.body.password,
		email: req.body.email,
		created_at: new Date(),
		updated_at: new Date()
	}		
	
	User.create(user, function(err, user) {
		if (err) return next(err);
		res.send({
			message: 'Usuário adicionado',
			data: user
		});
	});
}

module.exports.update = function (req, res, next) {
	var user = {
		name: req.body.name,
		done: req.body.done,
		updated_at: new Date()
	}
	
	User.update({id: req.body.id}, user, function(err, user) {
		if (err) return next(err);
		res.send({
			message: 'Usuário alterado',
			data: user[0]
		});
	});
}

module.exports.delete = function (req, res, next) {
	User.destroy({id: req.body.id}, function(err, user) {
		if (err) return next(err);
		res.send({
			message: 'Usuário removido',
			data: user
		});
	});
}

module.exports.get = function (req, res, next) {
	User.findOne({id: req.params.id}, function(err, user) {
		if (err) return next(err);
		res.send({
			message: 'Usuário encontrado',
			data: user
		});
	});
}

module.exports.getAll = function (req, res, next) {
	User.find({}, function(err, users) {
		if (err) return next(err);
		res.send({
			message: 'Usuário encontrado',
			data: users
		});
	});
}

module.exports.login = function (req, res, next) {
	if (!req.body.email) {
		return next('Email não informado para login');
	}
	if (!req.body.password) {
		return next('Senha não informada para login');
	}

	User.findOne({email : req.body.email}, function(err, user) {
		if (err) return next(err);
		if (!user) return next('Email ou senha incorretos.');

		bcrypt.compare(req.body.password, user.password, function(err, match) {
      if (err) return callback(err);
      if (!match) {
        return res.status(401).send({
          message: 'Email ou senha incorretos.'
        });
      }
      req.session.save(function(err) {
				if (err) return next(err);
				req.session.user = user;
				res.send({
					message: 'Autenticação realizada',
					data: user
				});

			});
    });
	});
}

module.exports.logout = function(req, res, next) {
  req.session.destroy(function(err) {
    if (err) return next(err);
    res.redirect('/');
  });
};