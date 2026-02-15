interface PrefectureEntry {
  code: string;
  name: string;
  keywords: string[];
}

const PREFECTURES: PrefectureEntry[] = [
  { code: '01', name: '北海道', keywords: ['北海道', '札幌', '旭川', '函館', '釧路', '帯広', '小樽'] },
  { code: '02', name: '青森県', keywords: ['青森', '弘前', '八戸', '十和田'] },
  { code: '03', name: '岩手県', keywords: ['岩手', '盛岡', '花巻', '一関', '奥州'] },
  { code: '04', name: '宮城県', keywords: ['宮城', '仙台', '石巻', '気仙沼', '名取'] },
  { code: '05', name: '秋田県', keywords: ['秋田', '横手', '大仙', '能代'] },
  { code: '06', name: '山形県', keywords: ['山形', '鶴岡', '酒田', '米沢'] },
  { code: '07', name: '福島県', keywords: ['福島', '郡山', 'いわき', '会津若松'] },
  { code: '08', name: '茨城県', keywords: ['茨城', '水戸', 'つくば', '日立', '土浦'] },
  { code: '09', name: '栃木県', keywords: ['栃木', '宇都宮', '小山', '足利', '那須'] },
  { code: '10', name: '群馬県', keywords: ['群馬', '前橋', '高崎', '太田', '伊勢崎'] },
  { code: '11', name: '埼玉県', keywords: ['埼玉', 'さいたま', '川越', '川口', '所沢', '越谷'] },
  { code: '12', name: '千葉県', keywords: ['千葉', '船橋', '松戸', '市川', '柏', '成田'] },
  { code: '13', name: '東京都', keywords: ['東京', '新宿', '渋谷', '品川', '池袋', '銀座', '六本木', '秋葉原', '浅草', '上野', '丸の内', '霞が関', '永田町', '八王子', '町田', '多摩'] },
  { code: '14', name: '神奈川県', keywords: ['神奈川', '横浜', '川崎', '相模原', '横須賀', '藤沢', '鎌倉', '箱根'] },
  { code: '15', name: '新潟県', keywords: ['新潟', '長岡', '上越', '佐渡'] },
  { code: '16', name: '富山県', keywords: ['富山', '高岡', '射水'] },
  { code: '17', name: '石川県', keywords: ['石川', '金沢', '小松', '加賀', '能登', '輪島', '珠洲'] },
  { code: '18', name: '福井県', keywords: ['福井', '敦賀', '越前'] },
  { code: '19', name: '山梨県', keywords: ['山梨', '甲府', '富士吉田'] },
  { code: '20', name: '長野県', keywords: ['長野', '松本', '上田', '飯田', '軽井沢'] },
  { code: '21', name: '岐阜県', keywords: ['岐阜', '大垣', '高山', '多治見', '白川郷'] },
  { code: '22', name: '静岡県', keywords: ['静岡', '浜松', '沼津', '富士', '熱海', '伊豆'] },
  { code: '23', name: '愛知県', keywords: ['愛知', '名古屋', '豊田', '岡崎', '一宮', '豊橋'] },
  { code: '24', name: '三重県', keywords: ['三重', '津', '四日市', '伊勢', '松阪', '鈴鹿'] },
  { code: '25', name: '滋賀県', keywords: ['滋賀', '大津', '草津', '彦根', '近江'] },
  { code: '26', name: '京都府', keywords: ['京都', '宇治', '舞鶴', '亀岡'] },
  { code: '27', name: '大阪府', keywords: ['大阪', '堺', '東大阪', '豊中', '吹田', '梅田', '難波', '天王寺'] },
  { code: '28', name: '兵庫県', keywords: ['兵庫', '神戸', '姫路', '西宮', '尼崎', '明石', '淡路'] },
  { code: '29', name: '奈良県', keywords: ['奈良', '橿原', '生駒'] },
  { code: '30', name: '和歌山県', keywords: ['和歌山', '田辺', '白浜', '新宮'] },
  { code: '31', name: '鳥取県', keywords: ['鳥取', '米子', '境港'] },
  { code: '32', name: '島根県', keywords: ['島根', '松江', '出雲', '隠岐'] },
  { code: '33', name: '岡山県', keywords: ['岡山', '倉敷', '津山'] },
  { code: '34', name: '広島県', keywords: ['広島', '福山', '呉', '尾道', '三原'] },
  { code: '35', name: '山口県', keywords: ['山口', '下関', '宇部', '萩', '岩国'] },
  { code: '36', name: '徳島県', keywords: ['徳島', '鳴門', '阿南'] },
  { code: '37', name: '香川県', keywords: ['香川', '高松', '丸亀', '小豆島'] },
  { code: '38', name: '愛媛県', keywords: ['愛媛', '松山', '今治', '新居浜', '道後'] },
  { code: '39', name: '高知県', keywords: ['高知', '南国', '四万十'] },
  { code: '40', name: '福岡県', keywords: ['福岡', '北九州', '久留米', '博多', '天神'] },
  { code: '41', name: '佐賀県', keywords: ['佐賀', '唐津', '鳥栖'] },
  { code: '42', name: '長崎県', keywords: ['長崎', '佐世保', '諫早', '対馬', '五島'] },
  { code: '43', name: '熊本県', keywords: ['熊本', '八代', '天草', '阿蘇'] },
  { code: '44', name: '大分県', keywords: ['大分', '別府', '中津', '由布'] },
  { code: '45', name: '宮崎県', keywords: ['宮崎', '都城', '延岡', '日南'] },
  { code: '46', name: '鹿児島県', keywords: ['鹿児島', '霧島', '薩摩', '屋久島', '奄美', '桜島'] },
  { code: '47', name: '沖縄県', keywords: ['沖縄', '那覇', '名護', '宮古島', '石垣', '普天間', '嘉手納'] },
];

export interface ClassifiedRegion {
  prefectureCode: string;
  prefectureName: string;
}

export function classifyRegion(title: string): ClassifiedRegion {
  for (const pref of PREFECTURES) {
    for (const keyword of pref.keywords) {
      if (title.includes(keyword)) {
        return {
          prefectureCode: pref.code,
          prefectureName: pref.name,
        };
      }
    }
  }

  return {
    prefectureCode: 'national',
    prefectureName: '全国',
  };
}
