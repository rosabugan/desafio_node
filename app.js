var express = require('express');

var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var expressValidator = require('express-validator');
var expressSession = require('express-session');

var User = require('./api/models/usuarios'); //modelo de dados do usuario

var app = express();

//configurando o bodyParse antes das rotas
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
//configurando midwares CookieParse, express-validator e express-session
app.use(cookieParser());
app.use(expressValidator());
app.use(expressSession({
  secret:'ten0xt1lpan',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));

//importando route
var routes = require('./api/routes/usersRoutes'); 
routes(app); //register the route


/* Middleware para usar tratar os status da aplicação */
app.use(function(req, res, next) {
  
  res.status(404).json({mensagem:'endpoint não encontrado'});
  next(); 
});
app.use(function(err,req, res, next) {
  
  res.status(500).send('erro no servidor');
  next(); 
});


var port=process.env.PORT||3000;
app.listen(port,function(){console.log('servidor rodando na porta '+port);});