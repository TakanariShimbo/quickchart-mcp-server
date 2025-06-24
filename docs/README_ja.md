# QuickChart MCP サーバー

QuickChart.io API を使用してチャートを生成する Model Context Protocol (MCP)サーバーです。AI アシスタントから簡単なコマンドで美しいチャートを直接作成できます。

## 機能

### ツール

#### `generate_chart`

QuickChart.io を使用してチャート URL を生成

- **入力**: チャートタイプ、ラベル、データセット、タイトル、追加オプション
- **出力**: 生成されたチャート画像の URL

#### `download_chart`

QuickChart.io からチャート画像をダウンロード

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
- **bubble**: 3 次元データのためのバブルチャート
- **radialGauge**: 単一の値を表示する放射状ゲージ
- **speedometer**: スピードメータースタイルのゲージ

## インストール

### npm 経由

```bash
npm install -g @takanarishimbo/quickchart-mcp-server
```

### Claude Desktop 経由

Claude Desktop の設定に追加：

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

### カスタム QuickChart インスタンスを使用

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
        { "x": 10, "y": 20 },
        { "x": 15, "y": 25 },
        { "x": 20, "y": 30 }
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

- **QUICKCHART_BASE_URL**: QuickChart API のベース URL（デフォルト: `https://quickchart.io/chart`）
  - セルフホストの QuickChart インスタンスを指定する際に使用

## NPM への公開

このプロジェクトは GitHub Actions を通じた自動 NPM 公開機能を含んでいます。公開の設定方法：

### 1. NPM アクセストークンの作成

1. **NPM にログイン**（アカウントが必要な場合は作成）

   ```bash
   npm login
   ```

2. **アクセストークンの作成**
   - [https://www.npmjs.com/settings/tokens](https://www.npmjs.com/settings/tokens) にアクセス
   - "Generate New Token"をクリック
   - "Automation"を選択（CI/CD 使用のため）
   - "Publish"権限レベルを選択
   - 生成されたトークンをコピー（`npm_`で始まる）

### 2. GitHub リポジトリにトークンを追加

1. **リポジトリ設定へ移動**

   - GitHub リポジトリにアクセス
   - "Settings"タブをクリック
   - "Secrets and variables" → "Actions" に移動

2. **NPM トークンを追加**
   - "New repository secret"をクリック
   - 名前：`NPM_TOKEN`
   - 値：ステップ 1 でコピーした NPM トークンを貼り付け
   - "Add secret"をクリック

### 3. GitHub Personal Access Token の設定（リリーススクリプト用）

リリーススクリプトは GitHub にプッシュする必要があるため、GitHub トークンが必要です：

1. **GitHub Personal Access Token の作成**

   - [https://github.com/settings/tokens](https://github.com/settings/tokens) にアクセス
   - "Generate new token" → "Generate new token (classic)" をクリック
   - 有効期限を設定（推奨：90 日またはカスタム）
   - スコープを選択：
     - ✅ `repo` (プライベートリポジトリの完全制御)
   - "Generate token"をクリック
   - 生成されたトークンをコピー（`ghp_`で始まる）

2. **Git にトークンを設定**

   ```bash
   # オプション1: GitHub CLI を使用（推奨）
   gh auth login

   # オプション2: gitにトークンを設定
   git config --global credential.helper store

   # パスワードを求められた際にトークンを使用
   ```

### 4. 新しいバージョンのリリース

付属のリリーススクリプトを使用してバージョン管理、タグ付け、公開トリガーを自動化：

```bash
# パッチバージョンを増分 (0.1.0 → 0.1.1)
./scripts/release.sh patch

# マイナーバージョンを増分 (0.1.0 → 0.2.0)
./scripts/release.sh minor

# メジャーバージョンを増分 (0.1.0 → 1.0.0)
./scripts/release.sh major

# 特定のバージョンを設定
./scripts/release.sh 1.2.3
```

### 5. 公開の確認

1. **GitHub Actions をチェック**

   - リポジトリの"Actions"タブに移動
   - "Publish to npm"ワークフローが正常に完了したことを確認

2. **NPM パッケージを確認**
   - アクセス：`https://www.npmjs.com/package/@takanarishimbo/quickchart-mcp-server`
   - または実行：`npm view @takanarishimbo/quickchart-mcp-server`

### リリースプロセスフロー

1. `release.sh`スクリプトがすべてのファイルのバージョンを更新
2. git コミットとタグを作成
3. GitHub にプッシュ
4. 新しいタグで GitHub Actions ワークフローが発動
5. ワークフローがプロジェクトをビルドして NPM に公開
6. `npm install`でパッケージがグローバルに利用可能になる

## 開発

### 方法 1: Node.js をローカルで使用

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

### 方法 2: Docker を使用（ローカルに Node.js 不要）

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
