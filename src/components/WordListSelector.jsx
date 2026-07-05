import { useState } from 'react';
import { Form, Modal, Button } from 'react-bootstrap';

// options: conf/setting.json の wordlist から作った [{ value, text }] のリスト
const WordListSelector = ({ options, selected, onChange, onOriginalListChange }) => {
  const [showModal, setShowModal] = useState(false);
  const [customWordList, setCustomWordList] = useState(() => {
    return localStorage.getItem('originalWordlist') || '';
  });

  const handleModalOpen = () => {
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
  };

  const handleSubmit = () => {
    // カスタム単語リストをローカルストレージに保存
    localStorage.setItem('originalWordlist', customWordList);
    if (onOriginalListChange) {
      onOriginalListChange(customWordList);
    }
    onChange('original');
    setShowModal(false);
  };

  const handleRadioChange = (e) => {
    const value = e.target.value;
    if (value === 'original') {
      handleModalOpen();
    } else {
      onChange(value);
    }
  };

  return (
    <div className="form-group col-xs-12 radio-wordlist">
      <Form.Label>単語リストの種類</Form.Label>
      <div className="radio-file">
        {options.map(({ value, text }) => (
          <Form.Check
            key={value}
            id={`wordlist-${value}`}
            inline
            type="radio"
            label={text}
            name="wordfile"
            value={value}
            checked={selected === value}
            onChange={handleRadioChange}
          />
        ))}
      </div>
      <div>
        <Form.Check
          id="wordlist-original"
          inline
          type="radio"
          label="自作の単語リストを使用"
          name="wordfile"
          value="original"
          checked={selected === 'original'}
          onChange={handleRadioChange}
          className="radio-original"
        />
      </div>

      {/* カスタム単語リスト入力モーダル */}
      <Modal show={showModal} onHide={handleModalClose} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>単語リストの登録</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Control
            as="textarea"
            value={customWordList}
            onChange={(e) => setCustomWordList(e.target.value)}
            style={{ height: '300px' }}
            className="ta-original-wordlist"
          />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleModalClose}>
            キャンセル
          </Button>
          <Button variant="primary" onClick={handleSubmit}>
            登録
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default WordListSelector;
