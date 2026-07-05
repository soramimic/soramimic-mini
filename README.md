# soramimic-mini

空耳単語変換アプリ(React + Vite)。入力した単語の読みに近い単語を、単語リストから探して返す。
[Soramimic](https://github.com/soramimic/soramimic)(空耳作詞支援システム)のミニ版。

## 構成

- **単語リスト**: [soramimic-wordlists](https://github.com/soramimic/soramimic-wordlists) を git submodule(`wordlists/`)で参照し、`public/wordlists` の symlink 経由で配信。リストの定義(表示名・whereフィルタ)は `public/conf/setting.json`
- **読み推定**: [soramimi-yomi](https://github.com/soramimic/soramimi-yomi) の API(Cloud Run)をプログレッシブエンハンスメントで利用。APIが使えるときは英語入力も可。使えないときはブラウザ内の kuromoji.js にフォールバック(オフラインでも動く)
- **デプロイ**: GitHub Actions(`.github/workflows/deploy.yml`)で master への push 時に GitHub Pages へ

## 開発

```sh
git clone --recursive <this repo>   # submodule ごと clone
npm ci
npm run dev        # 開発サーバー
npm test           # vitest
npm run build      # 本番ビルド(dist/)
npm run preview    # 本番ビルドの確認
```

clone 済みで `wordlists/` が空の場合は `git submodule update --init`。
単語リストを最新にするには `git submodule update --remote wordlists`。

## ハマりどころ

- kuromoji の辞書(`public/kuromoji/dict/*.dat.gz`)は kuromoji 自身が gzip 解凍するため、
  vite dev/preview では `vite.config.js` のプラグインが素のバイナリとして直接配信している(触らない)
- wordlists の CSV は**末尾改行なし**(パーサが最終空行で落ちる)
- `base: './'` で相対パス配信(GitHub Pages のプロジェクトページ対応)。fetch パスには `import.meta.env.BASE_URL` を付けること
