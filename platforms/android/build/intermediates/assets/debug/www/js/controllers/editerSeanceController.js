angular.module('app')
.controller('editerSeanceController', function($scope, $cordovaFile, $ionicPopup, $stateParams)
{
	$scope.exercice = {};
	$scope.seance = {
		nom : '',
		liste_exos : []
	};
	var cpt = 0;

	$scope.allExos = [];
	$scope.type = $stateParams.type;
	var exoAEditer = -1;

	// Récupération des données
	$scope.init = function()
	{
		// Par defaut le bouton porte ce nom
		$scope.EXO_TXT = "Ajouter un exercice";

		// On va chercher l'ensemble des exercices déjà créés
		listDir(cordova.file.externalApplicationStorageDirectory + 'exercices', function(fichiers)
		{
			for(i in fichiers)
			{
				// On ouvre le fichier
				$cordovaFile.readAsText(cordova.file.externalApplicationStorageDirectory + 'exercices', fichiers[i].name)
				.then(function(result)
				{
					var json = JSON.parse(result);
					$scope.allExos.push(json);
				}, failHandler);					
			}		
		});

		// On va également chercher l'ensemble des groupes d'exercices
		$scope.groupes = [
			"Triade", "Squats", "Abdos", "Isolation bras", "Isolation jambe"
		];

		// On charge la séance à editer
		$cordovaFile.readAsText(cordova.file.externalApplicationStorageDirectory + 'seances/'+$stateParams.type, $stateParams.nom)
    	.then(function (data) {
    		var json = JSON.parse(data);

    		$scope.seance = json;

			// Exo par defaut
			$scope.exercice.exoChoisi = $scope.allExos[0];
			$scope.exercice.groupeChoisi = $scope.groupes[0];
			$scope.exercice.typeEvolution = "mode";
			$scope.exercice.typeSerie = "serieNormales";
		});
	}
	
	// Ajout d'un exercice
	$scope.ajouterExercice = function()
	{
		if($scope.EXO_TXT == "Confirmer l'exercice")
		{
			$scope.EXO_TXT = "Ajouter un exercice";

			// On ajoute au json
			var data = 
			{
				id : 			cpt++,
				nom : 			$scope.exercice.exoChoisi.nom,
				img : 			$scope.exercice.exoChoisi.img,
				groupe : 		$scope.exercice.groupeChoisi,
				nbSeries : 		$scope.exercice.nbSeries,
				nbReps : 		$scope.exercice.nbReps,
				typeEvolution : $scope.exercice.typeEvolution,
				typeSerie : 	$scope.exercice.typeSerie,
				ris : 			$scope.exercice.ris,
				repos : 		$scope.exercice.repos
			};

			$scope.seance.liste_exos.push(data);
			$scope.afficherForm = false;
		}
		else if($scope.EXO_TXT == "Editer l'exercice")
		{
			$scope.EXO_TXT = "Ajouter un exercice";
			$scope.afficherForm = false;

			// On ajoute au json
			var data = 
			{
				id : 			$scope.seance.liste_exos[exoAEditer].id,
				nom : 			$scope.exercice.exoChoisi.nom,
				img : 			$scope.exercice.exoChoisi.img,
				groupe : 		$scope.exercice.groupeChoisi,
				nbSeries : 		$scope.exercice.nbSeries,
				nbReps : 		$scope.exercice.nbReps,
				typeEvolution : $scope.exercice.typeEvolution,
				typeSerie : 	$scope.exercice.typeSerie,
				ris : 			$scope.exercice.ris,
				repos : 		$scope.exercice.repos
			};

			$scope.seance.liste_exos[exoAEditer] = data;
		}
		else
		{
			$scope.EXO_TXT = "Confirmer l'exercice";

			// On verifie tous les champs
			$scope.afficherForm = true;			
		}
	}

	// Validation d'une séance
	$scope.editerSeance = function()
	{
		if(($scope.seance.nom + ".json") != $stateParams.nom)
		{
			// On supprime l'ancienne séance
			$cordovaFile.removeFile(cordova.file.externalApplicationStorageDirectory + 'seances/' + $scope.type + '/', $stateParams.nom)
		    .then(function(result) {
	        	var nomDossier = $stateParams.nom.replace('.json', '');
	        	$cordovaFile.removeDir(cordova.file.externalApplicationStorageDirectory + 'seances/' + $scope.type + '/', nomDossier)
	        	.then(function(result) {
	        		// On définit un nom de fichier unique
					nomUnique($scope.seance.nom, ".json", cordova.file.externalApplicationStorageDirectory + "seances/" + $stateParams.type, $cordovaFile, function(nomFichier)
					{
						$cordovaFile.createFile(cordova.file.externalApplicationStorageDirectory + 'seances/' + $stateParams.type + '/', nomFichier, true)
						.then(function(fileEntry) {
							$cordovaFile.writeFile(cordova.file.externalApplicationStorageDirectory + 'seances/' + $stateParams.type + '/', nomFichier, JSON.stringify($scope.seance), true)
							.then(function (success)
							{
								// On définit le nom du dossier
								var nomDossier = nomFichier.replace('.json', '');

								// On crée un dossier pour cette séance type
			    				$cordovaFile.createDir(cordova.file.externalApplicationStorageDirectory + 'seances/' + $stateParams.type, nomDossier, false)
			    				.then(function(success)
								{
									// On crée un fichier stats.json 
				    				$cordovaFile.createFile(cordova.file.externalApplicationStorageDirectory + 'seances/' + $stateParams.type + '/' + nomDossier + '/', 'stats.json', true)
									.then(function(fileEntry) {
										// On définit la structure du fichier
										var stats = {
											'nbBoucle':0,
											'boucles':[{
												'nbSeances':0,
												'derniereSeance':'',
												'exos':[]
											}]
										};

										$cordovaFile.writeFile(cordova.file.externalApplicationStorageDirectory + 'seances/' + $stateParams.type + '/' + nomDossier  + '/', 'stats.json', JSON.stringify(stats), true)
										.then(function (success)
										{
											$scope.seance = {};
											$scope.seance.liste_exos = [];
											cpt = 0;
											
											$ionicPopup.alert({
											    title: "Modification",
											    template: "Votre séance a bien été modifiée"
											});
										}, failHandler);
									}, failHandler);					
								}, failHandler);
							}, failHandler);    				
						}, failHandler);
					});
	        	}, failHandler);		        	
	        }, failHandler);
		}
		else
		{
			// On supprime les anciennes séances effectués
			var nomDossier = $scope.seance.nom;
			$cordovaFile.removeRecursively(cordova.file.externalApplicationStorageDirectory + 'seances/' + $stateParams.type + '/', nomDossier)
        	.then(function(result) {
        			$cordovaFile.writeFile(cordova.file.externalApplicationStorageDirectory + 'seances/' + $stateParams.type + '/', $stateParams.nom, JSON.stringify($scope.seance), true)
				.then(function (success)
				{
					// On crée un dossier pour cette séance type
    				$cordovaFile.createDir(cordova.file.externalApplicationStorageDirectory + 'seances/' + $stateParams.type, nomDossier, false)
    				.then(function(success)
					{
						// On crée un fichier stats.json 
	    				$cordovaFile.createFile(cordova.file.externalApplicationStorageDirectory + 'seances/' + $stateParams.type + '/' + nomDossier + '/', 'stats.json', true)
						.then(function(fileEntry) {
							// On définit la structure du fichier
							var stats = {
								'nbBoucle':0,
								'boucles':[{
									'nbSeances':0,
									'derniereSeance':'',
									'exos':[]
								}]
							};

							$cordovaFile.writeFile(cordova.file.externalApplicationStorageDirectory + 'seances/' + $stateParams.type + '/' + nomDossier  + '/', 'stats.json', JSON.stringify(stats), true)
							.then(function (success)
							{
								$scope.seance = {};
								$scope.seance.liste_exos = [];
								cpt = 0;
								
								$ionicPopup.alert({
								    title: "Modification",
								    template: "Votre séance a bien été modifiée"
								});
							}, failHandler);
						}, failHandler);					
					}, failHandler);
				}, failHandler);  
        	}, failHandler);
		}		
	}

	// Suppression d'un exercice
	$scope.delete = function(id)
	{
		for(var i = 0; i < $scope.seance.liste_exos.length; i++)
		{
			if($scope.seance.liste_exos[i].id == id)
				$scope.seance.liste_exos.splice(i, 1);
		}
	}

	// Edition d'un exercice
	$scope.edit = function(id)
	{
		for(var i = 0; i < $scope.seance.liste_exos.length; i++)
		{
			if($scope.seance.liste_exos[i].id == id)
				exoAEditer = i;
		}

		for(var i = 0; i < $scope.allExos.length; i++)
		{
			if($scope.allExos[i].nom == $scope.seance.liste_exos[exoAEditer].nom)
				$scope.exercice.exoChoisi = $scope.allExos[i];
		}

		$scope.exercice = $scope.seance.liste_exos[exoAEditer];
		$scope.EXO_TXT = "Editer l'exercice";
		$scope.afficherForm = true;
	}
});