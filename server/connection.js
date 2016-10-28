
var pg = require('pg');
var connectionString = '';
if(process.env.DATABASE_URL !== undefined) {
 console.log('env connection string');
 connectionString = process.env.DATABASE_URL;
 pg.defaults.ssl = true;
} else {
 connectionString = 'postgres://localhost:5432/Crabsweeper';
}
console.log("connectionString set to: ", connectionString);

module.exports = connectionString;
