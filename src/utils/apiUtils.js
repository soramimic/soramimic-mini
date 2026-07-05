// テキストファイルを読み込む関数
export async function loadTextFile(path) {
  try {
    const response = await fetch(path);
    if (!response.ok) {
      throw new Error(`Error fetching file: ${response.status}`);
    }
    return await response.text();
  } catch (error) {
    console.error("Failed to load text file:", error);
    return "";
  }
}

// JSON設定ファイルを読み込む関数
export async function loadJsonConfig(path) {
  try {
    const response = await fetch(path);
    if (!response.ok) {
      throw new Error(`Error fetching JSON: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Failed to load JSON:", error);
    return null;
  }
}

// 単語リストをデータベース形式に変換する関数
export function loadDatabaseText(text, getYomi, separateKana, convertBar) {
  if (!text) return {};
  
  const words = [];
  text.split("\n").forEach(function(val) {
    val = val.replace(/\u200B/g, ""); // エスケープ処理
    val = val.split("#")[0].split(","); // 各行において#以降をコメントアウトして、カンマでスプリット
    words.push(val);
  });
  
  const result = {};
  words.forEach(function(val, index) {
    if (val.length === 0) {
      return;
    } else {
      if (val.length === 1) {
        val.push(getYomi(val[0]));
      }
      const title = val[0];
      val.slice(1).forEach(function(val6) {
        const yomi = getYomi(val6);
        const sep = separateKana(yomi);
        const ptn = convertBar(sep);
        ptn.forEach(function(v4) {
          const v4len = v4.length;
          if (v4len === 0) {
            return;
          }
          if (!(v4len in result)) {
            result[v4len] = [];
          }
          result[v4len].push([title, val6, v4, index]);
        });
      });
    }
  });
  return result;
}

// ファイルからデータベースを読み込む関数
export async function loadDatabaseFile(path, getYomi, separateKana, convertBar) {
  const wordlisttext = await loadTextFile(path);
  if (!wordlisttext) {
    return null;
  }
  return loadDatabaseText(wordlisttext, getYomi, separateKana, convertBar);
}