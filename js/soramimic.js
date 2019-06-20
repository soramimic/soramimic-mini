class Soramimic {
	constructor(){
		//重みや母音、カナのリストの取得
		$.ajaxSetup({async: false});
		$.when(
			$.getJSON("conf/allkanaBi.json"),
			$.getJSON("conf/simConsonantsSimple.json"),
			$.getJSON("conf/simVowelsSimple.json"),
			$.getJSON("conf/vowels.json"),
			$.getJSON("conf/consonants.json")
		)
		.done((allkana, cCost, vCost,vowels,consonants) => {
			this.allKana = allkana[0];
			this.cCost = cCost[0];
			this.vCost = vCost[0];
			this.vowels = vowels[0];
			this.consonants = consonants[0];
		})
		.fail(function(){
			console.log("error");
		})
		$.ajaxSetup({async: true});
		this.makeKanaDist = this.makeKanaDist_outer();
		//console.log(this.makeKanaDist_outer());
	}

	//kanaの距離を計算する関数。outerで基本的な結果を求めておき、innerで微調整する
	makeKanaDist_outer(){
		const sims = [this.cCost,this.vCost],
			single = ["sp","ン","ッ","ア","イ","ウ","エ","オ","アー","イー","ウー","エー","オー"],
			//母音同士、子音同士の距離を求める
			kCostElem = Object.keys(this.allKana).reduce((prev1,v1) => {
				const s1 = this.allKana[v1];
				prev1[v1] = Object.keys(this.allKana).reduce((prev2,v2) => {
					const s2 = this.allKana[v2];
					prev2[v2] = zip(s1,s2,sims).map(([t1,t2,t3]) => t3[t1][t2]);
					return prev2;
				},{});
				return prev1;
			},{}),
			//母音と子音の距離を平均する
			costKanaBi = Object.keys(kCostElem).reduce((prev1,v1) => {
				const s1 = kCostElem[v1],
					isV1Single = ( single.indexOf(v1)>=0 ) //v1が子音なしの文字であるかどうか
					;
				prev1[v1] = Object.keys(s1).reduce((prev2,v2) => {
					const s2 = s1[v2],
						isV2Single = ( single.indexOf(v2) >=0 ),//v2が子音なしの文字であるかどうか
						//m = (isV1Single && isV2Single) ? s2[1] : (w[0]*s2[0]+w[1]*s2[1])/(w[0]+w[1])
						m = (isV1Single && isV2Single) ? s2[1] : (s2[0]+s2[1])/2;
						;
					prev2[v2] = orgRound(m,100);
					return prev2;
				},{});
				return prev1;
			},{})
			;
		//パラメータに基づいて微調整する
		const makeKanaDist_inner = param => {
			const sameChar = param["sameChar"],
				sameVowel = param["sameVowel"]
				//sameBar = param["sameBar"],
				;
			let costs = costKanaBi;
			if (sameVowel != 1){
				costs = Object.keys(vowels).reduce((prev1,v1)=>{
					for(let v2 of vowels[v1]){
						for(let v3 of vowels[v1])
							prev1[v3][v2] *= sameVowel;
					}
					return prev1;
				},costs)
			}
			return costs;
		}
		return makeKanaDist_inner;
	}

	//文字列同士の距離を求める

	//デフォルトのパラメータをセット
}

const db = new Soramimic();
console.log(db.makeKanaDist({"sameChar":1,"sameVowel":1}));
