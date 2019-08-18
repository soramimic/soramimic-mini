<?php
#定数管理用クラス
class Constants{
	public static $COOKIE_USERID = "user_id";

	public static $STATUS_FAILED = "failed";
	public static $STATUS_SUCCESS = "success";

	public static $MESSAGE_SUCCESS = "success";
	public static $MESSAGE_101 = "ポストパラメータが不十分です。";
	public static $MESSAGE_102 = "ポーリング処理がタイムアウトしました。";
	public static $MESSAGE_103 = "データサイズの超過です。";

	public static $LOG_IN = "in";
	public static $LOG_OUT = "out";
	public static $LOG_IN_QUESTIONNAIRE = "questionnaire";


	public static $REACTION_LIKE = "like";
	public static $REACTION_QUESTION = "question";

	public static $USER_STATUS_BANNED = 1;
	public static $USER_STATUS_ALLOWED = 0;

	public static $FIX_INTERVAL = 120; //second

	public static $KEY_ADMIN_USERS = "adminUsers";
	public static $MESSAGE_ERROR_USER_CERTIFICATION = "エラー: ユーザー認証できませんでした";

	public static $QUESTIONNAIRE_1_1 = "q1_1";
	public static $QUESTIONNAIRE_1_1_6_input = "q1_1_6_input";
	public static $QUESTIONNAIRE_1_2 = "q1_2";
	public static $QUESTIONNAIRE_2 = "q2";
	public static $QUESTIONNAIRE_3 = "q3";
	public static $QUESTIONNAIRE_4 = "q4";
	public static $QUESTIONNAIRE_5 = "q5";
	public static $QUESTIONNAIRE_6 = "q6";

	public static $MAX_PARAM_LENGTH = array(
			"opinion"=>2000,
			"password"=>200,
			"user_name"=>200
	);
	public static $MAX_QUESTIONNAIRE_LENGTH = array(
			"q1_1_6_input"=>400,
			"q1_2"=>400,
			"q3"=>2000,
			"q4"=>2000,
			"q5"=>2000,
			"q6"=>2000
	);


}