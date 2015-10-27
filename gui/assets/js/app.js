var app = angular.module('todo', ['angular-loading-bar'])

app.filter('elapsed', function(){
  return function(date){
    if (!date) return;
    var time = Date.parse(date),
        timeNow = new Date().getTime(),
        difference = timeNow - time,
        seconds = Math.floor(difference / 1000),
        minutes = Math.floor(seconds / 60),
        hours = Math.floor(minutes / 60),
        days = Math.floor(hours / 24);
    if (days > 1) {
        return days + " dias atrás";
    } else if (days == 1) {
        return "um dia atrás"
    } else if (hours > 1) {
        return hours + " horas atrás";
    } else if (hours == 1) {
        return "uma hora atrás";
    } else if (minutes > 1) {
        return minutes + " minutos atrás";
    } else if (minutes == 1){
        return "um minuto atrás";
    } else {
        return "alguns segundos atrás";
    }
  }
})

app.controller('Main', function ($scope, $http) {

  $scope.logout = function () {
    $http({
      url: '/user/logout',
      method: 'post',
      data: $scope.user
    })
    .success(function (res) {
      window.location = '/';
    })
    .error(function (err) {
      alert('Erro ao sair: ' + err.message);
    })
  }

  $scope.addTask = function () {
    if ($scope.task) {
      $http({
        url: '/task',
        method: 'post',
        data: $scope.task
      })
      .success(function (res) {
        $scope.tasks.push(res.data);
        $scope.task = undefined;
      })
      .error(function (err) {
        alert('Erro: ' + err.message);
      })
    }
  }

  $scope.toggleTask = function (task) {
    var newTask = angular.copy(task);
    newTask.done = !task.done;
    $http({
      url: '/task',
      method: 'put',
      data: newTask
    })
    .success(function (res) {
      task.done = res.data.done;
    })
    .error(function (err) {
      alert('Erro: ' + err.message);
    })
  }

  $scope.getAllTasks = function () {
    $http({
      url: '/task',
      method: 'get'
    })
    .success(function (res) {
      $scope.tasks = res.data
    })
    .error(function (err) {
      alert('Erro: ' + err.message);
    })
  }

  $scope.getAllTasks();

})
