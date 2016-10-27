var crabApp = angular.module( 'crabApp', []);


//Right click directive for flagging crabs
crabApp.directive('ngRightClick', function($parse) {
    return function(scope, element, attrs) {
        var fn = $parse(attrs.ngRightClick);
        element.bind('contextmenu', function(event) {
            scope.$apply(function() {
                event.preventDefault();
                fn(scope, {$event:event});
            });
        });
    };
});


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
    console.log("x", $scope.settings.span.x);
    console.log("y", $scope.settings.span.y);

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
    crabGrid.initializeGrid($scope.settings.span.x, $scope.settings.span.y, $scope.settings.crabCount, $scope.settings.timed);
      document.getElementById('crabSweeper').style.display = "Block";
      document.getElementById('crabSettings').style.display = "None";


  };



}]);



crabApp.service('crabGrid', ['$rootScope', function($rootScope){

  var gridSettings = {
    timer: {
      type: undefined,
      value: undefined
    },
    grid: {
      x: undefined,
      y: undefined,
      crabs: undefined,
      flagCount: undefined,
      values: []
    }
  };

  var initializeGrid = function(gridX, gridY, crabCount, timer){

    //Creates a crab under a random tile
    var createCrab = function(){
      var randomGridTile = Math.floor(Math.random() * gridSettings.grid.values.length);
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

      console.log("testing", x, y);
      //Out of bounds
      if(x<0 || y<0 || x>gridX-1 || y>gridY-1){
        return console.log("Out of bounds!");
      }

      for (var i=0; i<gridSettings.grid.values.length; i++){
        if (gridSettings.grid.values[i].x == x && gridSettings.grid.values[i].y == y){
          console.log("returning key:", i);
          return i;
        }
      }

      return console.log("No grid with coordinates (" + x + "," + y + ") was found.");
    };

    //Set-up
    gridSettings.running = true;
    if (timer !== "Up"){
      gridSettings.timer.type = "Down"
      gridSettings.timer.value = timer;
    } else {
      gridSettings.timer.type = "Up"
      gridSettings.timer.value = 0;
    }
    gridSettings.grid.x = gridX;
    gridSettings.grid.y = gridY;
    gridSettings.grid.crabs = crabCount;
    gridSettings.grid.flagCount = crabCount;

    //Create the grid values
    for (var i=0; i<gridY; i++){
      for (j=0; j<gridX; j++){
        gridSettings.grid.values.push(
          {
            x: j,
            y: i,
            type: "Empty",
            surrounding: 0,
            revealed: false,
            checked: false,
            flagged: false,
            style: {
              color: 'red'
            }
          }
        );
      }
    }

    //Randomize the mines ..errr... crabs
    for (i=0; i<gridSettings.grid.crabs; i++){
      createCrab();
    }

    //Calculate surrounding crabs of a tile
    for (var i=0; i<gridSettings.grid.values.length; i++){

      var currentGrid = gridSettings.grid.values[i];
      var x = currentGrid.x;
      var y = currentGrid.y;
      var surroundingGrids = [findGrid(x-1,y-1), findGrid(x-1,y), findGrid(x-1,y+1), findGrid(x,y-1), findGrid(x,y+1), findGrid(x+1,y-1), findGrid(x+1,y), findGrid(x+1,y+1)];

      console.log(surroundingGrids, i);

      for (var j=0; j<8; j++){
        if (isNaN(surroundingGrids[j]) === false){
          if (gridSettings.grid.values[surroundingGrids[j]].type == "Crab"){
            currentGrid.surrounding++;
          }
        }
      }


      //Set text color based on number
      switch (currentGrid.surrounding) {
        case 0:
          currentGrid.style.color = "rgb(130, 130, 130)";
          break;
        case 1:
          currentGrid.style.color = "lightblue";
          break;
        case 2:
          currentGrid.style.color = "blue";
          break;
        case 3:
          currentGrid.style.color = "lightgreen";
          break;
        case 4:
          currentGrid.style.color = "green";
          break;
        case 5:
          currentGrid.style.color = "orange";
          break;
        case 6:
          currentGrid.style.color = "orangered";
          break;
        case 7:
          currentGrid.style.color = "red";
          break;
        case 8:
          currentGrid.style.color = "darkred";
          break;
      }

    }//End surrounding crabs

    console.log(gridSettings);

    $rootScope.$emit('loadReady', gridSettings);

    return true;
  }; //End initializeGrid


  var retrieveGrid = function(){
    return gridSettings;
  }

  return {
    initializeGrid: initializeGrid,
    retrieveGrid: retrieveGrid
  };


}]);//End crabGrid


crabApp.controller('crabSweeper', ['$scope', '$rootScope', 'crabGrid', function($scope, $rootScope, crabGrid){

  $scope.gameData;
  var timerStart = false;

  $rootScope.$on('loadReady', function(e, data){
    $scope.gameData = data;
    console.log($scope.gameData);

    //A tile is 30x30 px, set the width of the gameBoard
    var boardWidth = ($scope.gameData.grid.x * 30)
    document.getElementById('gameBoard').style.width = boardWidth + "px";

  });


  $scope.revealTile = function(index){
    var currentTile = $scope.gameData.grid.values[index];

    //Check to see if this tile has already been revealed or if the game is over
    if (currentTile.revealed == true || $scope.gameData.running == false){
      return;
    }

    //Check to see if this is the first tile clicked, start game
    if (timerStart == false){
      $scope.timerStart();
    }

    //Make sure the tile isnt flagged
    if (currentTile.flagged == true){
      return;
    }

    console.log("Tile " + index + " is being revealed.");

    currentTile.revealed = true;
    currentTile.style.background = {"background-color": "rgb(130, 130, 130)", border: "1px solid black", "line-height": "30px"};

    if (currentTile.type == "Crab"){
      gameLoss("Crab");
      return;
    } else if (currentTile.surrounding == 0){
      $scope.gameData.grid.values[index].checked = true;
      revealSurroundingTiles(index);
    }

    //Check for game win
    var winCount = ($scope.gameData.grid.x * $scope.gameData.grid.y) - $scope.gameData.grid.crabs; //Number of non-crab tiles
    for (var i=0; i<$scope.gameData.grid.values.length; i++){
      if ($scope.gameData.grid.values[i].revealed == true){
        winCount--;
      }
    }

    if (winCount == 0){
      gameWin();
      return;
    }

    return;

  };


  $scope.flagCrab = function(index){

    var currentTile = $scope.gameData.grid.values[index];

    //Make sure the tile isnt already revealed and that the game is still running
    if (currentTile.revealed == true || $scope.gameData.running == false){
      return;
    }

    switch (currentTile.flagged) {
      case false:
        currentTile.flagged = true;
        $scope.gameData.grid.flagCount--;
        break;

      case true:
        currentTile.flagged = false;
        $scope.gameData.grid.flagCount++;
        break;

      default:

    }

  };


  $scope.timerStart = function(){

    //Mark the game as started
    timerStart = true;

    var crabTimer;

    if ($scope.gameData.timer.type == "Up"){

      crabTimer = setInterval(function(){

        //Max time or game over
        if ($scope.gameData.timer.value > 999 || timerStart == false){
          clearInterval(crabTimer);
        }

        $scope.gameData.timer.value++;

        $scope.$apply();
      }, 1000);

    } else if ($scope.gameData.timer.type == "Down"){

      crabTimer = setInterval(function(){

        //Out of time
        if ($scope.gameData.timer.value < 0){
          gameLoss("Time");
          clearInterval(crabTimer);
        }

        //Stepped on a crab
        if (timerStart == false){
          clearInterval(crabTimer);
        }

        $scope.gameData.timer.value--;
        $scope.$apply();

      }, 1000);
    } else {
      console.log("Game timer type not set!");
    }
  }


  function gameLoss(reason){

    $scope.gameData.running = false;

    //Stop the timer
    timerStart = false;

    if (reason == "Time"){
      console.log("You ran out of time!");
    } else if (reason == "Crab"){
      console.log("You stepped on a crab.  Ouch!");
    }

  }


  function gameWin(){
    $scope.gameData.running = false;
    //Stop the timer
    timerStart = false;

    for (var i=0; i<$scope.gameData.grid.values.length; i++){
      if ($scope.gameData.grid.values[i].type == "Crab"){
        $scope.gameData.grid.values[i].flagged = true;
      }
    }

    console.log("You won the game!");
  }


  //Returns the index of requested coordinates
  function findGrid(x,y){

    console.log("testing", x, y);
    //Out of bounds
    if(x<0 || y<0 || x>$scope.gameData.grid.x-1 || y>$scope.gameData.grid.y-1){
      return console.log("Out of bounds!");
    }

    for (i=0; i< $scope.gameData.grid.values.length; i++){
      if ($scope.gameData.grid.values[i].x == x && $scope.gameData.grid.values[i].y == y){
        console.log("returning key:", i);
        return i;
      }
    }

    return console.log("No grid with coordinates (" + x + "," + y + ") was found.");
  };


  function revealSurroundingTiles(index){
    //
    var currentTile = $scope.gameData.grid.values[index];
    var x = currentTile.x;
    var y = currentTile.y;
    var surroundingGrids = [findGrid(x-1,y-1), findGrid(x-1,y), findGrid(x-1,y+1), findGrid(x,y-1), findGrid(x,y+1), findGrid(x+1,y-1), findGrid(x+1,y), findGrid(x+1,y+1)];


    for (var i=0; i<8; i++){
      //Make sure it is a tile and not flagged
      if (isNaN(surroundingGrids[i]) == false && $scope.gameData.grid.values[surroundingGrids[i]].flagged == false){

        //No surrounding crabs and has not been checked before
        if ($scope.gameData.grid.values[surroundingGrids[i]].surrounding == 0 && $scope.gameData.grid.values[surroundingGrids[i]].checked == false){
          $scope.gameData.grid.values[surroundingGrids[i]].checked = true;
          revealSurroundingTiles(surroundingGrids[i]);
        }

        $scope.gameData.grid.values[surroundingGrids[i]].revealed = true;
        $scope.gameData.grid.values[surroundingGrids[i]].style.background = {"background-color": "rgb(130, 130, 130)", border: "1px solid black", "line-height": "30px"};

      }
    }
  }



}]);
