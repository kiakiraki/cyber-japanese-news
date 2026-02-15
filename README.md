# CYBER NEWS MAP // JAPAN

日本地図上にリアルタイムニュースをマッピングするサイバーパンク風デモWebアプリ。

NHK RSSフィードからニュースを取得し、記事タイトルのキーワードマッチングで都道府県に分類。速報ニュースは派手なエフェクトで演出。

P2P地震情報 API経由で地震・津波データも取得し、震源パルスアニメーション・都道府県別震度ハイライトを地図上に表示。

気象庁 bosai JSON APIから気象警報・注意報データも取得し、警報発令中の都道府県を地図上でハイライト表示。

NHK記事ページからOGP画像を取得し、地図上にサイバーパンク風のニュースカードとして表示。

![Screenshot](docs/screenshot-ogp.png)

## 技術スタック

| レイヤー | 技術 |
|---------|------|
| フロントエンド | React + TypeScript, Vite, Tailwind CSS v4 |
| 地図描画 | D3.js + TopoJSON |
| アニメーション | Framer Motion |
| バックエンド | Cloudflare Workers |
| RSSパース | fast-xml-parser |
| 地震データ | P2P地震情報 JSON API v2 |
| 気象警報データ | 気象庁 bosai JSON API |
| OGP取得 | Worker側 server-side fetch + 正規表現抽出 |

## 機能

- 47都道府県の地図表示（TopoJSON）
- ニュースの都道府県分類（キーワードマッチング）
- Breaking News検出（速報キーワード + 30分以内の記事）
- カテゴリ分類（災害・事件・政治・スポーツ・その他）
- 都道府県クリックでフィルタリング
- 60秒間隔の自動更新（ニュース）
- 地震情報の地図表示（震源マーカー・都道府県震度ハイライト）
- 津波情報バナー（大津波警報・津波警報・津波注意報）
- 震度4以上の地震でBreaking演出と連携
- 30秒間隔の地震データ自動更新
- 気象警報・注意報の地図ハイライト（特別警報=紫パルス、警報=赤、注意報=黄）
- サイドパネルに警報一覧（注意報トグル付き）
- 特別警報時の全画面バナー演出
- OGPニュースカード（地図上にサムネイル付きカード最大5枚、重なり回避配置）
- Breaking記事は赤ボーダー+glow、通常記事はcyanボーダー
- カードクリックで記事ページを新規タブで開く

## セットアップ

```bash
# 依存インストール（ルートで一括）
npm install

# Worker + Frontend を同時起動
npm run dev
```

Worker は `http://localhost:8787`、Frontend は `http://localhost:5173` で起動します。

### 個別起動

```bash
# フロントエンドのみ
cd frontend
npm install
npm run dev          # http://localhost:5173

# バックエンドのみ
cd worker
npm install
npx wrangler dev     # http://localhost:8787
```

## 環境変数

`frontend/.env.development`:

```
VITE_USE_MOCK=true          # モックデータ使用（バックエンド不要）
VITE_API_URL=http://localhost:8787  # Worker APIのURL
```

実データで動かす場合は `VITE_USE_MOCK=false` に変更。

## プロジェクト構成

```
cyber-japanese-news/
├── package.json             # ルート（npm workspaces + concurrently）
├── frontend/                # Vite + React + TypeScript
│   └── src/
│       ├── components/      # UIコンポーネント
│       ├── hooks/           # カスタムフック
│       ├── lib/             # マスタデータ・ユーティリティ
│       └── types/           # 型定義
├── worker/                  # Cloudflare Workers
│   └── src/
│       ├── index.ts         # APIエントリポイント
│       ├── rss-fetcher.ts   # RSSフェッチ + パース
│       ├── jma-fetcher.ts   # P2P地震情報フェッチ
│       ├── warning-fetcher.ts    # 気象庁警報フェッチ
│       ├── ogp-fetcher.ts        # OGP画像URL取得 + キャッシュ
│       ├── warning-codes.ts      # 警報コード定義テーブル
│       ├── area-code-map.ts      # 地域コード→都道府県名マップ
│       └── region-classifier.ts  # 都道府県分類
└── docs/
    └── screenshot-ogp.png
```

## API

```
GET /api/news                    # 全ニュース取得
GET /api/news?prefecture=13      # 都道府県フィルタ（13=東京都）
GET /api/jma                     # 地震・津波・気象警報情報取得
```

## データソース

- ニュース: [NHK RSS](https://www3.nhk.or.jp/rss/news/cat0.xml)
- 地震情報: [P2P地震情報](https://www.p2pquake.net/)（気象庁データ）
- 気象警報: [気象庁 bosai API](https://www.jma.go.jp/bosai/warning/)（政府標準利用規約 第2.0版）
