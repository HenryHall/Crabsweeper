var express = require('express');
var path = require('path');
var bodyParser=require('body-parser');
var pg = require('pg');
var urlencodedParser=bodyParser.urlencoded( { extended: false } );

var connection = require('../server/connection');
var router = express.Router();


router.get('/scores', function(req, res){
  console.log("In /scores.get");

  pg.connect(connection, function(err, client, done){
    var query = client.query("SELECT * FROM crabscores9x9 ORDER BY score ASC, date ASC");
    var results = {
      mode1: [],
      mode2: [],
      mode3: []
    };

    query.on('row', function(row){
      results.mode1.push(row);
    });

    query.on('end', function(){

      var query = client.query("SELECT * FROM crabscores18x18 ORDER BY score ASC, date ASC");

      query.on('row', function(row){
        results.mode2.push(row);
      });

      query.on('end', function(){

        var query = client.query("SELECT * FROM crabscores36x18 ORDER BY score ASC, date ASC");

        query.on('row', function(row){
          results.mode3.push(row);
        });

        query.on('end', function(){
          done();
          res.send(results);
        });


      });



    });
  });

});


router.get('/stats', function(req, res){
  console.log("In /stats.get");

  pg.connect(connection, function(err, client, done){
    var query = client.query("SELECT * FROM crabstats");
    var results =[];

    query.on('row', function(row){
      results.push(row);
    });

    query.on('end', function(){
      done();
      res.send(results);
    });
  });

});


router.put('/gamesPlayed', function(req, res){

  pg.connect(connection, function(err, client, done){

    var query = client.query("SELECT * FROM crabstats");
    var result =[];

    query.on('row', function(row){
      result.push(row);
    });

    query.on('end', function(){

      var newCount = result[0].playCount + 1;

      query = client.query('UPDATE crabstats SET "playCount" = ' + newCount + ' WHERE id = 1');

      done();
      res.end();

    });

  });



});


router.post('/checkScores', function(req, res){

  console.log("In checkScores");

  var selectedQuery;

  switch (req.body.grid) {
    case "9x9":
      selectedQuery = "crabscores9x9";
      break;
    case "18x18":
      selectedQuery = "crabscores18x18";
      break;
    case "36x18":
      selectedQuery = "crabscores36x18";
      break;
  }


  pg.connect(connection, function(err, client, done){

    //Update winCount
    var query2 = client.query('UPDATE crabstats SET "winCount" = "winCount" + 1');


    var query = client.query("SELECT id, score, date FROM " + selectedQuery + " ORDER BY score ASC, date ASC");
    var results = [];

    query.on('row', function(row){
      results.push(row);
    });

    query.on('end', function(){
      console.log(results);
      for (var i=0; i<results.length; i++){
        if (req.body.score < results[i].score){
          done();
          console.log("We made it!");
          res.send({success: "true", rank: (i+1)});
          return;
        }
      }
      done();
      res.send({success: "false"});
    });
  });

});


router.post('/submitScore', function(req, res){

  console.log("In submitScore");

  var selectedQuery;

  switch (req.body.grid) {
    case "9x9":
      selectedQuery = "crabscores9x9";
      break;
    case "18x18":
      selectedQuery = "crabscores18x18";
      break;
    case "36x18":
      selectedQuery = "crabscores36x18";
      break;
  }

  pg.connect(connection, function(err, client, done){

    //Add new score
    var query = client.query("INSERT INTO " + selectedQuery + " (score, playername) VALUES ($1, $2)", [req.body.score, req.body.playerName]);

    //Remove the lowest score
    var query = client.query("SELECT id, score, date FROM " + selectedQuery + " ORDER BY score ASC, date ASC");
    var results = [];

    query.on('row', function(row){
      results.push(row);
    });

    query.on('end', function(){

      //Delete the lowest score
      console.log(results);
      var query = client.query("DELETE FROM " + selectedQuery + " WHERE id = " + results[results.length-1].id);
      console.log("query return", query);
      done();
      res.sendStatus(200);
    });
  });


});



module.exports = router;
