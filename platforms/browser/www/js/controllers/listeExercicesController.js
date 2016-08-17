angular.module('app')
.controller('listeExercicesController', function($scope, $cordovaFile, $ionicPopup, $stateParams)
{
	$scope.exercices = [];

	$scope.chargerSeance = function()
	{
		listDir(cordova.file.externalApplicationStorageDirectory + 'exercices', function(fichiers)
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
		$cordovaFile.readAsText(cordova.file.externalApplicationStorageDirectory + 'exercices', nomFichier)
		.then(function(result)
		{
			json = JSON.parse(result);
			obj.nom = json.nom;
			obj.nomFichier = nomFichier;

			json = {};
			$scope.exercices.push(obj);
		}, failHandler);
	}

	$scope.delete = function(nomFichier)
	{
		$ionicPopup.confirm({
			title: 'Confirmation',
			template: 'Voulez-vous vraiment supprimer cet exercice ?'
		}).then(function(res){
			if(res){
				$cordovaFile.removeFile(cordova.file.externalApplicationStorageDirectory + 'exercices/', nomFichier)
		        .then(function(result) {

		        	for(var i = 0; i < $scope.exercices.length; i++)
					{
						if($scope.exercices[i].nomFichier == nomFichier)
							$scope.exercices.splice(i, 1);
					}	

		            $ionicPopup.alert({
					    title: "Suppression",
					    template: "L'exercice a bien été supprimé."
					});
		        }, function(err) {
		            alert(JSON.stringify(err));
				});
			}
		});		
	}
});

