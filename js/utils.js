
//const zip = (array1, array2) => array1.map((_, i) => [array1[i], array2[i]]);
//const zip = (...rows) => rows[0].map((_,c)=>rows.map(row=>row[c]));
const zip = (...rows) => [].map.call(rows[0],(_,c)=>rows.map(row=>row[c]));

//直積を求めてリストで返す
const product = (...arguments) => {
	if (arguments.length == 0) return [];//
    let prod = arguments[0].map(m => [m]);
    for (let i = 1; i<arguments.length; i++){
    	prod = prod.map( m =>
    		arguments[i].map( n => [...m,n])
    	).flat();
    }
    return prod;
}




//a=[["オ","オ"],["オー"]];
//b=[["エ","エ"],["エー"]];
//c=[["ウ","ウ"],[]];
//console.log(product(a,b,c));


const orgRound = (value, base) => Math.round(value * base) / base;



//makeKanaDist時のデフォルトパラメータを作る関数
const setDefaultParameters = (param={}) => {
	let defaultParam = {
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
const toHalfWidth = (strVal) => {
  // 半角変換
  let halfVal;
  halfVal = strVal.replace(/[！-～]/g,
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

const removeSign = strVal => {
	strVal = toHalfWidth(strVal); //全角を半角に変換
	strVal = strVal.replace(/\W/g, function(m){return m.match(/[!-~]|\s/) ? "" : m}); //正規表現で記号を削除
	strVal = strVal.replace(/・/g, '').replace(/「/g, '').replace(/」/g, '');
	return strVal;
}

const toKatakana = strVal => {
	strVal.replace(/[ぁ-ん]/g, function(s) {
		   return String.fromCharCode(s.charCodeAt(0) + 0x60);
	});
}

const formatText = strVal => {
	strVal = removeSign(strVal);
	strVal = toKatakana(strVal);
	return strVal;
}



const MakeTokenizer = () => {
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
				//console.log("yomi",yomi);
				ptn = convertBar(sep);
				//console.log(ptn);
				ptn.forEach(function(v4){
					const v4len = v4.length;
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

const loadDatabaseFile = path => {
	const wordlisttext = loadTextFile(path);
	if(wordlisttext == ""){
		return null;
	}
	return loadDatabaseText(wordlisttext);
}

const loadTextFile = path => {
	let text = "";
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

const separateKana_outer = () => {
	let kanalist, vowels;
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
    const S2L = {},
    	smallVowelList = "ァィゥェォャュョヮ",
    	largeVowelList = "アイウエオヤユヨワ"
    	;
    zip(smallVowelList,largeVowelList).forEach(function([v1,v2]){
    	S2L[v1] = v2;
    });
    edan = "ケセテネヘメエレエゲゼデベペ";
    //console.log(vowels);

	function separateKana_inner(k){
		let i = 0,
			result = []
			;
		for(let v of ["ー","ッ"]){
			while( k.indexOf(v+v) >= 0 ){
				k = k.replace(v+v,v);
			}
		};
		k+="__" //(最後の2文字をうまく処理するため終端文字の追加)

		while(i < k.length - 2){
			let p = k.slice(i,i+3),
				moji = ""
				;
			const lenmax = 2
				;
			if(p[0] in S2L)
				p = S2L[p[0]] + p.slice(1);//もし小文字で始まってたら大文字に置き換える
			for(let si of [2,1]){
				let p1 = p.slice(0,si),//最初のn文字,n=1 or 2
					p2 = p[si]//n+1文字目
					;
				if(moji != "")break;//直前のループでmojiになにか代入していたら終了
				//console.log(p1,p2);
				if(Object.keys(kanalist).indexOf(p1)>=0){
					if(p2 == "ー"){
						if(vowels["エ"].indexOf(p1)>=0 && p1.slice(-1) == "イ"){
							moji = p1[0];
						}
						else if(vowels["オ"].indexOf(p1)>=0 && p1.slice(-1) == "ウ"){
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
					else if(p2 == "エ" && vowels[p2].indexOf(p1)>=0 && p1.slice(-1) == "イ"){
						moji = p1.slice(0,-1) + "ー";
					}
					else if(p2 == "オ" && vowels[p2].indexOf(p1)>=0 && p1.slice(-1) == "ウ"){
						moji = p1.slice(0,-1) + "ー";
					}
					else if(p2 in vowels && vowels[p2].indexOf(p1)>=0 && p1.slice(-1) != "ー"){
						moji = p1+"ー";
					}
					else{
						moji = p1;
						//console.log(p1);
					}
				}
			};
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

const count = [].map.call("あいうい",(val,idx)=>{return {val,idx}})
				.filter(c => c.val == "い")
				;
console.log(
	zip(["い","う"],["き","く"]).reduce((prev,[v1,v2]) => prev.replace(v1,v2),	"あいうえお")
);

function convertBar_outer(){
	let converter;
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
	const convertBar_inner = kana => {
		if(typeof kana === "undefined")
			return []

		const count = kana.map((val,idx)=>{return {val,idx}})
						.filter(c => Object.keys(converter).indexOf(c.val)>=0)
						.map(c => c.idx);
		if(count.length == 0)//count.lengthが0のときは引数をそのまま返す
			return kana;

		const change = product(...count.map(v => converter[kana[v]]))//直積


		const result = change.map(v => {
			return zip(count,v).reduce((prev,[v2,v3]) => {
				//console.log(prev);
				prev[v2] = v3;
				return prev;
			}, kana) //入力のv2文字目をv3に置き換える
			.flat(); //配列の次元を統一
		});

		//console.log("result",result);
		return result;

		/*
		const result = [];
		for(let v of change){
			let kanaStr = kana.join("/");
			zip(count,v).forEach(function([v2,v3]){
				//console.log("v3",v3);
				kanaStr = kanaStr.replace(v2,v3.join("/")).replace("//","/");
			});
			if(kanaStr.endsWith("/"))
				kanaStr = kanaStr.slice(0,-1);
			result.push(kanaStr.split("/"));
		};
		return result;
		*/

	}
	return convertBar_inner;
}
//let convertBar = convertBar_outer();
//console.log(convertBar(["アー","ッ","ン"]));


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
const argmin = array => [].map.call(array, (x, i) => [x, i]).reduce((r, a) => (a[0] < r[0] ? a : r))[1];
/*
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
*/
function containAlphabet(val){
	console.log("containAlphabet",val);
	var regex = /^[^\x01-\x7E\xA1-\xDF]+$/
	return !regex.test(val);
}
