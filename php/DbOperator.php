<?php
#投票結果管理用クラス
class DbOperator{


	/*
	 * 有効なパスワードを追加する
	 */
	static function AddPassword($password){
		$dbh = Utils::GetPdO();
		$add = $dbh->prepare("insert into passwords(password,ban,logging,user_name,logging_time,opinion_num,time_stamp)values(?,0,'','',0,0,now())");
		$add->bindParam(1,$password);
		if($add->execute()){
			return $dbh->lastInsertId("id");
		}else{
			return null;
		}
	}

	/*
	 * パスワードを削除する
	 */
	static function DeletePassword($password){
		$dbh = Utils::GetPdO();
		$delete = $dbh->prepare("delete from passwords where password = ?");
		$delete->bindParam(1,$password);
		if($delete->execute()){
			return true;
		}else{
			return null;
		}
	}

	/*
	 * DBのパスワードを取得する
	 */

	static function GetPasswords(){
		$dbh = Utils::GetPdO();
		$get = $dbh->prepare("select * from passwords");
		$get->execute();
		if($get->rowCount()==0){
			//echo("row count is 0");
			return null;
		}
		else{
			//新しい返答が見つかった場合
			//同一ユーザ間の重複を排除して返答
			$data = null;
			while ($row = $get->fetch()){
				$data[] = array(
						'id'=>$row['id'],
						'password'=>$row['password'],
						'ban'=>$row['ban'],
						'logging'=>$row['logging'],
						'user_name'=>$row['user_name'],
						'logging_time'=>$row['logging_time'],
						'opinion_num'=>$row['opinion_num'],
						'time_stamp'=>$row['time_stamp']
				);
			}
			return $data;
		}
	}
	/*
	 * パスワードからユーザ情報を取得する
	 */

	/*
	 * パスワードがリストにあるかチェックする
	 */
	static function CheckPasswordExisted($password){
		$dbh = Utils::GetPDO();
		$get = $dbh->prepare("select * from passwords where password = ?");
		$get->bindParam(1,$password);
		$get->execute();
		if($get->rowCount()>0){
			return true;
		}
		else{
			return false;
		}
	}

	/*
	 * そのパスワードが使用可能かチェックする
	 */
	static function CheckPasswordAllowed($password){
		$exists = DbOperator::CheckPasswordExisted($password);
		return $exists;
	}


	/*
	 * ログイン情報を追加する
	 */
	static function AddLoginInfo($user_id,$user_name,$status){
		$isAllowed = true;
		if($isAllowed == true){ //パスワードが有効なとき

			$dbh = Utils::GetPDO();
			$add = $dbh->prepare("insert into logging(user_id,user_name,status,attend,time_stamp)values(?,?,?,1,now())");
			$add->bindParam(1, $user_id);
			$add->bindParam(2, $user_name);
			$add->bindParam(3, $status);

			if($add->execute()){
				$last_insert_id = $dbh->lastInsertId('id');

				$update = $dbh->prepare("update logging set attend = 0 where attend = 1 and id < ? and user_id = ?");
				$update->bindParam(1, $last_insert_id);
				$update->bindParam(2, $user_id);
				$update->execute();

				return $last_insert_id;
			}
			else{
				return null;
			}
		}else{
			return false;
		}
	}
	
	/*
	 * 変換の情報を記録する
	 */
	static function AddConversionInfo($user_id,$user_name,$text_length,$wordfile,$conversion_param){
	        
	        $dbh = Utils::GetPDO();
	        $add = $dbh->prepare("insert into conversion(user_id,user_name,text_length,wordfile,conversion_param,time_stamp)values(?,?,?,?,?,now())");
	        $add->bindParam(1, $user_id);
	        $add->bindParam(2, $user_name);
	        $add->bindParam(3, $text_length);
	        $add->bindParam(4, $wordfile);
	        $add->bindParam(5, $conversion_param);
	        
	        if($add->execute()){
	            $last_insert_id = $dbh->lastInsertId('id');
	            return $last_insert_id;
	        }
	        else{
	            return null;
	        }
	        
	}
	
	/*
	 * idからuser情報を取得する
	 */
	static function GetLoginInfoWithId($id){
		$dbh = Utils::GetPDO();
		$get = $dbh->prepare("select * from logging where id = ?");
		$get->bindParam(1,$id);
		$get->execute();
		if($get->rowCount()==0){
			return null;
		}
		else{
			$row = $get->fetch();
			$data = array(
					'id'=>$row['id'],
					'user_id'=>$row['user_id'],
					'user_name'=>$row['user_name'],
					'logging'=>$row['logging'],
					'attend'=>$row['attend'],
					'ban'=>$row['ban'],
					'password'=>$row['password'],
					'time_stamp'=>$row['time_stamp']
			);
			return $data;
		}

	}

	/*
	 * userをbanする(1がban、0がallow)
	 */
	static function SetUserStatus($password, $ban){
		DbOperator::SetPasswordStatus($password, $ban);

		$dbh = Utils::GetPDO();
		$update = $dbh->prepare("update logging set ban = ? where password = ?");
		$update->bindParam(1,$ban);
		$update->bindParam(2,$password);
		if($update->execute()){
			return $password;
		}else{
			return null;
		}
	}

	/*
	 *userのban状態を取得
	 */
	static function GetUserStatus($password){
		$dbh = Utils::GetPDO();
		$get = $dbh->prepare("select * from logging where password = ? order by id desc limit 1"); //同一password使用者の最後の一人だけ見れば良い
		$get->bindParam(1,$password);
		$get->execute();
		if($get->rowCount()>0){
			$row = $get->fetch();
			return $row["ban"];
			//return $row;
		}else{
			return null;
		}
	}
	/*
	 * userがコメント送信可能かどうかをチェックする
	 */
	static function CheckUserAllowed($password){
		$user_status = DbOperator::GetUserStatus($password);
		$presentation_status = DbOperator::GetPresentation()["ban"];

		$user_allowed = ($user_status == Constants::$USER_STATUS_ALLOWED);
		$presentation_allowed = ($presentation_status == Constants::$USER_STATUS_ALLOWED);
		return ($user_allowed and $presentation_allowed);
	}

	/*
	 * userがコメント送信可能かどうかをチェックする
	 */
	static function CheckUserKnockout($password){
		$user_status = DbOperator::GetUserStatus($password);
		$user_allowed = ($user_status == Constants::$USER_STATUS_BANNED);
		//$user_allowed = ($user_status == "0");
		return $user_allowed;
	}

	/*
	 * パスワードのban状態を設定
	 */
	static function SetPasswordStatus($password, $status){
		$dbh = Utils::GetPDO();
		$update = $dbh->prepare("update passwords set ban = ? where password = ?");
		$update->bindParam(1,$status);
		$update->bindParam(2,$password);
		if($update->execute()){
			return $password;
		}else{
			return null;
		}
	}

	/*
	 * パスワードのban状態の取得
	 */
	static function GetPasswordStatus($password){
		$dbh = Utils::GetPDO();
		$get = $dbh->prepare("select * from passwords where password = ? order by id desc limit 1");
		$get->bindParam(1,$password);
		$get->execute();
		if($get->rowCount()==0){
			return null;
		}
		else{
			return $get->fetch()['ban'];
		}
	}


	/*
	 * 意見を追加する
	 */
	static function AddOpinion($user_id,$user_name,$password,$opinion){
		$dbh = Utils::GetPDO();
		$add = $dbh->prepare("insert into opinions(user_id,user_name,password,opinion,presentation,time_stamp)values(?,?,?,?,?,now())");
		$add->bindParam(1, $user_id);
		$add->bindParam(2, $user_name);
		$add->bindParam(3, $password);
		$add->bindParam(4, $opinion);
		//現在のプレゼンテーションを取得して代入
		$presentation = DbOperator::GetPresentation()["presentation"];
		$add->bindParam(5, $presentation);

		if($add->execute()){
			//return $dbh->lastInsertId('id');
			return DbOperator::GetOpinionWithId($dbh->lastInsertId('id'));
		}
		else{
			return null;
		}
	}

	/*
	 * パスワードのコメント数を更新する
	 */
	static function SetOpinionNumber($password,$opinion_num){
		$dbh = Utils::GetPDO();
		$update = $dbh->prepare("update passwords set opinion_num = ? where password = ?");
		$update->bindParam(1,$opinion_num);
		$update->bindParam(2,$password);
		if($update->execute()){
			return $password;
		}
		else{
			return null;
		}
	}

	/*
	 * パスワードのコメント数を1増加する
	 */
	static function IncrementOpinionNumber($password){
		$current = DbOperator::GetPasswordWithPassword($password);
		return DbOperator::SetOpinionNumber($password, $current['opinion_num']+1);
	}

	/*
	 * パスワード情報を取得する
	 */
	static function GetPasswordWithPassword($password){
		$dbh = Utils::GetPDO();
		$get = $dbh->prepare("select * from passwords where password = ? order by id desc limit 1");
		$get->bindParam(1,$password);
		$get->execute();
		if($get->rowCount()==0){
			return null;
		}else{
			$row = $get->fetch();
			$data = array(
					'id'=>$row['id'],
					'password'=>$row['password'],
					'ban'=>$row['ban'],
					'logging'=>$row['logging'],
					'user_name'=>$row['user_name'],
					'logging_time'=>$row['logging_time'],
					'opinion_num'=>$row['opinion_num'],
					'time_stamp'=>$row['time_stamp']
			);
			return $data;
		}
	}

	/*
	 * パスワードのコメント数を取得する
	 */
	static function GetOpinionNumber($password){
		$dbh = Utils::GetPDO();
		$get = $dbh->prepare("select * from opinions where password = ?");
		$get->bindParam(1,$password);
		if($get->execute()){
			return $get->rowCount();
		}
		else{
			return null;
		}
	}

	/*
	 * 全パスワードのコメント数を更新する
	 */
	static function UpdateOpinionNumbers(){
		$passwords = DbOperator::GetPasswords();
		foreach($passwords as $p){
			$opinion_num = DbOperator::GetOpinionNumber($p['password']);
			DbOperator::SetOpinionNumber($p['password'], $opinion_num);
		}
	}
	/*
	 * 全パスワードのコメント数を更新して取得する
	 */
	static function UpdateAndGetPasswords(){
		DbOperator::UpdateOpinionNumbers();
		return DbOperator::GetPasswords();
	}

	/*
	 * idで指定したopinionを取得する
	 */
	static function GetOpinionWithId($id){
		$dbh = Utils::GetPDO();
		$get = $dbh->prepare("select * from opinions where id = ?");
		$get->bindParam(1,$id);
		$get->execute();
		if($get->rowCount()==0){
			return null;
		}
		else{
			$row = $get->fetch();
			$data = array(
					'id'=>$row['id'],
					'user_id'=>$row['user_id'],
					'user_name'=>$row['user_name'],
					'password'=>$row['password'],
					'opinion'=>$row['opinion'],
					'presentation'=>$row['presentation'],
					'time_stamp'=>$row['time_stamp']
			);
			return $data;
		}
	}

	/*
	 * idで指定したopinionを取得する
	 */
	static function GetOpinionsWithPassword($password){
		$dbh = Utils::GetPDO();
		$get = $dbh->prepare("select * from opinions where password = ?");
		$get->bindParam(1,$password);
		$get->execute();
		if($get->rowCount()==0){
			return null;
		}
		else{
			while ($row = $get->fetch()){
				$data[] = array(
						'id'=>$row['id'],
						'user_id'=>$row['user_id'],
						'user_name'=>$row['user_name'],
						'password'=>$row['password'],
						'opinion'=>$row['opinion'],
						'presentation'=>$row['presentation'],
						'time_stamp'=>$row['time_stamp']
				);
			}
			return $data;
		}
	}


	/*
	 * リアクションを追加する
	 */
	static function AddReaction($user_id,$user_name,$password,$reaction){

		$dbh = Utils::GetPDO();
		$add = $dbh->prepare("insert into reactions(user_id,user_name,password,reaction,used,phase,presentation,second,time_stamp)values(?,?,?,?,1,-1,?,TIME_TO_SEC(TIMEDIFF(now(),?)),now())");
		$add->bindParam(1, $user_id);
		$add->bindParam(2, $user_name);
		$add->bindParam(3, $password);
		$add->bindParam(4, $reaction);
		//現在のプレゼンテーションを取得して代入
		$current = DbOperator::GetPresentation();
		$add->bindParam(5, $current['presentation']);
		$add->bindParam(6, $current['time_stamp']);

		if($add->execute()){
			//同一パスワードの2分以内のfixされていないreactionのusedを0にする
			$lastInsertId = $dbh->lastInsertId('id');
			$lastReaction = DbOperator::GetReactionWithId($lastInsertId);
			$phase = floor($lastReaction['second']/Constants::$FIX_INTERVAL);

			//追加したのと同じphase, presen, passwordのusedを0にする
			$update = $dbh->prepare("update reactions set used = 0 where password = ? and id < ? and time_stamp >= ? and phase = ?");
			$update->bindParam(1,$password);
			$update->bindParam(2,$lastInsertId);
			$update->bindParam(3,$current['time_stamp']);
			$update->bindParam(4,$phase);
			$update->execute();

			//追加したらリアクションのphaseを更新
			$update2 = $dbh->prepare("update reactions set phase = ? where id = ?");
			$update2->bindParam(1,$phase);
			$update2->bindParam(2,$lastInsertId);
			$update2->execute();
			return DbOperator::GetReactionWithId($lastInsertId);
		}
		else{
		}
	}

	/*
	 * 指定したIDのリアクションを取得(作業用)
	 */
	static function GetReactionWithId($id){
		$dbh = Utils::GetPDO();
		$get = $dbh->prepare("select * from reactions where id = ?");
		$get->bindParam(1,$id);
		$get->execute();
		if($get->rowCount()==0){
			return null;
		}
		else{
			$row = $get->fetch();
			$data = array(
					'id'=>$row['id'],
					'user_id'=>$row['user_id'],
					'user_name'=>$row['user_name'],
					'password'=>$row['password'],
					'reaction'=>$row['reaction'],
					'used'=>$row['used'],
					'phase'=>$row['phase'],
					'presentation'=>$row['presentation'],
					'second'=>$row['second'],
					'time_stamp'=>$row['time_stamp']
			);
			return $data;
		}
	}

	/*
	 * 現在のfix_time (phase)を取得する(作業用)
	 */
	static function GetCurrentPhase(){
		$dbh = Utils::GetPDO();
		//現在のプレゼンの開始時刻を取得
		$current = DbOperator::GetPresentation();
		//現在のプレゼンの開始時刻と現在時刻の差(秒)をfix_intervalで割った商を切り捨てた値をphaseに代入する
		$add = $dbh->prepare("insert into gettime(phase)values( TRUNCATE ( TIME_TO_SEC ( TIMEDIFF(now(), ?) ) / ?, 0 ) )");
		$add->bindParam(1, $current['time_stamp']);
		$add->bindParam(2, Constants::$FIX_INTERVAL);

		if($add->execute()){
			$id = $dbh->lastInsertId(); //挿入した行の取得
			$get = $dbh->prepare("select * from gettime where id = ?");
			$get->bindParam(1,$id);
			$get->execute();

			$phase = $get->fetch()['phase'];//挿入した行からphaseを取得する

			//追加した行を消す
			$delete = $dbh->prepare("delete from gettime where id = ?");
			$delete->bindParam(1,$id);
			$delete->execute();

			return $phase;
		}
		else{
			return null;
		}
	}

	/*
	 *次のphaseまでの残り時間を取得
	 */
	static function GetRestTimeSec(){
		$dbh = Utils::GetPDO();
		//現在のプレゼンの開始時刻を取得
		$current = DbOperator::GetPresentation();
		//現在のプレゼンの開始時刻と現在時刻の差(秒)をfix_intervalで割った商を切り捨てた値をphaseに代入する
		$add = $dbh->prepare("insert into gettime(phase)values( TIME_TO_SEC ( TIMEDIFF(now(), ?) ) )");
		$add->bindParam(1, $current['time_stamp']);

		if($add->execute()){
			$id = $dbh->lastInsertId(); //挿入した行の取得
			$get = $dbh->prepare("select * from gettime where id = ?");
			$get->bindParam(1,$id);
			$get->execute();

			$second = Constants::$FIX_INTERVAL -  $get->fetch()['phase']%Constants::$FIX_INTERVAL;//挿入した行からphaseを取得する

			//追加した行を消す
			$delete = $dbh->prepare("delete from gettime where id = ?");
			$delete->bindParam(1,$id);
			$delete->execute();

			return $second;
		}
		else{
			return null;
		}
	}

	/*
	 * 過去の確定したreactionを取得
	 */
	static function GetFixedReactions($reaction, $last_phase=-1){ //last_phase+1以降のphaseのリアクションを追加する
		$current_phase = DbOperator::GetCurrentPhase(Constants::$FIX_INTERVAL);
		$current = DbOperator::GetPresentation();
		$data = array();
		for($i = $last_phase+1; $i < $current_phase; $i++){
			$dbh = Utils::GetPDO();
			$get = $dbh->prepare("select * from reactions where reaction = ? and used = 1 and phase = ? and presentation = ? and time_stamp >= ? and time_stamp > (now() - interval 60 minute)");
			$get->bindParam(1,$reaction);
			$get->bindParam(2,$i);
			$get->bindParam(3,$current['presentation']);
			$get->bindParam(4,$current['time_stamp']);
			if($get->execute()){
				$data[$i] = $get->rowCount();
			}
		}
		return $data;
	}

	/*
	 * 確定したリアクションの内もっとも新しいフェーズを取得
	 */
	static function GetLatestFixedReaction($reaction){
		$current_phase = DbOperator::GetCurrentPhase();
		return DbOperator::GetFixedReactions($reaction,$current_phase-2)[$current_phase-1];
	}

	static function GetTotalReactions($reaction){
		$dbh = Utils::GetPDO();
		$get = $dbh->prepare("select * from reactions where reaction = ? and used = 1 and presentation = ? and time_stamp >= ?");
		$get->bindParam(1,$reaction);
		$current = DbOperator::GetPresentation();['presentation'];
		$get->bindParam(2,$current['presentation']);
		$get->bindParam(3,$current['time_stamp']);
		if($get->execute()){
			return $get->rowCount();
		}
		else{
			return null;
		}
	}

	/*
	 * ログイン中のuser情報を取得する
	 */
	static function GetActiveUserNames(){
		$dbh = Utils::GetPDO();
		$get = $dbh->prepare("select * from logging where attend = 1 and logging = 'in'");
		$get->execute();
		if($get->rowCount()==0){
			//echo("row count is 0");
			return null;
		}
		else{
			//新しい返答が見つかった場合
			//同一ユーザ間の重複を排除して返答
			$count = 0;
			$user_ids = array();
			$data = null;
			while ($row = $get->fetch()){
				$data[] = array(
						'id'=>$row['id'],
						'user_id'=>$row['user_id'],
						'user_name'=>$row['user_name'],
						'ban'=>$row['ban'],
						'password'=>$row['password'],
						'time_stamp'=>$row['time_stamp']
				);
				$user_ids[$count] = $row['user_id'];
				$count++;
			}
			return $data;
		}
	}

	/*
	 * 最新のopinion情報を取得する
	 */
	static function GetNewOpinions($last_id){
		$dbh = Utils::GetPDO();
		$get = $dbh->prepare("select * from opinions where id > ?");

		$get->bindParam(1, $last_id);
		$get->execute();
		if($get->rowCount()==0){
			//echo("row count is 0");
			return null;
		}
		else{
			//新しい返答が見つかった場合
			$data = null;
			while ($row = $get->fetch()){
				if(true){
					$data[] = array(
							'id'=>$row['id'],
							'user_id'=>$row['user_id'],
							'user_name'=>$row['user_name'],
							'opinion'=>$row['opinion'],
							'presentation'=>$row['presentation'],
							'time_stamp'=>$row['time_stamp'],
					);
				}
			}
			return $data;
		}
	}


	/*
	 * プレゼン名の変更
	 */
	static function AddPresentation($name){
		$dbh = Utils::GetPDO();
		$add = $dbh->prepare("insert into config(presentation,ban,time_stamp)values(?,0,now())");
		$add->bindParam(1, $name);
		if($add->execute()){
			return $dbh->lastInsertId('id');
		}
		else{
			return null;
		}
	}

	/*
	 * 指定したプレゼンテーションの状態を変更する
	 */
	static function SetPresentationStatus($presentation,$status){
		$dbh = Utils::GetPDO();
		$update = $dbh->prepare("update config set ban = ? where presentation = ? order by id desc limit 1");
		$update->bindParam(1,$status);
		$update->bindParam(2,$presentation);
		if($update->execute()){
			return $presentation;
		}else{
			return null;
		}
	}

	/*
	 * 現在(表の最後)のプレゼン情報(名前、開始時刻など)を取得
	 */
	static function GetPresentation(){
		$dbh = Utils::GetPDO();
		$get = $dbh->prepare("select * from config order by id desc limit 1");
		$get->execute();
		$row = $get->fetch();
		$data = array(
				'id'=>$row['id'],
				'presentation'=>$row['presentation'],
				'ban'=>$row['ban'],
				'time_stamp'=>$row['time_stamp']
		);
		return $data;
	}

	/*
	 * 最新のプレゼンテーションを削除
	 */
	static function DeletePresentation(){
		$current = DbOperator::GetPresentation();

		$dbh = Utils::GetPDO();
		$delete = $dbh->prepare("delete from config where id = ?");
		$delete->bindParam(1,$current["id"]);
		if($delete->execute()){
			return DbOperator::GetPresentation(); //delete後の現在のプレゼン情報を返す
		}
		else{
			null;
		}

	}

	static function AddQuestionnaire($answer,$password,$user_name){
		$q1_1 = $answer[Constants::$QUESTIONNAIRE_1_1];
		$q1_1_6_input = $answer[Constants::$QUESTIONNAIRE_1_1_6_input];
		$q1_2 = $answer[Constants::$QUESTIONNAIRE_1_2];
		$q2 = $answer[Constants::$QUESTIONNAIRE_2];
		$q3 = $answer[Constants::$QUESTIONNAIRE_3];
		$q4 = $answer[Constants::$QUESTIONNAIRE_4];
		$q5 = $answer[Constants::$QUESTIONNAIRE_5];
		$q6 = $answer[Constants::$QUESTIONNAIRE_6];

		$dbh = Utils::GetPDO();
		$add = $dbh->prepare("insert into questionnaire(password,user_name,q1_1,q1_1_6_input,q1_2,q2,q3,q4,q5,q6,time_stamp)values(?,?,?,?,?,?,?,?,?,?,now())");
		$add->bindParam(1,$password);
		$add->bindParam(2,$user_name);
		$add->bindParam(3,$q1_1);
		$add->bindParam(4,$q1_1_6_input);
		$add->bindParam(5,$q1_2);
		$add->bindParam(6,$q2);
		$add->bindParam(7,$q3);
		$add->bindParam(8,$q4);
		$add->bindParam(9,$q5);
		$add->bindParam(10,$q6);
		if($add->execute()){
			return $dbh->lastInsertId();
		}
		else{
			return null;
		}

	}

}