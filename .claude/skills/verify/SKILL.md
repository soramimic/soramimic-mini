---
name: verify
description: soramimic-mini の変更をブラウザで実際に動かして確認する手順
---

# soramimic-mini の動作確認

ブラウザ SPA なので、確認は実ブラウザで行う(vitest 通過は CI の代替にすぎない)。

## 起動

```sh
npm run dev -- --port 5199 --strictPort     # 開発
npm run build && npm run preview -- --port 5198 --strictPort  # 本番相当
```

## 確認フロー

1. ページを開き **ロード完了(単語リストのラジオが出る)まで待つ**。
   kuromoji 辞書 + CSV 7本の読み込みで数秒かかる。ロード中のクリックは無視される
2. 単語リストを選び、入力欄に単語を入れて Convert → 結果リストが出ること
3. yomi-api 経由の確認: 英語(例 "hello world")を入力 → 「ハロー…」の読みで結果が出れば
   Cloud Run API が使われている(kuromoji では英語→カナは不可能)。
   ネットワークで `run.app/yomi` への POST 200 も確認できる
4. 自作リスト: 「自作の単語リストを使用」→ モーダルに単語(漢字可)を改行区切りで入力 → 登録 → Convert

## 注意

- **alert に注意**: yomi-api が unhealthy のときアルファベット入力で `alert()` が出る。
  ブラウザ自動化中に出ると全操作がブロックされる(復旧は URL 再ナビゲート)
- Node 22+ では vitest の jsdom で localStorage が Node の実験的グローバルに隠される
  → `src/tests/setup.js` がインメモリ実装を注入している
