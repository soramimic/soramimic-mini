import { useState, useEffect, useRef, useCallback } from 'react'
import 'bootstrap/dist/css/bootstrap.min.css'
import './App.css'
import WordListSelector from './components/WordListSelector'
import ParameterSlider from './components/ParameterSlider'
import ConversionForm from './components/ConversionForm'
import ResultDisplay from './components/ResultDisplay'
import { initializeKuromoji, getYomi, formatText } from './utils/kuromojiUtils'
import { loadDatabaseText, loadJsonConfig } from './utils/apiUtils'
import { loadDatabaseFromEntry } from './utils/wordListUtils'
import { createYomiApi } from './utils/yomiApi'
import { setDefaultParameters, createSeparateKana, createConvertBar, createMakeKanaDist, createLdOuter } from './utils/kanaUtils'
import { createGetSimilarWord, getParamFromSliderValue } from './utils/similarWordUtils'

function App() {
  const [loading, setLoading] = useState(true)
  const [wordListOptions, setWordListOptions] = useState([])
  const [wordListType, setWordListType] = useState('')
  const [paramValue, setParamValue] = useState(0.5)
  const [results, setResults] = useState([])
  const [processing, setProcessing] = useState(false)
  const [tokenizer, setTokenizer] = useState(null)

  // 処理に必要な関数
  const [separateKana, setSeparateKana] = useState(null)
  const [convertBar, setConvertBar] = useState(null)
  const [makeKanaDist, setMakeKanaDist] = useState(null)
  const [getSimilarWord, setGetSimilarWord] = useState(null)
  const [wordlists, setWordlists] = useState({})

  // 読み推定API(使えるときだけ入力の読み取得に使う。だめならkuromojiにフォールバック)
  const yomiApiRef = useRef(null)
  const [yomiApiReady, setYomiApiReady] = useState(false)

  // オリジナルリスト再構築用
  const utilsRef = useRef(null)

  // 設定データの初期化
  useEffect(() => {
    const initialize = async () => {
      try {
        // kuromojiの初期化
        const tokenizerInstance = await initializeKuromoji()
        setTokenizer(tokenizerInstance)

        // 設定ファイルの読み込み
        const base = import.meta.env.BASE_URL
        const [setting, allkanaBi, simConsonants, simVowels, vowels, consonants, kanaWithBar] = await Promise.all([
          loadJsonConfig(base + 'conf/setting.json'),
          loadJsonConfig(base + 'conf/allkanaBi.json'),
          loadJsonConfig(base + 'conf/simConsonantsSimple.json'),
          loadJsonConfig(base + 'conf/simVowelsSimple.json'),
          loadJsonConfig(base + 'conf/vowels.json'),
          loadJsonConfig(base + 'conf/consonants.json'),
          loadJsonConfig(base + 'conf/kanaWithBar.json')
        ])

        // 読み推定APIのヘルスチェック(バックグラウンド。UIはブロックしない)
        const yomiApi = createYomiApi(setting?.yomiApi?.url)
        yomiApiRef.current = yomiApi
        if (yomiApi.enabled) {
          yomiApi.healthy().then((ok) => { setYomiApiReady(ok) })
        }

        // 各ユーティリティ関数の初期化
        const separateKanaFunc = createSeparateKana(allkanaBi, vowels)
        setSeparateKana(() => separateKanaFunc)

        const convertBarFunc = createConvertBar(kanaWithBar)
        setConvertBar(() => convertBarFunc)

        const makeKanaDistFunc = createMakeKanaDist(allkanaBi, simConsonants, simVowels, vowels, consonants)
        setMakeKanaDist(() => makeKanaDistFunc)

        const ldOuter = createLdOuter()
        const getSimilarWordCreator = createGetSimilarWord(makeKanaDistFunc, ldOuter, convertBarFunc)

        // パラメータの初期化
        const initialParam = setDefaultParameters(getParamFromSliderValue(paramValue))
        const similarWordFunc = getSimilarWordCreator(initialParam)
        setGetSimilarWord(() => similarWordFunc)

        // 単語リストの読み込み(soramimic-wordlistsのtidy CSV)
        const getYomiFunc = (word) => getYomi(tokenizerInstance, word)
        utilsRef.current = { getYomiFunc, separateKanaFunc, convertBarFunc }

        const entries = setting?.wordlist || []
        setWordListOptions(entries.map(({ value, text }) => ({ value, text })))

        const wordlistsObj = {}
        for (const entry of entries) {
          wordlistsObj[entry.value] = await loadDatabaseFromEntry(entry, getYomiFunc, separateKanaFunc, convertBarFunc)
        }

        // オリジナルリストの初期化
        const storedOriginalList = localStorage.getItem('originalWordlist')
        if (storedOriginalList) {
          wordlistsObj['original'] = loadDatabaseText(
            storedOriginalList,
            getYomiFunc,
            separateKanaFunc,
            convertBarFunc
          )
        }

        setWordlists(wordlistsObj)
        if (entries.length > 0) {
          setWordListType(entries[0].value)
        }
        setLoading(false)
      } catch (error) {
        console.error('Initialization error:', error)
      }
    }

    initialize()
  }, [])

  // パラメータ変更時の処理
  useEffect(() => {
    if (makeKanaDist && convertBar) {
      const param = setDefaultParameters(getParamFromSliderValue(paramValue))
      const getSimilarWordCreator = createGetSimilarWord(makeKanaDist, createLdOuter(), convertBar)
      const similarWordFunc = getSimilarWordCreator(param)
      setGetSimilarWord(() => similarWordFunc)
    }
  }, [paramValue, makeKanaDist, convertBar])

  // オリジナルリストの更新(モーダルで登録されたとき)
  const handleOriginalListChange = useCallback((text) => {
    if (!utilsRef.current) return
    const { getYomiFunc, separateKanaFunc, convertBarFunc } = utilsRef.current
    const db = loadDatabaseText(text, getYomiFunc, separateKanaFunc, convertBarFunc)
    setWordlists(prev => ({ ...prev, original: db }))
  }, [])

  // 入力テキストの読み取得(API優先、失敗時kuromoji)
  const getInputYomi = useCallback(async (word) => {
    const yomiApi = yomiApiRef.current
    if (yomiApi && yomiApi.enabled && yomiApiReady) {
      try {
        return formatText(await yomiApi.getYomi(word))
      } catch (error) {
        console.warn('yomi api失敗。kuromojiにフォールバックします:', error)
      }
    }
    return getYomi(tokenizer, word)
  }, [tokenizer, yomiApiReady])

  // 変換処理
  const handleConvert = useCallback(async (word) => {
    if (!tokenizer || !separateKana || !getSimilarWord || !wordlists[wordListType]) {
      return
    }

    setProcessing(true)

    try {
      // 読みの取得
      const yomi = await getInputYomi(word)
      // カナの分割
      const separatedKana = separateKana(yomi)
      // 類似単語の取得
      const result = getSimilarWord(wordlists[wordListType], separatedKana, 100)

      if (result.length === 0) {
        setResults(["うまく変換できる単語を見つけられませんでした"])
      } else {
        // 結果の整形
        const formattedResults = result.map((value, index) => {
          return `${index + 1},${JSON.stringify(value.slice(0, -1)).slice(1, -1)}`
        })

        setResults(formattedResults)
      }
    } catch (error) {
      console.error('Conversion error:', error)
      setResults(["エラーが発生しました"])
    } finally {
      setProcessing(false)
    }
  }, [tokenizer, separateKana, getSimilarWord, wordlists, wordListType, getInputYomi])

  if (loading) {
    return (
      <div className="loading-container">
        <span>Loading...<img src={import.meta.env.BASE_URL + 'gif/ajax-loader.gif'} alt="loading" /></span>
      </div>
    )
  }

  return (
    <div className="container-fluid">
      <div className="row">
        <WordListSelector
          options={wordListOptions}
          selected={wordListType}
          onChange={setWordListType}
          onOriginalListChange={handleOriginalListChange}
        />

        <ParameterSlider
          value={paramValue}
          onChange={setParamValue}
        />

        <ConversionForm
          onConvert={handleConvert}
          allowAlphabet={yomiApiReady}
        />

        <ResultDisplay
          results={results}
          loading={processing}
        />
      </div>
    </div>
  )
}

export default App
