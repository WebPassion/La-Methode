angular.module('app')
.controller('modifierExerciceController', function($scope, $cordovaCamera, $cordovaFile, $ionicPopup, $stateParams)
{
	$scope.exercice = {};
	$scope.exercice.image = '';
	
	$scope.init = function()
	{
		$cordovaFile.readAsText(cordova.file.externalApplicationStorageDirectory + 'exercices/', $stateParams.nom).then( 
		function(result) {						
			var json = JSON.parse(result);
			$scope.exercice.nomExo = json.nom;
			$scope.exercice.image = json.img;
			$scope.exercice.description = json.description;
		}, failHandler);
	}

	$scope.modifier = function()
	{
		if($scope.exercice.image == '' || $scope.exercice.nomExo == '')
		{
			$ionicPopup.alert({
			    title: "Erreur",
			    template: "Veuillez remplir tous les champs"
			});
		}
		else
		{
			if($stateParams.nom != $scope.exercice.nomExo + ".json")
			{
				// Si un exercice porte deja son nom, on le modifie
				nomUnique($scope.exercice.nomExo, ".json", cordova.file.externalApplicationStorageDirectory + 'exercices/', function(nomFichier)
				{
					if(nomFichier != $scope.exercice.nomExo + ".json")
						$scope.exercice.nomExo = nomFichier.replace('.json', '');

					var json = '{"nom":"'+$scope.exercice.nomExo+'","img":"'+$scope.exercice.image+'","description":"'+$scope.exercice.description+'"}';

					// création du fichier json
					$cordovaFile.createFile(cordova.file.externalApplicationStorageDirectory + 'exercices/', nomFichier, true).then( 
					function(fileEntry) {
						$cordovaFile.writeFile(cordova.file.externalApplicationStorageDirectory + 'exercices/', nomFichier, json, true)
						.then(function (result)
						{
							$ionicPopup.alert({
							    title: "Modification",
							    template: "Votre exercice a bien été modifié"
							});
						}, failHandler);	
					}, failHandler);
				});
			}
			else
			{
				var json = '{"nom":"'+$scope.exercice.nomExo+'","img":"'+$scope.exercice.image+'","description":"'+$scope.exercice.description+'"}';

				// modificaiton du fichier json
				$cordovaFile.writeFile(cordova.file.externalApplicationStorageDirectory + 'exercices/', $stateParams.nom, json, true)
				.then(function (result)
				{
					$ionicPopup.alert({
					    title: "Modification",
					    template: "Votre exercice a bien été modifié"
					});
				}, failHandler);
			}						
		}
	}

	$scope.addGalerie = function()
	{
		var options = {
			destinationType : Camera.DestinationType.FILE_URI,
			sourceType : Camera.PictureSourceType.PHOTOLIBRARY, // Camera.PictureSourceType.PHOTOLIBRARY
		};

		$cordovaCamera.getPicture(options).then(function(imageData) {
			$scope.exercice.image = imageData;
			var fileName = imageData.substr(imageData.lastIndexOf('/') + 1);
			var path = imageData.substr(0, imageData.lastIndexOf('/') + 1);

			$cordovaFile.copyFile(path, fileName, cordova.file.externalApplicationStorageDirectory + 'img/', fileName)
			.then(function(success)
			{
				$scope.exercice.image = cordova.file.externalApplicationStorageDirectory + 'img/' + fileName;
			}, failHandler);	
		}, failHandler);
	}
 
    $scope.addImage = function() {	
		var options = {
			destinationType : Camera.DestinationType.FILE_URI,
			sourceType : Camera.PictureSourceType.CAMERA, // Camera.PictureSourceType.PHOTOLIBRARY
			allowEdit : false,
			encodingType: Camera.EncodingType.JPEG,
			quality : 100,
			targetHeight : 200
		};

		document.addEventListener("deviceready", function () {
			$cordovaCamera.getPicture(options).then(function(imageData) {
				$scope.exercice.image = imageData;

				var fileName = imageData.substr(imageData.lastIndexOf('/') + 1);
				var path = imageData.substr(0, imageData.lastIndexOf('/') + 1);

				$cordovaFile.copyFile(path, fileName, cordova.file.externalApplicationStorageDirectory + 'img/', fileName)
				.then(function(success)
				{
					$scope.exercice.image = cordova.file.externalApplicationStorageDirectory + 'img/' + fileName;
				}, failHandler);		
			}, failHandler);
		});
    }
});