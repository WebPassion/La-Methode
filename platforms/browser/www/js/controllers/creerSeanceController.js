angular.module('app')
.controller('creerSeanceController', function($scope, $cordovaFile, $ionicPopup, $stateParams)
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
		// On vérifie que les dossiers existe
		$cordovaFile.checkDir(cordova.file.externalApplicationStorageDirectory, 'seances')
		.then(null, function (error) {
    		$cordovaFile.createDir(cordova.file.externalApplicationStorageDirectory, 'seances', false)
    		.then(function (success)
    		{
    			$cordovaFile.createDir(cordova.file.externalApplicationStorageDirectory + 'seances', 'Musculation', false);
    			$cordovaFile.createDir(cordova.file.externalApplicationStorageDirectory + 'seances', 'Piliers', false);
    			$cordovaFile.createDir(cordova.file.externalApplicationStorageDirectory + 'seances', 'Souplesse', false);
    			$cordovaFile.createDir(cordova.file.externalApplicationStorageDirectory + 'seances', 'Cardio', false);
    		}, failHandler);
  		});			

		$cordovaFile.checkDir(cordova.file.externalApplicationStorageDirectory, 'exercices')
		.then(null, function (error) {
    		$cordovaFile.createDir(cordova.file.externalApplicationStorageDirectory, 'exercices', false);
  		});

		// Par defaut le bouton porte ce nom
		$scope.EXO_TXT = "Ajouter un exercice";

		// On va chercher l'ensemble des exercices déjà créés		
		listDir(cordova.file.externalApplicationStorageDirectory + 'exercices', function(fichiers)
		{
			if(fichiers.length == 0)
			{
				$ionicPopup.alert({
				    title: "Erreur",
				    template: "Vous devez d'abord créer des exercices avant de créer une séance type"
				});
			}

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
			"Triade", "Tractions", "Squats", "Abdos", "Isolation bras", "Colonne vertébrale", "Isolation jambe", "Oblique", "Trapèzes"
		];

		// Exo par defaut
		$scope.exercice.exoChoisi = $scope.allExos[0];
		$scope.exercice.groupeChoisi = $scope.groupes[0];
		$scope.exercice.typeEvolution = "mode";
		$scope.exercice.typeSerie = "serieNormales";
	}
	
	// Ajout d'un exercice
	$scope.ajouterExercice = function()
	{
		if($scope.EXO_TXT != "Ajouter un exercice")
		{
			$scope.afficherForm = false;

			// Données communes à tous les types
			var data = {};
			data.nom 			= $scope.exercice.exoChoisi.nom;
			data.img 			= $scope.exercice.exoChoisi.img;

			// Séances de musculation
			if($scope.type == 'Musculation')
			{				
				data.groupe 		= $scope.exercice.groupeChoisi;
				data.nbSeries 		= $scope.exercice.nbSeries;
				data.nbReps 		= $scope.exercice.nbReps;
				data.typeEvolution  = $scope.exercice.typeEvolution;
				data.typeSerie 		= $scope.exercice.typeSerie;
				data.ris 			= $scope.exercice.ris;
				data.repos 			= $scope.exercice.repos;
			}
			// Seance de souplesse
			else if($scope.type == 'Souplesse')
			{				
				data.chaqueCote 	= $scope.exercice.chaqueCote;
				data.dureeMin 		= $scope.exercice.dureeMin;
			}
			// Seances 4 piliers
			else if($scope.type == 'Piliers')
			{				
				data.dureeMin 		= $scope.exercice.dureeMin;
				data.nbSeries 		= $scope.exercice.nbSeries;
				data.nbReps 		= $scope.exercice.nbReps;
				data.ris 			= $scope.exercice.ris;
				data.repos 			= $scope.exercice.repos;
			}
			// Séances cardio
			else if($scope.type == 'Cardio')
			{				
				data.endurance 		= $scope.exercice.endurance;
			}

			if($scope.EXO_TXT == "Confirmer l'exercice")
			{
				data.id = cpt++;
				$scope.seance.liste_exos.push(data);
			}
			else
			{
				data.id = $scope.seance.liste_exos[exoAEditer].id;
				$scope.seance.liste_exos[exoAEditer] = data;
			}
			$scope.EXO_TXT = "Ajouter un exercice";
		}
		else
		{
			$scope.EXO_TXT = "Confirmer l'exercice";

			// On verifie tous les champs
			$scope.afficherForm = true;			
		}
	}

	// Validation d'une séance
	$scope.creerSeance = function()
	{
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
								    title: "Création",
								    template: "Votre séance a bien été créée"
								});
							}, failHandler);
						}, failHandler);					
					}, failHandler);
				}, failHandler);    				
			}, failHandler);
		});
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