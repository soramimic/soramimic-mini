/*
======================================================================
Project Name    : Soramimic
File Name       : soramimic.js
Encoding        : utf-8
Creation Date   : 2019/08/19
 
Copyright © 2019 Jiro Shimaya. All rights reserved.
======================================================================

 */
const SoramimicVariables = (function(){
	const DEFAULT_PARAMETER_VALUES_ = {
			REPEAT: "100",
			SPLITTER: "/",
			DUPLICATE: true,
			SAME_PHRASE_BREAK_REWARD: 1,//文節が一致しているとき掛け算する
			SAME_KANA_REWARD: 1,//同じカナに対して掛け算する
			SAME_VOWEL_REWARD: 1,//同じ母音に対して掛け算する
			SAME_CONSONANT_REWARD: 1,//同じ子音に対して掛け算する
			SAME_BAR_REWARD: 1, //拗音同士に対して掛け算する
			SAME_HATSUON_REWARD: 1, //撥音同士に対して掛け算する(pronunciationではない)
			SAME_SOKUON_REWARD: 1,//促音同士に対して掛け算する
			WORD_NUMBER_PENALTY: 1, //単語数に対するペナルティ
			LENGTH: 1
	}
	const KANA2PHONON_ = {"sp": ["sp", "sp"], "ッ": ["sp", "q"],"ン": ["sp", "N"],
			"ア": ["sp", "a"], "イ": ["sp", "i"], "ウ": ["sp", "u"], "エ": ["sp", "e"], "オ": ["sp", "o"],
			"ウァ": ["w+a", "w-a"],  "ウヮ": ["w+a", "w-a"], "ウィ": ["w+i", "w-i"], "ウェ": ["w+e", "w-e"], "ウォ": ["w+o", "w-o"],
			"カ": ["k+a", "k-a"],"キ": ["k+i", "k-i"],"ク": ["k+u", "k-u"],"ケ": ["k+e", "k-e"],"コ": ["k+o", "k-o"],
			"ガ": ["g+a", "g-a"],"ギ": ["g+i", "g-i"],"グ": ["g+u", "g-u"],"ゲ": ["g+e", "g-e"], "ゴ": ["g+o", "g-o"],
			"キャ": ["ky+a", "y-a"], "キュ": ["ky+u", "y-u"], "キェ": ["ky+e", "y-e"],"キョ": ["ky+o", "y-o"],
			"ギャ": ["gy+a", "y-a"],"ギュ": ["gy+u", "y-u"],"ギェ": ["gy+e", "y-e"],"ギョ": ["gy+o", "y-o"],
			"クァ": ["k+a", "k-a"], "クヮ": ["k+a", "k-a"],"クィ": ["k+i", "k-i"], "クェ": ["k+e", "k-e"], "クォ": ["k+o", "k-o"],
			"グァ": ["g+a", "g-a"], "グヮ": ["g+a", "g-a"],"グィ": ["g+i", "g-i"], "グェ": ["g+e", "g-e"], "グォ": ["g+o", "g-o"],
			"サ": ["s+a", "s-a"],"シ": ["sh+i", "y-i"],"ス": ["s+u", "s-u"], "セ": ["s+e", "s-e"],"ソ": ["s+o", "s-o"],
			"ザ": ["z+a", "z-a"],"ジ": ["j+i", "y-i"],"ズ": ["z+u", "z-u"],"ゼ": ["z+e", "z-e"], "ゾ": ["z+o", "z-o"],
			"シャ": ["sh+a", "y-a"],"シュ": ["sh+u", "y-u"],"シェ": ["sh+e", "y-e"], "ショ": ["sh+o", "y-o"],
			"ジャ": ["j+a", "y-a"], "ジュ": ["j+u", "y-u"], "ジェ": ["j+e", "y-e"], "ジョ": ["j+o", "y-o"],
			"スァ": ["s+a", "s-a"],"スヮ": ["s+a", "s-a"],"スィ": ["s+i", "s-i"],"スェ": ["s+e", "s-e"],"スォ": ["s+o", "s-o"],
			"ズァ": ["z+a", "z-a"], "ズヮ": ["z+a", "z-a"],"ズィ": ["z+i", "z-i"], "ズェ": ["z+e", "z-e"], "ズォ": ["z+o", "z-o"],
			"タ": ["t+a", "t-a"], "チ": ["ch+i", "y-i"], "ツ": ["ts+u", "s-u"], "テ": ["t+e", "t-e"], "ト": ["t+o", "t-o"],
			"ダ": ["d+a", "d-a"], "ヂ": ["d+i", "d-i"], "ヅ": ["d+u", "d-u"],"デ": ["d+e", "d-e"],"ド": ["d+o", "d-o"],
			"チャ": ["ch+a", "y-a"], "チュ": ["ch+u", "y-u"], "チェ": ["ch+e", "y-e"], "チョ": ["ch+o", "y-o"],
			"ヂャ": ["dy+a", "y-a"], "ヂュ": ["dy+u", "y-u"], "ヂェ": ["dy+e", "y-e"], "ヂョ": ["dy+o", "y-o"],
			"ツァ": ["ts+a", "s-a"],"ツヮ": ["ts+a", "s-a"],"ツィ": ["ts+i", "s-i"],"ツェ": ["ts+e", "s-e"],"ツォ": ["ts+o", "s-o"],
			"ティ": ["t+i", "t-i"], "テュ": ["t+u", "t-u"], "トゥ": ["t+u", "t-u"],
			"ディ": ["d+i", "d-i"], "デュ": ["d+u", "d-u"],  "ドゥ": ["d+u", "d-u"],
			"ナ": ["n+a", "n-a"], "ニ": ["n+i", "n-i"], "ヌ": ["n+u", "n-u"], "ネ": ["n+e", "n-e"], "ノ": ["n+o", "n-o"],
			"ニャ": ["ny+a", "y-a"],  "ニュ": ["ny+u", "y-u"], "ニェ": ["ny+e", "y-e"], "ニョ": ["ny+o", "y-o"],
			"ヌァ": ["n+a", "n-a"], "ヌヮ": ["n+a", "n-a"], "ヌィ": ["n+i", "n-i"], "ヌェ": ["n+e", "n-e"], "ヌォ": ["n+o", "n-o"],
			"ハ": ["h+a", "h-a"], "ヒ": ["h+i", "h-i"], "フ": ["f+u", "f-u"], "ヘ": ["h+e", "h-e"], "ホ": ["h+o", "h-o"],
			"バ": ["b+a", "b-a"], "ビ": ["b+i", "b-i"], "ブ": ["b+u", "b-u"], "ベ": ["b+e", "b-e"], "ボ": ["b+o", "b-o"],
			"パ": ["p+a", "p-a"], "ピ": ["p+i", "p-i"], "プ": ["p+u", "p-u"], "ペ": ["p+e", "p-e"], "ポ": ["p+o", "p-o"],
			"ヒャ": ["hy+a", "y-a"], "ヒュ": ["hy+u", "y-u"], "ヒェ": ["hy+e", "y-e"], "ヒョ": ["hy+o", "y-o"],
			"ビャ": ["by+a", "y-a"], "ビュ": ["by+u", "y-u"], "ビェ": ["by+e", "y-e"], "ビョ": ["by+o", "y-o"],
			"ピャ": ["py+a", "y-a"], "ピェ": ["py+e", "y-e"], "ピュ": ["py+u", "y-u"], "ピョ": ["py+o", "y-o"],
			"ファ": ["f+a", "f-a"], "フヮ": ["f+a", "f-a"],"フィ": ["f+i", "f-i"], "フュ": ["hy+u", "y-u"], "フェ": ["f+e", "f-e"], "フォ": ["f+o", "f-o"],
			"ブァ": ["b+a", "b-a"],  "ブヮ": ["b+a", "b-a"],"ブィ": ["b+i", "b-i"], "ブェ": ["b+e", "b-e"], "ブォ": ["b+o", "b-o"],
			"プァ": ["p+a", "p-a"], "プヮ": ["p+a", "p-a"],"プィ": ["p+i", "p-i"], "プェ": ["p+e", "p-e"], "プォ": ["p+o", "p-o"],
			"マ": ["m+a", "m-a"], "ミ": ["m+i", "m-i"], "ム": ["m+u", "m-u"], "メ": ["m+e", "m-e"], "モ": ["m+o", "m-o"],
			"ミャ": ["my+a", "y-a"], "ミュ": ["my+u", "y-u"], "ミェ": ["my+e", "y-e"], "ミョ": ["my+o", "y-o"],
			"ムァ": ["m+a", "m-a"], "ムヮ": ["m+a", "m-a"], "ムィ": ["m+i", "m-i"], "ムェ": ["m+e", "m-e"], "ムォ": ["m+o", "m-o"],
			"ヤ": ["y+a", "y-a"], "ユ": ["y+u", "y-u"], "イェ": ["y+e","y-e"], "ヨ": ["y+o", "y-o"],
			"ラ": ["r+a", "r-a"], "リ": ["r+i", "r-i"], "ル": ["r+u", "r-u"], "レ": ["r+e", "r-e"], "ロ": ["r+o", "r-o"],
			"リャ": ["ry+a", "y-a"], "リュ": ["ry+u", "y-u"], "リェ": ["ry+e", "y-e"], "リョ": ["ry+o", "y-o"],
			"ワ": ["w+a", "w-a"], "ヲ": ["sp", "o"],
			"ヴァ": ["b+a", "b-a"], "ヴヮ": ["b+a", "b-a"],"ヴィ": ["b+i", "b-i"], "ヴ": ["b+u", "b-u"], "ヴェ": ["b+e", "b-e"], "ヴォ": ["b+o", "b-o"]
		}
	const VOWELS_ = ["ア","イ","ウ","エ","オ"];
	const SMALL_VOWELS_ = "ァィゥェォャュョヮ";
	const LARGE_VOWELS_ = "アイウエオヤユヨワ";
	
	//カナを母音に変換するリストを作る
	const KANA2VOWEL_ = (function(){
		const k2r = KANA2PHONON_,
		roma2vowel = zip("アイウエオ","aiueo").reduce((prev,[v1,v2])=>{
			prev[v2] = v1;//aをアに変換する
			return prev;
		},{})
		;
		roma2vowel["p"]="sp";//無音
		roma2vowel["N"]="sp";//撥音の母音は無音とする
		roma2vowel["q"]="sp";//促音の母音は無音とする
		return Object.keys(k2r).reduce((prev,kana)=>{
			const romaVowelOfKana = k2r[kana][1].slice(-1);//kanaのローマ字表記の最後の文字(=母音)を取得
			prev[kana] = roma2vowel[romaVowelOfKana];//kanaを母音カナに変換
			//足してみた20190818
			if("ンッ".includes(kana)){}
			else if(kana == "sp"){}
			else{
				prev[kana+"ー"] = prev[kana];
				if(prev[kana] == "エ")
					prev[kana+"イ"] = prev[kana];
				else if(prev[kana] == "オ")
					prev[kana+"ウ"] = prev[kana];
			}
			return prev;
		},{});		
	})();
	
	//カナを子音に変換するリストを作る
	const KANA2CONSONANT_ = (function(){
		const k2r = KANA2PHONON_;

		return Object.keys(k2r).reduce( (prev,kana) => {
			const romaConsonantOfKana = (k2r[kana][0] == "sp") ? "sp" : k2r[kana][0][0];
			switch(romaConsonantOfKana){
			case "c": prev[kana]="t";//cはtと同じ子音とする
			case "f": prev[kana]="h";//fはhと同じ子音とする
			case "j": prev[kana]="z";//jはzと同じ子音とする
			case "v": prev[kana]="b";//vはbと同じ子音とする
			default: prev[kana]=romaConsonantOfKana;
			}
			return prev;
		},{} );		
	})();
	
	//カナを分割するときの単位を定義
	const KANA_UNITS_ = (function(){
		const k2r = KANA2PHONON_,
		k2v = KANA2VOWEL_;
		return Object.keys(k2r).reduce((prev,kana)=>{
			const vowelOfKana = k2v[kana];
			prev[kana] = [[kana]];
			switch(kana){
			case "ン": case "ッ":
				prev[kana].push([""]);
				break;
			}
			switch(vowelOfKana){
			case "ア": case "イ": case "ウ":	case "エ": case "オ":
				prev[kana+"ー"] = [[kana+"ー"]];//伸ばし棒のユニットを追加する
				prev[kana+"ン"] = [[kana+"ン"]];//ンのユニットを追加する
				prev[kana+"ッ"] = [[kana+"ッ"]];//ッのユニットを追加する
				prev[kana+vowelOfKana] = [[kana+"ー"],[kana,vowelOfKana]];//母音の連続を伸ばし棒化する
				if(vowelOfKana == "エ") prev[kana+"イ"] = [[kana+"ー"],[kana,"イ"]];//eiを伸ばし棒化する
				if(vowelOfKana == "オ") prev[kana+"ウ"] = [[kana+"ー"],[kana,"ウ"]];//ouを伸ばし棒化する
				break;
			}
			return prev;
		},{});		
	})();
	const KANA_UNITS_LIST_ = Object.keys(KANA_UNITS_);
	
	//small母音とlarge母音の変換オブジェクトを作る
	const SMALL2LARGE_ = (function(){
		return zip(SMALL_VOWELS_,LARGE_VOWELS_).reduce((prev,[v1,v2]) => {
			prev[v1] = v2;
			return prev;
		},{});
	})();
	
	const SIMILARITY_ = {
			vowel: loadJsonFile("conf/simVowelsSimple.json"),
			consonant: loadJsonFile("conf/simConsonantsSimple.json")
	}
	const ENGLISH2KANA_ = loadJsonFile("conf/bep-eng.json");//key値のアポストロフィはAPOSTROPHEに変換されている
	const getKanaOfEnglish = tYomi => {
		const e2k = ENGLISH2KANA_;
		const strApos = "APOSTROPHE";
		if(tYomi.match(/^[A-Za-z]*$/)){
			tYomi = tYomi.toUpperCase();
			if(tYomi in e2k)
				tYomi = e2k[tYomi];
			else{
				if(tYomi.includes(strApos) && tYomi != strApos)
					tYomi = tYomi.replace(/APOSTROPHE/g,"");//アポストロフィあるのに辞書に読みがなかった場合、アポストロフィを無視して読む
				tYomi = convertRomanToKana(tYomi);//英単語辞書になかったらローマ字読みする
				console.log("tYomi=",tYomi);
				//それでもアルファベットが残っていればいち文字ずつ読む
				let found = tYomi.match(/[A-Z]/g);//iは大文字小文字無視。
				if(found){
					for(let v of found){
						console.log("found loop v=",v);
						let count = 0;
						while(tYomi.includes(v)){
							tYomi = tYomi.replace(v,e2k[v]);
							if(count>tYomi.length)
								break;
							else
								count += 1;
						}
					}							
				}						
			}
			console.log("tyomi",tYomi);
			return tYomi;
		}
		else{
			console.log("aaaaa");
			return null;
		}
	}
	//kanaListのkeysの単位で文字列を分割する
	const separateKana = kanaStr => {//kanaUnitsはカナのリスト(not object)を想定
		const S2L = SMALL2LARGE_,
			KANA_UNITS_ = KANA_UNITS_LIST_,
			K2V = KANA2VOWEL_,
			//KANA_UNITS_WITH_BAR_ = KANA_UNITS_.filter(v=> (["ー","ッ","ン"].indexOf(v.slice(-1))>=0)),
			LEN_MAX_ = 2
			;
		let result = [],
			i=0;
		kanaStr = kanaStr.replace(/ーー/g, "ー").replace(/ンン/g, "ン").replace(/ッッ/,"ッ");
		let kanaStrLen = kanaStr.length;
		kanaStr += "//";

		while(i<kanaStrLen){
			let p = kanaStr.slice(i,i+LEN_MAX_+1);
			if(p[0] in S2L){
				p = S2L[p[0]] + p.slice(1);
			}
			let moji = "";
			for(let si = LEN_MAX_; si>0; si--){
				let p1 = p.slice(0,si);
				let p2 = p[si];
				if(p1 in K2V){
					if(p2 == "ー"){
						if(K2V[p1] == "エ" && p1[p1.length-1] == "イ")
							moji = p1[0];
						else if(K2V[p1] == "オ" && p1[p1.length-1] == "ウ"){
							moji = p1[0];
						}
						else if(p1 == "ン"){
							result.push(p1);
							i += 1;
							moji = p1;
						}
						else{
							moji = p1+p2;
						}
					}
					else if(p2 == "エ" && K2V[p1] == "エ" && p1[p1.length-1] == "イ")
						moji = p1;
					else if(p2 == "オ" && K2V[p1] == "オ" && p1[p1.length-1] == "ウ")
						moji = p1;
					else if("アイウエオ".includes(p2) && K2V[p1] == p2 && p1[p1.length-1] != "ー")
						moji = p1 + p2;
					else
						moji = p1;
					break;
				}
			}
			if(moji == "")
				break;
			result.push(moji);
			i+=result[result.length-1].length;
		}
		//p = kanaStr.slice(kanaStrLen);
		return result;

	}


	
	////parametersに存在しないkeyをthis.DEFAULT_PARAMETER_VALUESを埋めて返す
	const getFormatedParam = parameters => Object.assign(DEFAULT_PARAMETER_VALUES_,parameters);

	//kanaの距離を計算の元を出力する関数
	const getKanaSimilarity = (function(){
		
		const SIMILARITY_BASE_ = (function(){
			const sims = [SIMILARITY_.consonant, SIMILARITY_.vowel],
			k2p = $.extend(true,{},KANA2PHONON_);
			//伸ばし棒を追加
			for(let k1 of Object.keys(k2p)){
			//for(let k1 of k2plist){
				const hasVowel = ("aiueo".includes(k2p[k1][1].slice(-1)));
				//console.log(k1,hasVowel);
				if(hasVowel == true){
					k2p[k1+"ー"] = [k2p[k1][0],k2p[k1][1]+":"];
					//k2p[k1+"ン"] = [k2p[k1][0],k2p[k1][1]+":"];//ンはーと同じ
					//k2p[k1+"ッ"] = k2p[k1];//ッは、なにもないのと同じ
				}
			}
			let k2plist = Object.keys(k2p);
			//return Object.keys(k2p)
			return k2plist
				.reduce( (prev1,k1) => {
					const p1 = k2p[k1];//k1のphonon
					//prev1[k1] = Object.keys(k2p)
					prev1[k1] = k2plist
								.reduce( (prev2,k2) => {
									const p2 = k2p[k2];//k2のphonon
									//if(Object.keys(sims[1]).indexOf(p1[1])<0)
									if(!(p1[1] in sims[1]))
										console.log("k1,p1",k1,p1);
									prev2[k2] = (sims[0][p1[0]][p2[0]]+sims[1][p1[1]][p2[1]])/2;//子音同士、母音同士の類似度の平均をk1とk2の類似度のベースとして定義
									return prev2;
								},{});
					return prev1;
				},{});				
		})();
		
		//同じ文字か判定
		const isSameKana = (kana1,kana2) => kana1 == kana2;
		//同じ母音か判定
		const isSameVowel = (kana1,kana2) => {
			const k2v = KANA2VOWEL_;
			if(kana1 in k2v && kana2 in k2v)
				return k2v[kana1] == k2v[kana2];
			else{
				//console.log("kana is undefined");
				return false;
			}
		}
		//同じ子音か判定
		const isSameConsonant = (kana1,kana2) => {
			const k2c = KANA2CONSONANT_;
			if(kana1 in k2c && kana2 in k2c)
				return k2c[kana1] == k2c[kana2];
			else{
				//console.log("kana is undefined");
				return false;
			}
		}
		//どちらも拗音かどうか
		const isSameBar = (kana1,kana2) => {
			const checkChar = "ー",
				isKana1Ok = ( kana1.slice(-1) == checkChar),
				isKana2Ok = (kana2.slice(-1) == checkChar)
				;
			return (isKana1Ok && isKana2Ok);
		}
		//どちらも促音かどうか
		const isSameSokuon = (kana1,kana2) => {
			const checkChar = "ッ",
				isKana1Ok = ( kana1.slice(-1) == checkChar),
				isKana2Ok = (kana2.slice(-1) == checkChar)
				;
			return (isKana1Ok && isKana2Ok);
		}
		//どちらも撥音かどうか
		const isSameHatsuon = (kana1,kana2) => {
			const checkChar = "ン",
				isKana1Ok = ( kana1.slice(-1) == checkChar),
				isKana2Ok = (kana2.slice(-1) == checkChar)
			;
			return (isKana1Ok && isKana2Ok);
		}


		//パラメータに基づいて微調整する
		return parameter => {
			const param = getFormatedParam(parameter),
			//ksb = $.extend(true,{},kanaSimilarityBase)//値渡し
			ksb = SIMILARITY_BASE_;
			const ksbKeys = Object.keys(ksb);
			const kanaSimilarity = ksbKeys.reduce((prev1,k1)=>{
				prev1[k1] = ksbKeys.reduce((prev2,k2) => {
					let s = ksb[k1][k2];//baseのsimilarityを取得
					if(isSameKana(k1,k2)) s *= param.SAME_KANA_REWARD;
					if(isSameVowel(k1,k2)) s*= param.SAME_VOWEL_REWARD;
					if(isSameConsonant(k1,k2)) s*= param.SAME_CONSONANT_REWARD;
					if(isSameHatsuon(k1,k2)) s*= param.SAME_HATSUON_REWARD;
					if(isSameSokuon(k1,k2)) s*= param.SAME_SOKUON_REWARD;
					prev2[k2] = s;
					return prev2;
				},{});
				return prev1;
			},{});

			return kanaSimilarity;			
		}			
	})();
	
	//母音連続時の変換パターンのリスト("アア"を[["アー"],["ア","ア"]]にするなど)
	const getPronunciationVariation = kana => {
		const kanaUnits = KANA_UNITS_;
		const variations = kana.map(v => {
			//if(Object.keys(kanaUnits).indexOf(v)>=0)
			if(v in kanaUnits)
				return kanaUnits[v];
			else
				return [v];
		});
		return product(...variations)
				.map(v => v.filter(v2=>v2!="").flat())
				.filter(v => v.length != 0);//長さ0の配列は要素に含めない
	}

	
	return {
		getKanaSimilarity: param=>getKanaSimilarity(param),
		getKanaOfEnglish: text => getKanaOfEnglish(text),
		getFormatedParam: param=>getFormatedParam(param),
		separateKana: text=>separateKana(text),
		isKana: text=>text in KANA2PHONON_,
		isSmall: text=>text in SMALL2LARGE_,
		getPronunciationVariation: kana=>getPronunciationVariation(kana)
	}
	
})();