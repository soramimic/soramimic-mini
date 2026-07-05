import kuromoji from 'kuromoji';

export function initializeKuromoji() {
  return new Promise((resolve, reject) => {
    kuromoji.builder({ dicPath: import.meta.env.BASE_URL + 'kuromoji/dict' }).build((err, tokenizer) => {
      if (err) {
        reject(err);
      }
      resolve(tokenizer);
    });
  });
}

export function getYomi(tokenizer, strVal) {
  let yomi = "";
  const path = tokenizer.tokenize(strVal);
  
  path.forEach((val) => {
    let tYomi = val.pronunciation;
    if (typeof tYomi === "undefined") {
      tYomi = val.surface_form;
    }
    yomi += tYomi;
  });
  
  return removeSign(yomi);
}

// 記号を削除する関数
export function removeSign(strVal) {
  strVal = toHalfWidth(strVal); // 全角を半角に変換
  strVal = strVal.replace(/\W/g, function(m) {
    return m.match(/[!-~]|\s/) ? "" : m
  }); // 正規表現で記号を削除
  strVal = strVal.replace(/・/g, '').replace(/「/g, '').replace(/」/g, '');
  return strVal;
}

// 全角から半角への変換関数
export function toHalfWidth(strVal) {
  // 半角変換
  const halfVal = strVal.replace(/[！-～]/g,
    function(tmpStr) {
      // 文字コードをシフト
      return String.fromCharCode(tmpStr.charCodeAt(0) - 0xFEE0);
    }
  );

  // 文字コードシフトで対応できない文字の変換
  return halfVal.replace(/"/g, "\"")
    .replace(/'/g, "'")
    .replace(/'/g, "`")
    .replace(/￥/g, "\\")
    // eslint-disable-next-line no-irregular-whitespace
    .replace(/　/g, " ")
    .replace(/〜/g, "~");
}

// カタカナに変換する関数
export function toKatakana(strVal) {
  return strVal.replace(/[ぁ-ん]/g, function(s) {
    return String.fromCharCode(s.charCodeAt(0) + 0x60);
  });
}

// テキストをフォーマットする関数
export function formatText(strVal) {
  strVal = removeSign(strVal);
  strVal = toKatakana(strVal);
  return strVal;
}

// アルファベットが含まれているかチェックする関数
export function containAlphabet(val) {
  // eslint-disable-next-line no-control-regex
  const regex = /^[^\x01-\x7E\xA1-\xDF]+$/
  return !regex.test(val);
}