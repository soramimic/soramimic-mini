import { describe, it, expect, vi } from 'vitest';
import { loadDatabaseCsvText, Parser } from '../utils/wordListUtils';

// テスト用の単純なスタブ: 1カナ=1要素に分割、変換バリエーションはそのまま1通り
const separateKana = (yomi) => yomi.split('');
const convertBar = (sep) => [sep];
const getYomi = vi.fn(() => 'ヨミ');

const csv = [
  'id,original,surface,pronunciation,type',
  '0,クリス・アーノルド,アーノルド,アーノルド,family',
  '0,クリス・アーノルド,クリス,クリス,given',
  '1,山田太郎,山田,ヤマダ,family',
  '2,ピカチュウ,ピカチュウ,NA,pokemon',
].join('\n');

describe('loadDatabaseCsvText', () => {
  it('tidy CSVをminiのデータベース形式に変換する', () => {
    const db = loadDatabaseCsvText(csv, '', getYomi, separateKana, convertBar);

    // アーノルド(5音)とピカチュウ(5音): pronunciationがNAならsurfaceで代用
    const surfaces5 = db[5].map((row) => row[1]);
    expect(surfaces5).toContain('アーノルド');
    expect(surfaces5).toContain('ピカチュウ');

    // 行は [original, surface, pattern, id] の形式
    const arnold = db[5].find((row) => row[1] === 'アーノルド');
    expect(arnold[0]).toBe('クリス・アーノルド');
    expect(arnold[3]).toBe('0');

    // ヤマダ(3音)
    expect(db[3].map((row) => row[1])).toContain('山田');
  });

  it('whereクエリで行を絞り込める', () => {
    const db = loadDatabaseCsvText(csv, 'type=family', getYomi, separateKana, convertBar);

    const all = Object.values(db).flat();
    expect(all.map((row) => row[1]).sort()).toEqual(['アーノルド', '山田']);
  });

  it('pronunciationに漢字が残っている行はgetYomiで読みを補う', () => {
    const kanjiCsv = 'id,original,surface,pronunciation\n0,読み,読み,読み';
    const db = loadDatabaseCsvText(kanjiCsv, '', getYomi, separateKana, convertBar);

    expect(getYomi).toHaveBeenCalledWith('読み');
    expect(db[2][0][2]).toEqual(['ヨ', 'ミ']);
  });
});

describe('Parser', () => {
  it('and/orを含むwhereクエリを評価できる', () => {
    const header = ['id', 'type', 'status'];
    const df = [
      ['0', 'family', 'current'],
      ['1', 'given', 'current'],
      ['2', 'family', 'former'],
    ];
    const result = Parser().filter('type=family and status=current', header, df);
    expect(result).toEqual([['0', 'family', 'current']]);

    const result2 = Parser().filter('type=family or type=given', header, df);
    expect(result2.length).toBe(3);
  });
});
