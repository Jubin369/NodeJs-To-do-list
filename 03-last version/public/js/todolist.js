let arrTodos;
let orderDone=0;
let orderNotDone=0;

$(document).ready(function(){
  onDisplayOfElements(arrTodos);

  $(".text-box").keypress(function(event){
    if(event.key=="Enter")
      addToDos();
  });
  
  $(".button-enter").click(function(){
    addToDos();
  });
});

function addToDos(){
  if($("#textbox").val()!=""){
    let data={};
    data.value=$("#textbox").val();
    data.orderNotDone = ++orderNotDone;
    ajaxCall("POST",data);
    $("#textbox").val("");
  }
}


//append to-do-list data function for functions displayAllElements and appendNewToDoData
function onDisplayOfElements(arrTodos){
  for(objTodos of arrTodos){
      setDatasForCheckBox(objTodos._id,objTodos.chkData);
      eventInitializationOnAddingNewData(objTodos._id);
   	  dragAndDrop(objTodos._id);
  }
}

//function to specify checkbox for display function
function setDatasForCheckBox(intId,chkData){
	if(chkData){
    orderDone++;
		$("#"+intId).find('input').attr("checked",true);
		$("#"+intId).find('p').addClass("text-strike");
  }
  else
    orderNotDone++;
}

//Event Initialization on after the creation of element
function eventInitializationOnAddingNewData(intId){
	$("#"+intId).find('input').on('click',function(){
		selectUniqueToDoData(intId);
	});
	$("#"+intId).find('i').on('click',function(){
		confirmDeleteToDoData(intId);
	});
}

//Drag and drop operation on to-do-list list
function dragAndDrop(strId){
	let row=document.getElementById(strId);
	row.addEventListener('dragstart',dragStart,false);
	row.addEventListener('dragenter',dragEnter,false);
	row.addEventListener('dragover',dragOver,false);
	row.addEventListener('dragleave',dragLeave,false);
	row.addEventListener('drop',dropped,false);
	row.addEventListener('dragend',dragEnd,false);
}

function dragStart(e){
	e.dataTransfer.effectAllowed='move';
	e.dataTransfer.setData('Text',e.target.id);
}
function dragEnter(e){
	e.preventDefault();
	$(this).addClass('over');
}
function dragOver(e){
	e.preventDefault();
	e.dataTransfer.dropEffect='move';
	return false;
}
function dragLeave(e){
	e.stopPropagation();
	$(this).removeClass('over');
}
function dropped(e){
	let data = e.dataTransfer.getData("Text");
	if(data!=this.id && $('#'+data).parent().attr('id')===$('#'+this.id).parent().attr('id')){
    let idPrevious = data;
  	let idCurrent = this.id;

    let serverData={};
    if($('#'+data).parent().attr('id')=="to-do-list-not-done")
      serverData.section="orderNotDone";
    else
      serverData.section="orderDone";

    serverData.id = data;
    serverData.preOrder = $('#'+data).index();
    serverData.curOrder = $('#'+this.id).index();

    let copy=$("#"+idPrevious);
    $("#"+idPrevious).remove();
    if(serverData.preOrder<serverData.curOrder)
      $(copy).insertAfter("#"+idCurrent);
    else
      $(copy).insertBefore("#"+idCurrent);
    

    ajaxCall("PUT",serverData,"","drag");
	}
	return false;
}

function dragEnd(e){
	$('.draggable').removeClass('over');
}

//select operation on selecting
function selectUniqueToDoData(id){
  let chkSpecific = $('#'+id).find(".chk-unique:checked").val();
  let data = {};
  data.id=id;
  if(chkSpecific){
    data.orderDone = ++orderDone;
    data.orderNotDone = $('#'+id).index();
    orderNotDone--;
    data.chkBox=true;
    ajaxCall("PUT",data,"done");
  }else{
    data.orderNotDone = ++orderNotDone;
    data.orderDone = $('#'+id).index();
    orderDone--;
    data.chkBox=false;
    ajaxCall("PUT",data,"not-done");
  }
}

//To change the section of to-do-data on Clicking of unique checkbox
function toTransferToDoListData(strOldId,strNewId,strSec){
  let copy=$("#"+strOldId);
  $("#"+strOldId).remove();

  if(strSec=="Done"){
    $("#to-do-list-done").append(copy);
    setFontStyle(true,strOldId);
  }
  else{
    $("#to-do-list-not-done").append(copy);
    setFontStyle(false,strOldId);
  }
  $("#"+strOldId).attr('id',strNewId);
  eventInitializationOnAddingNewData(strNewId);
  dragAndDrop('row-'+strNewId);
}

//Function to set font style
function setFontStyle(chkSpecific,id){
	if(chkSpecific){
		$("#"+id).find('p').addClass("text-strike");
	}
	else{
		$("#"+id).find('p').removeClass("text-strike");
	}
}

//function to delete to-do-list row data on clicking of its delete icon
function confirmDeleteToDoData(idNum){
  let chkData = $('#'+idNum).find(".chk-unique:checked").val();

  let data = {};
  data.id = idNum;
	if(chkData){
    orderDone--;
		ajaxCall("DELETE",data,"done");
	}else{
		if(confirm("Your task is not completed! Do you want delete the task?")){
      orderNotDone--;
			ajaxCall("DELETE",data,"not-done");
		}
	}
}

//common Ajax call function to send data to server side
function ajaxCall(method,data,category,path=""){
  $.ajax({
    type:method,
    url:"http://localhost:8000/"+path,
    data:JSON.stringify(data),
    contentType:'application/json',
    success:function(result){

      if(result.msg=="Todos Inserted"){
        $("#to-do-list-not-done").append(`
        <div id=${result.id} class='row draggable', draggable='true'>
          <div>
            <input class='chk-unique', type='checkbox'>
          </div>
          <div class='to-do-font'>
            <p class='para-to-do-data'> ${data.value} </p>
          </div>
          <div class='delete'>
            <i class='fas fa-times'></i>
          </div>
        </div>`);
        eventInitializationOnAddingNewData(result.id);
   	    dragAndDrop(result.id);
      }else if(result.msg=="Todos Deleted"){
        let child = $("#"+data.id);
	      $("#to-do-list-"+category).find(child).remove();
      }else if(result.msg=="Select unique"){
        let child = $("#"+data.id);
        if(category=="done"){
          $("#to-do-list-not-done").find(child).remove();
          $("#to-do-list-done").append(child);
          setFontStyle(true,data.id);
          eventInitializationOnAddingNewData(data.id);
   	      dragAndDrop(data.id);
        }else{
          $("#to-do-list-done").find(child).remove();
          $("#to-do-list-not-done").append(child);
          setFontStyle(false,data.id);
          eventInitializationOnAddingNewData(data.id);
   	      dragAndDrop(data.id);
        }
      }
      //return data;
      // if(result==="POST"){ //For detetecting select check box operation
      //     intResultId=JSON.parse(result);
      //     let newId=intResultId.id;
      //     if(data.chkBox===true)onDisplaonDisplayOfElementsonDisplayOfElementsonDisplayOfElementsyOfElements
      //       toTransferToDoListData(data.id,newId,"Done");
      //     else 
      //       toTransferToDoListData(data.id,newId,"Not  Done");
      // }
    }
  });
}