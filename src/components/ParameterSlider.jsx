import { Form, Row, Col } from 'react-bootstrap';

const ParameterSlider = ({ value, onChange }) => {
  const handleChange = (e) => {
    let newValue = parseFloat(e.target.value);
    onChange(newValue);
  };

  return (
    <div className="col-xs-12">
      <Form.Label>パラメータ</Form.Label>
      <Row>
        <Col xs={2} style={{ textAlign: 'right' }}>子音重視</Col>
        <Col xs={7}>
          <Form.Range
            className="form-control form-control-range ipt-parameter"
            name="consonant_vowel"
            min="-1"
            max="1"
            step="0.1"
            value={value}
            onChange={handleChange}
          />
        </Col>
        <Col xs={2}>母音重視</Col>
        <Col xs={1} className="param-value">{value}</Col>
      </Row>
    </div>
  );
};

export default ParameterSlider;