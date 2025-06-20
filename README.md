# 🔥 悪魔の献立アプリ

りゅうじ風の簡単レシピで毎日の献立を提案するWebアプリケーション

## ✨ 特徴

* **🧠 AI風学習機能**: 使うほどあなたの好みを学習
* **🔄 食材重複回避**: 3日間の履歴で同じ食材の連続を防止
* **👨‍👩‍👧‍👦 家族対応**: お子様・辛さ・アレルギー設定
* **🎨 りゅうじ風デザイン**: 背徳感のあるダークテーマ
* **📱 レスポンシブ**: スマホでも快適操作
* **⚡ 高速動作**: ローカルストレージで瞬時に起動

## 🍽️ レシピ数

**総計32レシピ（各カテゴリ8個）**

* 😴 疲れた系: 簡単・時短レシピ
* 💪 がっつり系: ボリューム重視
* 🥗 あっさり系: ヘルシー・優しい味
* 🔥 チャレンジ系: りゅうじ風の意外な組み合わせ

## 🚀 使い方

### 基本操作

1. **気分選択**: 今日の気分を4つから選択
2. **レシピ選択**: 提案された3つの候補から選択
3. **献立確定**: 詳細レシピを確認して完了

### 高度機能

* **家族設定**: チェックボックスで家族構成に対応
* **学習機能**: 選択履歴から好みを自動学習
* **重複回避**: 食材バランスを自動調整

## 📁 ファイル構成

```
kondate-app/
├── index.html          # メイン画面
├── styles/
│   └── style.css       # スタイルシート
├── scripts/
│   └── app.js          # JavaScript機能
├── data/
│   └── recipes.json    # レシピデータベース
├── images/             # 画像ファイル（オプション）
├── README.md           # このファイル
└── sw.js               # サービスワーカー（PWA対応）
```

## 🛠️ セットアップ

### ローカル環境

1. ファイルをダウンロード
2. `index.html` をブラウザで開く
3. 完了！（サーバー不要）

### 無料サーバーでの公開

#### GitHub Pages

1. GitHubリポジトリを作成
2. ファイルをアップロード
3. Settings > Pages で公開設定
4. `https://username.github.io/repository-name` でアクセス

#### Vercel

1. [Vercel](https://vercel.com) にログイン
2. プロジェクトをインポート
3. 自動デプロイ完了

#### Netlify

1. [Netlify](https://netlify.com) にログイン
2. フォルダをドラッグ&ドロップ
3. 即座に公開

## 🔧 技術仕様

### フロントエンド

* **HTML5**: セマンティックマークアップ
* **CSS3**: CSS Grid, Flexbox, CSS変数
* **JavaScript**: ES6+, Async/Await, LocalStorage
* **レスポンシブ**: モバイルファースト設計

### データ管理

* **JSON**: レシピデータベース
* **LocalStorage**: 履歴・設定・学習データ
* **ファイルベース**: サーバー不要

### 対応ブラウザ

* Chrome 60+
* Firefox 55+
* Safari 12+
* Edge 79+

## 🎯 主要機能詳細

### 食材重複回避システム

* 直近3日間の食材履歴を記録
* メイン食材の完全重複を回避
* タンパク質タイプのローテーション
* 不足時の自動補完機能

### 好み学習アルゴリズム

* 選択レシピのスコア +0.2
* 非選択レシピのスコア -0.05
* 食材好み度の蓄積学習
* 気分選択パターンの分析

### 家族設定フィルター

* 子供向けレシピの優先表示
* 辛さレベルによる自動除外
* アレルゲン（卵・乳製品）の回避
* リアルタイム設定反映


## 📊 データ構造

### レシピオブジェクト（最新版）

```json
{
  "id": 1,
  "name": "豚バラもやし炒め",
  "category": "疲れた",
  "ingredients": ["豚バラ肉", "もやし", "ニンニク", "醤油", "みりん", "ごま油"],
  "idea": "豚バラを炒める",
  "tags": [],
  "image": null,
  "video": null,
  "steps": null,
  "tips": "強火でシャキシャキ感を残す",
  "nutrition": null,
  "cookTime": 10,
  "difficulty": 1,
  "spicyLevel": 0,
  "childFriendly": true,
  "allergens": [],
  "sourceUrl": "https://example.com/recipe/tonbara-moyashi"
}

🔗 sourceUrl は、調理手順の出典URLです。ユーザーがレシピを決定した後、「調理手順はこちら」ボタンから該当リンクへジャンプする設計です。

## 🧪 デバッグ機能

```javascript
// デバッグ情報表示
KondateApp.showDebugInfo()

// テストデータ追加
KondateApp.addTestData()

// レシピ検索
KondateApp.searchRecipes('豚')

// 人気レシピ
KondateApp.getPopularRecipes()

// データアクセス
KondateApp.recipes        // 全レシピ
KondateApp.currentMood    // 現在の気分
```

## 🚀 カスタマイズ

### レシピ追加

`data/recipes.json` にレシピオブジェクトを追加（上記形式）

### デザイン変更

`styles/style.css` のCSS変数を編集

```css
:root {
  --primary-red: #ff4757;    /* メインカラー */
  --accent-yellow: #feca57;  /* アクセントカラー */
}
```

### 機能拡張

`scripts/app.js` に新しい関数を追加

## 🌟 将来の拡張予定

### Phase 1: コンテンツ強化

* [ ] レシピ数を100個に拡張
* [ ] 料理写真の追加
* [ ] 動画レシピの統合
* [ ] 季節限定レシピ

### Phase 2: 機能強化

* [ ] SNSシェア機能
* [ ] 買い物リスト生成
* [ ] カロリー計算
* [ ] 栄養バランス分析

### Phase 3: PWA化

* [ ] オフライン対応
* [ ] プッシュ通知
* [ ] ホーム画面追加
* [ ] アプリストア公開

### Phase 4: 収益化

* [ ] Google AdSense統合
* [ ] アフィリエイトリンク
* [ ] 食材宅配サービス連携
* [ ] プレミアム機能
* [ ] Google AdSense統合
* [ ] アフィリエイトリンク
* [ ] 食材宅配サービス連携
* [ ] プレミアム機能

## 🐛 既知の問題

### Chrome関連

* ローカルファイルでの制限により、一部環境でJavaScriptが動作しない場合があります
* **解決策**: Edge/Firefox使用 または サーバー環境での実行

### iOS Safari

* LocalStorageの容量制限により、大量データで動作が不安定になる場合があります
* **解決策**: 定期的な履歴クリア

## 🤝 貢献

プルリクエストやイシューを歓迎します！

### 開発環境

1. リポジトリをクローン
2. ローカルサーバーを起動（推奨）
3. 変更を加えてテスト
4. プルリクエストを作成

## 📄 ライセンス

MIT License - 詳細は [LICENSE](LICENSE) ファイルを参照

## 👨‍💻 作者

悪魔の献立アプリ開発チーム

## 🙏 謝辞

* りゅうじさんのレシピアイデアにインスパイア
* フォント: Google Fonts (Noto Sans JP)
* 無料ホスティング: GitHub Pages, Vercel, Netlify

---

**🔥 毎日の献立選びを、悪魔的に簡単に。**
