angular.module('app')
.controller('effectuerSeanceController', function($scope, $cordovaFile, $stateParams, $timeout, $ionicPopup, $interval)
{	
	$scope.seance = {};
	$scope.historiqueSeance = [];
	$scope.stats = {};
	$scope.classTAS = [];

	// Variable pour la séance en cours
	$scope.exoEnCours = 0; 
	$scope.reposRestant = 0;
	$scope.serieEnCours = 0;
	$scope.reposEnCours = false;

	$scope.more_detail = false;
	$scope.afficherNbRep = false;
	$scope.afficherTAS = false;

	// Variable pour l'horloge courante
	$scope.minute = 0;
	$scope.heure = 0;
	$scope.seconde = 0;

	$scope.totalRepsEnCours = 0;

	// Type de séance
	$scope.type = $stateParams.type;

	var contientEchauffement = false;

	// Cercle progression
	var bar = new ProgressBar.Circle(document.getElementById('container'), {
	  strokeWidth: 6,
	  easing: 'easeInOut',
	  duration: 1,
	  color: '#29ABD6',
	  trailColor: '#030303',
	  trailWidth: 6,
	  svgStyle: null
	});

	$scope.color = ['button-balanced', 'button-energized', 'button-assertive'];
	var media = new Media( getPhoneGapPath() + "data/beep.mp3", null, mediaError);

	function mediaError(err)
	{
		alert("Error media : " + JSON.stringify(err));
	}

	function traduireTempsChrono(totalSec)
	{
		var nbMin = Math.floor(totalSec / 60);
		var nbSec = totalSec % 60;
		nbSec = nbSec < 10 && nbMin > 0 ? '0' + nbSec : nbSec;

		return (nbMin == 0 ? (nbSec + '"') : (nbMin + "'" + nbSec + '"'));
	}

	var barVars = {
		cpt : 0,
		intervalAnim : null,
		intervalTemps : null,
		nbSec : 0,
		nbSecTotal : 0,
		animer : function()
		{
			if(this.cpt <= 1)
		  	{
		  		bar.animate(this.cpt);  // Number from 0.0 to 1.0
		  		this.cpt += (1 / 100) / this.nbSecTotal;  
		  	}
		},
		chrono : function()
		{
			--this.nbSec;
			$scope.tempsRepos = traduireTempsChrono(this.nbSec);

			if(this.nbSec < 5)			
				media.play();	
		},
		clear : function()
		{
			$interval.cancel(this.intervalAnim);
	 		$interval.cancel(this.intervalTemps);

	 		if($scope.NOM_NEXT == "Début séance")
	 		{
	 			if($scope.type == 'Musculation')
	 				$scope.afficherTAS = true;

	 			if($scope.seance.liste_exos[$scope.exoEnCours].nbSeries == 1)		 		
		 			$scope.NOM_NEXT = "Prochain exercice";
		 		else
	 				$scope.NOM_NEXT = "Prochaine série";
	 		}	 			 		
	 		else
	 		{
	 			// On modifie le nom du bouton
		 		if($scope.seance.liste_exos[$scope.exoEnCours].nbSeries == 1)	 		
		 			$scope.NOM_NEXT = "Prochain exercice";		 		
		 		else 
		 		{
		 			if($scope.exoEnCours != $scope.seance.liste_exos.length - 1)
		 			{
		 				if($scope.serieEnCours == $scope.seance.liste_exos[$scope.exoEnCours].nbSeries - 1)			
							$scope.NOM_NEXT = "Prochain exercice"; //  dernière série
						else if($scope.serieEnCours == $scope.seance.liste_exos[$scope.exoEnCours].nbSeries)
						{
							$scope.NOM_NEXT = "Prochaine série";
							$scope.serieEnCours = 0;
							++$scope.exoEnCours;
							$scope.totalRepsEnCours = 0;
						}
		 			}
		 			else // Dernier exo
		 			{
		 				if($scope.serieEnCours == $scope.seance.liste_exos[$scope.exoEnCours].nbSeries - 1)			
							$scope.NOM_NEXT = "Fin de séance";
		 			}
				}

				$scope.afficherNbRep = false;
	 		}

	 		$scope.title = $scope.seance.nom + ' - ' + $scope.seance.liste_exos[$scope.exoEnCours].nom + ' (' + ($scope.serieEnCours + 1) + '/' + $scope.seance.liste_exos[$scope.exoEnCours].nbSeries + ')';		
			
			// Nous ne somme pu en repos
	 		$scope.reposEnCours = false;
	 		this.cpt = 0;
		},
		debuterChrono : function(nbSec)
		{
			var obj = this;
			this.nbSecTotal = nbSec - 1;
			this.nbSec = nbSec;
			this.intervalAnim = $interval(function(){obj.animer();}, 10);
			this.intervalTemps = $interval(function(){obj.chrono();}, 1000);
			$timeout(function(){obj.clear();}, nbSec * 1000 + 100);

			$scope.tempsRepos = traduireTempsChrono(this.nbSec);
		}
	};

	$scope.chargerSeance = function()
	{	
		$cordovaFile.readAsText(cordova.file.externalApplicationStorageDirectory + 'seances/'+$stateParams.type, $stateParams.nom)
    	.then(function (data) {
    		var json = JSON.parse(data);
			$scope.seance = json;

			if($stateParams.type == "Musculation" || $stateParams.type == "Cardio")
			{
				// Voir pour mettre le contenu de l'échauffement
				$scope.NOM_NEXT = "Début échauffement";
				$scope.title = $scope.seance.nom + ' - ' + 'Echauffement';
				contientEchauffement = true;
			}
			else
			{
				$scope.NOM_NEXT = "Début séance";
				$scope.title = $scope.seance.nom + ' - ' + $scope.seance.liste_exos[exoEnCours].nom;
			}
			
			$scope.HORLOGE = '00h00:00';

			var nomDossier = ($stateParams.nom).replace(".json", "");
			
			// On ouvre le fichier de stats
			$cordovaFile.readAsText(cordova.file.externalApplicationStorageDirectory + 'seances/' + $stateParams.type + '/' + nomDossier, 'stats.json')
		    .then(function (data) {		    	
		    	$scope.stats = JSON.parse(data);

		    	if($scope.stats.boucles[$scope.stats.nbBoucle].nbSeances == 0)
		    	{
		    		for(var i = 0; i < $scope.seance.liste_exos.length; i++)
					{
						var obj = {
							nbSeries : $scope.seance.liste_exos[i].nbSeries,
							nbRepsAFaire : $scope.seance.liste_exos[i].nbReps,
							lesSeries : [],
							tas : []
						};

						var tabClass = [];
						for(var j = 0; j < 6; j++)
							tabClass.push('button-stable');

						for(var j = 0; j < $scope.seance.liste_exos[i].nbSeries; j++)
						{
							var serie = {
								nbRepsEffectue : $scope.seance.liste_exos[i].nbReps,
								ressenti : 0,
								tempsTension : 0
							};
							obj.lesSeries.push(serie);					
						}
						$scope.historiqueSeance.push(obj);
						$scope.classTAS.push(tabClass);
					}
		    	}
		    	else
		    	{
		    		// On ouvre le dernier fichier
					$cordovaFile.readAsText(cordova.file.externalApplicationStorageDirectory + 'seances/' + $stateParams.type + '/' + nomDossier, $scope.stats.boucles[$scope.stats.nbBoucle].derniereSeance)
		    		.then(function (data) {
		    			var lastSeance = JSON.parse(data);
		    			for(var i = 0; i < $scope.seance.liste_exos.length; i++)
						{
							var obj = {
								nbSeries : $scope.seance.liste_exos[i].nbSeries,
								nbRepsAFaire : lastSeance[i].nbRepsAFaire + 1,
								lesSeries : [],
								tas : lastSeance[i].tas
							};

							
							var tabClass = [];
							for(var j = 0; j < 6; j++)
							{
								if(lastSeance[i].tas.indexOf(j + 1) != -1)
									tabClass.push('button-balanced');
								else
									tabClass.push('button-stable');
							}

							for(var j = 0; j < $scope.seance.liste_exos[i].nbSeries; j++)
							{
								var serie = {
									nbRepsEffectue : lastSeance[i].lesSeries[j].nbRepsEffectue + 1,
									ressenti : 0,
									tempsTension : 0
								};
								obj.lesSeries.push(serie);					
							}
							$scope.historiqueSeance.push(obj);
							$scope.classTAS.push(tabClass);
						}
		    		}, failHandler);
		    	}
		    }, failHandler);		
      	}, failHandler);	
	}

	function lancerHorloge()
	{		
		$scope.debut = Date.now();
		$scope.intervalHorloge = $interval(function(){ajouterUneSeconde(); }, 1000);
	}

	function ajouterUneSeconde()
	{
		++($scope.seconde);

		if($scope.seconde >= 60)
		{
			$scope.seconde -= 60;
			++($scope.minute);

			if($scope.minute >= 60)
			{
				$scope.minute -= 60;
				++($scope.heure);
			}
		}

		$scope.HORLOGE = ($scope.heure < 10 ? '0' + $scope.heure : $scope.heure) + 'h' 
						+ ($scope.minute < 10 ? '0' + $scope.minute : $scope.minute) + ':'
						+ ($scope.seconde < 10 ? '0' + $scope.seconde : $scope.seconde);
	}

	$scope.ressenti = function(lvl)
	{
		$scope.historiqueSeance[$scope.exoEnCours].lesSeries[$scope.serieEnCours - 1].ressenti = lvl;
	}

	$scope.tas = function(t)
	{
		var index = $scope.historiqueSeance[$scope.exoEnCours].tas.indexOf(t);
		if(index == -1){
			$scope.historiqueSeance[$scope.exoEnCours].tas.push(t);
			$scope.classTAS[$scope.exoEnCours][t-1] = 'button-balanced';
		}
		else
		{
			$scope.historiqueSeance[$scope.exoEnCours].tas.splice(index, 1);
			$scope.classTAS[$scope.exoEnCours][t-1] = 'button-stable';
		}			
	}

	$scope.moins = function()
	{
		--($scope.historiqueSeance[$scope.exoEnCours].lesSeries[$scope.serieEnCours - 1].nbRepsEffectue);
		--($scope.totalRepsEnCours);
	}

	$scope.plus = function()
	{
		++($scope.historiqueSeance[$scope.exoEnCours].lesSeries[$scope.serieEnCours - 1].nbRepsEffectue);
		++($scope.totalRepsEnCours);
	}

	function enregistrerSeance() 
	{
		$interval.cancel($scope.intervalHorloge);

		var nomFichier = Date.now() + ".json";
		var nomDossier = ($stateParams.nom).replace(".json", "");

		// On crée le fichier de cette séance
		$cordovaFile.createFile(cordova.file.externalApplicationStorageDirectory + 'seances/' + $stateParams.type + '/' + nomDossier, nomFichier, true)
		.then(function(fileEntry) {
			$cordovaFile.writeFile(cordova.file.externalApplicationStorageDirectory + 'seances/' + $stateParams.type + '/' + nomDossier, nomFichier, JSON.stringify($scope.historiqueSeance), true)
			.then(function (success)
			{
				// On modifie le fichier stat	
				($scope.stats.boucles[$scope.stats.nbBoucle].nbSeances)++;
				$scope.stats.boucles[$scope.stats.nbBoucle].derniereSeance = nomFichier;

				// S'il s'agit de la première séance
				if($scope.stats.boucles[$scope.stats.nbBoucle].nbSeances == 1)
				{
					for(var i = 0; i < $scope.historiqueSeance.length; i++)
					{
						// On prévoit les variables
						var tas = [$scope.historiqueSeance[i].tas];
						var modeCourant = $scope.historiqueSeance[i].nbRepsAFaire;
						var modeValide = true;
						var totalReps = 0;

						for(var j = 0; j < $scope.historiqueSeance[i].lesSeries.length; j++)
						{
							// On verifie que le mode est bien valide
							if(modeValide && $scope.historiqueSeance[i].lesSeries[j].nbRepsEffectue < modeCourant)
								modeValide = false;
							
							totalReps += $scope.historiqueSeance[i].lesSeries[j].nbRepsEffectue;
						}

						// On vérifie les stats
						var nbRepsMax = totalReps;
						var nbRepsMin = totalReps;

						var modeMin = 0, modeMax = 0;
						if(modeValide)
						{
							modeMin = modeCourant;
							modeMax = modeCourant;
						}

						// On crée l'objet json
						var obj = {
							'tas': tas,
							'nbRepsMax' : nbRepsMax,
							'nbRepsMin' : nbRepsMin,
							'modeMin' : modeMin,
							'modeMax' : modeMax
						};

						// On ajoute les stats
						$scope.stats.boucles[$scope.stats.nbBoucle].exos.push(obj);
					}
				}
				else
				{
					// On modifie une à une les stats
					for(var i = 0; i < $scope.historiqueSeance.length; i++)
					{
						// On prévoit les variables
						var modeCourant = $scope.historiqueSeance[i].nbRepsAFaire;
						var modeValide = true;
						var totalReps = 0;

						for(var j = 0; j < $scope.historiqueSeance[i].lesSeries.length; j++)
						{
							// On verifie que le mode est bien valide
							if(modeValide && $scope.historiqueSeance[i].lesSeries[j].nbRepsEffectue < modeCourant)
								modeValide = false;
							
							totalReps += $scope.historiqueSeance[i].lesSeries[j].nbRepsEffectue;
						}

						// On ajoute les stats
						if($scope.historiqueSeance[i].tas != 0)	
							$scope.stats.boucles[$scope.stats.nbBoucle].exos[i].tas.push($scope.historiqueSeance[i].tas);

						$scope.stats.boucles[$scope.stats.nbBoucle].exos[i].nbRepsMax = $scope.stats.boucles[$scope.stats.nbBoucle].exos[i].nbRepsMax < totalReps ? totalReps : $scope.stats.boucles[$scope.stats.nbBoucle].exos[i].nbRepsMax;
						$scope.stats.boucles[$scope.stats.nbBoucle].exos[i].nbRepsMin = $scope.stats.boucles[$scope.stats.nbBoucle].exos[i].nbRepsMin > totalReps ? totalReps : $scope.stats.boucles[$scope.stats.nbBoucle].exos[i].nbRepsMin;
						
						if(modeValide)
						{
							$scope.stats.boucles[$scope.stats.nbBoucle].exos[i].modeMax = $scope.stats.boucles[$scope.stats.nbBoucle].exos[i].modeMax < modeCourant ? modeCourant : $scope.stats.boucles[$scope.stats.nbBoucle].exos[i].modeMax;
							$scope.stats.boucles[$scope.stats.nbBoucle].exos[i].modeMin = $scope.stats.boucles[$scope.stats.nbBoucle].exos[i].modeMin > modeCourant ? modeCourant : $scope.stats.boucles[$scope.stats.nbBoucle].exos[i].modeMin;
						}
					}
				}

				// On enregistre le fichier
				$cordovaFile.writeFile(cordova.file.externalApplicationStorageDirectory + 'seances/' + $stateParams.type + '/' + nomDossier, 'stats.json', JSON.stringify($scope.stats), true)
				.then(function (success)
				{
					// On crée et enregistre la séance
					$ionicPopup.alert({
					    title: "Enregistrement",
					    template: "Bravo, vous pouvez être fier(e) de vous !"
					});
				}, failHandler);
			}, failHandler);
		}, failHandler);
	}

	$scope.suivant = function()
	{
		if(contientEchauffement && $scope.NOM_NEXT == "Début séance")
		{
			$scope.reposEnCours = true;
			barVars.debuterChrono(120);
			//barVars.debuterChrono(10);
		}
		else if($scope.NOM_NEXT == "Début échauffement")
		{
			$scope.NOM_NEXT = "Début séance";
			lancerHorloge();
		}
		else if($scope.NOM_NEXT == "Fin de séance")
		{
			enregistrerSeance();
		}
		else
		{
			if(!$scope.reposEnCours)
			{
				// Nous sommes en repos
				$scope.reposEnCours = true;
				$scope.afficherNbRep = true;		
				++$scope.serieEnCours;

				// On défini le repos
				if($scope.seance.liste_exos[$scope.exoEnCours].nbSeries == 1)
				{
		 			$scope.repos = $scope.seance.liste_exos[$scope.exoEnCours].repos;
					++$scope.exoEnCours;
					$scope.serieEnCours = 0;

					$scope.totalRepsEnCours = $scope.historiqueSeance[$scope.exoEnCours].lesSeries[$scope.serieEnCours - 1].nbRepsEffectue;
				}		 		
				else
				{
					if($scope.serieEnCours == $scope.seance.liste_exos[$scope.exoEnCours].nbSeries)
						$scope.repos = $scope.seance.liste_exos[$scope.exoEnCours].repos; // dernière série			
					else			
						$scope.repos = $scope.seance.liste_exos[$scope.exoEnCours].ris;

					$scope.totalRepsEnCours += $scope.historiqueSeance[$scope.exoEnCours].lesSeries[$scope.serieEnCours - 1].nbRepsEffectue;
				}

				// On demarre le chrono
				barVars.debuterChrono($scope.repos);
			}
		}		
	}

	$scope.changeMoreDetail = function()
	{
		$scope.more_detail = !($scope.more_detail);
	}

});