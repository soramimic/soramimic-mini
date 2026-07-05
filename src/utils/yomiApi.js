// 読み推定API(soramimi-yomi)クライアント。
// プログレッシブエンハンスメント: 起動時にヘルスチェックし、使えるときだけ
// 入力テキストの読み推定をAPIに任せる。失敗時は呼び出し側がkuromojiへフォールバックする。
// URLは conf/setting.json の yomiApi.url で設定(空/未設定なら無効)。

export function createYomiApi(baseUrl, { timeoutMs = 8000 } = {}) {
  const url = (baseUrl || "").replace(/\/$/, "");

  async function post(path, body, ms) {
    const res = await fetch(url + path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(ms),
    });
    if (!res.ok) throw new Error(`yomi api error: ${res.status}`);
    return res.json();
  }

  return {
    enabled: !!url,
    async healthy() {
      if (!url) return false;
      try {
        const res = await fetch(url + "/health", {
          signal: AbortSignal.timeout(3000),
        });
        return res.ok;
      } catch {
        return false;
      }
    },
    // テキストの読み(カタカナ)を返す
    async getYomi(text) {
      const data = await post("/yomi", { text }, timeoutMs);
      return data.yomi;
    },
  };
}
