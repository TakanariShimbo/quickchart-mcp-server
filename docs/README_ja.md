[English](README.md) | [日本語](README_ja.md) | **README**

# QuickChart MCP サーバー

QuickChart.io API を使用した 10 種類の強力な可視化ツールを提供する包括的な Model Context Protocol (MCP)サーバーです。AI アシスタントから簡単なコマンドで、チャート、図表、バーコード、ワードクラウド、テーブルなどを直接作成できます。

## ツール

### `create-chart-using-chartjs`

Chart.js と QuickChart.io を使用してチャートを作成 - URL 取得またはファイル保存

**ドキュメント**: [QuickChart.io Chart API](https://quickchart.io/documentation/)

- **入力**: アクション（get_url/save_file）、出力パス、寸法（整数）、フォーマットオプション、エンコード方式、Chart.js 設定オブジェクト
- **出力**: チャート URL または保存されたファイルパスを含む確認メッセージ

**サポートされているチャートタイプ:**
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

### `create-chart-using-apexcharts`

ApexCharts ライブラリを使用してチャートを作成 - URL 取得またはファイル保存

**ドキュメント**: [ApexCharts Image Rendering](https://quickchart.io/documentation/apex-charts-image-rendering/)

- **入力**: アクション（get_url/save_file）、出力パス、ApexCharts 設定、寸法、バージョンオプション
- **出力**: ApexCharts URL または保存されたファイルパスを含む確認メッセージ

**サポートされている機能:**
- 線グラフ、面グラフ、日時軸チャート
- カスタマイズ可能な軸設定とデータラベル
- 線のスタイルとストローク設定
- ツールチップとインタラクティブ要素
- PDFレポートやメールでの活用に最適

### `create-chart-using-googlecharts`

Google Charts ライブラリを使用してチャートを作成 - URL 取得またはファイル保存

**ドキュメント**: [Google Charts Image Server](https://quickchart.io/documentation/google-charts-image-server/)

- **入力**: アクション（get_url/save_file）、出力パス、JavaScript 描画コード、パッケージ、寸法、API キー
- **出力**: Google Charts URL または保存されたファイルパスを含む確認メッセージ

**サポートされているチャートタイプ:**
- **棒グラフ**: カテゴリ別データ比較
- **円グラフ**: 割合とパーセンテージ表示
- **ゲージチャート**: 測定値と目標値の表示
- **タイムラインチャート**: 時系列イベント表示
- **地理的チャート**: 世界地図・地域マップ（Maps API キー対応）

### `create-chart-using-natural-language`

自然言語記述からチャートを生成 - URL 取得またはファイル保存

**ドキュメント**: [Text to Chart API](https://quickchart.io/documentation/apis/text-to-chart/)

- **入力**: アクション（get_url/save_file）、出力パス、自然言語記述、データ値、チャートオプション
- **出力**: AI 生成チャート URL または保存されたファイルパスを含む確認メッセージ

**主な機能:**
- **自然言語解析**: 「青い線グラフで月別売上を表示」などの記述を理解
- **自動チャート選択**: 最適なチャートタイプを自動判定
- **データ統合**: CSV形式データの自動処理
- **スタイル適用**: 色、フォント、レイアウトの自動最適化

### `create-sparkline-using-chartjs`

コンパクトなスパークラインチャートを作成 - URL 取得またはファイル保存

**ドキュメント**: [Sparkline API](https://quickchart.io/documentation/sparkline-api/)

- **入力**: アクション（get_url/save_file）、出力パス、Chart.js 設定、寸法、表示オプション
- **出力**: スパークライン URL または保存されたファイルパスを含む確認メッセージ

**特徴:**
- **コンパクト設計**: テキスト内やダッシュボードに埋め込み可能
- **トレンド可視化**: データの傾向と変動を一目で表示
- **単一・複数系列対応**: 1つまたは複数のデータ線を表示
- **カスタマイズ可能**: 色、線スタイル、ポイント表示の調整
- **滑らかな線**: 線の張力調整で直線または曲線表示

### `create-diagram-using-graphviz`

GraphViz を使用してグラフ図を作成 - URL 取得またはファイル保存

**ドキュメント**: [GraphViz API](https://quickchart.io/documentation/graphviz-api/)

- **入力**: アクション（get_url/save_file）、出力パス、DOT グラフ記述、レイアウトアルゴリズム、フォーマット、寸法
- **出力**: GraphViz 図 URL または保存されたファイルパスを含む確認メッセージ

**サポートされているレイアウトアルゴリズム:**
- **dot**: 階層構造グラフ（フローチャート）
- **neato**: 無向グラフ（ネットワーク図）
- **fdp**: 力学モデルベースレイアウト
- **circo**: 円形レイアウト
- **twopi**: 放射状レイアウト

### `create-wordcloud`

ワードクラウド可視化を作成 - URL 取得またはファイル保存

**ドキュメント**: [Word Cloud API](https://quickchart.io/documentation/word-cloud-api/)

- **入力**: アクション（get_url/save_file）、出力パス、テキストコンテンツ、フォント、色、レイアウトオプション
- **出力**: ワードクラウド URL または保存されたファイルパスを含む確認メッセージ

**カスタマイズオプション:**
- **テキスト処理**: ストップワード除去、文字クリーニング、最小文字数設定
- **フォント設定**: Google Fonts読み込み、フォントファミリー・ウェイト調整
- **サイズ・レイアウト**: 最大単語数（デフォルト200）、回転角度（デフォルト20度）
- **色とスタイル**: カスタムカラーパレット、大文字・小文字変換
- **スケーリング**: 頻度スケーリング（linear、sqrt、log）、フォントサイズ調整

### `create-barcode`

バーコードと QR コードを生成 - URL 取得またはファイル保存

**ドキュメント**: [Barcode API](https://quickchart.io/documentation/barcode-api/)

- **入力**: アクション（get_url/save_file）、出力パス、バーコードタイプ、テキストデータ、寸法、書式オプション
- **出力**: バーコード URL または保存されたファイルパスを含む確認メッセージ

**サポートされているバーコードタイプ:**
- **QR コード**: 高密度2次元バーコード
- **Code 128**: 英数字対応の1次元バーコード
- **EAN-13/UPC-A**: 商品用標準バーコード
- **Data Matrix**: 小型2次元バーコード
- **PDF417**: 大容量2次元バーコード
- **Aztec**: コンパクト2次元バーコード

### `create-table`

データをテーブル画像に変換 - URL 取得またはファイル保存

**ドキュメント**: [Table Image API](https://quickchart.io/documentation/apis/table-image-api/)

- **入力**: アクション（get_url/save_file）、出力パス、テーブルデータ構造、列定義、スタイリングオプション
- **出力**: テーブル画像 URL または保存されたファイルパスを含む確認メッセージ

**スタイリング機能:**
- **セル設定**: セル幅・高さ（デフォルト100x40px）、左右オフセット調整
- **フォント設定**: フォントファミリー（デフォルト"sans-serif"）
- **背景色**: テーブル背景色（デフォルト"#ffffff"）
- **スペーシング**: テーブル間隔（20px）、タイトル間隔（10px）
- **パディング**: 垂直・水平パディング、テキスト配置（右寄せ等）
- **区切り線**: "-"文字による水平線挿入対応

### `create-watermark`

画像にウォーターマークとロゴを追加 - URL 取得またはファイル保存

**ドキュメント**: [Watermark API](https://quickchart.io/documentation/watermark-api/)

- **入力**: アクション（get_url/save_file）、出力パス、メイン画像 URL、ウォーターマーク画像 URL、位置決め、透明度オプション
- **出力**: ウォーターマーク付き画像 URL または保存されたファイルパスを含む確認メッセージ

**位置決めオプション:**
- **プリセット位置**: 中央、四隅、上下中央、左右中央
- **カスタム位置**: X・Y座標による正確な配置
- **マージン設定**: 端からの距離調整
- **サイズ調整**: 比率指定、絶対サイズ指定
- **透明度制御**: 0.0（透明）～1.0（不透明）の範囲で調整

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

### `create-chart-using-chartjs` ツールの使用

`create-chart-using-chartjs` ツールは、`action` パラメータに応じてチャート URL を返すかファイルを保存するかを選択できます。

#### チャート URL の取得（デフォルト）

`action` を `"get_url"` に設定（または省略）してチャート URL を取得：

```json
{
  "action": "get_url",
  "chart": {
    "type": "bar",
    "data": {
      "labels": ["1月", "2月", "3月", "4月"],
      "datasets": [
        {
          "label": "2024年売上",
          "data": [65, 59, 80, 81],
          "backgroundColor": "rgba(75, 192, 192, 0.2)",
          "borderColor": "rgba(75, 192, 192, 1)"
        }
      ]
    },
    "options": {
      "plugins": {
        "title": {
          "display": true,
          "text": "月次売上レポート"
        }
      }
    }
  }
}
```

#### チャートをファイルとして保存

`action` を `"save_file"` に設定してチャートをローカルに保存：

```json
{
  "action": "save_file",
  "outputPath": "reports/device-usage.svg",
  "format": "svg",
  "chart": {
    "type": "pie",
    "data": {
      "labels": ["デスクトップ", "モバイル", "タブレット"],
      "datasets": [
        {
          "data": [65, 25, 10],
          "backgroundColor": ["#FF6384", "#36A2EB", "#FFCE56"]
        }
      ]
    },
    "options": {
      "plugins": {
        "title": {
          "display": true,
          "text": "デバイス使用統計"
        }
      }
    }
  }
}
```

_保存先：`デスクトップ/reports/device-usage.svg`_

#### その他のチャート例

**複数データセットの折れ線グラフ：**

```json
{
  "chart": {
    "type": "line",
    "data": {
      "labels": ["Q1", "Q2", "Q3", "Q4"],
      "datasets": [
        {
          "label": "製品A",
          "data": [10, 25, 15, 30],
          "borderColor": "blue"
        },
        {
          "label": "製品B",
          "data": [20, 15, 25, 35],
          "borderColor": "red"
        }
      ]
    },
    "options": {
      "plugins": {
        "title": {
          "display": true,
          "text": "四半期製品比較"
        }
      }
    }
  }
}
```

**散布図：**

```json
{
  "chart": {
    "type": "scatter",
    "data": {
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
      ]
    },
    "options": {
      "plugins": {
        "title": {
          "display": true,
          "text": "散布図の例"
        }
      }
    }
  }
}
```

**放射状ゲージ：**

```json
{
  "chart": {
    "type": "radialGauge",
    "data": {
      "datasets": [
        {
          "data": [75],
          "backgroundColor": "green"
        }
      ]
    },
    "options": {
      "plugins": {
        "title": {
          "display": true,
          "text": "パフォーマンススコア"
        }
      }
    }
  }
}
```

#### ファイル保存オプション

**サポートされる形式：**

- **PNG**（デフォルト）：`"format": "png"`
- **WebP**：`"format": "webp"`
- **JPEG**：`"format": "jpg"`
- **SVG**：`"format": "svg"`
- **PDF**：`"format": "pdf"`
- **Base64**：`"format": "base64"`

**保存場所：**

- **パス未指定**：デスクトップ（デスクトップが存在しない場合はホームディレクトリ）
- **相対パス**：デスクトップ（またはホームディレクトリ）を基準とした相対パス
- **絶対パス**：指定された正確なパス

## 高度な設定例

### カスタム寸法と高 DPI

```json
{
  "action": "save_file",
  "width": 1200,
  "height": 800,
  "devicePixelRatio": 2,
  "format": "png",
  "outputPath": "high-res-chart.png",
  "chart": {
    "type": "line",
    "data": {
      "labels": ["1月", "2月", "3月"],
      "datasets": [
        {
          "data": [10, 20, 30],
          "borderColor": "blue"
        }
      ]
    }
  }
}
```

### 背景色を指定した PDF 出力

```json
{
  "action": "save_file",
  "format": "pdf",
  "backgroundColor": "#ffffff",
  "version": "3",
  "encoding": "url",
  "chart": {
    "type": "bar",
    "data": {
      "labels": ["Q1", "Q2", "Q3", "Q4"],
      "datasets": [
        {
          "data": [100, 150, 120, 180],
          "backgroundColor": "rgba(54, 162, 235, 0.8)"
        }
      ]
    }
  }
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
npm run release patch

# マイナーバージョンを増分 (0.1.0 → 0.2.0)
npm run release minor

# メジャーバージョンを増分 (0.1.0 → 1.0.0)
npm run release major

# 特定のバージョンを設定
npm run release 1.2.3
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

## プロジェクト構造

```
quickchart-mcp-server/
├── src/
│   └── index.ts          # メインサーバー実装
├── package.json          # パッケージ設定
├── package-lock.json
├── tsconfig.json         # TypeScript設定
├── .github/
│   └── workflows/
│       └── npm-publish.yml   # NPM公開ワークフロー
├── scripts/
│   └── release.sh        # リリース自動化スクリプト
├── docs/
│   ├── README.md         # 英語版ドキュメント
│   └── README_ja.md      # このファイル
└── .gitignore            # Gitの無視ファイル
```

## リソース

- [QuickChart ドキュメント](https://quickchart.io/documentation/)
- [Chart.js ドキュメント](https://www.chartjs.org/docs/latest/)
- [Model Context Protocol](https://modelcontextprotocol.io/)

## ライセンス

MIT
