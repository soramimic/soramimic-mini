import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ConversionForm from '../components/ConversionForm';
import * as kuromojiUtils from '../utils/kuromojiUtils';

// kuromojiUtilsのモック
vi.mock('../utils/kuromojiUtils', () => ({
  containAlphabet: vi.fn(),
}));

describe('ConversionForm', () => {
  const mockOnConvert = vi.fn();
  
  beforeEach(() => {
    mockOnConvert.mockClear();
    kuromojiUtils.containAlphabet.mockClear();
  });

  it('フォームが正しく表示される', () => {
    render(<ConversionForm onConvert={mockOnConvert} />);
    
    // 入力フィールドが表示されていることを確認
    const input = screen.getByPlaceholderText('変換したい単語(10文字以内)');
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('maxLength', '10');
    
    // ボタンが表示されていることを確認
    const button = screen.getByText('Convert');
    expect(button).toBeInTheDocument();
  });

  it('テキスト入力が正しく機能する', () => {
    render(<ConversionForm onConvert={mockOnConvert} />);
    
    // 入力フィールドに値を入力
    const input = screen.getByPlaceholderText('変換したい単語(10文字以内)');
    fireEvent.change(input, { target: { value: '東京' } });
    
    // 入力値が正しく設定されたことを確認
    expect(input).toHaveValue('東京');
  });

  it('フォーム送信でonConvertが呼ばれる', () => {
    // アルファベットチェックをfalseに設定
    kuromojiUtils.containAlphabet.mockReturnValue(false);
    
    render(<ConversionForm onConvert={mockOnConvert} />);
    
    // 入力フィールドに値を入力
    const input = screen.getByPlaceholderText('変換したい単語(10文字以内)');
    fireEvent.change(input, { target: { value: '東京' } });
    
    // ボタンをクリック
    const button = screen.getByText('Convert');
    fireEvent.click(button);
    
    // containAlphabetが呼ばれたことを確認
    expect(kuromojiUtils.containAlphabet).toHaveBeenCalledWith('東京');
    
    // onConvertが呼ばれたことを確認
    expect(mockOnConvert).toHaveBeenCalledTimes(1);
    expect(mockOnConvert).toHaveBeenCalledWith('東京');
  });

  it('空の値を送信するとonConvertが呼ばれない', () => {
    render(<ConversionForm onConvert={mockOnConvert} />);
    
    // ボタンをクリック（入力なし）
    const button = screen.getByText('Convert');
    fireEvent.click(button);
    
    // onConvertが呼ばれていないことを確認
    expect(mockOnConvert).not.toHaveBeenCalled();
  });

  it('アルファベットが含まれる場合はアラートが表示される', () => {
    // windowのalertをモック
    const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => {});
    
    // アルファベットチェックをtrueに設定
    kuromojiUtils.containAlphabet.mockReturnValue(true);
    
    render(<ConversionForm onConvert={mockOnConvert} />);
    
    // 入力フィールドに値を入力
    const input = screen.getByPlaceholderText('変換したい単語(10文字以内)');
    fireEvent.change(input, { target: { value: 'Tokyo' } });
    
    // ボタンをクリック
    const button = screen.getByText('Convert');
    fireEvent.click(button);
    
    // containAlphabetが呼ばれたことを確認
    expect(kuromojiUtils.containAlphabet).toHaveBeenCalledWith('Tokyo');
    
    // アラートが表示されたことを確認
    expect(alertMock).toHaveBeenCalledWith('【変換不可能文字の検出】使用できるのはひらがな・カタカナ・漢字のみです');
    
    // onConvertが呼ばれていないことを確認
    expect(mockOnConvert).not.toHaveBeenCalled();
    
    // モックをクリア
    alertMock.mockRestore();
  });

  it('Enterキーでも送信できる', () => {
    // アルファベットチェックをfalseに設定
    kuromojiUtils.containAlphabet.mockReturnValue(false);
    
    render(<ConversionForm onConvert={mockOnConvert} />);
    
    // 入力フィールドに値を入力
    const input = screen.getByPlaceholderText('変換したい単語(10文字以内)');
    fireEvent.change(input, { target: { value: '大阪' } });
    
    // Enterキーを押す
    fireEvent.keyPress(input, { key: 'Enter', code: 'Enter', charCode: 13 });
    
    // onConvertが呼ばれたことを確認
    expect(mockOnConvert).toHaveBeenCalledTimes(1);
    expect(mockOnConvert).toHaveBeenCalledWith('大阪');
  });
});