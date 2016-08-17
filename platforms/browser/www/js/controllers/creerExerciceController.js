angular.module('app')
.controller('creerExerciceController', function($scope, $cordovaCamera, $cordovaFile, $ionicPopup, $stateParams)
{
	$scope.exercice = {};
	$scope.exercice.image = '';

	var enCours = false;

	// Type de séance
	$scope.type = $stateParams.type;
	
	$scope.init = function()
	{
		// On vérifie que les dossiers existe
		$cordovaFile.checkDir(cordova.file.externalApplicationStorageDirectory, 'exercices')
		.then(null, function (error) {
			$cordovaFile.createDir(cordova.file.externalApplicationStorageDirectory, 'exercices', false)
			.then(null, failHandler);
		});

		$cordovaFile.checkDir(cordova.file.externalApplicationStorageDirectory, 'img')
		.then(null, function (error) {
			$cordovaFile.createDir(cordova.file.externalApplicationStorageDirectory, 'img', false)
			.then(null, failHandler);
		});
	}

	$scope.creer = function()
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
			// Si un exercice porte deja son nom, on le modifie
			nomUnique($scope.exercice.nomExo, ".json", cordova.file.externalApplicationStorageDirectory + 'exercices/', $cordovaFile, function(nomFichier)
			{
				if(nomFichier != $scope.exercice.nomExo + ".json")
					$scope.exercice.nomExo = nomFichier.replace('.json', '');

				var json = '{"nom":"'+$scope.exercice.nomExo+'","img":"'+$scope.exercice.image+'","description":"'+$scope.exercice.description+'"}';

				// création du fichier json
				$cordovaFile.createFile(cordova.file.externalApplicationStorageDirectory + 'exercices/', nomFichier, true).then( 
				function(fileEntry) {
					$cordovaFile.writeFile(cordova.file.externalApplicationStorageDirectory + 'exercices/', nomFichier, json, true)
					.then( function(result)
					{
						$scope.exercice.image = '';
						$scope.exercice.nomExo = '';
						$scope.exercice.description = '';

						// Alert ionic
						$ionicPopup.alert({
						    title: "Création",
						    template: "L'exercice a bien été créé"
						});
					}, failHandler);
				}, failHandler);
			});			
		}
	}

	$scope.addGalerie = function()	
	{
		if(!enCours)
		{
			enCours = true;

			var options = {
				destinationType : Camera.DestinationType.FILE_URI,
				sourceType : Camera.PictureSourceType.PHOTOLIBRARY, // Camera.PictureSourceType.PHOTOLIBRARY
			};

			document.addEventListener("deviceready", function () {
				$cordovaCamera.getPicture(options).then(function(imageData) {
					$scope.exercice.image = imageData;
					var fileName = imageData.substr(imageData.lastIndexOf('/') + 1);
					var path = imageData.substr(0, imageData.lastIndexOf('/') + 1);

					$cordovaFile.copyFile(path, fileName, cordova.file.externalApplicationStorageDirectory + 'img/', fileName)
					.then(function(success)
					{
						alert("copy galerie success");
						$scope.exercice.image = cordova.file.externalApplicationStorageDirectory + 'img/' + fileName;
						enCours = false;
					}, failHandler);	
				}, failHandler);
			});
		}		
	}
 
    $scope.addImage = function() 
    {
    	if(!enCours)
    	{
			enCours = true;

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
						enCours = true;
						$scope.exercice.image = cordova.file.externalApplicationStorageDirectory + 'img/' + fileName;
					}, failHandler);		
				}, failHandler);
			});
    	}		
    }
});