// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('app', ['ionic', 'ngRoute', 'ngCordova'])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    if(window.cordova && window.cordova.plugins.Keyboard) {
      // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
      // for form inputs)
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);

      // Don't remove this line unless you know what you are doing. It stops the viewport
      // from snapping when text inputs are focused. Ionic handles this internally for
      // a much nicer keyboard experience.
      cordova.plugins.Keyboard.disableScroll(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }
    // On retire la mise en veille
    if(window.plugins && window.plugins.insomnia)
      window.plugins.insomnia.keepAwake();
  });
})

// Routing
.config(function($stateProvider, $urlRouterProvider) {
  $urlRouterProvider.otherwise('/');  
  
  $stateProvider
  // Accueil
  .state('accueil', {
    url: '/',
    templateUrl: 'views/accueil.html'
  })
  // Différents types de séances
  .state('listeSeances', {
    cache: false,
    url: '/listeSeances/:type',
    templateUrl: 'views/listeSeances.html',
    controller: 'listeSeancesController'
  })
  // Liste des exercices
  .state('listeExercices', {
    cache: false,
    url: '/listeExercices',
    templateUrl: 'views/listeExercices.html',
    controller: 'listeExercicesController'
  })
  // Formulaire de création
  .state('creerExercice', {
    url: '/creerExercice',
    templateUrl: 'views/creerExercice.html',
    controller: 'creerExerciceController'
  })
  // Modifier exercice
  .state('modifierExercice', {
    cache: false,
    url: '/modifierExercice/:nom',
    templateUrl: 'views/modifierExercice.html',
    controller: 'modifierExerciceController'
  })
  .state('creerSeance', {
    cache: false,
    url: '/creerSeance/:type',
    templateUrl: 'views/creerSeance.html',
    controller: 'creerSeanceController'
  })
  // Configuration général
  .state('configuration', {
    url: '/configuration',
    templateUrl: 'views/configuration.html',
    controller: 'configurationController'
  }) 
  // Seance en cours
  .state('effectuerSeance', {
    cache: false,
    url: '/effectuerSeance/:type/:nom',
    templateUrl: 'views/effectuerSeance.html',
    controller: 'effectuerSeanceController'
  })
  // Test
  .state('test', {
    url: '/test',
    templateUrl: 'views/test.html',
    controller: 'testController'
  })
  // Historique
  .state('voirSeances', {
    cache: false,
    url: '/voirSeances/:type/:nom',
    templateUrl: 'views/voirSeances.html',
    controller: 'voirSeancesController'
  })
  .state('voirSeance', {
    cache: false,
    url: '/voirSeance/:type/:nom/:date',
    templateUrl: 'views/voirSeance.html',
    controller: 'voirSeanceController'
  })
  .state('editerSeance', {
    cache: false,
    url: '/editerSeance/:type/:nom',
    templateUrl: 'views/editerSeance.html',
    controller: 'editerSeanceController'
  });
});


function listDir(path, callback){
    window.resolveLocalFileSystemURL(path,
    function (fileSystem) {
        var reader = fileSystem.createReader();
        reader.readEntries(
        function (entries) {
            callback(entries);
        },
        function (err) {
            callback(false);
        }
      );
    }, function (err) {
        callback(false);
    }
    );
}

function failHandler(err)
{
    alert('Error : ' + JSON.stringify(err));
}

function nomUnique(nom, format, dossier, $cordovaFile, callback)
{
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    var existe = true;
    var nomFichier = nom + format;

    $cordovaFile.readAsText(dossier, nomFichier).then( 
    function(result) {            
        var ajout = "";
        for(var i = 0; i < 5; i++) 
            ajout += possible.charAt(Math.floor(Math.random() * possible.length));

        nomUnique(nom+ "-" + ajout, format, dossier, callback);     
    }, 
    function(err)
    {
        callback(nomFichier);
    });
}

function getPhoneGapPath() {
    var path = window.location.pathname;
    path = path.substr( path, path.length - 10 );
    return 'file://' + path;
};