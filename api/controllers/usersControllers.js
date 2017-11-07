var crypto = require('crypto');
var secret='ten0xt1lpan';
var conection = require('./conexaoDb'),
  mongoose = require('mongoose');
  User = mongoose.model('Users');

 
module.exports={

list_all_users : function(req, res) {
  if(req.session.autenticado){

  User.find({}, function(err, User) {
    if (err){
      res.json( {mensagem:err});
    return;}
    res.json( User);
  });}
  else {
    res.status(401).json({mensagem:'usuário não autenticado'});
  }
},


create_a_user : function(req, res) {
  req.assert('nome','nome é obrigatório').notEmpty();
  req.assert('senha','senha é obrigatória').notEmpty();
  req.assert('email','email é obrigatório').notEmpty();
  req.assert('email','email não valido').isEmail();
  var erros= req.validationErrors();
  var mensagem=[];
  if(erros){
    for(var i=0; i<erros.length;i++){
      mensagem[i]={mensagem:erros[i].msg};
    }
    res.status(400).json(mensagem);
    return;
  }
  var new_user = new User(req.body);
  //criptografa a senha
   new_user.senha =crypto.createHmac('sha256', secret)
  .update(req.body.senha)
  .digest('hex');
  //cria o token unico com base na data
  new_user.token=crypto.createHash('sha256')
  .update(Date.now().toString())
  .digest('hex');
  new_user.data_criacao=Date.now();
  new_user.save(function(err,usuario) {
    if (err){
      if(err.code==11000){
        res.status(400).json({mensagem:'E-mail já existente'});
      return;}
      res.status(401).json({mensagem:err});
      return;
    }
    req.session.autenticado=true;
    req.session.token=usuario.token;
    req.session._id=usuario._id;
    res.json (usuario);
  });

},

autenticar :function(req, res) {
 
  User.findOne({email: req.body.email}, function(err, usuario) {
    
    if (err){
      res.send(err);
    return;}
    if(usuario==undefined || usuario.senha!=crypto.createHmac('sha256', secret)
    .update(req.body.senha)
    .digest('hex')){ 
      
      res.status(401).json({mensagem:'Usuário e/ou senha inválidos'});
      return;
    }
    var token = crypto.createHash('sha256')
    .update(Date.now().toString())
    .digest('hex');
    usuario.token=token;
    usuario.ultimo_login=Date.now();
    User.findOneAndUpdate({email:usuario.email}, { $set: { ultimo_login: usuario.ultimo_login,token:usuario.token }},{new:false}, function(err,reg){
      if(err){
        res.json({erro:err});
        return;
      }
    });
    req.session.autenticado=true;
    req.session.token=usuario.token;
    req.session._id=usuario._id;
    res.json(usuario);
  });
  

},
read_a_user : function(req, res) {
  //Busca o token no header authorization esperado 'Bearer {token}'
  var token = (req.headers.authorization!=undefined && req.headers.authorization.length>7)?req.headers.authorization.substr(7):'';
  
  if(req.session.autenticado){
   
     // Se o token existir
    if (token!='') {
      
      // Verificamos se o token está batendo com as informações do usuário e se ainda é valido
      User.findById(req.params.userId, function(err,usuario) {
        if (err){
          res.json(err);
          return;
          
        }
        
        if(token!=usuario.token){
         
          res.status(401).json({mensagem:'usuario não autorizado'});
          return;
          
        }
        var validTime=(usuario.ultimo_login.getTime()+30*60000);
      
        if(Date.now()>validTime){
         
          res.status(401).json({mensagem:'Sessão inválida'});
          return;
          
        }
        res.json(usuario);
        return;
      });
    }else {
     
      // Se quem requisitou não informou o token, devolvemos um erro para ele.
      res.status(403).json({mensagem:'token não informado'});
      return;
      
    }
  }
  else
  res.status(401).json({mensagem:'usuario não autenticado'});
  
},
  
  
update_a_user : function(req, res) {
  //Busca o token no header authorization esperado 'Bearer {token}'
  var token = (req.headers.authorization!=undefined && req.headers.authorization.length>7)?req.headers.authorization.substr(7):'';
  
  if(req.session.autenticado){
   
     // Se o token existir
    if (token!='') {
      
      // Verificamos se o token está batendo com as informações do usuário e se ainda é valido
      User.findById(req.params.userId, function(err,usuario) {
        if (err){
          res.json(err);
          return;
          
        }
        
        if(token!=usuario.token){
         
          res.status(401).json({mensagem:'usuario não autorizado'});
          return;
          
        }
        //verifica se token foi gerado a menos de 30 minutos
        var validTime=(usuario.ultimo_login.getTime()+30*60000);
      
        if(Date.now()>validTime){
         
          res.status(401).json({mensagem:'Sessão inválida'});
          return;
          
        }
        //atualiza a data_atualizacao
        req.body.data_atualizacao=Date.now();
        //se o usuário estiver atualizando a senha, criptogafa-a
        if(req.body.senha!=undefined)
         req.body.senha =crypto.createHmac('sha256', secret)
         .update(req.body.senha)
         .digest('hex');
        User.findOneAndUpdate({_id: req.params.userId}, req.body, {new: true}, function(err, usuario) {
          if (err)
            res.send(err);
          res.json(usuario);
        });
        return;
      });

    }else {
   
      // Se quem requisitou não informou o token, devolvemos um erro para ele.
      res.status(403).json({mensagem:'token não informado'});
      return;
      
    }
  }
  else
  res.status(401).json({mensagem:'usuario não autenticado'});
  
    
  },
  
  
  delete_a_user : function(req, res) {
   //Busca o token no header authorization esperado 'Bearer {token}'
  var token = (req.headers.authorization!=undefined && req.headers.authorization.length>7)?req.headers.authorization.substr(7):'';
  
  if(req.session.autenticado){
   
     // Se o token existir
    if (token!='') {
      
      // Verificamos se o token está batendo com as informações do usuário e se ainda é valido
      User.findById(req.params.userId, function(err,usuario) {
        if (err){
          res.json(err);
          return;
          
        }
        
        if(token!=usuario.token){
       
          res.status(401).json({mensagem:'usuario não autorizado'});
          return;
          
        }
        //verifica se token foi gerado a menos de 30 min token
        var validTime=(usuario.ultimo_login.getTime()+30*60000);
      
        if(Date.now()>validTime){
         
          res.status(401).json({mensagem:'Sessão inválida'});
          return;
          
        }
        User.remove({
          _id: req.params.userId
        }, function(err, usuario) {
          if (err)
            res.send(err);
            res.json({ message: 'usuario apagado' });
        });
      });
    } else{
      
      // Se quem requisitou não informou o token, devolvemos um erro para ele.
      res.status(403).json({mensagem:'token não informado'});
      return;
      
    }
  }
  else
  res.status(401).json({mensagem:'usuario não autenticado'});
}
    
};