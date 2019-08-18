<?php
#便利関数管理用クラス　

class Utils{

	static function GetUserIdByCookie(){
		if(isset($_COOKIE[Constants::$COOKIE_USERID])){
			return $_COOKIE[Constants::$COOKIE_USERID];
		}
		else {
			$uuid = Utils::GenerateUniqID("chega_system_");
			setcookie(Constants::$COOKIE_USERID,$uuid);
			return $uuid;
		}
	}

	static function GenerateUniqID($prefix = null){
		if($prefix == null){
			$uuid = uniqid(rand(0,1000));
		}
		else $uuid = uniqid($prefix,true);

		return str_replace(".", "_", $uuid);
	}


	/*
	 * クライアントへの返答を生成する
	 * @status
	 * @message
	 * @content
	 */
	static function SendResponse($status,$message,$content){
		header('content-type: application/json; charset=utf-8');
		$array = array("status"=>$status,"message"=>$message,"content"=>$content);
		echo(json_encode($array));
	}

	/*
	 * データベース接続用PDOを取得する
	 */
	static function GetPDO(){
		if(PHP_OS=="Linux"){
			$dbh = new PDO('mysql:host=127.0.0.1;dbname=soramimic','soramimic','M3wm2dt2oNah');
			//$dbh = new PDO('mysql:host=127.0.0.1;dbname=chega_system','chega','password');
		}
		else{
			//$dbh = new PDO('mysql:host=127.0.0.1:8889;dbname=shimaya','shimaya','UUGcrUvJmTovQbx5',array(PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION));
			$dbh = new PDO('mysql:host=127.0.0.1:8889;dbname=soramimic','soramimic','M3wm2dt2oNah',array(PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION));
		}
		/// これを入れないと、mysqlから帰って来る文字列が全部'?'になる場合がある
		$dbh->query("set names utf8");
		return $dbh;
	}

	/*
	 * 必要なパラメータがすべてポストされているかどうか確認する
	 */
	static function CheckPostParameters($requred_parameters,$posted_parameters){
		foreach ($requred_parameters as $parameter){
			if(!array_key_exists($parameter, $posted_parameters))return false;
		}
		return true;
	}


	/*
	 * ループ中のタイムアウトをチェックする
	 */
	static function CheckTimeOut($start_time,$MAX_TIME){
		if(time() - $start_time > $MAX_TIME){
			return true;
		}
		else return false;
	}

	/*
	 * adminとして許可するユーザ情報の取得
	 */
	static function ReadAdminUsersConf(){
		$dir = __FILE__;
		if(PHP_OS=="WIN32"||PHP_OS=="WINNT"||PHP_OS=="WIN64"){
			$dir = rtrim($dir, "\php\Utils.php");
			$file = $dir."\conf\adminUsers.json";
		}
		else{
			$dir = rtrim($dir, "/php/Utils.php");
			$file = $dir."/conf/adminUsers.json";
		}

		$json_string = file_get_contents($file);
		//echo($json_string);
		$obj = json_decode($json_string);
		$obj = (array)$obj;
		return $obj[Constants::$KEY_ADMIN_USERS];
	}

	/*
	 * ユーザが許可されているかどうかのチェック
	 */
	static function CheckUserAllowedAsAdmin(){
		$this_user = "u319435f";
		//$this_user = getenv("roleId");
		//echo $this_user;

		$allowed_admin_users = Utils::ReadAdminUsersConf();
		//$allowed_admin_users = ["u319435ff"];
		if(in_array($this_user, $allowed_admin_users)){

		}
		else{
			echo Constants::$MESSAGE_ERROR_USER_CERTIFICATION;
			//echo "エラー: ユーザー認証できませんでした";
			exit;
		}
	}


}
