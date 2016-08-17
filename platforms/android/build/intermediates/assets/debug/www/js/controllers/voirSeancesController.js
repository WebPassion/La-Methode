angular.module('app')
.controller('voirSeancesController', function($scope, $cordovaFile, $stateParams, $ionicPopup)
{
	$scope.title = ($stateParams.nom).replace('.json', '');
	$scope.seances = [];
	$scope.typeSeance = $stateParams.type;
	$scope.nomSeance = $stateParams.nom;

	$scope.chargerLesSeances = function()
	{
		// On liste toutes les séances de cette séance type
		listDir(cordova.file.externalApplicationStorageDirectory + 'seances/' + $scope.typeSeance + '/' + $stateParams.nom + '/', function(fichiers)
		{
			for(i in fichiers)
			{
				if(fichiers[i].isFile && fichiers[i].name != 'stats.json')
				{
					var dateCourante = new Date(parseInt(fichiers[i].name.replace('.json', '')));
					var obj = {
						date : dateToStr(dateCourante),
						nomFichier : fichiers[i].name
					};
					$scope.seances.push(obj);
				}
			}		
		});
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

	$scope.delete = function(nomFichier)
	{
		$ionicPopup.confirm({
			title: 'Confirmation',
			template: 'Voulez-vous vraiment supprimer cette séance ?'
		}).then(function(res){
			if(res){
				$cordovaFile.removeFile(cordova.file.externalApplicationStorageDirectory + 'seances/' + $scope.typeSeance + '/'  + $stateParams.nom + '/', nomFichier)
		        .then(function(result) {

		        	for(var i = 0; i < $scope.seances.length; i++)
					{
						if($scope.seances[i].nomFichier == nomFichier)
							$scope.seances.splice(i, 1);
					}	

		            $ionicPopup.alert({
					    title: "Suppression",
					    template: "Cette séance a bien été supprimée."
					});
		        }, function(err) {
		            alert(JSON.stringify(err));
				});
			}
		});		
	}
});