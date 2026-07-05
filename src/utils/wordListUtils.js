// soramimic-wordlists の tidy CSV(id,original,surface,pronunciation,...)を
// miniのデータベース形式 {音数: [[original, surface, pattern, id], ...]} に変換する。
// whereクエリのParserは本体(soramimic frontend/src/lib/wordList.js)から移植(ロジック無改変)。
import { formatText } from './kuromojiUtils';
import { loadTextFile } from './apiUtils';

export function Parser() {
  function tokenize(query_str) {
    query_str = query_str.replace(/!=|=|\(|\)/g, " $& "); //!= or = or ( or )
    query_str = query_str.trim();
    return query_str.split(/\s+/);
  }

  function expression(obj, query, i, checkFunc) {
    if (i >= query.length) return -1;

    let result;
    let r = factor(obj, query, i, checkFunc);

    if (r === -1) return -1;

    result = r[0];
    i = r[1];

    while (i < query.length) {
      if (query[i] !== "or" && query[i] !== "and") return -1;

      let r = factor(obj, query, i + 1, checkFunc);

      if (r === -1) return -1;

      if (query[i] === "or") {
        result = (result || r[0]);
      } else {
        result = (result && r[0]);
      }

      i = r[1];
    }

    return result;
  }

  function factor(obj, query, i, checkFunc) {
    if (query[i] === "(") {
      let r = expression(obj, query, i + 1, checkFunc);
      if (query(r[1]) === ")") {
        return [r[0], r[1] + 1];
      } else {
        return -1;
      }
    } else if (i < query.length - 2 && (query[i + 1] === "=" || query[i + 1] === "!=")) {
      let r = checkFunc(query, i, obj);
      if (r === -1) return -1;
      return [r, i + 3];
    } else {
      return -1;
    }
  }

  function getKeys(query) {
    let result = [];
    for (let i = 1; i < query.length - 1; i++) {
      if (query[i] === "=" || query[i] === "!=") {
        if (result.includes(query[i - 1]) === false) {
          result.push(query[i - 1]);
        }
      }
    }
    return result;
  }

  return {
    filter: function (query_str, header, dataframe) {
      let query = tokenize(query_str);
      let keys = getKeys(query);
      let keyToIndex = {};
      for (let k of keys) {
        let index = header.indexOf(k);
        if (index === -1) {
          console.error("where句のキーがヘッダにありません:", k);
          return [];
        }
        keyToIndex[k] = index;
      }
      let checkFunc = function (query, i, obj) {
        if (query[i + 1] === "=") {
          let index = keyToIndex[query[i]];
          return obj[index] === query[i + 2];
        } else if (query[i + 1] === "!=") {
          let index = keyToIndex[query[i]];
          return obj[index] !== query[i + 2];
        } else {
          return -1;
        }
      };
      return dataframe.filter(obj => expression(obj, query, 0, checkFunc));
    }
  };
}

// tidy CSVテキストをデータベース形式に変換する
export function loadDatabaseCsvText(text, whereQuery, getYomi, separateKana, convertBar) {
  if (!text) return {};

  text = text.replace(/\s*,\s*/g, ",");
  const lines = text.split(/\r\n|\n|\r/).filter(v => v.length > 0);
  const header = lines[0].split(",");
  const df = lines.slice(1).map(v => v.split(","));

  const filtered = whereQuery ? Parser().filter(whereQuery, header, df) : df;

  const h2i = {};
  header.forEach((h, i) => { h2i[h] = i; });

  const result = {};
  filtered.forEach((row) => {
    const id = row[h2i["id"]];
    const original = row[h2i["original"]];
    const surface = row[h2i["surface"]];

    let pronunciation = row[h2i["pronunciation"]];
    if (!pronunciation || pronunciation === "NA" || pronunciation === "na") {
      pronunciation = surface;
    }
    // 読み欄に漢字が残っている場合のみトークナイザで読みを推定する
    if (/[一-龠]/.test(pronunciation)) {
      pronunciation = getYomi(pronunciation);
    }
    pronunciation = formatText(pronunciation);
    if (!pronunciation) return;

    const ptn = convertBar(separateKana(pronunciation));
    ptn.forEach((p) => {
      if (p.length === 0) return;
      if (!(p.length in result)) {
        result[p.length] = [];
      }
      result[p.length].push([original, surface, p, id]);
    });
  });
  return result;
}

// setting.json の wordlist エントリ1件からデータベースを読み込む
export async function loadDatabaseFromEntry(entry, getYomi, separateKana, convertBar) {
  const text = await loadTextFile(import.meta.env.BASE_URL + entry.filepath);
  if (!text) return null;
  return loadDatabaseCsvText(text, entry.where, getYomi, separateKana, convertBar);
}
