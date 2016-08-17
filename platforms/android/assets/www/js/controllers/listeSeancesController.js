angular.module('app')
.controller('listeSeancesController', function($scope, $cordovaFile, $ionicPopup, $stateParams)
{
	$scope.typeSeance = $stateParams.type;
	$scope.seances = [];
	//$scope.seances = [{nomFichier:"nv2.json", nom:"NV2"}];

	$scope.chargerSeance = function()
	{
		listDir(cordova.file.externalApplicationStorageDirectory + 'seances/' + $scope.typeSeance + '/', function(fichiers)
		{
			for(i in fichiers)
			{
				if(fichiers[i].isFile)				
					ajouterFichier(fichiers[i].name);	
			}		
		});
	}

	function ajouterFichier(nomFichier)
	{
		var json = {}, obj = {nom : '', nomFichier : ''};		
		$cordovaFile.readAsText(cordova.file.externalApplicationStorageDirectory + 'seances/' + $scope.typeSeance + '/', nomFichier)
		.then(function(result)
		{
			json = JSON.parse(result);
			obj.nom = json.nom;
			obj.nomFichier = nomFichier;

			json = {};
			$scope.seances.push(obj);
		}, failHandler);
	}

	$scope.delete = function(nomFichier)
	{
		$ionicPopup.confirm({
			title: 'Confirmation',
			template: 'Voulez-vous vraiment supprimer cette séance type ?'
		}).then(function(res){
			if(res){
				$cordovaFile.removeFile(cordova.file.externalApplicationStorageDirectory + 'seances/' + $scope.typeSeance + '/', nomFichier)
		        .then(function(result) {
		        	var nomDossier = nomFichier.replace('.json', '');
		        	$cordovaFile.removeRecursively(cordova.file.externalApplicationStorageDirectory + 'seances/' + $scope.typeSeance + '/', nomDossier)
		        	.then(function(result) {
		        		for(var i = 0; i < $scope.seances.length; i++)
						{
							if($scope.seances[i].nomFichier == nomFichier)
								$scope.seances.splice(i, 1);
						}	

			            $ionicPopup.alert({
						    title: "Suppression",
						    template: "La séance type a bien été supprimée."
						});
		        	}, function(err) {
		            	alert(JSON.stringify(err));
					});		        	
		        }, function(err) {
		            alert(JSON.stringify(err));
				});
			}
		});		
	}
});

