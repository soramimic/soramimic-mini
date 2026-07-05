import { orgRound, argsort } from './kanaUtils';

// 類似単語を取得する関数
export function createGetSimilarWord(makeKanaDist, ldOuter, convertBarFunc) {
  return function getSimilarWord(param) {
    const kanadist = makeKanaDist(param);
    const ld = ldOuter(kanadist);
    
    return function(wordlist, target, length = 100) {
      const orglen = target.length;
      const cand = convertBarFunc(target);
      
      const cand2 = {};
      cand.forEach(val => {
        const tmplength = val.length;
        if (!(tmplength in cand2)) {
          cand2[tmplength] = [];
        }
        cand2[tmplength].push(val);
      });
      
      const sims = [];
      const words = [];
      
      for (const i in cand2) {
        if (!(i in wordlist)) {
          continue;
        }
        
        wordlist[i].forEach(w => {
          const tmplist = [];
          cand2[i].forEach(tar => {
            tmplist.push(ld(tar, w[2]) / i);
          });
          const tSim = Math.min(...tmplist);
          sims.push(tSim * orglen);
        });
        
        words.push(...wordlist[i]);
      }
      
      const args = argsort(sims);
      const result = [];
      const indexes = [];
      
      for (let i = 0; i < args.length; i++) {
        const val = args[i];
        const tmpW = words[val];
        
        const id = tmpW[tmpW.length - 1];
        if (indexes.indexOf(id) < 0) {
          indexes.push(id);
          result.push([
            target.join(""), 
            tmpW[1], 
            tmpW[0], 
            orgRound(sims[val], 100),
            tmpW[3]
          ]);
        }
        
        if (result.length === length) {
          break;
        }
      }
      
      return result;
    };
  };
}

// パラメータ取得関数
export function getParamFromSliderValue(val) {
  const param = {};
  
  if (val === 0) {
    // デフォルト値
  } else if (val > 0) {
    if (val === 1) {
      val = 0.99;
    }
    param["sameVowel"] = (1 - val);
  } else {
    if (val === -1) {
      val = -0.99;
    }
    param["sameConsonant"] = (1 + val);
  }
  
  return param;
}