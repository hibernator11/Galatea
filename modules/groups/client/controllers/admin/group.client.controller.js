'use strict';

angular.module('groups.admin').controller('GroupAdminController', ['$scope', '$state', '$http', 'Authentication', 'groupResolve',
  function ($scope, $state, $http, Authentication, groupResolve) {
    $scope.authentication = Authentication;
    $scope.group = groupResolve;
    
    $scope.remove = function (group) {
      if (confirm('¿Estás seguro que desea eliminar el grupo?')) {
        if (group) {
          group.$remove();

          $scope.groups.splice($scope.groups.indexOf(group), 1);
        } else {
          $scope.group.$remove(function () {
            $state.go('admin.groups');
          });
        }
      }
    };

    $scope.update = function (isValid) {
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'groupForm');

        return false;
      }

      var group = $scope.group;
      
      group.$update(function () {
        $state.go('admin.group', {
          groupId: group._id
        });
      }, function (errorResponse) {
        $scope.error = errorResponse.data.message;
      });
    };
    
    $scope.removeComment = function (commentId, index){
        
        $http({
            url: 'api/admin/groups/removeComment',
            method: "POST",
            data: { 'groupId' : $scope.group._id,
                    'commentId': commentId}
        })
        .then(function(response) {
            // success
            $scope.messageok = response.data.message;
            $scope.group.comments.splice(index, 1);
        },
        function(response) { // optional
            // failed
            $scope.messageok = '';
            $scope.error = response.data.message;
        });
    };
    
    $scope.updateComment = function (commentId, data){
        
        $http({
            url: 'api/admin/groups/updateComment',
            method: "POST",
            data: { 'groupId' : $scope.group._id,
                    'commentId': commentId,
                    'data' : data
                  }
        })
        .then(function(response) {
            // success
            $scope.messageok = response.data.message;
        },
        function(response) { // optional
            // failed
            $scope.messageok = '';
            $scope.error = response.data.message;
        });
    };
    
    $scope.setBlocked = function (){
        
        $http({
            url: 'api/admin/groups/setStatus',
            method: "POST",
            data: { 'groupId' : $scope.group._id,
                    'status' : 'blocked'}
        })
        .then(function(response) {
            // success
            $scope.messageok = response.data.message;
            $scope.group.status = 'blocked';
        },
        function(response) { // optional
            // failed
            $scope.messageok = '';
            $scope.error = response.data.message;
        });
    };
    
    $scope.setPublic = function (){
        
        $http({
            url: 'api/admin/groups/setStatus',
            method: "POST",
            data: { 'groupId' : $scope.group._id,
                    'status' : 'public'}
        })
        .then(function(response) {
            // success
            $scope.messageok = response.data.message;
            $scope.group.status = 'public';
        },
        function(response) { // optional
            // failed
            $scope.messageok = '';
            $scope.error = response.data.message;
        });
    };
    
    $scope.activateMember = function(item) {
        $http({
            url: 'api/admin/groups/setStatusMember',
            method: "POST",
            data: { 'groupId':  $scope.group._id,
                    'userId' :  item.user._id,
                    'status' :  'activo'}
        })
        .then(function(response) {
            // success
            $scope.messageok = "Usuario activado correctamente";
            $scope.group = response.data;
        }, 
        function(response) { // optional
            // failed
            $scope.error = response.data.message;
        });
    };
    
    $scope.deactivateMember = function(item) {
        $http({
            url: 'api/admin/groups/setStatusMember',
            method: "POST",
            data: { 'groupId':  $scope.group._id,
                    'userId' :  item.user._id,
                    'status' : 'inactivo'}
        })
        .then(function(response) {
            // success
            $scope.messageok = "Usuario bloqueado correctamente";
            $scope.group = response.data;
        }, 
        function(response) { // optional
            // failed
            $scope.error = response.data.message;
        });
    };
    
    $scope.getUsersLike = function(val) {
        // load users like
        return $http.get('/api/userslike/' + val)
        .then(function(response){
            return response.data.map(function(item){
                var result = {
                        displayName:item.displayName, 
                        userId: item._id,
                        profileImageURL: item.profileImageURL
                    };
                return result;
            });
        });
               
    };
    
    $scope.addMemberByAdminGroup = function(item) {
      
        var found = false;
        for(var i = 0; i <  $scope.group.members.length; i++) {
            if ($scope.group.members[i].user._id === item.userId) {
                found = true;
                break;
            }
        }

        if(!found){

            $http({
                url: 'api/admin/groups/addGuestMember',
                method: "POST",
                data: { 'groupId':  $scope.group._id,
                        'userId' :  item.userId}
            })
            .then(function(response) {

                var Indata = {'toUserId': item.userId, 
                          'subject': 'Te han invitado a un grupo',
                          'message': 'Te han invitado a un grupo. Haz click en el siguiente enlace para aceptar la invitación.',
                          'url': '/groups/accept/' + $scope.group._id};

                $http.post('api/auth/sendEmail', Indata).success(function (response) {
                    // Show user success message and clear form
                    $scope.success = response.message;

                }).error(function (response) {
                    // Show user error message and clear form
                    $scope.error = response.message;
                });

                // success
                $scope.group = response.data;
                $scope.messageok = "Solicitud enviada. El usuario debe aceptar tu invitación.";
                $scope.memberName = '';
            }, 
            function(response) { // optional
                // failed
                $scope.messageok = '';
                $scope.error = response.data.message;
            });

        }else{
            $scope.messageok = '';
            $scope.error = 'El usuario ' + item.displayName + ' ya forma parte del grupo.';
        }
    };
    
    $scope.removeMember = function (item){
        $http({
            url: 'api/admin/groups/removeMember',
            method: "POST",
            data: { 'groupId' :  $scope.group._id,
                    'userId'  :  item.user._id}
        })
        .then(function(response) {
            // success
            $scope.group = response.data;
            $scope.messageok = "Usuario eliminado correctamente.";
        }, 
        function(response) { // optional
            // failed
            $scope.messageok = '';
            $scope.error = response.data.message;
        });
    };
  }
]);
