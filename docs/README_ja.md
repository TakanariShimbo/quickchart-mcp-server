[English](README.md) | [日本語](README_ja.md) | **README**

# QuickChart MCP サーバー

## 概要

この Model Context Protocol (MCP)サーバー は、QuickChart.io API を使用した強力な可視化ツールを提供します。  
AI アシスタントは、この MCP を経由することで、チャート、図表、バーコード、QR コード、ワードクラウド、テーブルなどを作成することができるようになります。

**プロンプトの例:**

- 「Q4 の地域別売上のチャートが必要です」
- 「連絡先情報の QR コードを作成して」
- 「この CSV データからプロフェッショナルなテーブルを生成して」
- 「この顧客レビューからワードクラウドを作って」
- 「デプロイメントプロセスのフローチャートを描いて」

**AI が行うこと:**

1. リクエストに適したツールを選択
2. データを適切に構造化
3. 適切なスタイリングと書式設定を適用
4. 必要に応じて結果を保存または表示

### 出力オプション

**URL 取得:** 共有、ウェブページへの埋め込み、クイックプレビューに最適
**ファイル保存:** レポート、プレゼンテーション、アーカイブ目的に理想的

**サポートされる形式:**

- **画像**: PNG、JPEG、WebP、SVG
- **ドキュメント**: PDF
- **データ**: Base64 エンコーディング

**ファイル管理:**

- ファイルはデフォルトでデスクトップに保存（設定可能）
- 環境変数によるカスタム出力ディレクトリ
- 整理のためのカスタムパスサポート
- 必要に応じて自動ディレクトリ作成

## インストール

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

### カスタム設定を使用

```json
{
  "mcpServers": {
    "quickchart": {
      "command": "npx",
      "args": ["-y", "@takanarishimbo/quickchart-mcp-server"],
      "env": {
        "QUICKCHART_BASE_URL": "https://your-quickchart-instance.com",
        "QUICKCHART_DEFAULT_OUTPUT_DIR": "/home/username/Downloads",
        "QUICKCHART_ENABLE_QRCODE": "false"
      }
    }
  }
}
```

### 環境変数

**環境変数設定:**

**URL 設定:**

- **QUICKCHART_BASE_URL**: メインの QuickChart API ベース URL（デフォルト: `https://quickchart.io`）
- **QUICKCHART_API_BASE_URL**: QuickChart API サーバーのベース URL（デフォルト: `https://api.quickchart.io`）

`QUICKCHART_BASE_URL` を設定すると、以下のエンドポイントが設定されます：

- チャート: `{BASE_URL}/chart`
- QR コード: `{BASE_URL}/qr`
- ワードクラウド: `{BASE_URL}/wordcloud`
- ApexCharts: `{BASE_URL}/apex-charts/render`
- Google Charts: `{BASE_URL}/google-charts/render`
- バーコード: `{BASE_URL}/barcode`
- GraphViz: `{BASE_URL}/graphviz`
- テキストからチャート: `{BASE_URL}/natural`
- ウォーターマーク: `{BASE_URL}/watermark`

`QUICKCHART_API_BASE_URL` を設定すると、以下のエンドポイントが設定されます：

- テーブル: `{API_BASE_URL}/v1/table`

**ツール無効化設定:**
特定のツールを無効化する場合は、以下の環境変数を `false` に設定してください：

- **QUICKCHART_ENABLE_CHART**: Chart.js チャートツール
- **QUICKCHART_ENABLE_APEXCHARTS**: ApexCharts ツール
- **QUICKCHART_ENABLE_GOOGLECHARTS**: Google Charts ツール
- **QUICKCHART_ENABLE_TEXTCHART**: テキストからチャートツール
- **QUICKCHART_ENABLE_SPARKLINE**: スパークラインツール
- **QUICKCHART_ENABLE_GRAPHVIZ**: GraphViz ツール
- **QUICKCHART_ENABLE_WORDCLOUD**: ワードクラウドツール
- **QUICKCHART_ENABLE_BARCODE**: バーコードツール
- **QUICKCHART_ENABLE_QRCODE**: QR コードツール
- **QUICKCHART_ENABLE_TABLE**: テーブルツール
- **QUICKCHART_ENABLE_WATERMARK**: ウォーターマークツール
- **QUICKCHART_ENABLE_HELP**: ビジュアライゼーションツールヘルプ

**ファイル管理:**

- **QUICKCHART_DEFAULT_OUTPUT_DIR**: ファイル保存用のデフォルトディレクトリ（絶対パス、デフォルト: ホームディレクトリの `Desktop`）

**デフォルト出力ディレクトリの例:**

```bash
# カスタムチャートディレクトリに保存（Linux/macOS）
QUICKCHART_DEFAULT_OUTPUT_DIR=/home/username/Documents/charts

# カスタムチャートディレクトリに保存（Windows）
QUICKCHART_DEFAULT_OUTPUT_DIR=C:/Users/username/Documents/charts
```

## ツール

### `create-chart-using-chartjs`

Chart.js と QuickChart.io を使用してチャートを作成 - URL 取得またはファイル保存

**ドキュメント**: [QuickChart.io Chart API](https://quickchart.io/documentation/)

- **入力**: アクション（get_url/save_file）、出力パス、寸法（整数）、フォーマットオプション、エンコード方式、Chart.js 設定オブジェクト
- **出力**: チャート URL または保存されたファイルパスを含む確認メッセージ

**サポートされているチャートタイプ:**

- **bar**: カテゴリ間の値を比較する棒グラフ
- **line**: 時系列のトレンドを示す折れ線グラフ
- **pie**: 比率とパーセンテージを示す円グラフ
- **doughnut**: ドーナツグラフ（中心が空洞の円グラフ）
- **radar**: 複数の変数を比較するレーダーチャート
- **polarArea**: 周期的なデータの可視化のための極座標エリアチャート
- **scatter**: 相関分析のための散布図
- **bubble**: 3 次元データ関係のためのバブルチャート
- **area**: 時間経過による累積値を表示するエリアチャート
- **mixed**: 複数のチャートタイプを組み合わせたミックスチャート

**プロンプト例:**

- **売上レポート**: 「月別売上データの棒グラフを作成して」
- **パフォーマンス指標**: 「85%のパフォーマンススコアを示すゲージチャートを生成して」
- **トレンド分析**: 「四半期売上成長を折れ線グラフで表示して」
- **データ比較**: 「地域別製品パフォーマンスを円グラフで比較して」
- **統計分析**: 「価格と売上の関係を散布図で表示して」

**AI のための使用例:**

```json
{
  "action": "save_file",
  "chart": {
    "type": "bar",
    "data": {
      "labels": ["Q1", "Q2", "Q3", "Q4"],
      "datasets": [
        {
          "label": "2024年売上",
          "data": [65, 59, 80, 81],
          "backgroundColor": "rgba(54, 162, 235, 0.8)"
        }
      ]
    }
  }
}
```

### `create-chart-using-apexcharts`

ApexCharts ライブラリを使用してチャートを作成 - URL 取得またはファイル保存

**ドキュメント**: [ApexCharts Image Rendering](https://quickchart.io/documentation/apex-charts-image-rendering/)

- **入力**: アクション（get_url/save_file）、出力パス、ApexCharts 設定、寸法、バージョンオプション
- **出力**: ApexCharts URL または保存されたファイルパスを含む確認メッセージ

**サポートされているチャートタイプ:**

- **line**: 時間経過によるトレンドや動向を描写する折れ線グラフ
- **area**: 累積データトレンドを表示するエリアチャート
- **bar**: カテゴリデータの比較のための棒グラフ
- **column**: 縦方向データ比較のためのコラムチャート
- **pie**: 比率可視化のための円グラフ
- **donut**: 強化された比率表示のためのドーナツチャート
- **scatter**: 相関分析のための散布図
- **bubble**: 多次元データのためのバブルチャート
- **candlestick**: 金融データのためのローソク足チャート
- **boxplot**: 統計データ分布のためのボックスプロット
- **heatmap**: マトリックスデータ可視化のためのヒートマップ
- **treemap**: 階層データのためのツリーマップ
- **radar**: 多変数比較のためのレーダーチャート
- **radialbar**: 放射状バーチャートと円形ゲージ
- **rangearea**: データ範囲のための範囲エリアチャート
- **rangebar**: 時間期間のための範囲バーチャート
- **funnel**: プロセス可視化のためのファネルチャート

**プロンプト例:**

- **金融ダッシュボード**: 「株価のローソク足チャートを作成して」
- **インタラクティブレポート**: 「ズーム機能付きの複数系列エリアチャートを生成して」
- **時系列分析**: 「日時軸チャートでリアルタイムデータを表示して」

**AI のための使用例:**

```json
{
  "action": "save_file",
  "config": {
    "series": [
      {
        "name": "売上",
        "data": [30, 40, 45, 50, 49, 60, 70, 91]
      }
    ],
    "chart": {
      "type": "line"
    },
    "xaxis": {
      "categories": ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月"]
    }
  }
}
```

### `create-chart-using-googlecharts`

Google Charts ライブラリを使用してチャートを作成 - URL 取得またはファイル保存

**ドキュメント**: [Google Charts Image Server](https://quickchart.io/documentation/google-charts-image-server/)

- **入力**: アクション（get_url/save_file）、出力パス、JavaScript 描画コード、パッケージ、寸法、API キー
- **出力**: Google Charts URL または保存されたファイルパスを含む確認メッセージ

**サポートされているチャートタイプ:**

- **bar**: カテゴリデータ比較のための棒グラフ
- **column**: 縦方向データ比較のためのコラムチャート
- **line**: トレンド可視化のための折れ線グラフ
- **area**: エリアチャートとステップエリアチャート
- **pie**: 比率表示のための円グラフ
- **donut**: 強化された比率可視化のためのドーナツチャート
- **scatter**: 相関分析のための散布図
- **bubble**: 多次元データのためのバブルチャート
- **combo**: 複数のチャートタイプを組み合わせたコンボチャート
- **gauge**: 測定値と目標値のためのゲージチャート
- **timeline**: 時系列イベントのためのタイムラインチャート
- **gantt**: プロジェクト管理のためのガントチャート
- **geochart**: 地理チャートと世界地図
- **treemap**: 階層データのためのツリーマップチャート
- **sankey**: フロー可視化のためのサンキーダイアグラム
- **candlestick**: 金融データのためのローソク足チャート
- **histogram**: データ分布のためのヒストグラム
- **calendar**: 日付ベースデータのためのカレンダーチャート
- **org**: 階層表示のための組織図
- **table**: 構造化データ表示のためのテーブルチャート
- **waterfall**: 累積効果のためのウォーターフォールチャート
- **annotation**: 詳細分析のための注釈チャート

**プロンプト例:**

- **地理的データ**: 「国別売上を示す世界地図を作成して」
- **組織図**: 「会社の階層図を生成して」
- **タイムライン可視化**: 「プロジェクトマイルストーンをタイムラインチャートで表示して」

**AI のための使用例:**

```json
{
  "action": "get_url",
  "code": "const data = google.visualization.arrayToDataTable([['タスク', '時間'], ['仕事', 8], ['睡眠', 8], ['食事', 2], ['通勤', 2], ['テレビ', 4]]); const chart = new google.visualization.PieChart(document.getElementById('chart')); chart.draw(data);",
  "packages": ["corechart"]
}
```

### `create-chart-using-natural-language`

自然言語記述からチャートを生成 - URL 取得またはファイル保存

**ドキュメント**: [Text to Chart API](https://quickchart.io/documentation/apis/text-to-chart/)

- **入力**: アクション（get_url/save_file）、出力パス、自然言語記述、データ値、チャートオプション
- **出力**: AI 生成チャート URL または保存されたファイルパスを含む確認メッセージ

**主な機能:**

- **自然言語解析**: 「青い線グラフで月別売上を表示」などの記述を理解
- **自動チャート選択**: 最適なチャートタイプを自動判定
- **データ統合**: CSV 形式データの自動処理
- **スタイル適用**: 色、フォント、レイアウトの自動最適化

**プロンプト例:**

- **クイックプロトタイピング**: 「月別売上成長を青い線グラフで表示して」
- **データ探索**: 「この売上データを最適に表現するチャートを作成して」
- **自動レポート**: 「CSV データから適切な可視化を生成して」

**AI のための使用例:**

```json
{
  "action": "save_file",
  "description": "月別売上成長を青い線グラフで表示",
  "data1": "100,120,150,180,200",
  "labels": "1月,2月,3月,4月,5月",
  "title": "売上成長"
}
```

### `create-sparkline-using-chartjs`

コンパクトなスパークラインチャートを作成 - URL 取得またはファイル保存

**ドキュメント**: [Sparkline API](https://quickchart.io/documentation/sparkline-api/)

- **入力**: アクション（get_url/save_file）、出力パス、Chart.js 設定、寸法、表示オプション
- **出力**: スパークライン URL または保存されたファイルパスを含む確認メッセージ

**サポートされているチャートタイプ:**

- **line**: トレンド可視化のための単一ラインスパークライン
- **multiline**: 比較のための複数ラインスパークライン

**プロンプト例:**

- **ダッシュボードウィジェット**: 「KPI ダッシュボード用の小さなトレンド指標を生成して」
- **インライン指標**: 「メールレポート用のミニチャートを作成して」
- **モバイル表示**: 「モバイルアプリ用のコンパクトなデータトレンドを表示して」

**AI のための使用例:**

```json
{
  "action": "save_file",
  "config": {
    "type": "line",
    "data": {
      "datasets": [
        {
          "data": [10, 15, 12, 18, 22, 20, 25],
          "borderColor": "blue",
          "pointRadius": 0
        }
      ]
    }
  },
  "width": 200,
  "height": 50
}
```

### `create-diagram-using-graphviz`

GraphViz を使用してグラフ図を作成 - URL 取得またはファイル保存

**ドキュメント**: [GraphViz API](https://quickchart.io/documentation/graphviz-api/)

- **入力**: アクション（get_url/save_file）、出力パス、DOT グラフ記述、レイアウトアルゴリズム、フォーマット、寸法
- **出力**: GraphViz 図 URL または保存されたファイルパスを含む確認メッセージ

**作成可能な図表:**

- **フローチャート**: ステップバイステップのプロセス図と判断ポイント
- **組織図**: 会社の階層構造と報告関係
- **ネットワーク図**: システムアーキテクチャとインフラマップ
- **決定木**: ロジックフローと意思決定プロセス
- **ER 図**: データベーススキーマと関係性
- **状態遷移図**: システムの状態遷移とワークフロー
- **マインドマップ**: 概念マッピングとブレーンストーミング図
- **依存関係図**: プロジェクトの依存関係とタスク関係
- **システムアーキテクチャ**: ソフトウェアコンポーネントの相互作用
- **データフロー図**: システム内の情報の流れ

**プロンプト例:**

- **ワークフロー文書化**: 「承認プロセスのフローチャートを生成して」
- **システムアーキテクチャ**: 「インフラストラクチャのネットワーク図を作成して」
- **決定木**: 「顧客オンボーディングの決定フローをマップして」

**AI のための使用例:**

```json
{
  "action": "get_url",
  "graph": "digraph G { 開始 -> 処理 -> 判定; 判定 -> 終了 [label=\"はい\"]; 判定 -> 処理 [label=\"いいえ\"]; }",
  "layout": "dot"
}
```

### `create-wordcloud`

ワードクラウド可視化を作成 - URL 取得またはファイル保存

**ドキュメント**: [Word Cloud API](https://quickchart.io/documentation/word-cloud-api/)

- **入力**: アクション（get_url/save_file）、出力パス、テキストコンテンツ、フォント、色、レイアウトオプション
- **出力**: ワードクラウド URL または保存されたファイルパスを含む確認メッセージ

**プロンプト例:**

- **コンテンツ分析**: 「顧客フィードバックからワードクラウドを作成して」
- **アンケート結果**: 「アンケートデータの最頻回答を可視化して」
- **ソーシャルメディア分析**: 「ソーシャル投稿のトレンドキーワードを表示して」

**AI のための使用例:**

```json
{
  "action": "get_url",
  "text": "イノベーション テクノロジー 人工知能 機械学習 データサイエンス",
  "width": 800,
  "height": 400,
  "backgroundColor": "#f0f0f0"
}
```

### `create-barcode`

バーコードと QR コードを生成 - URL 取得またはファイル保存

**ドキュメント**: [Barcode API](https://quickchart.io/documentation/barcode-api/)

- **入力**: アクション（get_url/save_file）、出力パス、バーコードタイプ、テキストデータ、寸法、書式オプション
- **出力**: バーコード URL または保存されたファイルパスを含む確認メッセージ

**サポートされているバーコードタイプ（100 以上のフォーマット）:**

- **QR コード**: URL、テキスト、データ用の高密度 2 次元バーコード
- **Code 128**: 英数字コンテンツ用の汎用性 1 次元バーコード
- **EAN-13/UPC-A**: 小売製品識別用標準バーコード
- **Data Matrix**: 小型アイテム用コンパクト 2 次元バーコード
- **PDF417**: 文書用大容量 2 次元バーコード
- **Aztec**: エラー修正機能内蔵のコンパクト 2 次元バーコード

**作成可能なコンテンツ:**

- **製品管理**: 小売製品用の UPC-A、EAN-13 コード
- **在庫管理**: 倉庫追跡用の Code 128 バーコード
- **配送ラベル**: 物流用の追跡コードを生成
- **文書エンコード**: 大量データ保存用 PDF417 コード
- **資産追跡**: 機器やツール用 Data Matrix コード
- **モバイルアプリ**: アプリダウンロードやリンク用 QR コード
- **連絡先情報**: vCard データ含有 QR コード
- **イベントチケット**: 入場認証用セキュアバーコード
- **決済処理**: モバイル決済用 QR コード
- **位置情報共有**: GPS 座標含有 QR コード
- **WiFi アクセス**: ネットワーク認証情報用 QR コード
- **プロモーション**: 特別オファーリンク用 QR コード

  **プロンプト例:**

- **在庫管理**: 「倉庫システム用の製品バーコードを生成して」
- **小売業務**: 「新製品ライン用の UPC コードを作成して」
- **資産追跡**: 「機器追跡用の Code128 バーコードを生成して」

**AI のための使用例:**

```json
{
  "action": "get_url",
  "type": "code128",
  "text": "ABC123456789",
  "width": 300,
  "height": 100
}
```

### `create-table`

データをテーブル画像に変換 - URL 取得またはファイル保存

**ドキュメント**: [Table Image API](https://quickchart.io/documentation/apis/table-image-api/)

- **入力**: アクション（get_url/save_file）、出力パス、テーブルデータ構造、列定義、スタイリングオプション
- **出力**: テーブル画像 URL または保存されたファイルパスを含む確認メッセージ

**プロンプト例:**

- **財務レポート**: 「四半期収益データをプロフェッショナルなテーブルに変換して」
- **比較表**: 「製品の機能比較表を作成して」
- **サマリーレポート**: 「役員向けプレゼンテーション用の書式設定されたテーブルを生成して」

**AI のための使用例:**

```json
{
  "action": "save_file",
  "data": {
    "title": "Q4売上レポート",
    "columns": [
      { "title": "製品", "dataIndex": "product" },
      { "title": "売上", "dataIndex": "revenue" }
    ],
    "dataSource": [
      { "product": "製品A", "revenue": "¥5,000,000" },
      { "product": "製品B", "revenue": "¥7,500,000" }
    ]
  }
}
```

### `create-qr-code`

豊富なカスタマイズオプションを持つ QR コードを作成 - URL 取得またはファイル保存

**ドキュメント**: [QR Code API](https://quickchart.io/documentation/qr-codes/)

- **入力**: アクション（get_url/save_file）、出力パス、テキストコンテンツ、フォーマットオプション、サイズ、色、エラー訂正レベル、高度なカスタマイズ
- **出力**: QR コード URL または保存されたファイルパスを含む確認メッセージ

**作成可能なコンテンツ:**

- **ウェブサイトリンク**: ウェブサイト、ランディングページ、オンラインコンテンツへの直接リンク
- **連絡先情報**: 簡単な連絡先共有のための vCard データ
- **WiFi アクセス**: ゲストアクセス用のネットワーク認証情報
- **イベント詳細**: カレンダーイベント、会議情報、RSVP リンク
- **アプリダウンロード**: アプリストアとダウンロードページへの直接リンク
- **決済情報**: 決済リンクと暗号通貨アドレス
- **位置情報共有**: GPS 座標とマップリンク
- **ソーシャルメディア**: プロフィールリンクとソーシャルメディア接続
- **製品情報**: アイテム詳細、仕様、レビュー
- **マーケティングキャンペーン**: プロモーションリンクと特別オファー
- **名刺**: デジタル名刺情報
- **メニューアクセス**: レストランメニューと注文システム
- **文書共有**: PDF、フォーム、ダウンロードへのリンク
- **アンケートリンク**: 研究アンケートとフィードバックフォーム

**プロンプト例:**

- **マーケティングキャンペーン**: 「製品ページにリンクする QR コードを作成して」
- **イベント管理**: 「チケット認証用の QR コードを生成して」
- **連絡先共有**: 「名刺情報を含む QR コードを作成して」
- **WiFi アクセス**: 「ゲストネットワークアクセス用の QR コードを生成して」

**AI のための使用例:**

```json
{
  "action": "save_file",
  "text": "https://example.com",
  "size": 300,
  "centerImageUrl": "https://example.com/logo.png",
  "centerImageSizeRatio": 0.2,
  "caption": "当社ウェブサイトにアクセス"
}
```

### `create-watermark`

画像にウォーターマークとロゴを追加 - URL 取得またはファイル保存

**ドキュメント**: [Watermark API](https://quickchart.io/documentation/watermark-api/)

- **入力**: アクション（get_url/save_file）、出力パス、メイン画像 URL、ウォーターマーク画像 URL、位置決め、透明度オプション
- **出力**: ウォーターマーク付き画像 URL または保存されたファイルパスを含む確認メッセージ

**プロンプト例:**

- **文書保護**: 「レポートに会社ロゴのウォーターマークを追加して」
- **ブランド一貫性**: 「すべてのマーケティング資料にウォーターマークを適用して」
- **著作権保護**: 「共有する可視化に帰属を追加して」

**AI のための使用例:**

```json
{
  "action": "save_file",
  "mainImageUrl": "https://example.com/chart.png",
  "watermarkImageUrl": "https://example.com/logo.png",
  "position": "bottom-right",
  "opacity": 0.7
}
```

### `get-visualization-tool-help`

利用可能なすべてのチャート、図表、QR コードツールの詳細な使用方法と例を取得

- **入力**: パラメータ不要
- **出力**: すべてのビジュアライゼーションツールの完全なドキュメント（JSON 形式）

**AI のための使用例:**

```json
{}
```

このツールは以下を含む、利用可能な全ツールの包括的な情報を提供します：

- サポートされるチャートタイプと機能
- 各ツールのプロンプト例
- JSON 設定を含む詳細な使用例
- 公式ドキュメントリンク
- 各ツールで作成できるもの
- AI が検索可能な追加ウェブリソース

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

## Desktop Extension (DXT) の作成

Desktop Extensions (.dxt) により、Claude Desktop での MCP サーバーのワンクリックインストールが可能になります。このサーバー用の DXT ファイルを作成する手順：

### 1. DXT マニフェストの初期化

プロジェクトルートディレクトリで以下のコマンドを実行：

```bash
npx @anthropic-ai/dxt init
```

### 2. DXT パッケージの作成

```bash
npx @anthropic-ai/dxt pack
```

これにより、ユーザーが Claude Desktop でワンクリックインストールできる `.dxt` ファイルが作成されます。

### 3. ユーザー設定

DXT ファイルには、ユーザーが以下を設定できるユーザー設定可能オプションが含まれています：

- **URL 設定**: カスタム QuickChart インスタンス URL の設定
- **ツール管理**: 特定の可視化ツールの有効/無効の切り替え
- **簡単インストール**: 手動 JSON 設定不要

ユーザーはインストール時または後で Claude Desktop の拡張機能管理インターフェースを通じてこれらの設定を変更できます。

## プロジェクト構造

```
quickchart-mcp-server/
├── src/
│   ├── index.ts          # メインサーバー実装
│   ├── tools/
│   │   ├── index.ts      # ツール登録とエクスポート
│   │   ├── chart.ts      # Chart.js ツール
│   │   ├── wordcloud.ts  # ワードクラウドツール
│   │   ├── apexcharts.ts # ApexCharts ツール
│   │   ├── barcode.ts    # バーコード/QR ツール
│   │   ├── googlecharts.ts # Google Charts ツール
│   │   ├── graphviz.ts   # GraphViz ツール
│   │   ├── sparkline.ts  # スパークラインツール
│   │   ├── table.ts      # テーブル画像ツール
│   │   ├── textchart.ts  # テキストからチャートツール
│   │   ├── watermark.ts  # ウォーターマークツール
│   │   └── qrcode.ts     # QR コードツール
│   └── utils/
│       ├── config.ts     # 設定管理
│       └── file.ts       # ファイルユーティリティ
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

### 公式ドキュメント

#### QuickChart API

- [QuickChart メインドキュメント](https://quickchart.io/documentation/) - 全 QuickChart API の包括的ガイド

#### チャートライブラリ

- [Chart.js ドキュメント](https://www.chartjs.org/docs/latest/) - 人気の JavaScript チャートライブラリ
- [ApexCharts ドキュメント](https://apexcharts.com/docs/) - モダンなチャートライブラリ
- [Google Charts ドキュメント](https://developers.google.com/chart) - Google の可視化 API
- [GraphViz ドキュメント](https://graphviz.org/documentation/) - グラフ可視化ソフトウェア

#### MCP プロトコル

- [Model Context Protocol](https://modelcontextprotocol.io/) - 公式 MCP 仕様
- [MCP SDK ドキュメント](https://github.com/modelcontextprotocol/typescript-sdk) - MCP 用 TypeScript SDK
- [Claude Desktop MCP ガイド](https://docs.anthropic.com/en/docs/build-with-claude/mcp) - Claude での MCP 使用方法
- [MCP Inspector](https://github.com/modelcontextprotocol/inspector) - MCP サーバーのデバッグとテスト

### チュートリアル・例

#### 入門ガイド

- [QuickChart ギャラリー](https://quickchart.io/gallery/) - チャート例とインスピレーション
- [Chart.js 例](https://www.chartjs.org/docs/latest/samples/) - インタラクティブチャート例
- [ApexCharts デモ](https://apexcharts.com/javascript-chart-demos/) - ライブチャートデモンストレーション
- [GraphViz ギャラリー](https://graphviz.org/gallery/) - グラフ可視化例

#### 高度な使用法

- [Chart.js 設定](https://www.chartjs.org/docs/latest/configuration/) - 詳細な設定オプション
- [DOT 言語ガイド](https://graphviz.org/doc/info/lang.html) - GraphViz 構文リファレンス
- [QR コードベストプラクティス](https://blog.qr4.nl/post/qr-code-best-practices/) - QR コード設計ガイドライン
- [データ可視化ガイドライン](https://www.data-to-viz.com/) - 適切なチャートタイプの選択

#### 開発ツール

- [Chart.js チャートビルダー](https://www.chartjs.org/docs/latest/getting-started/) - インタラクティブチャートビルダー
- [QR コードジェネレーター](https://www.qr-code-generator.com/) - オンライン QR コードテスト
- [GraphViz オンライン](https://dreampuf.github.io/GraphvizOnline/) - DOT 構文のオンラインテスト

## ライセンス

MIT - 詳細は [LICENSE](LICENSE) ファイルを参照してください
