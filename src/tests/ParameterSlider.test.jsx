import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ParameterSlider from '../components/ParameterSlider';

describe('ParameterSlider', () => {
  const mockOnChange = vi.fn();
  
  it('スライダーが正しく表示される', () => {
    render(<ParameterSlider value={0.5} onChange={mockOnChange} />);
    
    // ラベルが表示されていることを確認
    expect(screen.getByText('パラメータ')).toBeInTheDocument();
    expect(screen.getByText('子音重視')).toBeInTheDocument();
    expect(screen.getByText('母音重視')).toBeInTheDocument();
    expect(screen.getByText('0.5')).toBeInTheDocument();
    
    // スライダーが表示されていることを確認
    const slider = screen.getByRole('slider');
    expect(slider).toBeInTheDocument();
    expect(slider).toHaveAttribute('min', '-1');
    expect(slider).toHaveAttribute('max', '1');
    expect(slider).toHaveAttribute('step', '0.1');
    expect(slider).toHaveValue('0.5');
  });
  
  it('スライダーを動かすとonChangeが呼ばれる', () => {
    render(<ParameterSlider value={0.5} onChange={mockOnChange} />);
    
    // スライダーの値を変更
    const slider = screen.getByRole('slider');
    fireEvent.change(slider, { target: { value: '0.7' } });
    
    // onChangeが呼ばれることを確認
    expect(mockOnChange).toHaveBeenCalledTimes(1);
    expect(mockOnChange).toHaveBeenCalledWith(0.7);
  });
  
  it('負の値でも正しく表示される', () => {
    render(<ParameterSlider value={-0.8} onChange={mockOnChange} />);
    
    // 表示が正しいことを確認
    expect(screen.getByText('-0.8')).toBeInTheDocument();
    
    // スライダーの値が正しいことを確認
    const slider = screen.getByRole('slider');
    expect(slider).toHaveValue('-0.8');
  });
});