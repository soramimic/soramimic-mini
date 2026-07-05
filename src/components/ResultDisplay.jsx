import { Row, Col } from 'react-bootstrap';

const ResultDisplay = ({ results, loading }) => {
  return (
    <>
      <div className="col-xs-10">出力結果(左から順位,入力読み,出力読み,出力,非類似度)</div>
      <div className="col-xs-2">
        {loading && <img className="loading2" src='/gif/ajax-loader.gif' alt="loading" />}
      </div>
      <div className="col-xs-12 div-result">
        {results.length > 0 ? (
          results.map((result, index) => (
            <div key={index}>{result}</div>
          ))
        ) : (
          <div></div>
        )}
      </div>
    </>
  );
};

export default ResultDisplay;