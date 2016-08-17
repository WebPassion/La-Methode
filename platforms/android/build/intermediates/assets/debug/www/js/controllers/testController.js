angular.module('app')
.controller('testController', ['$scope', '$cordovaFile', '$cordovaFileTransfer', function($scope, $cordovaFile, $cordovaFileTransfer) {

	alert('testController');

	var fileDir = '';

	/*
	 List dir test and remove all dirs and files in test to start over again the test
	*/
	$scope.ClearDirectory = function() {
		alert('ClearDirectory : ' + fileDir);

		document.addEventListener("deviceready", function () {

			alert("ready clear directory");

			listDir(fileDir + 'test', 
			function(entries) {
				alert('listDir: '+ JSON.stringify(entries));

				$cordovaFile.removeRecursively(fileDir + 'test').then( 
				function() {
					alert(trinlDir + ' recursively removed');
				},
				function(err) {
					alert(fileDir + ' error: '+ JSON.stringify(err));
				});
			});

		});
	}

	$scope.changeDir = function()
	{
		fileDir = '';

		testFS();
	}

	/*
	Here some examples with proper filepath
	*/
	function testFS() {
		// Download file from 'http://www.yourdomain.com/test.jpg' to test/one/test.jpg on device Filesystem
		var hostPath = 'http://www.velior.ru/wp-content/uploads/2009/05/Test-Computer-Key-by-Stuart-Miles.jpg';
		var clientPath = fileDir + 'test.jpg';
		var fileTransferOptions = {};

		alert("testFS");

		document.addEventListener("deviceready", function () {

			alert("ready testfs");

			$cordovaFileTransfer.download(hostPath, clientPath, fileTransferOptions, true).then (
			function(result) {
				alert('downloadFile ' + JSON.stringify(result));

				// Create dir test
				$cordovaFile.createDir(fileDir, 'test').then( 
				function(dirEntry) {
					alert('create dir "test": '+ JSON.stringify(dirEntry));

					// Create dir aganin in dir test
					$cordovaFile.createDir(fileDir + 'test/', 'one').then( 
					function(dirEntry) {
						alert('create dir "test/one": ' + JSON.stringify(dirEntry));

						// Create empty file test.txt in test/again/
						$cordovaFile.createFile(fileDir + 'test/one/', 'test.txt', true).then( 
						function(fileEntry) {
							alert('create file: ' + JSON.stringify(fileEntry));

							// List of files in test/again
							listDir(fileDir + 'test/one/',  
							function(entries) {
								alert('list dir: ' + JSON.stringify(entries));

								// Write some text into file 
								$cordovaFile.writeFile(fileDir + 'test/one/', 'test.txt', 'Some text te test filewrite', true).then( 
								function(result) {
									alert('writeFile: ' + JSON.stringify(result));

									// Read text written in file
									$cordovaFile.readAsText(fileDir + 'test/one/', 'test.txt').then( 
									function(result) {
										alert('readAsText: '+ JSON.stringify(result));
									}, 
									function(err)
									{
										alert('error readAsText ' + JSON.stringify(err));
									});
								}, 
								function(err)
								{
									alert('error writeFile ' + JSON.stringify(err));
								});								
							});
						}, 
						function(err)
						{
							alert('error create file ' + JSON.stringify(err));
						});
					}, 
					function(err)
					{
						alert('error createDir /test/one/ ' + JSON.stringify(err));
					});
				}, 
				function(err)
				{
					alert('error createDir /test ' + JSON.stringify(err));
				});	
			}, 
			function(err)
			{
				alert('error downloadFile ' + JSON.stringify(err));
			});
		});
	}

	/*
	Here is what I am using for my Android and IOS apps
	Keep attention to a couple of things:
	-	Android and IOS have other directorynames for files
	-	$cordovaFile functions prefixes all pathnames with root
		$cordovaFileTransfer functions needs absolute pathnames

	Here I create the prefixes for File functions and FileTransfer functions for Android and IOS
	*/
    $scope.init = function() {

    	alert("init");

		if (ionic.Platform.isAndroid()) {
    		alert('cordova.file.externalApplicationStorageDirectory: ' + cordova.file.externalApplicationStorageDirectory);		
			fileDir = cordova.file.externalApplicationStorageDirectory;
    	}
		else if (ionic.Platform.isIOS()) {
			alert('cordova.file.externalApplicationStorageDirectory ' + cordova.file.externalApplicationStorageDirectory);
			fileDir = cordova.file.externalApplicationStorageDirectory;
		}
		else		
			fileDir = '';		
		
		testFS();
		//ClearDirectory();
		// Other functions here		
	};

}]);