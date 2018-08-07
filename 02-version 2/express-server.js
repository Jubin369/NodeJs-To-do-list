const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const bodyParser = require('body-parser');
let intCount;
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
let Todolistdata=require('./models/todolistdata');

//Data fething from database
app.get('/',function(request,response){
  Todolistdata.find({}).sort({id:-1}).limit(1).exec(function(error,intMaxId){
    if(error){
      console.log("Error in Finding Result, Error:"+error);
      return;
    }else{
      if(intMaxId.length!=0){
        intCount = ++intMaxId[0].id;
      }else {
        intCount=1;
      }
    }
    Todolistdata.find({}).sort({chkData:1, id:1}).exec(function(error,todolistdatas){
      if(error){
        console.log("Error in Fetching, Error:"+error);
      }else{
        response.render('index', {
          todolistdatas:todolistdatas
        });
      }
    });
  });
});

app.post('/ope',function(request,response){
  let data=request.body;

  if(data.ope==="setAllChk"){                       //Database updation section on select All checkbox
    Todolistdata.update({},{$set :{chkData:data.chkBox}},{multi:true},function(error){
      if(error){
        console.log(error);
      }
    });
  }else if(data.ope==="setChk"){                   //Database updation section on select unique checkbox
    Todolistdata.update({id:data.id},{$set :{id:intCount,chkData:data.chkBox}},function(error){
      if(error){
        console.log("Error in updation, Error: "+error);
      }else{
        let intIdData={};
        intIdData.id=intCount;
        intCount++;
        response.send(JSON.stringify(intIdData));
      }
    });
  }else if(data.ope==="delete"){                   //ToDoData delete operation
    Todolistdata.remove({id:data.id},function(error){
      if(error){
        console.log("Error in deletion, Error: "+error)
      }
    });
  }
  else if(data.ope==="dragAndDrop"){                   //ToDoData delete operation
    Todolistdata.find({id:data.preIndex},function(error,preData){
      if(error){
        console.log("Error in Fetching, Error:"+error);
      }else{
        Todolistdata.update({id:data.preIndex},{$set :{id:data.curIndex}},function(error){
          if(error){
            console.log("Error in updation in drag and drop section, Error: "+error)
          }
        });
        Todolistdata.update({_id:{$ne:preData[0]._id},id:data.curIndex},{$set :{id:data.preIndex}},function(error){
          if(error){
            console.log("Error in updation in drag and drop section, Error: "+error)
          }
        });

      }
    });
  }
  else{
    if(request.body.textbox!=null){
      let todolistdata = new Todolistdata();
      todolistdata.id = intCount++;
      todolistdata.toDoData = request.body.textbox;
      todolistdata.save(function(err){
        if(err){
          console.log(err);
          return;
        }
      });
    }
  }

  if(data.ope!=="setChk")
    response.redirect('/');
});

app.listen(8000);
