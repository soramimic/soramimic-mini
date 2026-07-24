import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import WordListSelector from '../components/WordListSelector';

describe('WordListSelector', () => {
  const mockOnChange = vi.fn();
  const mockOnOriginalListChange = vi.fn();

  const mockOnFilterChange = vi.fn();

  // conf/setting.json の wordlist 相当
  const options = [
    { value: 'BASEBALL', text: '野球選手' },
    { value: 'FOOTBALL', text: 'サッカー選手' },
    { value: 'STATION', text: '駅名' },
    {
      value: 'NATION',
      text: '国名',
      filters: [
        {
          column: 'status',
          label: '対象',
          options: [
            { value: 'current', label: '現在の国', default: true },
            { value: 'former', label: '昔の国・旧称', default: false },
          ],
        },
      ],
    },
    { value: 'SEKITSUI', text: '動物' },
    { value: 'POKEMON', text: 'ポケモン' },
    { value: 'PHYSICIST', text: '物理学者' },
  ];

  const filterSelections = { NATION: { status: ['current'] } };

  const renderSelector = (selected = 'BASEBALL') =>
    render(
      <WordListSelector
        options={options}
        selected={selected}
        onChange={mockOnChange}
        onOriginalListChange={mockOnOriginalListChange}
        filterSelections={filterSelections}
        onFilterChange={mockOnFilterChange}
      />
    );

  beforeEach(() => {
    // テスト前にモックをリセット
    mockOnChange.mockClear();
    mockOnOriginalListChange.mockClear();
    mockOnFilterChange.mockClear();
    // localStorage のモック
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation((key) => {
      if (key === 'originalWordlist') return 'テスト単語リスト';
      return null;
    });
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {});
  });

  it('optionsで渡した単語リストのラジオボタンが表示される', () => {
    renderSelector();

    // 各ラジオボタンが表示されているか確認
    for (const { text } of options) {
      expect(screen.getByLabelText(text)).toBeInTheDocument();
    }
    expect(screen.getByLabelText('自作の単語リストを使用')).toBeInTheDocument();

    // 野球選手が選択されていることを確認
    expect(screen.getByLabelText('野球選手')).toBeChecked();
  });

  it('ラジオボタンを選択したときにonChangeが呼ばれる', () => {
    renderSelector();

    // 駅名を選択
    fireEvent.click(screen.getByLabelText('駅名'));

    // onChangeが正しい値で呼ばれることを確認
    expect(mockOnChange).toHaveBeenCalledTimes(1);
    expect(mockOnChange).toHaveBeenCalledWith('STATION');
  });

  it('filtersを持つリストを選択中はチェックボックスが表示される', () => {
    renderSelector('NATION');

    const current = screen.getByLabelText('現在の国');
    const former = screen.getByLabelText('昔の国・旧称');
    expect(current).toBeChecked();
    expect(former).not.toBeChecked();

    // チェックすると選択値の配列でコールバックが呼ばれる
    fireEvent.click(former);
    expect(mockOnFilterChange).toHaveBeenCalledWith('NATION', 'status', ['current', 'former']);

    // 外すと配列から取り除かれる
    fireEvent.click(current);
    expect(mockOnFilterChange).toHaveBeenCalledWith('NATION', 'status', []);
  });

  it('filtersの無いリスト選択中はチェックボックスを表示しない', () => {
    renderSelector('BASEBALL');
    expect(screen.queryByLabelText('現在の国')).not.toBeInTheDocument();
  });

  it('自作の単語リストを選択するとモーダルが表示される', () => {
    renderSelector();

    // 自作の単語リストを選択
    fireEvent.click(screen.getByLabelText('自作の単語リストを使用'));

    // モーダルが表示されていることを確認
    expect(screen.getByText('単語リストの登録')).toBeInTheDocument();
    expect(screen.getByText('キャンセル')).toBeInTheDocument();
    expect(screen.getByText('登録')).toBeInTheDocument();
  });

  it('モーダルで登録ボタンを押すとローカルストレージに保存される', () => {
    renderSelector();

    // 自作の単語リストを選択してモーダルを表示
    fireEvent.click(screen.getByLabelText('自作の単語リストを使用'));

    // テキストエリアに入力
    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: '新しい単語リスト' } });

    // 登録ボタンをクリック
    fireEvent.click(screen.getByText('登録'));

    // localStorageにセットされたことを確認
    expect(localStorage.setItem).toHaveBeenCalledWith('originalWordlist', '新しい単語リスト');

    // リスト再構築のコールバックとonChangeが呼ばれたことを確認
    expect(mockOnOriginalListChange).toHaveBeenCalledWith('新しい単語リスト');
    expect(mockOnChange).toHaveBeenCalledWith('original');
  });
});
