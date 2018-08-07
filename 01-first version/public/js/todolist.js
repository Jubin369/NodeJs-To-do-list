
//Functions and events that should initializes on refresh of page
$(document).ready(function(){
  onDisplayOfElements();
	//Select All event for select-all check box
	$(".select-all").on('click',function(){
		setAllCheckbox();
	});
})

//append to-do-list data function for functions displayAllElements and appendNewToDoData
function onDisplayOfElements(intId,chkData){
    if(intId != undefined){
      setDatasForCheckBox(intId,chkData);
      eventInitializationOnAddingNewData(intId);
   	  dragAndDrop('row-'+intId);
    }
}

//function to specify checkbox for display function
function setDatasForCheckBox(intId,chkData){
	if(chkData){
		$('#chk-'+intId).attr("checked",true);
		$('#p-'+intId).addClass("text-strike");
	}
}

//Event Initialization on after the creation of element
function eventInitializationOnAddingNewData(intId){
	$("#chk-"+intId).on('click',function(){
		selectUniqueToDoData(this.id);
	});
	$('#del-'+intId).on('click',function(){
		let id=$(this).parent().attr('id');
		confirmDeleteToDoData(id);
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
    let idPrevious = data.substr(4);
  	let idCurrent = this.id.substr(4);

    let preData = $('#p-'+idPrevious).text();
    let curData = $('#p-'+idCurrent).text();
    $('#p-'+idPrevious).text(curData);
    $('#p-'+idCurrent).text(preData);

    let serverData={};
    serverData.ope="dragAndDrop";
    serverData.preIndex=idPrevious;
    serverData.curIndex=idCurrent;
    ajaxCall(serverData);
	}
	return false;
}

function dragEnd(e){
	$('.draggable').removeClass('over');
}

//select All operation on clicking of select all check box
function setAllCheckbox(){
	let chkBoxAll = $("#all:checked").val();        //$("#all:checked").is(':checked')
	let chkBoxAllData;

	if(chkBoxAll){
    chkBoxAllData=true;
    $('.chk-unique').prop('checked',true);
    toTransferAllNotDoneListToDone();
	}else{
    chkBoxAllData=false;
    $('.chk-unique').prop('checked',false);
    toTransferAllDoneListToNotDone();
	}
  setFontStyle(chkBoxAllData,'.para-to-do-data');
  let data = {};
  data.chkBox=chkBoxAllData;
  data.ope="setAllChk";
  ajaxCall(data);
}

//To transfer all to-do-data from "Not done" section to "done" section on Clicking select all checkbox
function toTransferAllNotDoneListToDone(){
  let copy=$("#to-do-list-not-done").children('div');
  $("#to-do-list-not-done").children('div').remove();
  $("#to-do-list-done").append(copy);
}

//To transfer all to-do-data from "done" section to "Not done" section on Clicking select all checkbox
function toTransferAllDoneListToNotDone(){
  let copy=$("#to-do-list-done").children('div');
  $("#to-do-list-done").children('div').remove();
  $("#to-do-list-not-done").append(copy);
}

//select operation on selecting
function selectUniqueToDoData(id){
	let chkSpecific = $('#'+id+':checked').val();
	id=id.substr(4);

  let data = {};
  data.id=id;
  if(chkSpecific){
    toTransferToDoListData(id,"Done");
    data.chkBox=true;
  }
  else{
    toTransferToDoListData(id,"Not Done");
    data.chkBox=false;
  }
  data.ope="setChk";
  setFontStyle(data.chkBox,"#p-"+id);
  ajaxCall(data);
}

//To change the section of to-do-data on Clicking of unique checkbox
function toTransferToDoListData(strId,strSec){
  let copy=$("#row-"+strId);
  $("#row-"+strId).remove();
  if(strSec=="Done")
    $("#to-do-list-done").append(copy);
  else
    $("#to-do-list-not-done").append(copy);
}

//Function to set font style
function setFontStyle(chkSpecific,element){
	if(chkSpecific){
		$(element).addClass("text-strike");
	}
	else{
		$(element).removeClass("text-strike");
	}
}

//function to delete to-do-list row data on clicking of its delete icon
function confirmDeleteToDoData(strId){
	let idNum=strId.substr(4);

	let chkData = $('#chk-'+idNum+':checked').val();
	if(chkData){
		deleteToDoData(idNum,"done");
	}else{
		if(confirm("Your task is not completed! Do you want delete the task?")){
			deleteToDoData(idNum,"not-done");
		}
	}
}

//Removing the selected to-do-list
function deleteToDoData(idNum,catagory){
	let child = $("#row-"+idNum);
	$("#to-do-list-"+catagory).find(child).remove();

  let data = {};
  data.id = idNum;
  data.ope="delete";
	ajaxCall(data);
}

//common Ajax call function to send data to server side
function ajaxCall(data){
  $.ajax({
    type:"POST",
    url:"http://localhost:8000/ope",
    data:JSON.stringify(data),
    contentType:'application/json',
    success:function(data){

    }
  });
}
