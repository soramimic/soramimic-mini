// 二つの配列を組み合わせる関数
export const zip = (array1, array2) => array1.map((_, i) => [array1[i], array2[i]]);

// 数値を丸める関数
export function orgRound(value, base) {
  return Math.round(value * base) / base;
}

// デフォルトパラメータを設定する関数
export function setDefaultParameters(param = {}) {
  const defaultParam = {
    "splitter": "/",
    "vowel": 1,
    "consonant": 1,
    "repeat": 100,
    "duplicate": false,
    "bunsetsu": 0.1,
    "wordsNum": 0.01,
    "sameChar": 1,
    "sameVowel": 1,
    "sameConsonant": 1,
    "length": 1
  };
  return Object.assign(defaultParam, param);
}

// カナ文字をセパレートする関数（設定ファイル読み込み後に初期化される）
export function createSeparateKana(allkanaBiData, vowelsData) {
  const kanalist = allkanaBiData;
  const vowels = vowelsData;
  
  // 小さい文字から大きい文字への変換マップ
  const S2L = {};
  zip(["ァ", "ィ", "ゥ", "ェ", "ォ", "ャ", "ュ", "ョ", "ヮ"], 
      ["ア", "イ", "ウ", "エ", "オ", "ヤ", "ユ", "ヨ", "ワ"])
    .forEach(([v1, v2]) => {
      S2L[v1] = v2;
    });
  
  return function separateKana(k) {
    // 長音記号とっと音が連続する場合は一つにまとめる
    ["ー", "ッ"].forEach(v => {
      while (k.indexOf(v + v) >= 0) {
        k = k.replace(v + v, v);
      }
    });
    
    k += "__"; // 最後の2文字をうまく処理するため終端文字の追加
    
    let i = 0;
    const result = [];
    
    while (i < k.length - 2) {
      let p = k.slice(i, i + 3);
      if (p[0] in S2L) {
        p = S2L[p[0]] + p.slice(1);
      }
      
      let moji = "";

      [2, 1].forEach(si => {
        if (moji !== "") return;
        
        const p1 = p.slice(0, si);
        const p2 = p[si];
        
        if (p1 in kanalist) {
          if (p2 === "ー") {
            if (vowels["エ"] && vowels["エ"].indexOf(p1) >= 0 && p1[p1.length - 1] === "イ") {
              moji = p1[0];
            } else if (vowels["オ"] && vowels["オ"].indexOf(p1) >= 0 && p1[p1.length - 1] === "ウ") {
              moji = p1[0];
            } else if (p1 === "ン") {
              result.push(p1);
              i += 1;
              moji = p1;
            } else {
              moji = p1 + p2;
            }
          } else if (p2 === "エ" && vowels[p2] && vowels[p2].indexOf(p1) >= 0 && p1[p1.length - 1] === "イ") {
            moji = p1.slice(0, -1) + "ー";
          } else if (p2 === "オ" && vowels[p2] && vowels[p2].indexOf(p1) >= 0 && p1[p1.length - 1] === "ウ") {
            moji = p1.slice(0, -1) + "ー";
          } else if (vowels[p2] && vowels[p2].indexOf(p1) >= 0 && p1[p1.length - 1] !== "ー") {
            moji = p1 + "ー";
          } else {
            moji = p1;
          }
        }
      });
      
      if (moji === "") {
        break;
      }
      
      result.push(moji);
      i += moji.length;
    }
    
    return result;
  };
}

// カナとバーを変換する関数（設定ファイル読み込み後に初期化される）
export function createConvertBar(kanaWithBarData) {
  const converter = kanaWithBarData;
  
  return function convertBar(kana) {
    const count = [];
    const count2 = [];
    
    kana.forEach((v) => {
      if (v in converter) {
        count.push(v);
        count2.push(converter[v]);
      }
    });
    
    const change = productList(count2);
    const result = [];
    
    change.forEach(v => {
      let kanaStr = kana.join("/");
      zip(count, v).forEach(([v2, v3]) => {
        kanaStr = kanaStr.replace(v2, v3.join("/")).replace("//", "/");
      });
      
      if (kanaStr.endsWith("/")) {
        kanaStr = kanaStr.slice(0, -1);
      }
      
      result.push(kanaStr.split("/"));
    });
    
    return result;
  };
}

// 直積を求めてリストで返す関数
export function productList(list) {
  let p = 1;
  list.forEach(v => {
    p *= v.length;
  });
  
  const result = [];
  for (let i = 0; i < p; i++) {
    result.push([]);
  }
  
  const plist = [];
  let p2 = p;
  
  list.forEach(v => {
    p2 /= v.length;
    plist.push([p2, p / (p2 * v.length)]);
  });
  
  zip(plist, list).forEach(([v1, v2]) => {
    let tmp = 0;
    for (let i1 = 0; i1 < v1[0]; i1++) {
      v2.forEach(v3 => {
        for (let i2 = 0; i2 < v1[1]; i2++) {
          result[tmp].push(v3);
          tmp += 1;
        }
      });
    }
  });
  
  return result;
}

// 配列のソートインデックスを返す関数
export function argsort(array) {
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

// 音韻距離計算のための関数（設定ファイル読み込み後に初期化される）
export function createMakeKanaDist(allkanaBiData, cCostData, vCostData, vowelsData, consonantsData) {
  const configs = {};
  configs["single"] = ["sp", "ン", "ッ", "ア", "イ", "ウ", "エ", "オ", "アー", "イー", "ウー", "エー", "オー"];
  configs["allkana"] = allkanaBiData;
  configs["cCost"] = cCostData;
  configs["vCost"] = vCostData;
  configs["vowels"] = vowelsData;
  configs["consonants"] = consonantsData;
  
  // カナコスト要素の計算
  const k = {};
  Object.keys(configs["allkana"]).forEach(v1 => {
    const s1 = configs["allkana"][v1];
    k[v1] = {};
    Object.keys(configs["allkana"]).forEach(v2 => {
      const s2 = configs["allkana"][v2];
      k[v1][v2] = [
        configs["cCost"][s1[0]][s2[0]], 
        configs["vCost"][s1[1]][s2[1]]
      ];
    });
  });
  configs["kanaCostElement"] = k;
  
  function reflectParam(costkana, param) {
    const vowels = configs["vowels"];
    const sameVowel = param["sameVowel"];
    const consonants = configs["consonants"];
    const sameConsonant = param["sameConsonant"];
    
    if (sameVowel !== 1) {
      for (const v1 in vowels) {
        vowels[v1].forEach(v2 => {
          vowels[v1].forEach(v3 => {
            costkana[v2][v3] *= sameVowel;
          });
        });
      }
    }
    
    if (sameConsonant !== 1) {
      for (const v1 in consonants) {
        consonants[v1].forEach(v2 => {
          consonants[v1].forEach(v3 => {
            costkana[v2][v3] *= sameConsonant;
          });
        });
      }
    }
    
    return costkana;
  }
  
  return function makeKanaDist(param) {
    const w = [param["consonant"], param["vowel"]];
    const single = configs["single"];
    const costKanaBi = {};
    const k = configs["kanaCostElement"];
    
    Object.keys(k).forEach(v1 => {
      const s1 = k[v1];
      costKanaBi[v1] = {};
      
      Object.keys(k).forEach(v2 => {
        const s2 = s1[v2];
        let m = (w[0] * s2[0] + w[1] * s2[1]) / (w[0] + w[1]);
        
        if (single.indexOf(v1) >= 0 || single.indexOf(v2) >= 0) {
          m = s2[1];
        }
        
        costKanaBi[v1][v2] = Math.round(m * 100) / 100;
        
        if (isNaN(costKanaBi[v1][v2])) {
          console.log(v1, v2);
        }
      });
    });
    
    return reflectParam(costKanaBi, param);
  };
}

// レーベンシュタイン距離の計算関数
export function createLdOuter() {
  return function ld_outer(cost) {
    return function ld_inner(s, t) {
      let score = 0;
      zip(s, t).forEach(([v1, v2]) => {
        score += cost[v1][v2];
      });
      return score;
    };
  };
}