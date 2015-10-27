var app = angular.module('loginTodo', ['angular-loading-bar'])

app.controller('Main', function ($scope, $http) {
  
  $scope.login = function (callback) {
    $http({
      url: '/user/login',
      method: 'post',
      data: $scope.user
    })
    .success(function (res) {
      window.location = '/';
    })
    .error(function (err) {
      $scope.message = err.message;
      setTimeout(function() {
        $scope.message = undefined;
        $scope.$apply();
      }, 2500);
    })
  }

})
