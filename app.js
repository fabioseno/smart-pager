/*global angular, alert*/
angular.module('smart', []);

angular.module('smart').controller('smartController', ['$scope', '$q', '$timeout', function ($scope, $q, $timeout) {
    'use strict';
    
    var totalPages = 5,
        pageSize = 5,
        pagesToBuffer = 1,
        bufferedPages = {};
    
    $scope.currentPage = 1;
    
    $scope.items = [];
    $scope.logs = [];
    
    function getLiveData(currentPage, pageSize) {
        var items = [], i,
            defer,
            data = {
                currentPage: currentPage
            };
        
        defer = $q.defer();
        
        $scope.logs.push('Retrieving page ' + currentPage + '...');
        
        $timeout(function () {
            $scope.logs.push('Page ' + currentPage + ' ready to be consumed!');
            
            for (i = 0; i < pageSize; i += 1) {
                items.push('Item ' + ((currentPage - 1) * pageSize + 1 + i));
            }
            
            data.items = items;
            
            defer.resolve(data);
        }, 2000);
        
        return defer.promise;
    }
    
    function getData(entity, currentPage, pageSize, pagesToBuffer) {
        var i = 0, startPage = 1, endPage, totalItems = pageSize, items = [],  defer;
        
        defer = $q.defer();
        
        startPage = currentPage - pagesToBuffer;
        endPage = currentPage + pagesToBuffer;
        
        if (startPage < 1) {
            startPage = 1;
        }
        
        totalItems = (endPage - startPage + 1) * pageSize;
        
        // cria estrutura de armazenamento
        if (!bufferedPages[entity]) {
            bufferedPages[entity] = {};
        }
        
        // primeiro serve a página corrente
        if (!bufferedPages[entity]['page' + currentPage]) {
            getLiveData(currentPage, pageSize).then(function (result) {
                bufferedPages[entity]['page' + result.currentPage] = result.items;
                defer.resolve(result.items);
            });
        } else {
            $timeout(function () {
                defer.resolve(bufferedPages[entity]['page' + currentPage]);
            });
        }
        
        // demais páginas
        for (i = startPage; i <= endPage; i += 1) {
            if (i !== currentPage && !bufferedPages[entity]['page' + i]) {
                getLiveData(i, pageSize).then(function (result) {
                    bufferedPages[entity]['page' + result.currentPage] = result.items; 
                });
            }
        }
        
        return defer.promise;
    }
    
    $scope.list = function (currentPage) {
        getData('users', currentPage, pageSize, pagesToBuffer).then(function (result) {
            $scope.items = result;
        });
    };
    
    $scope.list($scope.currentPage);
    
}]);