var Task = MODELS.task;
var Task_User = MODELS.task_user;
var async = require('async');

function setTaskRoles(tasksUser, tasks) {
	tasksUser.forEach(function (tUser) {
		var taskToEdit = tasks.filter(function (t) {
			return tUser.task_id === t.id;
		})[0];

		if (taskToEdit) {
			taskToEdit.role = tUser.role;
		}
	});
}

function canEdit(taskUser) {
	return (taskUser.role === 'ADMIN') || (taskUser.role === 'GUEST');
}

module.exports.save = function (req, res, next) {
	var task = {
		name: req.body.name,
		created_at: new Date(),
		updated_at: new Date()
	}		
	
	Task.create(task, function(err, task) {
		if (err) return next(err);
		var taskUser = {
			user_id: req.session.user.id,
			task_id: task.id,
			role: 'ADMIN',
			created_at: new Date(),
			updated_at: new Date()
		}
		Task_User.create(taskUser, function(err, taskUser) {
			if (err) return next(err);
			res.send({
				message: 'Tarefa adicionada',
				data: task
			});
		})
	});
}

module.exports.update = function (req, res, next) {
	var taskUser = {
		user_id: req.session.user.id,
		task_id: req.body.id
	}

	Task_User.findOne(taskUser, function(err, taskUser) {
		if (err) return next(err);
		if (!canEdit(taskUser)) {
			return res.status(403).send({
		    message: 'Você não tem permissão para alterar esta tarefa.'
		  });
		}

		if (taskUser.role === 'ADMIN' && (req.body.role && req.body.role !== 'ADMIN')) {
			return res.status(403).send({
		    message: 'Você não pode deixar de ser o dono de uma tarefa.'
		  });
		}

		var updateRole = function(next) {
			if (!req.body.role) return next(null, taskUser);

			var newTaskUser = {
				role: req.body.role
			};
			Task_User.update(taskUser, newTaskUser, function(err, newTaskUser) {
				if (err) return next(err);
				next(null, newTaskUser);
			});
		}
		
		var updateTask = function(err, newTaskUser) {
			if (err) return next(err);
			var task = {
				name: req.body.name,
				done: req.body.done,
				updated_at: new Date()
			}
			
			Task.update({id: req.body.id}, task, function(err, task) {
				if (err) return next(err);
				setTaskRoles(newTaskUser, task);
				res.send({
					message: 'Tarefa alterada',
					data: task[0]
				});
			});
		}

		async.series([updateRole], updateTask);
	});
}

module.exports.delete = function (req, res, next) {
	Task_User.destroy({
		task_id: req.body.id,
		user_id: req.session.user.id
	}, function(err, taskUser) {
		if (!canEdit(taskUser)) {
			return res.status(403).send({
		    message: 'Você não tem permissão para remover esta tarefa.'
		  });
		}
		Task.destroy({id: req.body.id}, function(err, task) {
			if (err) return next(err);
			res.send({
				message: 'Tarefa removida',
				data: task
			});
		});
	});
}

module.exports.get = function (req, res, next) {
	Task_User.findOne({
		task_id: req.params.id,
		user_id: req.session.user.id
	}, function(err, taskUser) {
		if (err) return next(err);
		if (!taskUser) return res.send({message: 'Tarefa não encontrada'});
		Task.findOne({id: req.params.id}, function(err, task) {
			if (err) return next(err);
			setTaskRoles([taskUser], [task]);
			res.send({
				message: 'Tarefa encontrada',
				data: task
			});
		});
	});
}

module.exports.getAll = function (req, res, next) {
	Task_User.find({
		user_id: req.session.user.id
	}, function(err, taskUser) {
		if (err) return next(err);
		if (!taskUser || !taskUser.length > 0) {
			return res.send({message: 'Você ainda não tem nenhuma tarefa'});
		}

		var tasksToFind = [];
		for (var i in taskUser) {
			tasksToFind.push({id : taskUser[i].task_id});
		}
		Task.find(tasksToFind, function(err, tasks) {
			if (err) return next(err);
			setTaskRoles(taskUser, tasks);
			res.send({
				message: 'Tarefas encontradas',
				data: tasks
			});
		});		
	});
}

module.exports.changeRole = function (req, res, next) {
	if (!req.body.user_id) {
		return res.status(400).send({message: 'Usuário não informado'});
	}

	if (!req.body.id) {
		return res.status(400).send({message: 'Tarefa não informada'});
	}

	if (!req.body.role) {
		return res.status(400).send({message: 'Permissão não informada'});
	}

	async.series([
		function (next) {
			var taskUser = {
				user_id: req.session.user.id,
				task_id: req.body.id
			}
			Task_User.findOne(taskUser, function(err, taskUser) {
				if (err) return next(err);
				if (!canEdit(taskUser)) return next(403);
				next(null, true);
			});
		}
	, function (next) {
			var taskUser = {
				user_id: req.body.user_id,
				task_id: req.body.id
			}
			Task_User.findOne(taskUser, function(err, taskUser) {
				if (err) return next(err);
				next(null, taskUser);
			});
	}], function (err, results) {
		if (err) {
			return res.status(err).send({message: 'Você não pode editar esta tarefa'});				
		}

		var roleExists = results[1];
		if (roleExists) {
			if (roleExists.role === 'ADMIN') {
				return res.status(403).send({
			    message: 'Você não pode deixar de ser o dono de uma tarefa.'
			  });
			}
			
			var newTaskUser = {
				role: req.body.role
			};
			Task_User.update(roleExists, newTaskUser, function(err, newTaskUser) {
				if (err) return next(err);
				res.send({
					message: 'Permissão alterada',
					data: newTaskUser
				});
			});
		} else {
			var taskUser = {
				user_id: req.body.user_id,
				task_id: req.body.id,
				role: req.body.role,
				created_at: new Date(),
				updated_at: new Date()
			}
			Task_User.create(taskUser, function(err, taskUser) {
				if (err) return next(err);
				res.send({
					message: 'Permissão adicionada',
					data: taskUser
				});
			});
		}
	});	
}