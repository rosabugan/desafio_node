var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

// define o schema usuarios
var telefoneSchema= mongoose.Schema({numero: {type:Number},
    ddd: {type:Number}});
var usuariosSchema= mongoose.Schema(
    {id:ObjectId, nome:{type: String,required:true},
    email:{type:String, unique: true,required:true},
    senha:{type:String,required:true}, 
    telefone:[telefoneSchema] ,
    data_criacao:{type:Date},
    data_atualizacao:{type:Date,default: Date.now},
    ultimo_login:{type:Date,default: Date.now},
    token:String
});

module.exports =  mongoose.model('Users',usuariosSchema);