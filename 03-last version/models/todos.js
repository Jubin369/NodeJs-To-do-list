const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//To do data schema
let todosSchema=new Schema({
  orderDone:{
    type:Number
  },
  orderNotDone:{
    type:Number
  },
  chkData:{
    type:Boolean,
    default:false
  },
  toDoData:{
    type:String,
    required:true
  }
});

let Todos = module.exports = mongoose.model('Todos',todosSchema);
