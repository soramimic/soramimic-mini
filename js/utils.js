function ld_outer(cost){
	function ld_inner(s,t){
		score = 0;
		zip(s,t).forEach(function([v1,v2]){
			score+=cost[v1][v2]
		});
		return score;
	}
}
const zip = (array1, array2) => array1.map((_, i) => [array1[i], array2[i]]);

function orgRound(value, base) {
    return Math.round(value * base) / base;
}

//母音同士、子音同士の距離から、ひらがな同士の距離を求める関数
//outerで、母音同士、子音同士の類似度など必要なファイルを読み込んでおく
//innerで、その都度パラメータによる微調整を加えた音素間類似度のobjectを返す。
function makeKanaDist_outer(){
	var configs = {}
	configs["single"] = ["sp","ン","ッ","ア","イ","ウ","エ","オ","アー","イー","ウー","エー","オー"];
	$.when(
		$.getJSON("conf/allkanaBi.json"),
		$.getJSON("conf/simConsonantsSimple.json"),
		$.getJSON("conf/simVowelsSimple.json")
	)
	.done(function(allkana, cCost, vCost){
		zip(["allkana","cCost","vCost"],[allkana,cCost,vCost]).forEach(function([v1,v2]){
			configs[v1]=v2[0];
		});
		allkana = configs["allkana"], cCost = configs["cCost"], vCost = configs["vCost"];

		var k = {}
		Object.keys(allkana).forEach(function(v1){
			s1 = allkana[v1];
			k[v1] = {}
			Object.keys(allkana).forEach(function(v2){
				s2 = allkana[v2]
				k[v1][v2] = [ cCost[s1[0]][s2[0]], vCost[s1[1]][s2[1]] ];
			});
		});
		configs["kanaCostElement"] = k;
		//console.log(configs["kanaCostElement"]);
	})
	.fail(function(){
		console.log("error");
	})

	function makeKanaDist_inner(param){
		var w = [param["consonant"],param["vowel"]],
			sameChar = param["sameChar"],
			sameVowel = param["sameVowel"],
			single = configs["single"];
		var costKanaBi = {},
			k = configs["kanaCostElement"];
		Object.keys(k).forEach(function(v1){
			var s1 = k[v1];
			costKanaBi[v1] = {}
			Object.keys(k).forEach(function(v2){
				var s2 = s1[v2],
					m = (w[0]*s2[0]+w[1]*s2[1])/(w[0]+w[1]);
				if(single.indexOf(v1) >= 0 || single.indexOf(v2)>=0 )
					m = s2[1];
				costKanaBi[v1][v2] = Math.round(m*100)/100;
			});
		});
		return costKanaBi;
	}
	return makeKanaDist_inner;
}

//makeKanaDist時のデフォルトパラメータを作る関数
function setDefaultParameters(param={}){
	var defaultParam = {
	        "splitter":"/",
	        "vowel":1,
	        "consonant":1,
	        "repeat":100,
	        "duplicate":false,
	        "bunsetsu": 0.1,
	        "wordsNum":0.01,
	        "sameChar":1,
	        "sameVowel":1,
	        "sameConsonant":1,
	        "length":1
	}
	return Object.assign(param,defaultParam);
}




