export interface Prefecture {
  code: string;
  name: string;
  nameEn: string;
  capital: string;
  lat: number;
  lng: number;
}

export const PREFECTURES: Prefecture[] = [
  { code: '01', name: '北海道', nameEn: 'Hokkaido', capital: '札幌', lat: 43.0642, lng: 141.3469 },
  { code: '02', name: '青森県', nameEn: 'Aomori', capital: '青森', lat: 40.8244, lng: 140.7400 },
  { code: '03', name: '岩手県', nameEn: 'Iwate', capital: '盛岡', lat: 39.7036, lng: 141.1527 },
  { code: '04', name: '宮城県', nameEn: 'Miyagi', capital: '仙台', lat: 38.2688, lng: 140.8721 },
  { code: '05', name: '秋田県', nameEn: 'Akita', capital: '秋田', lat: 39.7186, lng: 140.1024 },
  { code: '06', name: '山形県', nameEn: 'Yamagata', capital: '山形', lat: 38.2405, lng: 140.3633 },
  { code: '07', name: '福島県', nameEn: 'Fukushima', capital: '福島', lat: 37.7503, lng: 140.4676 },
  { code: '08', name: '茨城県', nameEn: 'Ibaraki', capital: '水戸', lat: 36.3418, lng: 140.4468 },
  { code: '09', name: '栃木県', nameEn: 'Tochigi', capital: '宇都宮', lat: 36.5658, lng: 139.8836 },
  { code: '10', name: '群馬県', nameEn: 'Gunma', capital: '前橋', lat: 36.3911, lng: 139.0608 },
  { code: '11', name: '埼玉県', nameEn: 'Saitama', capital: 'さいたま', lat: 35.8569, lng: 139.6489 },
  { code: '12', name: '千葉県', nameEn: 'Chiba', capital: '千葉', lat: 35.6047, lng: 140.1233 },
  { code: '13', name: '東京都', nameEn: 'Tokyo', capital: '東京', lat: 35.6895, lng: 139.6917 },
  { code: '14', name: '神奈川県', nameEn: 'Kanagawa', capital: '横浜', lat: 35.4478, lng: 139.6425 },
  { code: '15', name: '新潟県', nameEn: 'Niigata', capital: '新潟', lat: 37.9026, lng: 139.0236 },
  { code: '16', name: '富山県', nameEn: 'Toyama', capital: '富山', lat: 36.6953, lng: 137.2114 },
  { code: '17', name: '石川県', nameEn: 'Ishikawa', capital: '金沢', lat: 36.5946, lng: 136.6256 },
  { code: '18', name: '福井県', nameEn: 'Fukui', capital: '福井', lat: 36.0652, lng: 136.2216 },
  { code: '19', name: '山梨県', nameEn: 'Yamanashi', capital: '甲府', lat: 35.6642, lng: 138.5684 },
  { code: '20', name: '長野県', nameEn: 'Nagano', capital: '長野', lat: 36.2378, lng: 138.1812 },
  { code: '21', name: '岐阜県', nameEn: 'Gifu', capital: '岐阜', lat: 35.3912, lng: 136.7223 },
  { code: '22', name: '静岡県', nameEn: 'Shizuoka', capital: '静岡', lat: 34.9756, lng: 138.3828 },
  { code: '23', name: '愛知県', nameEn: 'Aichi', capital: '名古屋', lat: 35.1802, lng: 136.9066 },
  { code: '24', name: '三重県', nameEn: 'Mie', capital: '津', lat: 34.7303, lng: 136.5086 },
  { code: '25', name: '滋賀県', nameEn: 'Shiga', capital: '大津', lat: 35.0045, lng: 135.8686 },
  { code: '26', name: '京都府', nameEn: 'Kyoto', capital: '京都', lat: 35.0116, lng: 135.7681 },
  { code: '27', name: '大阪府', nameEn: 'Osaka', capital: '大阪', lat: 34.6937, lng: 135.5023 },
  { code: '28', name: '兵庫県', nameEn: 'Hyogo', capital: '神戸', lat: 34.6913, lng: 135.1830 },
  { code: '29', name: '奈良県', nameEn: 'Nara', capital: '奈良', lat: 34.6851, lng: 135.8048 },
  { code: '30', name: '和歌山県', nameEn: 'Wakayama', capital: '和歌山', lat: 34.2260, lng: 135.1675 },
  { code: '31', name: '鳥取県', nameEn: 'Tottori', capital: '鳥取', lat: 35.5039, lng: 134.2381 },
  { code: '32', name: '島根県', nameEn: 'Shimane', capital: '松江', lat: 35.4723, lng: 133.0505 },
  { code: '33', name: '岡山県', nameEn: 'Okayama', capital: '岡山', lat: 34.6618, lng: 133.9344 },
  { code: '34', name: '広島県', nameEn: 'Hiroshima', capital: '広島', lat: 34.3963, lng: 132.4596 },
  { code: '35', name: '山口県', nameEn: 'Yamaguchi', capital: '山口', lat: 34.1861, lng: 131.4714 },
  { code: '36', name: '徳島県', nameEn: 'Tokushima', capital: '徳島', lat: 34.0658, lng: 134.5593 },
  { code: '37', name: '香川県', nameEn: 'Kagawa', capital: '高松', lat: 34.3401, lng: 134.0434 },
  { code: '38', name: '愛媛県', nameEn: 'Ehime', capital: '松山', lat: 33.8416, lng: 132.7657 },
  { code: '39', name: '高知県', nameEn: 'Kochi', capital: '高知', lat: 33.5597, lng: 133.5311 },
  { code: '40', name: '福岡県', nameEn: 'Fukuoka', capital: '福岡', lat: 33.6064, lng: 130.4183 },
  { code: '41', name: '佐賀県', nameEn: 'Saga', capital: '佐賀', lat: 33.2494, lng: 130.2988 },
  { code: '42', name: '長崎県', nameEn: 'Nagasaki', capital: '長崎', lat: 32.7448, lng: 129.8737 },
  { code: '43', name: '熊本県', nameEn: 'Kumamoto', capital: '熊本', lat: 32.7898, lng: 130.7417 },
  { code: '44', name: '大分県', nameEn: 'Oita', capital: '大分', lat: 33.2382, lng: 131.6126 },
  { code: '45', name: '宮崎県', nameEn: 'Miyazaki', capital: '宮崎', lat: 31.9111, lng: 131.4239 },
  { code: '46', name: '鹿児島県', nameEn: 'Kagoshima', capital: '鹿児島', lat: 31.5602, lng: 130.5581 },
  { code: '47', name: '沖縄県', nameEn: 'Okinawa', capital: '那覇', lat: 26.2124, lng: 127.6809 },
];

export const PREFECTURE_MAP = new Map(PREFECTURES.map((p) => [p.code, p]));
