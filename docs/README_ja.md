# QuickChart MCP サーバー

QuickChart.io APIを使用してチャートを生成するModel Context Protocol (MCP)サーバーです。AIアシスタントから簡単なコマンドで美しいチャートを直接作成できます。

## 機能

### ツール

#### `generate_chart`
QuickChart.ioを使用してチャートURLを生成
- **入力**: チャートタイプ、ラベル、データセット、タイトル、追加オプション
- **出力**: 生成されたチャート画像のURL

#### `download_chart` 
QuickChart.ioからチャート画像をダウンロード
- **入力**: チャート設定オブジェクトとオプションの出力パス
- **出力**: 保存されたファイルパスを含む確認メッセージ

## サポートされているチャートタイプ

- **bar**: カテゴリ間の値を比較する棒グラフ
- **line**: 時系列のトレンドを示す折れ線グラフ
- **pie**: 比率を示す円グラフ
- **doughnut**: ドーナツグラフ（中心が空洞の円グラフ）
- **radar**: 複数の変数を比較するレーダーチャート
- **polarArea**: 周期的なデータのための極座標エリアチャート
- **scatter**: 相関分析のための散布図
- **bubble**: 3次元データのためのバブルチャート
- **radialGauge**: 単一の値を表示する放射状ゲージ
- **speedometer**: スピードメータースタイルのゲージ

## インストール

### npm経由

```bash
npm install -g @takanarishimbo/quickchart-mcp-server
```

### Claude Desktop経由

Claude Desktopの設定に追加：

```json
{
  "mcpServers": {
    "quickchart": {
      "command": "npx",
      "args": ["-y", "@takanarishimbo/quickchart-mcp-server"]
    }
  }
}
```

### カスタムQuickChartインスタンスを使用

```json
{
  "mcpServers": {
    "quickchart": {
      "command": "npx",
      "args": ["-y", "@takanarishimbo/quickchart-mcp-server"],
      "env": {
        "QUICKCHART_BASE_URL": "https://your-quickchart-instance.com/chart"
      }
    }
  }
}
```

## 使用例

### 棒グラフの生成

```json
{
  "type": "bar",
  "labels": ["1月", "2月", "3月", "4月"],
  "datasets": [
    {
      "label": "2024年売上",
      "data": [65, 59, 80, 81],
      "backgroundColor": "rgba(75, 192, 192, 0.2)",
      "borderColor": "rgba(75, 192, 192, 1)"
    }
  ],
  "title": "月次売上レポート"
}
```

### 複数データセットの折れ線グラフ作成

```json
{
  "type": "line",
  "labels": ["Q1", "Q2", "Q3", "Q4"],
  "datasets": [
    {
      "label": "製品A",
      "data": [10, 25, 15, 30],
      "borderColor": "blue",
      "backgroundColor": "transparent"
    },
    {
      "label": "製品B", 
      "data": [20, 15, 25, 35],
      "borderColor": "red",
      "backgroundColor": "transparent"
    }
  ],
  "title": "四半期製品比較"
}
```

### 円グラフの生成

```json
{
  "type": "pie",
  "labels": ["デスクトップ", "モバイル", "タブレット"],
  "datasets": [
    {
      "data": [65, 25, 10],
      "backgroundColor": ["#FF6384", "#36A2EB", "#FFCE56"]
    }
  ],
  "title": "デバイス使用統計"
}
```

### 散布図の作成

```json
{
  "type": "scatter",
  "datasets": [
    {
      "label": "データセット1",
      "data": [
        {"x": 10, "y": 20},
        {"x": 15, "y": 25},
        {"x": 20, "y": 30}
      ],
      "backgroundColor": "rgba(255, 99, 132, 0.5)"
    }
  ],
  "title": "散布図の例"
}
```

### 放射状ゲージの生成

```json
{
  "type": "radialGauge",
  "datasets": [
    {
      "data": [75],
      "backgroundColor": "green"
    }
  ],
  "title": "パフォーマンススコア"
}
```

## 設定

### 環境変数

- **QUICKCHART_BASE_URL**: QuickChart APIのベースURL（デフォルト: `https://quickchart.io/chart`）
  - セルフホストのQuickChartインスタンスを指定する際に使用

## 開発

### 方法1: Node.jsをローカルで使用

1. **このリポジトリをクローン**

   ```bash
   git clone https://github.com/TakanariShimbo/quickchart-mcp-server.git
   cd quickchart-mcp-server
   ```

2. **依存関係をインストール**

   ```bash
   npm ci
   ```

3. **プロジェクトをビルド**

   ```bash
   npm run build
   ```

4. **MCP Inspector でのテスト（オプション）**

   ```bash
   npx @modelcontextprotocol/inspector node dist/index.js
   ```

### 方法2: Docker を使用（ローカルに Node.js 不要）

1. **リポジトリをクローン**

   ```bash
   git clone https://github.com/TakanariShimbo/quickchart-mcp-server.git
   cd quickchart-mcp-server
   ```

2. **ワンコマンドでビルドと抽出**

   ```bash
   # Docker 内でプロジェクトをビルドし、ローカルディレクトリに直接出力
   docker build -t quickchart-mcp-build .
   docker run --rm -v $(pwd):/app quickchart-mcp-build
   ```

## プロジェクト構造

```
quickchart-mcp-server/
├── index.ts              # メインサーバー実装
├── package.json          # パッケージ設定
├── tsconfig.json         # TypeScript設定
├── Dockerfile            # Docker設定
├── .gitignore            # Gitの無視ファイル
├── .github/
│   └── workflows/
│       └── npm-publish.yml   # NPM公開ワークフロー
├── scripts/
│   └── release.sh        # リリース自動化スクリプト
├── docs/
│   ├── README.md         # 英語版ドキュメント
│   └── README_ja.md      # このファイル
└── dist/                 # コンパイル済みJavaScript（ビルド後）
```

## リソース

- [QuickChart ドキュメント](https://quickchart.io/documentation/)
- [Chart.js ドキュメント](https://www.chartjs.org/docs/latest/)
- [Model Context Protocol](https://modelcontextprotocol.io/)

## ライセンス

MIT