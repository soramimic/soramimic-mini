import { useState } from 'react';
import { Form, Button } from 'react-bootstrap';
import { containAlphabet } from '../utils/kuromojiUtils';

// allowAlphabet: 読み推定APIが使えるとき(英語→カナ変換が可能)はアルファベット入力を許可する
const ConversionForm = ({ onConvert, allowAlphabet = false }) => {
  const [word, setWord] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!word) {
      return;
    }

    if (!allowAlphabet && containAlphabet(word)) {
      alert('【変換不可能文字の検出】使用できるのはひらがな・カタカナ・漢字のみです');
      return;
    }
    
    onConvert(word);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSubmit(e);
    }
  };

  return (
    <div className="col-xs-12">
      <Form onSubmit={handleSubmit}>
        <Form.Control
          type="text"
          className="form-control ipt-word"
          maxLength="10"
          placeholder="変換したい単語(10文字以内)"
          value={word}
          onChange={(e) => setWord(e.target.value)}
          onKeyPress={handleKeyPress}
        />
        <Button 
          variant="primary" 
          type="submit" 
          className="btn-block btn-send w-100 mt-2"
        >
          Convert
        </Button>
      </Form>
    </div>
  );
};

export default ConversionForm;