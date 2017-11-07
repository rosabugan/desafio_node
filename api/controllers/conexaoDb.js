// conexão com banco de dados
var mongoose = require('mongoose');
var connection;
mongoose.Promise = global.Promise;
connection = mongoose.connect('mongodb://localhost/api',{ useMongoClient: true },function(err){
  if(err){console.log('erro ao conectar mongo db:'+err);}
  console.log('ok, banco de dados conectado');
});
module.exports=connection;