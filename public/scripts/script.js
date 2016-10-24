var crabApp = angular.module( 'crabApp', []);


crabApp.controller('crabSettings', ['$scope', 'crabGrid', function($scope, crabGrid){

  //Initial settings
  $scope.settings = {
    grid: undefined,
    span: {
      x: undefined,
      y: undefined
    },
    crabCount: undefined,
    timed: undefined
  };


  //When a radio button or custom grid is focused
  $scope.selectGrid = function(input){

    switch (input) {
      case '9x9':
        $scope.settings.crabCount = 10;
        $scope.settings.span.x = 9;
        $scope.settings.span.y = 9;
        document.getElementById('customGridIn').style.display = "None";
        break;

      case '18x18':
        $scope.settings.crabCount = 40;
        $scope.settings.span.x = 18;
        $scope.settings.span.y = 18;
        document.getElementById('customGridIn').style.display = "None";
        break;

      case '36x18':
        $scope.settings.crabCount = 80;
        $scope.settings.span.x = 36;
        $scope.settings.span.y = 18;
        document.getElementById('customGridIn').style.display = "None";
        break;

      case 'Custom':
        var radioButtons = document.getElementsByClassName('gridRadio')
        for (i=0; i<radioButtons.length; i++){
            radioButtons[i].checked = false;
        }
        document.getElementById('customGridIn').style.display = "inline-block";
        document.getElementById('customGrid').checked = true;
        $scope.settings.crabCount = undefined;
        $scope.settings.span.x = undefined;
        $scope.settings.span.y = undefined;
        break;

      default:

    }

  }//End selectGrid


  //Time Limit radio button focus trigger
  $scope.timerSettings = function(input){

    switch (input) {
      case "Up":
        document.getElementById('customTimeIn').style.display = "none";
        document.getElementById('timedTrue').checked = false;
        $scope.settings.timed = false;
        break;

      case "Custom":
        document.getElementById('customTimeIn').style.display = "inline-block";
        $scope.settings.timed = undefined;
        break;

      default:
    }
  };


  $scope.startGame = function(){

    //Housekeeping
    var maxCrabs = $scope.settings.span.x * $scope.settings.span.y;
    $scope.settings.span.x = parseInt($scope.settings.span.x);
    $scope.settings.span.y = parseInt($scope.settings.span.y);

    console.log($scope.settings, maxCrabs);
    console.log(isNaN($scope.settings.crabCount));

    //Validate form
    if (isNaN($scope.settings.span.x) || isNaN($scope.settings.span.y)){
      document.getElementById('settingsAlert').style.display = "block";
      console.log("fail1");
      return;
    } else if (isNaN($scope.settings.crabCount) && $scope.settings.crabCount !== ""){
      document.getElementById('settingsAlert').style.display = "block";
      console.log("fail2");
      return;
    } else if (isNaN($scope.settings.timed) && $scope.settings.timed !== "Up"){
      document.getElementById('settingsAlert').style.display = "block";
      console.log("fail3");
      return;
    } else if ($scope.settings.crabCount > maxCrabs-1){
      document.getElementById('settingsAlert').style.display = "block";
      console.log("fail4");
      return;
    }

    //Successful validation
    // if ($scope.settings.timed == "Up"){
    //   crabGrid.gridSettings.timer.type = "Up";
    // } else {
    //   crabGrid.gridSettings.timer.type = "Down";
    //   crabGrid.gridSettings.timer.value = $scope.settings.timed;
    // }

    crabGrid.initializeGrid($scope.settings.span.x, $scope.settings.span.y, $scope.settings.crabCount, $scope.settings.timed);


  };



}]);



crabApp.service('crabGrid', function(){

  var gridSettings = {
    timer: {
      type: undefined,
      value: undefined
    },
    grid: {
      x: undefined,
      y: undefined,
      crabs: undefined,
      values: []
    }
  };

  var initializeGrid = function(gridX, gridY, crabCount, timer){


    //Creates a crab under a random tile
    var createCrab = function(){
      var randomGridTile = Math.floor(Math.random() * gridSettings.grid.values.length-1);
      console.log("random number:", randomGridTile);

      if (gridSettings.grid.values[randomGridTile].type == "Empty"){
        gridSettings.grid.values[randomGridTile].type = "Crab"
        console.log("Crab created", randomGridTile);
        return;
      } else {
        console.log("Repeat Crab");
        return createCrab();
      }
    };

    //Returns the index of requested coordinates
    var findGrid = function(x,y){

      //Out of bounds
      if(x<0 || y<0){
        return console.log("Out of bounds!");
      }

      for (i=0; i< gridSettings.grid.values.length-1; i++){
        if (gridSettings.grid.values[i].x == x && gridSettings.grid.values[i].y == y){
          return i;
        } else {
          return console.log("No grid with coordinates (" + x + "," + y + ") was found.");
        }
      }
    };

    //Set-up
    if (timer !== "Up"){
      gridSettings.timer.type = "Down"
    }
    gridSettings.timer.value = timer;
    gridSettings.grid.x = gridX;
    gridSettings.grid.y = gridY;
    gridSettings.grid.crabs = crabCount;

    //Create the grid values
    for (i=0; i<gridX; i++){
      for (j=0; j<gridY; j++){
        gridSettings.grid.values.push({x: i, y: j, type: "Empty", surrounding: undefined});
      }
    }

    //Randomize the mines ..errr... crabs
    for (i=0; i<gridSettings.grid.crabs; i++){
      createCrab();
    }

    //Calculate surrounding crabs of a tile
    for (i=0; i<gridSettings.grid.values.length-1; i++){

    }




    console.log(gridSettings);

  }; //End initializeGrid


  return {
    initializeGrid: initializeGrid
  };


});


crabApp.controller('crabSweeper', ['$scope', function($scope){

}]);
