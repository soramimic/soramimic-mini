
//AjaxPostを行うメソッド
function AjaxPost(parameters, async=true){
	var data = {
			user_id: parameters.user_id,
			user_name:parameters.user_name,
   	        command: parameters.command,
   	        text_length: parameters.text_length,
   	        wordfile: parameters.wordfile,
   	        conversion_param: parameters.conversion_param
   	};

	console.log(data);

    return $.ajax({
            url: "php/AccessMe.php",
            type: "POST",
            data: JSON.stringify(data),
            //processData: false,
            contentType: "application/json",
            dataType:"json",
            async: async
         })
        .done(function( data ) {
        	if(async == true){
            	var json_string = JSON.stringify(data);
       	      	var obj = JSON.parse(json_string);
       	      	//console.log(json_string);
       	      	console.log(data);
       	      	ProcessResult(parameters.command,obj["content"]); //html側に書かれている想定の関数
        	}
        })
        .fail(function(XMLHttpRequest, textStatus, errorThrown){
            console.log("ajax通信に失敗しました");
            console.log("XMLHttpRequest : " + XMLHttpRequest.responseText);
            console.log("XMLHttpRequest : " + XMLHttpRequest.status);
            console.log("textStatus     : " + textStatus);
            console.log("errorThrown    : " + errorThrown.message);
        })
}




//Ajaxポストをする関数を管理するクラス
var AjaxGateway = function(){

	this.Login = function(){
		const param = new PostParameters();
		param.SetCommand("log_in");
		AjaxPost(param);
	}

	this.Logout = function(async = true){
		const param = new PostParameters();
		param.SetCommand("log_out");
		AjaxPost(param,async);
	}
	this.SendConversionInfo = (textlen,wordfile,conversion_param) => {
		const param = new PostParameters();
		param.SetCommand("send_conversion_info");
		param.SetTextLength(textlen);
		param.SetWordFile(wordfile);
		param.SetConversionParam(conversion_param);
		AjaxPost(param);		
	}

}


//Post用パラメータ
let PostParameters = function(){
	this.command = "";
	this.user_name = "";
	this.user_id = user_id;
	this.wordfile = "";
	this.text_length = "";
	this.conversion_param = "";

	this.SetCommand = function(command){
		this.command  = command;
	}
	this.SetConversionParam = (conversion_param) => {
		this.conversion_param = JSON.stringify(conversion_param);
	}
	this.SetTextLength = (textlen) => {
		this.text_length = textlen;
	}
	this.SetWordFile = (wordfile) => {
		this.wordfile = wordfile;
	}
	this.SetUserId = (user_id) => {
		this.user_id = user_id;
	}
	this.SetUsername = function(user_name){
		this.user_name = user_name;
	}
}



