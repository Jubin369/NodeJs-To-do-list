const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const bodyParser = require('body-parser');
//Connecting to mongodb
mongoose.connect('mongodb://admin:admin123@127.0.0.1:27017/admin');
let db = mongoose.connection;

db.once('open',function(){
  console.log('Connected to MongoDb');
});
db.on('error',function(err){

  console.log('Error in connection... Error:'+err);
});


let app = express();

//Load view engine
app.set("views",path.join(__dirname,"views"));
app.set("view engine","pug");
app.use("/static", express.static(path.join(__dirname,'public')));
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

//Bring in models
let Todos=require('./models/todos');

//Data fething from database
app.get('/',function(req,res){
  Todos.find({}).sort({orderNotDone:1,orderDone:1}).exec(function(error,todos){
    if(error){
      console.log("Data not found, Error:"+error);
      res.status(404).json({msg:"Data not found"});
    }else{
      res.status(200).render('index', {
        todos:todos
      });
    }
  });
});

//To Insert new toDoData to database
app.post('/',function(req,res){
  if(req.body.value!=null){
    let todos = new Todos();
    todos.orderNotDone =req.body.orderNotDone;
    todos.toDoData = req.body.value;
    todos.save(function(err, data){
      if(err){
        console.log(err);
        res.status(500).json({msg:"Insertion of data failed"});
      }
      else 
        res.status(200).send({msg:"Todos Inserted",id:data._id});
    });
  }
});

//Database updation section on select unique checkbox
app.put('/',function(req,res){
  let data=req.body;
  let done,notDone;
  done = data.orderDone;
  notDone = data.orderNotDone;

  if(data.chkBox==true){
    Todos.update({chkData:false,orderNotDone:{$gt:notDone}},{ $inc: {orderNotDone: -1}},{multi: true},function(error,data){
      
    });
    Todos.update({_id:data.id},{$set :{orderDone: done,chkData:data.chkBox},$unset:{orderNotDone:1}},function(error){
      if(error){
        console.log("Error in updation, Error: "+error);
        res.status(500).json({msg:"Updation of Todos failed"});
      }else{
        
        res.status(200).send({msg:"Select unique"});
      }
    });
  }else{
    Todos.update({chkData:true, orderDone:{$gt:done}},{ $inc: { orderDone: -1}},{multi: true},function(error,data){
      
    });
    Todos.update({_id:data.id},{$set :{orderNotDone: notDone,chkData:data.chkBox},$unset:{orderDone:1}},function(error){
      if(error){
        console.log("Error in updation, Error: "+error);
        res.status(500).json({msg:"Updation of Todos failed"});
      }else{
        res.status(200).send({msg:"Select unique"});
      }
    });
  }
});

//ToDoData delete operation
app.delete('/',function(req,res){
  let data=req.body;
  Todos.remove({_id:data.id},function(error){
    if(error){
      console.log("Error in deletion, Error: "+error);
      res.status(500).json({msg:"Deletion of data failed"});
    }
    else
      res.status(200).send({msg:"Todos Deleted"});
  });
});

//ToDoData drag and drop operation
app.put('/drag',function(req,res){
  let data=req.body;
  //Drag and drop for "not done" section
  if(data.section=="orderNotDone"){
    if(data.preOrder>data.curOrder){
      Todos.update({orderNotDone:{$gte:data.curOrder,$lt:data.preOrder}},{ $inc: {orderNotDone: 1}},{multi: true},function(error,data){
        
      });
    }
    else{

      Todos.update({orderNotDone:{$gt:data.preOrder,$lte:data.curOrder}},{ $inc: {orderNotDone: -1}},{multi: true},function(error,data){ 
      });
    }
    Todos.update({_id:data.id},{$set :{orderNotDone:data.curOrder}},function(error){
      if(error){
        console.log("Error in updation, Error: "+error);
        res.status(500).json({msg:"Updation of Todos failed"});
      }else{
        
        res.status(200).send({msg:"Drag and Drop"});
      }
    });
  }else{ // Drag and drop for Todos Done section

    if(data.preOrder>data.curOrder){
      Todos.update({orderDone:{$gte:data.curOrder,$lt:data.preOrder}},{ $inc: {orderDone: 1}},{multi: true},function(error,data){
        
      });
    }
    else{

      Todos.update({orderDone:{$gt:data.preOrder,$lte:data.curOrder}},{ $inc: {orderDone: -1}},{multi: true},function(error,data){ 
      });
    }
    Todos.update({_id:data.id},{$set :{orderDone:data.curOrder}},function(error){
      if(error){
        console.log("Error in updation, Error: "+error);
        res.status(500).json({msg:"Updation of Todos failed"});
      }else{
        
        res.status(200).send({msg:"Drag and Drop"});
      }
    });
  }
});

app.listen(process.env.port||8000);
