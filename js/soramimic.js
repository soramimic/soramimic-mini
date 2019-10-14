/*
======================================================================
Project Name    : Soramimic
File Name       : soramimic.js
Encoding        : utf-8
Creation Date   : 2019/08/19
 
Copyright © 2019 Jiro Shimaya. All rights reserved.
======================================================================

 */

const SoramimicPublic = (function(){
	
	let TOKENIZER_ = null;
	const buildTokenizer = (function(){
		const KUROMOJI_PATH_ = "js/kuromoji/dict";
		return new Promise(function(resolve,reject){
			kuromoji.builder({dicPath:KUROMOJI_PATH_}).build(function(err, tokenizer){
				if(err) { console.log(err);reject("error:",err); }
				TOKENIZER_ = tokenizer;
				console.log("set tokenizer");
				resolve("ok");
			});
		});
	})();
	
	const loadDatabaseFile = path => {
		const wordlisttext = loadTextFile(path);
		if(wordlisttext == ""){
			return null;
		}
		return loadDatabaseText(wordlisttext);
	}
	


	const loadDatabaseText = text => {
		const words = text.split("\n").map(val=>{
			val = val.replace(/\u200B/g, "");//エスケープ処理
			val = val.split("#")[0].split(",");//各行において#以降をコメントアウトして、カンマでスプリット
			return val;
		}).filter(v => (v.length != 0 && v[0] != ""));

		const resultdb = {}
		for(let i = 0; i<words.length;i++){
			const v = words[i];

			if(v.length == 1)v.push(getYomi.only(v[0]));
			const title = v[0];
			for(let v2 of v.slice(1)){
				if(v2.length == 0)console.log("v2",v2);
				const yomi = getYomi.only(v2);
				const sep = SoramimicVariables.separateKana(yomi);
				const ptn = SoramimicVariables.getPronunciationVariation(sep);
				for(let v3 of ptn){
					const v3len = v3.length;
					if(!(v3len in resultdb))resultdb[v3len]=[]
					resultdb[v3len].push([title,v2,v3,i]);
				}
			}
		}
		return resultdb;
	}
	const getYomi = (function(){
		const strApos = "APOSTROPHE";
		
		const getMaResult = strVal => {
			strVal = strVal.toUpperCase();//英語は大文字に直しておく
			strVal = strVal.replace("’","'").replace(/\'/g,strApos);//アポストロフィをAPOSTROPHEにする
			return TOKENIZER_.tokenize(strVal);
		}
		const getYomiAndPhraseBreak = strVal => {
			const maresult = getMaResult(strVal);
			//console.log(maresult);
			let yomi = [];
			const phraseBreak = [];
			for(let v of maresult){
				let tYomi = v.pronunciation;
				if(typeof tYomi === "undefined"){
					tYomi = v.surface_form;
					if(tYomi.match(/^[A-Za-z]*$/))tYomi = SoramimicVariables.getKanaOfEnglish(tYomi);
					tYomi = hiraToKana(tYomi);
				}
				tYomi = removeSign(tYomi);//記号削除
				if(tYomi.length > 0){
					if(SoramimicVariables.isSmall(tYomi[0]) && yomi.length>0){
						if( SoramimicVariables.isKana(yomi[yomi.length-1]+tYomi[0])){
							tYomi = yomi.pop() + tYomi;
						}
					}
				}
				tYomi = SoramimicVariables.separateKana(tYomi);//kanaUnitに変換
				if(["名詞","動詞","副詞","形容詞","形容動詞","感動詞"].includes(v.pos)){
					phraseBreak.push(yomi.length);
				}
				yomi = yomi.concat(tYomi);//yomiに結合
			}
			return {"kana":yomi,"phrasebreak":phraseBreak}
		}
		return {
			only: text=>getYomiAndPhraseBreak(text).kana.join(""),
			withBreak: text=>getYomiAndPhraseBreak(text)
		}
	})();
	
	const WORD_LIST_ = {};
	let onFinishedLoadingDatabaseFunc = null;
	buildTokenizer.then(()=>{
		const WORD_FILE_PATH_ = {
				BASEBALL: "words/baseball.txt",
				//CREATURE: "words/creature.txt",
				NATION: "words/nations.txt",
				PHYSICIST: "words/physicist.txt",
				POKEMON: "words/pokemon.txt",
				SEKITSUI: "words/sekitsui.txt",
				//SHOGI: "words/shogi.txt",
				STATION: "words/stations.txt"
		}
		
		for(let k in WORD_FILE_PATH_){
			const path = WORD_FILE_PATH_[k];
			switch(k){
			case "BASEBALL":case "SEKITSUI":case "STATION":case "PHYSICIST":
			case "POKEMON":case "NATION":
				WORD_LIST_[k] = loadJsonFile("wordsFormatted/"+path.split("/")[1]);
				break;
			default:
				console.log(k);
				WORD_LIST_[k] = loadDatabaseFile(path);
				console.log(JSON.stringify(WORD_LIST_[k]));
				break;
			}
		}
		//$(".container-fluid").show();
		//$(".loading").remove();		

	})
	.then(()=>onFinishedLoadingDatabaseFunc());
	

	//入力にkanaDist下で距離の近い単語を求める
	const getSimilarWord = (kanaDist,wordlist,target,param,length=1) => {
		//console.log(kanaDist);
		const orglen = target.length,
			//Object.keysでは文字列配列が取得できるので、v.lengthも文字列に直してからfilterする
			//cand = this.getPronunciationVariation(target).filter(v=>{return Object.keys(wordlist).indexOf(String(v.length))>=0}),
			cand = SoramimicVariables.getPronunciationVariation(target).filter(v=>{return v.length in wordlist}),
			cand2 = {}
		let	sims = [],
			words = []
			;

		for(let val of cand){
			const tmplength = val.length;
			//if(Object.keys(cand2).indexOf(tmplength)<0)
			if(!(tmplength in cand2))
				cand2[tmplength] = []
			cand2[tmplength].push(val);
		};
		for(let i of Object.keys(cand2)){
			sims = sims.concat(
					wordlist[i].map(w => {
						//console.log("kanaDist",kanaDist);
						const tmplist = cand2[i].map(tar=>ld(kanaDist,tar,w[2])/i);
						return orgRound(Math.min.apply(null,tmplist)*orglen,100);//最小値を見つけて丸める
					})
				);
			//console.log("sims",sims,wordlist[i]);
			words = words.concat(wordlist[i]);
		}
		//console.log("sims",sims);

		return argsort(sims)
				.slice(0,length) //指定された長さまでを切り取る
				.map(val => {
					const tmpW = words[val];
					return [target.join(""), tmpW[1],tmpW[0], sims[val],tmpW[3]];
				});
	}
	
	const soramimi_dp = (text, wordlist, para = {}) => {
		const param = SoramimicVariables.getFormatedParam(para);
		const KANA_SIMILARITY_ = SoramimicVariables.getKanaSimilarity(param);
		const gs = (wordlist,target,length) => getSimilarWord(KANA_SIMILARITY_, wordlist, target, param, length);
		const splitter=param.SPLITTER;
		const repeat = param.REPEAT;
		const isDuplicate = param.DUPLICATE;
		const samePhraseBreak = param.SAME_PHRASE_BREAK_REWARD;
		const wordsNum = param.WORD_NUMBER_PENALTY;
		const takeLen = param.LENGTH;
		const number = Object.keys(wordlist).map(i => Number(i));
		const phrases = text.split(splitter);
		const phraselen = phrases.length;
		console.timeEnd("dpDef2");
			//phraseの基本的な構造を解析
		console.time("dpDef3");
		    const base_info = phrases.reduce((prev,val)=>{
				prev["raws"].push(val);
				const yomi = getYomi.withBreak(val);
				//prev["targets"].push(this.separateKana(this.getYomi(val)));
				prev["targets"].push(yomi["kana"]);
				prev["phrasebreak"].push(yomi["phrasebreak"]);
				return prev;
			},{"raws":[],"targets":[],"phrasebreak":[]});
		    const results = ["relativeScores","scores","words"].reduce((prev,val)=>{
				prev[val] = Array(phraselen);
				prev[val].fill([]);
				return prev;
			},{});
		console.timeEnd("dpDef3");

		//base_infoの確認
		for (let v of Object.keys(base_info)){
			console.log(v, base_info[v]);
		}

		const dp = index => {
			const target = base_info["targets"][index],
	        	phraseBreaks = base_info["phrasebreak"][index],
	        	tarlen = target.length,
	        	//used = results["words"].map(v => v.map(v2 => v2.slice(-1)[0])).flat(),//mapやforEachではなぜかだめだった
	        	used = [],
	        	memo = {0:[]},
	        	error = null
	        	;

			//mapやforEachではなぜか参照できなかったので、これを使う
			//console.log("result_word",results["words"][0]);
			for(let v of results["words"]){
				for(let v2 of v)
					//used.push(v2.slice(-1)[0]);
					used.push(v2[v2.length-1]);
			}
			//console.log("used",used);
			console.log("index,tarlen",index,tarlen);

			const dp_inner = t => {
				const mini_result = {"scores":[],"words":[]}
				if(t in memo){
					return memo[t];
				}else{
				}
				console.log("0",JSON.stringify(mini_result));
				for (let i = 0; i<t; i++){
					//console.log("1",JSON.stringify(mini_result));
					//console.log("in_loop i=",i);
					if ( number.includes(t-i) == false ){
						continue
					}

					let words = dp_inner(i);
					if(words === error)
						continue;
					else{
						words = words.slice();
					}

					let score =  words.reduce((s, data) => {return s + data.slice(-2)[0]},0);
					//console.log("score_org",score);
					const currentUsed = words.map(v => v[v.length-1]);
					let newWord = null;
					//console.log("target_out",target);

					for(let w of gs(wordlist,target.slice(i,t),100)){
						//const wid = w.slice(-1)[0];
						const wid = w[w.length-1];
						if(isDuplicate == false && (used.includes(wid) || currentUsed.includes(wid))){
							//console.log("skip: t,i,used,current,w",t,i,used,currentUsed,w);
							continue;
						}
						else{
							//console.log("ok: t,i,used,current,w",t,i,used,currentUsed,w);
						}


						let w2 = w.slice();
						//let wscore = w2.slice(-2)[0];
						let wscore = w2[w2.length-2];
						if(phraseBreaks.includes(t)){
							wscore -= samePhraseBreak*1;
						}
						else{

						}
						w2[w2.length-2] = wscore;
						newWord = [w2,wscore];
						//console.log("wscore",wscore);
						//words.push(w);
						//console.log("newWord",w,wscore,scoreb,score);
						//score += wscore;
						break;
					}
					if(newWord == null)
						continue;
					words.push(newWord[0]);
					score += newWord[1];
					score += words.length*wordsNum;
					mini_result["scores"].push(score);
					mini_result["words"].push(words);
				}
				if(mini_result["scores"].length > 0){
					if(t == tarlen+1){
						const targetstr = target.join("");
						for(let i=0;i<mini_result["scores"].length;i++){
							const resultstr = mini_result["words"][i].map(v=>v[0]).join("");
							if(resultstr != targetstr){
								mini_result["scores"][i]+=10000*t;
							}
						}
						console.log("mini_result",mini_result);
					}
					const arg = argmin(mini_result["scores"]);
					memo[t] = mini_result["words"][arg];
					return memo[t];
				}
				else{
					memo[t] = error;
					console.log("memo error");
					return memo[t];
				}

			}
			return dp_inner(tarlen+1);
		}

		//progressBarの初期値設定
		//const bar = $(".progress-bar.convert-progress");
		const bar = $(".span-progress");
		bar.html("0/"+String(phraselen));
		$(".div-result").html("");

		let dpIndex = 0;

		//dpをset_timeoutで実行するための関数
		const dp_outer = i => {
			if(i>=phraselen || i<0){
				//bar.css("width","26%");
				const result = results["words"];
				console.log(result);
				if(result.length == 0){
					$(".loading2").hide();
					$(".div-result").html("うまく変換できる単語を見つけられませんでした");
					return;
				}
				let resultText = result.map(v=>{
					return v.reduce((prev2,v2)=>{
						prev2[0].push(v2[0]);//org
						prev2[1].push(v2[1]);//yomi
						prev2[2].push(v2[2]);//word
						return prev2
					},[[],[],[]])
					.map(v=>v.join("/"))
					.concat([""])
					;
				})
				.flat()//平坦化
				;

				$(".div-result").html(resultText.join("<br>"));
				$(".loading2").hide();

				return results;
			}

			console.time("dp_"+String(i));
			const r = dp(i);
			//$("body").append("<div>"+String(i)+"</div>");
			console.log(r);
			if ( r != null)
				results["words"][i] = r;
			//progressBarの変更
			const percentStr = String(orgRound((i+1)*100/phraselen,1))+"%";
			bar.html(String(i+1)+"/"+String(phraselen));
			setTimeout(function(){
				dp_outer(i+1);
			},0);
		}
		setTimeout(function(){
			dp_outer(0);
		},0);
	}

	const setWordListOriginal = text => {
		WORD_LIST_["ORIGINAL"] = loadDatabaseText(text);
	}

	//文字列sとtのkanaDist下での置換コストを求める
	const ld = (kanaDist,s,t) => {
		if(typeof s === "undefined" ||  typeof t === "undefined")
			console.log("ld",s,t);
		//console.log("ld_kanadist",kanaDist);
		return zip(s,t).reduce((prev,[v1,v2])=> {
			if(!(v1 in kanaDist)){
				console.log(v1);
				return prev+100;
			}else if(!(v2 in kanaDist[v1])){
				console.log(v2);
				return prev+100;
			}
			else{
				prev += kanaDist[v1][v2];
				return prev;
			}
			},0);
	}
	//デフォルトのパラメータをセット


	
	return {
		getWordList: ()=>WORD_LIST_,
		makeSoramimi: (text, wordlist, para = {})=>soramimi_dp(text, wordlist, para),
		setWordListOriginal: text=>setWordListOriginal(text),
		setOnFinishedLoadingDatabaseFunc: func=>onFinishedLoadingDatabaseFunc=func,
		
	}
	
})();