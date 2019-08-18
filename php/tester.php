<?php

require_once 'autoloader.php';
//$res = DbOperator::SetUserStatus("b",0);
//DbOperator::DeletePassword("testpassword");
//$res = DbOperator::GetPasswords();
//$res = DbOperator::GetUserStatus("b");
//$res = DbOperator::GetReactions(-1);
//$res = DbOperator::AddReaction("a","b","c","d",120);
//$res = DbOperator::GetCurrentPhase();
//$res = DbOperator::GetFixedReactionNumbers("like",120);
//$res = DbOperator::GetLatestFixedReaction("like",120);
//$res = DbOperator::AddOpinion("a","b","c","d");
//$res = DbOperator::DeletePresentation();
//$res = DbOperator::GetOpinionsWithPassword("a");
//$res = DbOperator::CheckUserKnockout("a");
//$res = DbOperator::AddLoginInfo("a","b","in","a");
//$res = DbOperator::GetPasswordStatus("a");
//$res = DbOperator::AddPassword("abcde");
//$res = DbOperator::UpdateOpinionNumbers();
//$res = DbOperator::UpdateAndGetPasswords();
//$res = DbOperator::GetOpinionNumber("a");
//$res = DbOperator::SetOpinionNumber("a",DbOperator::GetOpinionNumber("a"));
//$res = DbOperator::GetNewOpinions("a");
//$res = DbOperator::GetCurrentPhase("b");
$res = DbOperator::AddLoginInfo("b","c","d");
var_dump($res);
//Utils::ChangeConfig('room','value');


?>


