function ld_outer(cost){
	function ld_inner(s,t){
		score = 0;
		zip(s,t).forEach(function([v1,v2]){
			score+=cost[v1][v2]
		});
		return score;
	}
	return ld_inner;
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
	$.ajaxSetup({async: false});
	$.when(
		$.getJSON("conf/allkanaBi.json"),
		$.getJSON("conf/simConsonantsSimple.json"),
		$.getJSON("conf/simVowelsSimple.json"),
		$.getJSON("conf/vowels.json"),
		$.getJSON("conf/consonants.json")
	)
	.done(function(allkana, cCost, vCost,vowels,consonants){
		zip(["allkana","cCost","vCost","vowels","consonants"],[allkana,cCost,vCost,vowels,consonants]).forEach(function([v1,v2]){
			configs[v1]=v2[0];
		});
		allkana = configs["allkana"], cCost = configs["cCost"], vCost = configs["vCost"];

		var k = {}
		Object.keys(allkana).forEach(function(v1){
			s1 = allkana[v1];
			k[v1] = {}
			Object.keys(allkana).forEach(function(v2){
				s2 = allkana[v2];
				k[v1][v2] = [ cCost[s1[0]][s2[0]], vCost[s1[1]][s2[1]] ];
			});
		});
		configs["kanaCostElement"] = k;
		//console.log(configs["kanaCostElement"]);
	})
	.fail(function(){
		console.log("error");
	})
	$.ajaxSetup({async: true});

	function reflectParam(costkana, param){
		var vowels, sameVowel, consonants, sameConsonant;
		vowels = configs["vowels"];
		sameVowel = param["sameVowel"];
		consonants = configs["consonants"];
		sameConsonant = param["sameConsonant"];
		if(sameVowel != 1){
			for(v1 in vowels){
				vowels[v1].forEach(function(v2){
					 vowels[v1].forEach(function(v3){
						 costkana[v2][v3] *= sameVowel;
					 });
				});
			}
		}
		if(sameConsonant != 1){
			for(v1 in consonants){
				consonants[v1].forEach(function(v2){
					 consonants[v1].forEach(function(v3){
						 costkana[v2][v3] *= sameConsonant;
					 });
				});
			}
		}
		return costkana;
	}

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
		//console.log(costKanaBi["ン"]);
		costKanaBi = reflectParam(costKanaBi,param);
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
	return Object.assign(defaultParam,param);
}



/**
 * 全角から半角への変革関数
 * 入力値の英数記号を半角変換して返却
 * [引数]   strVal: 入力値
 * [返却値] String(): 半角変換された文字列
 */
function toHalfWidth(strVal){
  // 半角変換
  var halfVal = strVal.replace(/[！-～]/g,
    function( tmpStr ) {
      // 文字コードをシフト
      return String.fromCharCode( tmpStr.charCodeAt(0) - 0xFEE0 );
    }
  );

  // 文字コードシフトで対応できない文字の変換
  return halfVal.replace(/”/g, "\"")
    .replace(/’/g, "'")
    .replace(/‘/g, "`")
    .replace(/￥/g, "\\")
    .replace(/　/g, " ")
    .replace(/〜/g, "~");
}
 var text ="[]]{（こんにちは」・？/";

function removeSign(strVal){
	strVal = toHalfWidth(strVal); //全角を半角に変換
	strVal = strVal.replace(/\W/g, function(m){return m.match(/[!-~]|\s/) ? "" : m}); //正規表現で記号を削除
	strVal = strVal.replace(/・/g, '').replace(/「/g, '').replace(/」/g, '');
	return strVal;
}

function toKatakana(strVal){
	return strVal.replace(/[ぁ-ん]/g, function(s) {
		   return String.fromCharCode(s.charCodeAt(0) + 0x60);
	});
}

function formatText(strVal){
	strVal = removeSign(strVal);
	strVal = toKatakana(strVal);
	return strVal;
}


//直積を求めてリストで返す
function productList(list){
	var p=1;
	list.forEach(function(v){
		p*=v.length;
	});
	var result = [];
	for(var i=0;i<p;i++){
		result.push([]);
	}
	var plist = [],
		p2=p;
	list.forEach(function(v){
		p2 /= v.length;
		plist.push([p2,p/(p2*v.length)]);
	});
	zip(plist,list).forEach(function([v1,v2]){
		var tmp=0;
		for(var i1=0;i1<v1[0];i1++){
			v2.forEach(function(v3){
				for(var i2 = 0;i2<v1[1];i2++){
					result[tmp].push(v3);
					tmp+=1;
				}
			});
		}
	});
	return result;
}

function MakeTokenizer(){
	return new Promise(function(resolve,reject){
		kuromoji.builder({dicPath:"js/kuromoji/dict"}).build(function(err, tokenizer){
			if(err) { reject(err); }
			resolve(tokenizer);
		});
	});
}

function GetYomi_outer(tokenizer){
	function getYomi(strVal){
		var yomi = "";
		path = tokenizer.tokenize(strVal);
		path.forEach(function(val){
			var tYomi = val.pronunciation;
			if(typeof tYomi === "undefined"){
				//console.log(val);
				tYomi = val.surface_form;
			}
			yomi += tYomi;
		});
		return removeSign(yomi);
	}
	return getYomi;
}

function loadDatabaseText(text){
	var words, result;
	words = [];
	text.split("\n").forEach(function(val){
		val = val.replace(/\u200B/g, "");//エスケープ処理
		val = val.split("#")[0].split(",");//各行において#以降をコメントアウトして、カンマでスプリット
		words.push(val);
	});
	result = {}
	words.forEach(function(val,index){
		if(val.length == 0){

		}
		else{
			if(val.length == 1){
				val.push(GetYomi(val[0]));
			}
			var title = val[0];
			val.slice(1).forEach(function(val6){
				var yomi, sep, ptn;
				yomi = GetYomi(val6);
				sep = separateKana(yomi);
				ptn = convertBar(sep);
				ptn.forEach(function(v4){
					var v4len = v4.length;
					if(v4len == 0){
						return;
					}
					if(!(v4len in result)){
						result[v4len]=[];
					}
					result[v4len].push([title,val6,v4,index]);
				});
			});
		}
	});
	return result;
}

function loadDatabaseFile(path){
	/*
	var wordlisttext = "";
	$.ajaxSetup({async: false});
	$.get(path)
	.done(function(data){
		wordlisttext = data;
	})
	.fail(function(data){
		console.log("error",data);
	})
	$.ajaxSetup({async: true});
	*/
	var wordlisttext = loadTextFile(path);

	if(wordlisttext == ""){
		return null;
	}
	return loadDatabaseText(wordlisttext);
}

function loadTextFile(path){
	var text = "";
	$.ajaxSetup({async: false});
	$.get(path)
	.done(function(data){
		text = data;
	})
	.fail(function(data){
		console.log("error",data);
	})
	$.ajaxSetup({async: true});
	return text;
}

function separateKana_outer(){
	var kanalist, vowels;
	$.ajaxSetup({async: false});
	$.when(
			$.getJSON("conf/allkanaBi.json"),
			$.getJSON("conf/vowels.json")
	)
	.done(function(data1,data2){
	    kanalist = data1[0];
	    vowels = data2[0];
	})
	.fail(function(data){
		console.log("error");
	});
	$.ajaxSetup({async: true});
	//console.log(kanalist);
	//適切な発音への変換に必要なオブジェクトの定義
    S2L = {}
    zip(["ァ","ィ","ゥ","ェ","ォ","ャ","ュ","ョ","ヮ"],["ア","イ","ウ","エ","オ","ヤ","ユ","ヨ","ワ"]).forEach(function([v1,v2]){
    	S2L[v1] = v2;
    });
    edan = "ケセテネヘメエレエゲゼデベペ";
    //console.log(vowels);

	function separateKana_inner(k){
		["ー","ッ"].forEach(function(v){
			while( k.indexOf(v+v) >= 0 ){
				k = k.replace(v+v,v);
			}
		});
		k+="__" //(最後の2文字をうまく処理するため終端文字の追加)
		var i = 0,
			result = [];
		while(i < k.length - 2){
			var p = k.slice(i,i+3);
			if(p[0] in S2L)
				p = S2L[p[0]] + p.slice(1);
			var moji = "",
				lenmax = 2;
			[2,1].forEach(function(si){
				if(moji != "")return;
				var p1 = p.slice(0,si);
				var p2 = p[si];
				//console.log(p1,p2);
				if(p1 in kanalist){
					if(p2 == "ー"){
						if(vowels["エ"].indexOf(p1)>=0 && p1[p1.length-1] == "イ"){
							moji = p1[0];
						}
						else if(vowels["オ"].indexOf(p1)>=0 && p1[p1.length-1] == "ウ"){
							moji = p1[0];
						}
						else if(p1 == "ン"){
							result.push(p1);
							i+=1;
							moji = p1;
						}
						else{
							moji = p1+p2;
						}
					}
					else if(p2 == "エ" && vowels[p2].indexOf(p1)>=0 && p1[p1.length-1] == "イ"){
						moji = p1.slice(0,-1) + "ー";
					}
					else if(p2 == "オ" && vowels[p2].indexOf(p1)>=0 && p1[p1.length-1] == "ウ"){
						moji = p1.slice(0,-1) + "ー";
					}
					else if(p2 in vowels && vowels[p2].indexOf(p1)>=0 && p1[p1.length-1] != "ー"){
						moji = p1+"ー";
					}
					else{
						moji = p1;
						//console.log(p1);
					}
				}
			});
			if(moji == ""){
				break;
			}
			result.push(moji);
			i += moji.length;
		}
		return result;
	}
    return separateKana_inner;
}



function convertBar_outer(){
	var converter;
	$.ajaxSetup({async: false});
	$.when(
		$.getJSON("conf/kanaWithBar.json")
	)
	.done(function(data){
	    converter = data;
	})
	.fail(function(data){
		console.log(data);
		console.log("error");
	});
	$.ajaxSetup({async: true});
	//console.log(converter);
	function convertBar_inner(kana){
		var count = [];
		var count2 = [];
		kana.forEach(function(v,i){
			if(v in converter){
				count.push(v);
				count2.push(converter[v]);
			}
		});
		var change = productList(count2);
		var result = [];
		change.forEach(function(v){
			var kanaStr = kana.join("/");
			zip(count,v).forEach(function([v2,v3]){
				kanaStr = kanaStr.replace(v2,v3.join("/")).replace("//","/");
			});
			if(kanaStr.endsWith("/"))
				kanaStr = kanaStr.slice(0,-1);
			result.push(kanaStr.split("/"));
		});
		return result;
	}
	return convertBar_inner;
}


function argsort(array) {
    const arrayObject = array.map((value, idx) => { return { value, idx }; });
    arrayObject.sort((a, b) => {
        if (a.value < b.value) {
            return -1;
        }
        if (a.value > b.value) {
            return 1;
        }
        return 0;
    });
    const argIndices = arrayObject.map(data => data.idx);
    return argIndices;
}

function getSimilarWord_outer(param){
	var kanadist, ld;
	kanadist = makeKanaDist(param);
	ld = ld_outer(kanadist);

	var memo = {}
	function getSimilarWord_inner(wordlist, target, length = 1){
		var orglen, cand, cand2, sims, words, args, result, indexes;
		orglen = target.length;
		cand = convertBar(target);

		cand2 = {}
		cand.forEach(function(val){
			var tmplength = val.length;
			if(!(tmplength in cand2)){
				cand2[tmplength] = []
			}
			cand2[tmplength].push(val);
		});

		sims = [];
		words = [];
		for(var i in cand2){
			if(!(i in wordlist)){
				continue;
			}
			wordlist[i].forEach(function(w){
				var tmplist, tSim;
				tmplist = [];
				cand2[i].forEach(function(tar){
					tmplist.push(ld(tar,w[2])/i);
				});
				tSim = Math.min.apply(null,tmplist);

				sims.push(tSim*orglen);
			});
			words = words.concat(wordlist[i]);
		}

		args = argsort(sims);
		result = [];
		indexes = [];
		for(var i = 0; i<args.length;i++){
			var val = args[i];
			var tmpW = words[val];

			var id = tmpW[tmpW.length-1];
			if(indexes.indexOf(id)<0){
				indexes.push(id);
				result.push([target.join(""),tmpW[1], tmpW[0], orgRound(sims[val],100),tmpW[3]]);

			}
			if(result.length == length){
				break;
			}
		}
		return result;
	}

	return getSimilarWord_inner;

}

function containAlphabet(val){
	console.log("containAlphabet",val);
	var regex = /^[^\x01-\x7E\xA1-\xDF]+$/
	return !regex.test(val);
}
