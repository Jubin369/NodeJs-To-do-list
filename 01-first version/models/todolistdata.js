const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//To do data schema
let todolistdataSchema=new Schema({
  id:{
    type:Number,
    min:1,
    required:true
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

let Todolistdata = module.exports = mongoose.model('Todolistdata',todolistdataSchema);
