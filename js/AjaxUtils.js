var username = "";  //html側でusernameが宣言されていなかったとき用に宣言しておく

//AjaxPostを行うメソッド
function AjaxPost(parameters, async=true){
	var data = {
			user_name:parameters.user_name,
   	        command: parameters.command,
   	        opinion: parameters.opinion,
   	        last_id: parameters.last_id,
   	        opinion_id:parameters.opinion_id,
   	        presentation: parameters.presentation,
   	        password: parameters.password,
   	        answer: parameters.answer
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

	this.Login = function(password = ""){
		var param = new PostParameters();
		param.SetCommand("log_in");
		param.SetPassword(password);
		AjaxPost(param);
	}

	this.Logout = function(async = true){
		var param = new PostParameters();
		param.SetCommand("log_out");
		AjaxPost(param,async);
	}

	this.LoginQuestionnaire = function(password,async = true){
		var param = new PostParameters();
		param.SetCommand("log_in_questionnaire");
		param.SetPassword(password);
		AjaxPost(param,async);
	}

	this.SendOpinion = function(opinion,password){
		var param = new PostParameters();
		param.SetCommand("add_opinion");
		param.SetOpinion(opinion);
		param.SetPassword(password);
		AjaxPost(param);
	}


	this.GetOpinions = function(last_id=0){

		var param = new PostParameters();
		param.SetCommand("get_opinions");
		param.SetLastId(last_id);
		AjaxPost(param);
	}
	this.GetOpinionsWithPassword = function(password){
		var param = new PostParameters();
		param.SetCommand("get_opinions_with_password");
		param.SetPassword(password);
		AjaxPost(param);
	}

	this.GetUserId = function(){
		var param = new PostParameters();
		param.SetCommand("get_user_id");
		AjaxPost(param);
	}

	this.SendLike = function(password){
		var param = new PostParameters();
		param.SetCommand("add_like");
		param.SetPassword(password);
		AjaxPost(param);
	}

	this.SendQuestion = function(password){
		var param = new PostParameters();
		param.SetCommand("add_question");
		param.SetPassword(password);
		AjaxPost(param);
	}

	this.GetReactions = function(last_id){
		var param = new PostParameters();
		param.SetCommand("get_reactions");
		param.SetLastId(last_id);
		AjaxPost(param);

	}

	this.GetFixedReactions = function(){
		var param = new PostParameters();
		param.SetCommand("get_fixed_reactions");
		AjaxPost(param);
	}

	this.GetLatestFixedReaction = function(){
		var param = new PostParameters();
		param.SetCommand("get_latest_fixed_reaction");
		AjaxPost(param);
	}

	this.GetTotalReactions = function(){
		var param = new PostParameters();
		param.SetCommand("get_total_reactions");
		AjaxPost(param);
	}

	this.SetPresentation = function(presentation,async=true){
		var param = new PostParameters();
		param.SetCommand("set_presentation");
		param.SetPresentation(presentation);
		return AjaxPost(param,async);
	}

	this.AllowPresentation = function(presentation){
		var param = new PostParameters();
		param.SetCommand("allow_presentation");
		param.SetPresentation(presentation);
		AjaxPost(param);
	}

	this.BanPresentation = function(presentation){
		var param = new PostParameters();
		param.SetCommand("ban_presentation");
		param.SetPresentation(presentation);
		AjaxPost(param);
	}

	this.GetPresentation = function(async = true){
		var param = new PostParameters();
		param.SetCommand("get_presentation");
		return AjaxPost(param, async);
	}
	this.DeletePresentation = function(async = true){
		var param = new PostParameters();
		param.SetCommand("delete_presentation");
		return AjaxPost(param, async);
	}

	this.CheckPasswordAllowed = function(password, async=true){
		var param = new PostParameters();
		param.SetCommand("check_password_allowed");
		param.SetPassword(password);
		return AjaxPost(param, async);
	}

	this.GetActiveUserNames = function(){
		var param = new PostParameters();
		param.SetCommand("get_active_user_names");
		AjaxPost(param);
	}

	this.GetPasswords = function(async = true){
		var param = new PostParameters();
		param.SetCommand("get_passwords");
		return AjaxPost(param, async);
	}

	this.AddPassword = function(password){
		var param = new PostParameters();
		param.SetCommand("add_password");
		param.SetPassword(password);
		AjaxPost(param);
	}

	this.DeletePassword = function(password){
		var param = new PostParameters();
		param.SetCommand("delete_password");
		param.SetPassword(password);
		AjaxPost(param);
	}

	this.BanUser = function(password){
		var param = new PostParameters();
		param.SetCommand("ban_user");
		param.SetPassword(password);
		AjaxPost(param);
	}

	this.AllowUser = function(password){
		var param = new PostParameters();
		param.SetCommand("allow_user");
		param.SetPassword(password);
		AjaxPost(param);
	}

	this.CheckUserAllowed = function(password, async = true){
		var param = new PostParameters();
		param.SetCommand("check_user_allowed");
		param.SetPassword(password);
		return AjaxPost(param,async);
	}
	this.CheckUserKnockout = function(password, async = true){
		var param = new PostParameters();
		param.SetCommand("check_user_knockout");
		param.SetPassword(password);
		return AjaxPost(param,async);
	}

	this.AddQuestionnaire = function(answer, password,async = true){
		var param = new PostParameters();
		param.SetCommand("add_questionnaire");
		param.SetPassword(password);
		param.SetAnswer(answer);
		return AjaxPost(param,async);
	}

	this.GetRestTime = function(async=true){
		var param = new PostParameters();
		param.SetCommand("get_rest_time");
		return AjaxPost(param,async);
	}

}


//Post用パラメータ
var PostParameters = function(){
	this.command = "";
	this.opinion = "";
	this.user_name = username; //html側で宣言されている想定、宣言されていなければカラ文字列が入る
	this.last_id = "";
	this.opinion_id = "";
	this.presentation = "";
	this.password = "";
	this.answer = "";

	this.SetCommand = function(command){
		this.command  = command;
	}
	this.SetOpinion = function(opinion){
		this.opinion = opinion;
	}
	this.SetUsername = function(user_name){
		this.user_name = user_name;
	}
	this.SetLastId = function(last_id){
		this.last_id = last_id;
	}
	this.SetOpinionId = function(opinion_id){
		this.opinion_id = opinion_id;
	}
	this.SetPresentation = function(presentation){
		this.presentation = presentation;
	}
	this.SetPassword = function(password){
		this.password = password;
	}
	this.SetAnswer = function(answer){
		this.answer = answer;
	}

}



