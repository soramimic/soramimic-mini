<?php
#ajaxアクセス先
require_once 'autoloader.php';


//jsonをパース/////////////////
$json_string = file_get_contents('php://input');
$obj = json_decode($json_string);
$obj = (array)$obj;
/////////////////////////////////

$command = $obj['command'];//コマンドの種類を取得
//COOKIEをチェックし、ユーザーIDを取得
if(!array_key_exists("user_id", $obj) || $obj['user_id']==""){
	$user_id = Utils::GetUserIdByCookie();
}
else {
	$user_id = $obj['user_id'];
}

$user_name = $obj['user_name'];
//Utils::SendResponse("success", "message", $user_id);


//受信したデータサイズのチェック
foreach(Constants::$MAX_PARAM_LENGTH as $key => $value){
	if(Utils::CheckPostParameters([$key], $obj)){
		if(strlen($obj[$key])>$value){
			Utils::SendResponse(Constants::$STATUS_FAILED, Constants::$MESSAGE_103, "fail:".$key);
			return;
		}
	}
}

//answerがあればanswerについてもチェックする
if(Utils::CheckPostParameters(["answer"], $obj) and $obj['answer']!=""){
	$answer = (array)$obj['answer'];
	foreach(Constants::$MAX_QUESTIONNAIRE_LENGTH as $key => $value){
		if(Utils::CheckPostParameters([$key], $answer)){
			if(strlen($answer[$key])>$value){
				Utils::SendResponse(Constants::$STATUS_FAILED, Constants::$MESSAGE_103, "fail:".$key);
				return;
			}
		}
	}
}



switch($command){
	case 'log_in':
		//ユーザーがログインしたことをBBへ通知
		DbOperator::AddLoginInfo($user_id,$obj['user_name'],Constants::$LOG_IN);
		Utils::SendResponse(Constants::$STATUS_SUCCESS, Constants::$MESSAGE_SUCCESS, null);
		break;
	case 'log_out':
		DbOperator::AddLoginInfo($user_id,$obj['user_name'],Constants::$LOG_OUT);
		Utils::SendResponse(Constants::$STATUS_SUCCESS, Constants::$MESSAGE_SUCCESS, null);
		break;
	case "send_conversion_info":
	    DbOperator::AddConversionInfo($user_id,$obj["user_name"],$obj["text_length"],$obj["wordfile"],$obj["conversion_param"]);
	    Utils::SendResponse(Constants::$STATUS_SUCCESS, Constants::$MESSAGE_SUCCESS, null);
	    break;
	default:
		var_dump($obj);
		break;
}