/*global angular, alert*/
angular.module('smart', []);

angular.module('smart').factory('pageBuffer',  ['$q', '$timeout', function ($q, $timeout) {
    'use strict';
    
    return function PageBuffer(pageSize, pagesToBuffer) {
        var bufferedPages = {};
        
        return {
            
            getData: function getData(currentPage, callback) {
                var i = 0, startPage = 1, endPage, items = [], defer, promise;
                
                defer = $q.defer();
                
                startPage = currentPage - pagesToBuffer;
                endPage = currentPage + pagesToBuffer;
                
                if (startPage < 1) {
                    startPage = 1;
                }
                
                // primeiro serve a página corrente
                if (!bufferedPages['page' + currentPage]) {
                    promise = callback(currentPage);
                    promise.then(function (result) {
                        bufferedPages['page' + result.currentPage] = result.items;
                        defer.resolve(result.items);
                    });
                } else {
                    //$timeout(function () {
                        $q.when(defer.resolve(bufferedPages['page' + currentPage]));
                    //});
                }
                
                // demais páginas
                for (i = startPage; i <= endPage; i += 1) {
                    if (i !== currentPage && !bufferedPages['page' + i]) {
                        promise = callback(i);
                        promise.then(function (result) {
                            bufferedPages['page' + result.currentPage] = result.items;
                        });
                    }
                }
                
                return defer.promise;
            }
        };
    };
}]);


angular.module('smart').controller('smartController', ['$scope', 'pageBuffer', 'customDataSource', function ($scope, PageBuffer, customDataSource) {
    'use strict';
    
    var pageSize = 5,
        bufferFactory = new PageBuffer(pageSize, 1);
    
    $scope.items = [];
    $scope.logs = [];
    
    $scope.list = function (currentPage) {
        bufferFactory.getData(currentPage, function (currentPage) {
            $scope.logs.push('Retrieving page ' + currentPage + '...');
            return customDataSource.getLiveData(currentPage, pageSize);
        }).then(function (result) {
            $scope.logs.push('Page ' + currentPage + ' ready to be consumed!');
            
            $scope.items = result;
        });
    };
    
    $scope.list($scope.currentPage);
    
}]);

angular.module('smart').service('customDataSource', ['$q', '$timeout', function ($q, $timeout) {
    'use strict';
    
    this.getLiveData = function getLiveData(currentPage, pageSize) {
        var items = [], i,
            defer,
            data = {
                currentPage: currentPage
            };
        
        defer = $q.defer();
        
        $timeout(function () {
            for (i = 0; i < pageSize; i += 1) {
                items.push('Item ' + ((currentPage - 1) * pageSize + 1 + i));
            }
            
            data.items = items;
            
            defer.resolve(data);
        }, 2000);
        
        return defer.promise;
    };
}]);
