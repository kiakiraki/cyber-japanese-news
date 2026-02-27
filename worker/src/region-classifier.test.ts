import { describe, it, expect } from 'vitest';
import { classifyRegion } from './region-classifier';

describe('classifyRegion', () => {
  it('都道府県名キーワードで分類できる', () => {
    const result = classifyRegion('北海道で大雪の恐れ');
    expect(result).toStrictEqual({ prefectureCode: '01', prefectureName: '北海道' });
  });

  it('都市名キーワードで分類できる', () => {
    const result = classifyRegion('名古屋市で交通事故');
    expect(result).toStrictEqual({ prefectureCode: '23', prefectureName: '愛知県' });
  });

  it('沖縄の都市名で分類できる', () => {
    const result = classifyRegion('那覇空港で遅延');
    expect(result).toStrictEqual({ prefectureCode: '47', prefectureName: '沖縄県' });
  });

  it('東京の地名で分類できる', () => {
    const result = classifyRegion('渋谷で再開発計画');
    expect(result).toStrictEqual({ prefectureCode: '13', prefectureName: '東京都' });
  });

  it('複数キーワードがある場合は最初にマッチした都道府県を返す', () => {
    const result = classifyRegion('東京から大阪まで新幹線が運休');
    expect(result).toStrictEqual({ prefectureCode: '13', prefectureName: '東京都' });
  });

  it('どの都道府県にもマッチしない場合は全国を返す', () => {
    const result = classifyRegion('新年度予算案が実質的審議入り');
    expect(result).toStrictEqual({ prefectureCode: 'national', prefectureName: '全国' });
  });

  it('空文字列は全国を返す', () => {
    const result = classifyRegion('');
    expect(result).toStrictEqual({ prefectureCode: 'national', prefectureName: '全国' });
  });

  it('国名キーワードで国際ニュースに分類できる', () => {
    const result = classifyRegion('ウクライナ東部で激しい戦闘');
    expect(result).toStrictEqual({ prefectureCode: 'international', prefectureName: '国際' });
  });

  it('都市名キーワードで国際ニュースに分類できる', () => {
    const result = classifyRegion('ミラノで路面電車が脱線');
    expect(result).toStrictEqual({ prefectureCode: 'international', prefectureName: '国際' });
  });

  it('人名キーワードで国際ニュースに分類できる', () => {
    const result = classifyRegion('トランプ大統領が新たな関税措置を発表');
    expect(result).toStrictEqual({ prefectureCode: 'international', prefectureName: '国際' });
  });

  it('都道府県キーワードは国際キーワードより優先される', () => {
    const result = classifyRegion('沖縄の米軍基地問題で抗議');
    expect(result).toStrictEqual({ prefectureCode: '47', prefectureName: '沖縄県' });
  });
});
