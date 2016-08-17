angular.module('app')
.controller('voirSeanceController', function($scope, $cordovaFile, $stateParams)
{
	$scope.title = $stateParams.nom + ' : ' + dateToStr(new Date(parseInt($stateParams.date.replace('.json', ''))));
	$scope.seance = {};
	$scope.stats = {};
	$scope.historiqueSeance = [];
	$scope.color = ['button-balanced', 'button-energized', 'button-assertive'];

	$scope.chargerLaSeance = function()
	{
		// On ouvre le fichier seance
		$cordovaFile.readAsText(cordova.file.externalApplicationStorageDirectory + 'seances/'+ $stateParams.type + '/', $stateParams.nom + '.json')
		.then(function(result)
		{
			$scope.seance = JSON.parse(result);
			// On ouvre le fichier de statistiques
			$cordovaFile.readAsText(cordova.file.externalApplicationStorageDirectory + 'seances/'+ $stateParams.type + '/' + $stateParams.nom + '/', 'stats.json')
			.then(function(statistiques)
			{
				$scope.stats = JSON.parse(statistiques);
				// Puis on ouvre cette seance en particulier
				$cordovaFile.readAsText(cordova.file.externalApplicationStorageDirectory + 'seances/'+ $stateParams.type + '/' + $stateParams.nom + '/', $stateParams.date)
		    	.then(function (data) 
		    	{	
					var lastSeance = JSON.parse(data);

					for(var i = 0; i < $scope.seance.liste_exos.length; i++)
					{
						var obj = {
							nbSeries : $scope.seance.liste_exos[i].nbSeries,
							nbRepsAFaire : lastSeance[i].nbRepsAFaire,
							lesSeries : [],
							tas : lastSeance[i].tas
						};

						for(var j = 0; j < $scope.seance.liste_exos[i].nbSeries; j++)
						{
							var serie = {
								nbRepsEffectue : lastSeance[i].lesSeries[j].nbRepsEffectue,
								ressenti : lastSeance[i].lesSeries[j].ressenti,
								tempsTension : 0
							};
							obj.lesSeries.push(serie);					
						}
						$scope.historiqueSeance.push(obj);
					}	
		      	}, failHandler);
		    }, failHandler);
	    }, failHandler);
	}

	function dateToStr(date)
	{
		// Journée
		var jour = date.getDate();
		jour = (jour < 10 ? '0' + jour : jour);

		var mois = (date.getMonth() +1);
		mois = (mois < 10 ? '0' + mois : mois);

		var journee = jour + '/' + mois + '/' + date.getFullYear();

		// Horaire
		var heures = date.getHours();
		heures = (heures < 10 ? '0' + heures : heures);

		var minutes = date.getMinutes();
		minutes = (minutes < 10 ? '0' + minutes : minutes);

		var horaire = heures + ':' + minutes;

		return journee + ' - ' + horaire;					
	}
});