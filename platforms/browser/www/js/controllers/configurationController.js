angular.module('app')
.controller('configurationController', function($scope, $stateParams, $cordovaFile)
{
	$scope.importer = function()
	{
		
	}

	$scope.exporter = function()
	{
		
	}

	$scope.valider = function()
	{
		if($scope.idMuscu != '' && $scope.passMuscu != '')
		{
			var json = "{'id':'"+$scope.idMuscu+"', 'pass': '"+$scope.passMuscu+"'}";

			$cordovaFile.readAsText(cordova.file.externalApplicationStorageDirectory, 'configuration.json').then( 
			function(result) {
				$cordovaFile.writeFile(cordova.file.externalApplicationStorageDirectory, 'configuration.json', json, true)
				.then(null, failHandler);
			}, 
			function(err)
			{
				$cordovaFile.createFile(cordova.file.externalApplicationStorageDirectory, 'configuration.json', true).then( 
				function(fileEntry) {
					$cordovaFile.writeFile(cordova.file.externalApplicationStorageDirectory, 'configuration.json', json, true)
					.then(null, failHandler);	
				});
			});			
		}		
	}
});