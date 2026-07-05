import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { fileURLToPath } from 'node:url'
import fs from 'node:fs'
import path from 'node:path'

// kuromoji の辞書(.dat.gz)は kuromoji 自身が gzip 解凍する。
// vite の dev/preview サーバは .gz に Content-Encoding を付けたり
// 圧縮ミドルウェアで再圧縮したりしてブラウザ側の解凍と衝突するため、
// 辞書パスは静的配信を通さずこのプラグインが素のバイナリとして直接返す。
// (GitHub Pages 等は .gz を素のバイナリで返すので本番ビルドは問題ない)
function serveDictAsBinary() {
  function makeMiddleware(rootDir) {
    return (req, res, next) => {
      if (!req.url || !req.url.startsWith('/kuromoji/dict/')) return next()
      const rel = req.url.split('?')[0].replace(/^\//, '')
      const file = path.join(rootDir, rel)
      fs.readFile(file, (err, data) => {
        if (err) {
          res.statusCode = 404
          return res.end('not found')
        }
        res.setHeader('Content-Type', 'application/octet-stream')
        res.setHeader('Content-Length', data.length)
        res.setHeader('Cache-Control', 'no-transform')
        res.end(data)
      })
    }
  }
  return {
    name: 'serve-kuromoji-dict-as-binary',
    configureServer(server) {
      server.middlewares.use(
        makeMiddleware(path.resolve(server.config.root, 'public')))
    },
    configurePreviewServer(server) {
      server.middlewares.use(
        makeMiddleware(server.config.build.outDir
          ? path.resolve(server.config.root, server.config.build.outDir)
          : path.resolve(server.config.root, 'dist')))
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  // GitHub Pages のプロジェクトページ(サブパス配信)でも動くよう相対パスにする
  base: './',
  plugins: [react(), serveDictAsBinary()],
  resolve: {
    alias: {
      // kuromoji(辞書ローダ)がブラウザでも path.join を使うため最小シムを与える
      path: fileURLToPath(new URL('./src/shims/path.js', import.meta.url)),
    },
  },
})
