var express= require('express');
var app= express();
var path = require('path');
var bodyParser=require('body-parser');
var pg = require('pg');
var urlencodedParser=bodyParser.urlencoded( { extended: false } );

app.use( bodyParser.json() );
app.use( express.static( 'public' ) );

app.get( '/', function( req, res ){
  console.log( 'Home, sweet home' );
  res.sendFile( path.resolve( 'public/views/index.html' ) );
});


app.set('port', process.env.PORT || 7000);
app.listen(app.get('port'), function() {
  console.log('Server up:', app.get('port'));
});


var crabScores = require ('../server/crabScores');

app.use('/crabScores', crabScores);
