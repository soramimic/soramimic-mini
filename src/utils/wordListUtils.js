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

// フィルター選択(列 -> 選択値の配列)をwhereクエリに変換する。
// パーサは括弧非対応なので、ベースのwhere句とは別クエリにして逐次適用(AND)する
export function buildFilterQueries(entry, selections) {
  const queries = entry.where ? [entry.where] : [];
  for (const filter of entry.filters || []) {
    const values = selections?.[filter.column];
    // 全解除(空配列)は「該当なし」であってクエリ省略ではない。呼び出し側で処理する
    if (!values || values.length === 0) continue;
    queries.push(values.map((v) => `${filter.column}=${v}`).join(" or "));
  }
  return queries;
}

// setting.json のfiltersからデフォルトの選択状態を作る
export function defaultFilterSelections(entry) {
  const selections = {};
  for (const filter of entry.filters || []) {
    selections[filter.column] = filter.options
      .filter((o) => o.default)
      .map((o) => o.value);
  }
  return selections;
}

// tidy CSVテキストをデータベース形式に変換する
// whereQuery: 文字列または文字列の配列(配列は順に適用=AND)
export function loadDatabaseCsvText(text, whereQuery, getYomi, separateKana, convertBar) {
  if (!text) return {};

  text = text.replace(/\s*,\s*/g, ",");
  const lines = text.split(/\r\n|\n|\r/).filter(v => v.length > 0);
  const header = lines[0].split(",");
  const df = lines.slice(1).map(v => v.split(","));

  const queries = (Array.isArray(whereQuery) ? whereQuery : [whereQuery])
    .filter((q) => q);
  let filtered = df;
  for (const q of queries) {
    filtered = Parser().filter(q, header, filtered);
  }

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

// CSVはフィルター変更のたびに再構築するので、テキストは一度だけ取得する
const csvTextCache = {};

// setting.json の wordlist エントリ1件からデータベースを読み込む。
// selections はフィルターの選択状態(列 -> 選択値の配列)。省略時はwhere句のみ
export async function loadDatabaseFromEntry(entry, getYomi, separateKana, convertBar, selections) {
  if (!(entry.filepath in csvTextCache)) {
    csvTextCache[entry.filepath] = await loadTextFile(import.meta.env.BASE_URL + entry.filepath);
  }
  const text = csvTextCache[entry.filepath];
  if (!text) return null;
  // どれかのフィルターが全解除なら該当なし
  if (selections && Object.values(selections).some((v) => v && v.length === 0)) {
    return {};
  }
  const queries = buildFilterQueries(entry, selections);
  return loadDatabaseCsvText(text, queries, getYomi, separateKana, convertBar);
}
