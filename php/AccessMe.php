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
		DbOperator::AddLoginInfo($user_id,$obj['user_name'],Constants::$LOG_IN,$obj["password"]);
		Utils::SendResponse(Constants::$STATUS_SUCCESS, Constants::$MESSAGE_SUCCESS, null);
		break;
	case 'log_out':
		DbOperator::AddLoginInfo($user_id,$obj['user_name'],Constants::$LOG_OUT);
		Utils::SendResponse(Constants::$STATUS_SUCCESS, Constants::$MESSAGE_SUCCESS, null);
		break;
	case "log_in_questionnaire":
		DbOperator::AddLoginInfo($user_id,$obj['user_name'],Constants::$LOG_IN_QUESTIONNAIRE,$obj["password"]);
		Utils::SendResponse(Constants::$STATUS_SUCCESS, Constants::$MESSAGE_SUCCESS, null);
		break;
	case 'get_user_id':
		Utils::SendResponse(Constants::$STATUS_SUCCESS, Constants::$MESSAGE_SUCCESS, $user_id);
		break;
	case 'get_active_user_names':
		$active_user_names = DbOperator::GetActiveUserNames();
		Utils::SendResponse(Constants::$STATUS_SUCCESS, Constants::$MESSAGE_SUCCESS, $active_user_names);
		break;
	case 'add_opinion':
		if(Utils::CheckPostParameters(["opinion"], $obj)){
			$new_opinion = DbOperator::AddOpinion($user_id, $obj['user_name'],$obj['password'],$obj['opinion']);
			if($new_opinion != null){
				Utils::SendResponse(Constants::$STATUS_SUCCESS, Constants::$MESSAGE_SUCCESS, $new_opinion);
			}
		}
		else {
			Utils::SendResponse(Constants::$STATUS_FAILED, Constants::$MESSAGE_101, null);
		}
		break;
	case 'get_opinions':
		if(Utils::CheckPostParameters(["last_id"], $obj)){
			$new_opinions = DbOperator::GetNewOpinions($obj['last_id']);
			Utils::SendResponse(Constants::$STATUS_SUCCESS, Constants::$MESSAGE_SUCCESS, $new_opinions);
		}
		else{
			Utils::SendResponse(Constants::$STATUS_FAILED, Constants::$MESSAGE_101, null);
		}
		break;
	case 'get_opinions_with_password':
		$opinions = DbOperator::GetOpinionsWithPassword($obj['password']);
		Utils::SendResponse(Constants::$STATUS_SUCCESS, Constants::$MESSAGE_SUCCESS, $opinions);
		break;
	case 'get_reactions':
		$reactions = DbOperator::GetReactions($obj['last_id']);
		Utils::SendResponse(Constants::$STATUS_SUCCESS, Constants::$MESSAGE_SUCCESS, $reactions);
		break;
	case 'get_fixed_reactions':
		$like = DbOperator::GetFixedReactions(Constants::$REACTION_LIKE,-1);
		$question = DbOperator::GetFixedReactions(Constants::$REACTION_QUESTION,-1);
		$count = array(
				Constants::$REACTION_LIKE => $like,
				Constants::$REACTION_QUESTION => $question
		);
		Utils::SendResponse(Constants::$STATUS_SUCCESS, Constants::$MESSAGE_SUCCESS, $count);
		break;
	case 'get_latest_fixed_reaction':
		$like = DbOperator::GetLatestFixedReaction(Constants::$REACTION_LIKE);
		$question = DbOperator::GetLatestFixedReaction(Constants::$REACTION_QUESTION);
		$count = array(
				Constants::$REACTION_LIKE => $like,
				Constants::$REACTION_QUESTION => $question
		);
		Utils::SendResponse(Constants::$STATUS_SUCCESS, Constants::$MESSAGE_SUCCESS, $count);
		break;
	case 'get_total_reactions':
		$like = DbOperator::GetTotalReactions(Constants::$REACTION_LIKE);
		$question = DbOperator::GetTotalReactions(Constants::$REACTION_QUESTION);
		$count = array(
				Constants::$REACTION_LIKE => $like,
				Constants::$REACTION_QUESTION => $question
		);
		Utils::SendResponse(Constants::$STATUS_SUCCESS, Constants::$MESSAGE_SUCCESS, $count);
		break;
	case 'add_like':
		$id = DbOperator::AddReaction($user_id, $user_name, $obj['password'],Constants::$REACTION_LIKE);
		Utils::SendResponse(Constants::$STATUS_SUCCESS, Constants::$MESSAGE_SUCCESS, $id);
		break;
	case 'add_question' :
		$id = DbOperator::AddReaction ( $user_id, $user_name,  $obj['password'], Constants::$REACTION_QUESTION);
		Utils::SendResponse ( Constants::$STATUS_SUCCESS, Constants::$MESSAGE_SUCCESS, $id );
		break;
	case 'set_presentation':
		$id = DbOperator::AddPresentation($obj['presentation']);
		Utils::SendResponse ( Constants::$STATUS_SUCCESS, Constants::$MESSAGE_SUCCESS, $id );
		break;
	case 'get_presentation':
		$presentation = DbOperator::GetPresentation();
		Utils::SendResponse ( Constants::$STATUS_SUCCESS, Constants::$MESSAGE_SUCCESS, $presentation );
		break;
	case 'delete_presentation':
		$presentation = DbOperator::DeletePresentation();
		Utils::SendResponse ( Constants::$STATUS_SUCCESS, Constants::$MESSAGE_SUCCESS, $presentation );
		break;
	case 'allow_presentation':
		$presentation = DbOperator::SetPresentationStatus($obj['presentation'],Constants::$USER_STATUS_ALLOWED);
		Utils::SendResponse ( Constants::$STATUS_SUCCESS, Constants::$MESSAGE_SUCCESS, $presentation );
		break;
	case 'ban_presentation':
		$presentation = DbOperator::SetPresentationStatus($obj['presentation'],Constants::$USER_STATUS_BANNED);
		Utils::SendResponse ( Constants::$STATUS_SUCCESS, Constants::$MESSAGE_SUCCESS, $presentation );
		break;
	case 'check_password_allowed':
		$isAllowed = DbOperator::CheckPasswordAllowed($obj["password"]);
		Utils::SendResponse ( Constants::$STATUS_SUCCESS, Constants::$MESSAGE_SUCCESS, $isAllowed );
		break;
	case 'ban_user':
		DbOperator::SetUserStatus($obj["password"], Constants::$USER_STATUS_BANNED);
		Utils::SendResponse ( Constants::$STATUS_SUCCESS, Constants::$MESSAGE_SUCCESS, $obj["password"]);
		break;
	case 'allow_user':
		DbOperator::SetUserStatus($obj["password"], Constants::$USER_STATUS_ALLOWED);
		Utils::SendResponse ( Constants::$STATUS_SUCCESS, Constants::$MESSAGE_SUCCESS, $obj["password"]);
		break;
	case 'add_password':
		DbOperator::AddPassword($obj["password"]);
		Utils::SendResponse ( Constants::$STATUS_SUCCESS, Constants::$MESSAGE_SUCCESS, $obj["password"]);
		break;
	case 'delete_password':
		DbOperator::DeletePassword($obj["password"]);
		Utils::SendResponse ( Constants::$STATUS_SUCCESS, Constants::$MESSAGE_SUCCESS, $obj["password"]);
		break;
	case 'get_passwords':
		//$passwords = DbOperator::GetPasswords($obj["password"]);
		$passwords = DbOperator::UpdateAndGetPasswords($obj["password"]);
		Utils::SendResponse ( Constants::$STATUS_SUCCESS, Constants::$MESSAGE_SUCCESS, $passwords);
		break;
	case 'check_user_allowed':
		$isAllowed = DbOperator::CheckUserAllowed($obj["password"]);
		Utils::SendResponse ( Constants::$STATUS_SUCCESS, Constants::$MESSAGE_SUCCESS, $isAllowed);
		break;
	case 'check_user_knockout':
		$isAllowed = DbOperator::CheckUserKnockout($obj["password"]);
		Utils::SendResponse ( Constants::$STATUS_SUCCESS, Constants::$MESSAGE_SUCCESS, $isAllowed);
		break;
	case 'add_questionnaire':
		//$obj["answer"]=(array)$obj["answer"];
		$answer = (array)$obj["answer"];
		//文字数チェック

		$id = DbOperator::AddQuestionnaire($answer,$obj["password"],$obj["user_name"]);
		Utils::SendResponse ( Constants::$STATUS_SUCCESS, Constants::$MESSAGE_SUCCESS, $id);
		break;
	case 'get_rest_time':
		$sec = DbOperator::GetRestTimeSec();
		Utils::SendResponse ( Constants::$STATUS_SUCCESS, Constants::$MESSAGE_SUCCESS, $sec);
		break;
	default:
		var_dump($obj);
		break;
}