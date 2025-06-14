# 悪魔の献立アプリ - システム設計仕様書

## 📋 目次
1. [システム概要](#1-システム概要)
2. [アーキテクチャ設計](#2-アーキテクチャ設計)
3. [データモデル設計](#3-データモデル設計)
4. [機能仕様](#4-機能仕様)
5. [UI/UX設計](#5-uiux設計)
6. [アルゴリズム仕様](#6-アルゴリズム仕様)
7. [技術要件](#7-技術要件)
8. [パフォーマンス仕様](#8-パフォーマンス仕様)
9. [セキュリティ要件](#9-セキュリティ要件)
10. [拡張設計](#10-拡張設計)

---

## 1. システム概要

### 1.1 プロダクト定義
**名称**: 悪魔の献立アプリ
**目的**: りゅうじ風レシピによる個人最適化された献立提案システム
**対象**: 毎日の献立に悩む個人・家族

### 1.2 コアバリュー
- **個人最適化**: 使用履歴による学習機能
- **食材バランス**: 重複回避による栄養配慮
- **家族対応**: 子供・アレルギー・辛さ設定
- **簡単操作**: 3クリックで献立決定

### 1.3 主要KPI
- **利用継続率**: 7日後60%以上
- **提案満足度**: 選択率70%以上
- **重複回避率**: 3日間で90%以上
- **学習効果**: 10回利用後の好み反映率80%以上

### 1.4 システム境界
```
[ユーザー] → [Webブラウザ] → [フロントエンド] → [LocalStorage]
                ↓
        [レシピデータベース(JSON)]
```

---

## 2. アーキテクチャ設計

### 2.1 システム全体構成
```
Frontend (SPA)
├── UI Layer (HTML/CSS)
├── Business Logic (JavaScript)
├── Data Access Layer
└── Storage Layer (LocalStorage)

External Dependencies
├── Google Fonts (Noto Sans JP)
└── Static Assets (images)
```

### 2.2 モジュール構成
```javascript
// メインモジュール
App {
  RecipeEngine,     // レシピ提案エンジン
  LearningEngine,   // 学習アルゴリズム
  FamilyFilter,     // 家族設定フィルター
  UIController,     // UI制御
  StorageManager    // データ管理
}
```

### 2.3 データフロー
```
1. ユーザー入力(気分選択)
   ↓
2. 家族設定フィルタリング
   ↓
3. 重複回避フィルタリング
   ↓
4. 好み学習によるソート
   ↓
5. 上位3件をUI表示
   ↓
6. ユーザー選択
   ↓
7. 学習データ更新
   ↓
8. 履歴保存
```

### 2.4 状態管理
```javascript
AppState {
  currentMood: string | null,
  selectedRecipe: Recipe | null,
  currentCandidates: Recipe[],
  recipes: Recipe[],
  userPreferences: UserPreferences,
  familySettings: FamilySettings,
  foodHistory: FoodHistory
}
```

---

## 3. データモデル設計

### 3.1 Recipeモデル
```typescript
interface Recipe {
  id: number;                    // 一意ID
  name: string;                  // レシピ名
  category: MoodCategory;        // カテゴリ
  mainProtein: string;           // メインタンパク質
  proteinType: ProteinType;      // タンパク質タイプ
  vegetables: string[];          // 野菜リスト
  cookTime: number;              // 調理時間（分）
  difficulty: 1 | 2 | 3;        // 難易度
  childFriendly: boolean;        // 子供向けフラグ
  spicyLevel: 0 | 1 | 2 | 3;     // 辛さレベル
  allergens: AllergenType[];     // アレルゲンリスト
  nutritionTags: string[];       // 栄養タグ
  ingredients: string[];         // 材料リスト
  steps: string[];               // 手順
  tips: string;                  // コツ
  estimatedCost?: number;        // 推定コスト（円）
  season?: SeasonType;           // 季節
}

type MoodCategory = '疲れた' | 'がっつり' | 'あっさり' | 'チャレンジ';
type ProteinType = '豚' | '鶏' | '牛' | '魚' | '大豆' | '卵' | '乳製品' | '麺' | '揚げ物' | '果物' | '植物' | '穀物';
type AllergenType = '卵' | '乳製品' | '小麦' | 'そば' | 'えび' | 'かに';
type SeasonType = '春' | '夏' | '秋' | '冬' | '通年';
```

### 3.2 UserPreferencesモデル
```typescript
interface UserPreferences {
  recipeScores: { [recipeId: number]: number };           // レシピスコア
  ingredientPreference: { [ingredient: string]: number }; // 食材好み度
  moodHistory: MoodCategory[];                            // 気分履歴
  categoryStats: { [category: string]: number };         // カテゴリ統計
  lastUpdated: string;                                    // 最終更新日時
}
```

### 3.3 FamilySettingsモデル
```typescript
interface FamilySettings {
  hasChildren: boolean;    // 子供の有無
  spicyOK: boolean;       // 辛い料理OK
  allergyFree: boolean;   // アレルギー配慮
}
```

### 3.4 FoodHistoryモデル
```typescript
interface FoodHistory {
  [date: string]: {
    mainProtein: string;      // メインタンパク質
    proteinType: ProteinType; // タンパク質タイプ
    vegetables: string[];     // 使用野菜
    selectedRecipe: string;   // 選択レシピ名
    recipeId: number;        // レシピID
    timestamp: string;       // タイムスタンプ
  }
}
```

### 3.5 データ永続化仕様
```javascript
// LocalStorage キー定義
const STORAGE_KEYS = {
  FOOD_HISTORY: 'foodHistory',
  USER_PREFERENCES: 'userPreferences',
  FAMILY_SETTINGS: 'familySettings',
  APP_VERSION: 'appVersion'
};

// データ保存形式
localStorage: {
  'foodHistory': JSON.stringify(FoodHistory),
  'userPreferences': JSON.stringify(UserPreferences),
  'familySettings': JSON.stringify(FamilySettings),
  'appVersion': '1.0.0'
}
```

---

## 4. 機能仕様

### 4.1 コア機能一覧

#### 4.1.1 献立提案機能
**機能**: 気分に基づくレシピ提案
**入力**: 気分選択（4択）
**出力**: 3つのレシピ候補
**処理フロー**:
1. カテゴリフィルタリング
2. 家族設定フィルタリング
3. 重複回避フィルタリング
4. 好み度ソート
5. 上位3件選択

#### 4.1.2 食材重複回避機能
**機能**: 過去3日間の食材重複を回避
**アルゴリズム**:
- 優先度1: 同一メインタンパク質の除外
- 優先度2: 前日と同一タンパク質タイプの除外
- 候補不足時の補完機能

#### 4.1.3 好み学習機能
**機能**: 選択履歴による好み学習
**学習要素**:
- レシピスコア: 選択時+0.2、非選択時-0.05
- 食材好み度: 選択食材+0.1
- 気分パターン: 最新10回を記録

#### 4.1.4 家族設定機能
**機能**: 家族構成に応じたフィルタリング
**設定項目**:
- 子供向けレシピ優先
- 辛い料理の除外
- アレルゲンの除外

### 4.2 UI機能詳細

#### 4.2.1 画面遷移
```
[トップ画面]
    ↓ 気分選択
[候補表示画面]
    ↓ レシピ選択・確定
[詳細表示画面]
    ↓ リセット
[トップ画面]
```

#### 4.2.2 インタラクション仕様
- **気分選択**: 4つのボタンから選択
- **レシピ選択**: 3つのカードから選択（ラジオボタン風）
- **確定**: 選択後にボタンで確定
- **リシャッフル**: 同一気分で再提案

#### 4.2.3 レスポンシブ対応
```css
/* ブレークポイント */
Mobile: 0px - 480px    (1カラム)
Tablet: 481px - 768px  (1カラム)
Desktop: 769px+        (2カラム)
```

---

## 5. UI/UX設計

### 5.1 デザインシステム

#### 5.1.1 カラーパレット
```css
:root {
  /* プライマリカラー */
  --primary-red: #ff4757;      /* メインアクセント */
  --dark-red: #c44569;         /* セカンダリ */
  --devil-orange: #ff6b35;     /* アクション */
  
  /* ベースカラー */
  --dark-bg: #2f3542;          /* 背景 */
  --darker-bg: #1e272e;        /* 深い背景 */
  --light-text: #f1f2f6;       /* テキスト */
  
  /* アクセントカラー */
  --accent-yellow: #feca57;    /* ハイライト */
  --success-green: #5f27cd;    /* 成功 */
}
```

#### 5.1.2 タイポグラフィ
```css
/* フォント定義 */
font-family: 'Noto Sans JP', sans-serif;

/* サイズ階層 */
h1: 2.5rem (40px) - アプリタイトル
h2: 2rem (32px) - セクション見出し
h3: 1.4rem (22px) - コンテナ見出し
h4: 1.3rem (21px) - レシピタイトル
body: 1rem (16px) - ベーステキスト
small: 0.9rem (14px) - 補助テキスト
```

#### 5.1.3 間隔システム
```css
/* スペーシング */
--space-xs: 5px;     /* 微細な間隔 */
--space-sm: 10px;    /* 小さい間隔 */
--space-md: 15px;    /* 中間隔 */
--space-lg: 20px;    /* 大きい間隔 */
--space-xl: 25px;    /* 非常に大きい間隔 */
```

### 5.2 UXパターン

#### 5.2.1 マイクロインタラクション
- **ホバー効果**: 0.3s transform + box-shadow
- **クリック効果**: scale(0.98) + 浮き上がり
- **ローディング**: opacity 0.7 + disabled状態
- **選択状態**: グラデーション背景 + 枠線変更

#### 5.2.2 フィードバック設計
- **成功**: 緑色のメッセージ + チェックアイコン
- **エラー**: 赤色のメッセージ + 5秒自動消去
- **進行中**: 透明度変更 + ボタン無効化
- **選択済み**: 色変更 + 視覚的強調

#### 5.2.3 情報アーキテクチャ
```
1. アプリヘッダー（タイトル・説明）
2. 状況表示エリア（履歴・学習・バランス）
3. 設定エリア（家族設定）
4. メイン操作エリア（気分選択）
5. 結果表示エリア（候補・詳細）
6. デバッグエリア（開発者向け）
```

---

## 6. アルゴリズム仕様

### 6.1 重複回避アルゴリズム

#### 6.1.1 実装仕様
```javascript
function avoidFoodDuplication(candidateRecipes) {
  const recentHistory = getRecentFoodHistory(3);
  
  if (recentHistory.length === 0) return candidateRecipes;
  
  const usedMainProteins = recentHistory.map(day => day.mainProtein);
  const yesterday = recentHistory[0];
  
  return candidateRecipes.filter(recipe => {
    // 条件1: 同一メインタンパク質の除外
    if (usedMainProteins.includes(recipe.mainProtein)) {
      return false;
    }
    
    // 条件2: 昨日と同じタンパク質タイプの除外
    if (yesterday && yesterday.proteinType === recipe.proteinType) {
      return false;
    }
    
    return true;
  });
}
```

#### 6.1.2 パフォーマンス計算量
- **時間計算量**: O(n) - n: 候補レシピ数
- **空間計算量**: O(1) - 固定メモリ使用量

### 6.2 好み学習アルゴリズム

#### 6.2.1 スコア計算式
```javascript
// 総合スコア = レシピスコア(70%) + 食材好み度(30%)
totalScore = recipeScore * 0.7 + ingredientPreferenceScore * 0.3

// 食材好み度スコア
ingredientPreferenceScore = Σ(ingredient_preference) / ingredient_count
```

#### 6.2.2 学習パラメータ
```javascript
const LEARNING_PARAMS = {
  SELECTION_BONUS: 0.2,      // 選択時ボーナス
  NON_SELECTION_PENALTY: -0.05, // 非選択ペナルティ
  INGREDIENT_BONUS: 0.1,     // 食材好み度増加
  SCORE_MAX: 1.0,           // スコア上限
  SCORE_MIN: -1.0,          // スコア下限
  HISTORY_LIMIT: 10         // 気分履歴保持数
};
```

### 6.3 家族フィルターアルゴリズム

#### 6.3.1 フィルタリング条件
```javascript
function filterByFamily(recipes, settings) {
  return recipes.filter(recipe => {
    // 子供向けチェック
    if (settings.hasChildren && !recipe.childFriendly) {
      return false;
    }
    
    // 辛さチェック
    if (!settings.spicyOK && recipe.spicyLevel > 1) {
      return false;
    }
    
    // アレルギーチェック
    if (settings.allergyFree && recipe.allergens.length > 0) {
      return false;
    }
    
    return true;
  });
}
```

---

## 7. 技術要件

### 7.1 フロントエンド技術スタック

#### 7.1.1 基盤技術
- **HTML5**: セマンティックマークアップ
- **CSS3**: Flexbox, Grid, CSS変数, アニメーション
- **JavaScript**: ES6+, Async/Await, Modules
- **ブラウザAPI**: LocalStorage, Fetch API

#### 7.1.2 外部依存関係
```json
{
  "dependencies": {
    "fonts": "Google Fonts (Noto Sans JP)",
    "icons": "Unicode絵文字",
    "assets": "静的ファイル（画像）"
  },
  "devDependencies": {
    "none": "バニラJS実装"
  }
}
```

### 7.2 ブラウザ対応要件

#### 7.2.1 サポートブラウザ
```
Chrome: 60+ (2017年7月〜)
Firefox: 55+ (2017年8月〜) 
Safari: 12+ (2018年9月〜)
Edge: 79+ (2020年1月〜)
```

#### 7.2.2 必須機能サポート
- LocalStorage (容量10MB)
- CSS Grid & Flexbox
- ES6 Classes & Arrow Functions
- Fetch API

### 7.3 パフォーマンス要件

#### 7.3.1 ロード時間目標
```
初回ロード: < 2秒
リピートアクセス: < 1秒
気分選択 → 候補表示: < 500ms
レシピ確定: < 200ms
```

#### 7.3.2 ファイルサイズ目標
```
index.html: < 15KB
style.css: < 25KB
app.js: < 50KB
recipes.json: < 30KB
総サイズ: < 120KB (gzip前)
```

---

## 8. パフォーマンス仕様

### 8.1 メモリ使用量

#### 8.1.1 LocalStorage使用量
```
レシピデータ: ~30KB (32レシピ)
履歴データ: ~5KB (7日分)
学習データ: ~10KB (100回利用想定)
設定データ: ~1KB
合計: ~46KB / 10MB制限
```

#### 8.1.2 メモリ最適化戦略
- 不要なDOMエレメント削除
- イベントリスナーの適切な削除
- 大きなオブジェクトの早期解放

### 8.2 レンダリング最適化

#### 8.1.1 Critical Rendering Path
```
1. HTML解析 (Critical)
2. CSS読み込み (Critical)
3. JavaScript読み込み (Deferred)
4. JSON読み込み (Async)
5. フォント読み込み (Optional)
```

#### 8.2.2 アニメーション最適化
```css
/* GPU加速の利用 */
transform: translateX() translateY();
will-change: transform;

/* リフロー回避 */
position: absolute;
transform: translate3d(0,0,0);
```

---

## 9. セキュリティ要件

### 9.1 クライアントサイドセキュリティ

#### 9.1.1 XSS対策
```javascript
// HTMLエスケープ処理
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// innerHTML使用時のサニタイズ
element.innerHTML = escapeHtml(userInput);
```

#### 9.1.2 データ検証
```javascript
// 入力値検証
function validateRecipeData(recipe) {
  return {
    id: Number.isInteger(recipe.id) && recipe.id > 0,
    name: typeof recipe.name === 'string' && recipe.name.length > 0,
    category: ['疲れた', 'がっつり', 'あっさり', 'チャレンジ'].includes(recipe.category)
  };
}
```

### 9.2 プライバシー要件

#### 9.2.1 データ収集ポリシー
- 個人を特定する情報は収集しない
- LocalStorageのみ使用（サーバー送信なし）
- アナリティクス実装時は匿名化

#### 9.2.2 データ保持ポリシー
- 履歴データ: 7日間自動削除
- 学習データ: ユーザーが手動削除可能
- 設定データ: ユーザー制御下

---

## 10. 拡張設計

### 10.1 将来の機能拡張

#### 10.1.1 Phase 2: 機能強化
```javascript
// 新機能モジュール設計
const ExtendedFeatures = {
  RecipeSearchEngine,    // レシピ検索
  ShoppingListGenerator, // 買い物リスト生成
  NutritionCalculator,   // 栄養計算
  SocialSharing,         // SNSシェア
  OfflineMode           // オフライン対応
};
```

#### 10.1.2 Phase 3: バックエンド統合
```javascript
// API統合設計
const APILayer = {
  endpoints: {
    recipes: '/api/v1/recipes',
    analytics: '/api/v1/analytics',
    user: '/api/v1/user'
  },
  authentication: 'JWT',
  caching: 'Service Worker'
};
```

### 10.2 スケーラビリティ設計

#### 10.2.1 データベース移行計画
```sql
-- レシピテーブル設計
CREATE TABLE recipes (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  category recipe_category NOT NULL,
  data JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ユーザーテーブル設計
CREATE TABLE users (
  id UUID PRIMARY KEY,
  preferences JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### 10.2.2 マイクロサービス分割
```
Frontend Service (SPA)
├── Recipe Service (レシピ管理)
├── Learning Service (学習処理)
├── Analytics Service (分析)
└── Notification Service (通知)
```

### 10.3 技術負債管理

#### 10.3.1 リファクタリング計画
```javascript
// 現在の課題
const TechnicalDebt = {
  globalVariables: '状態管理ライブラリ導入',
  largeFunctions: '関数分割とモジュール化',
  testCoverage: 'ユニットテスト実装',
  bundling: 'ビルドツール導入'
};
```

#### 10.3.2 モダン化ロードマップ
```
Phase 1: TypeScript導入
Phase 2: React/Vue移行
Phase 3: Testing Framework導入
Phase 4: CI/CD構築
```

---

## 11. テスト仕様

### 11.1 テスト戦略

#### 11.1.1 テストピラミッド
```
E2E Tests (10%)
├── ユーザーシナリオテスト
└── クロスブラウザテスト

Integration Tests (20%)
├── データフロー統合テスト
└── UI統合テスト

Unit Tests (70%)
├── 個別関数テスト
├── アルゴリズムテスト
└── ユーティリティテスト
```

#### 11.1.2 主要テストケース
```javascript
describe('重複回避アルゴリズム', () => {
  test('同一メインタンパク質を除外する', () => {
    // テストコード
  });
  
  test('昨日と同じタンパク質タイプを除外する', () => {
    // テストコード
  });
  
  test('候補不足時に補完する', () => {
    // テストコード
  });
});
```

### 11.2 パフォーマンステスト

#### 11.2.1 負荷テスト項目
- レシピ数1000件での応答時間
- 1年分の履歴データでの動作
- メモリリーク検証
- 長時間利用でのパフォーマンス劣化

---

## 12. 運用・保守

### 12.1 監視・ログ

#### 12.1.1 エラー監視
```javascript
// エラー捕捉とレポート
window.addEventListener('error', (event) => {
  const errorData = {
    message: event.message,
    filename: event.filename,
    lineno: event.lineno,
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent
  };
  
  // エラーレポート送信（将来実装）
  reportError(errorData);
});
```

#### 12.1.2 使用統計
```javascript
// 匿名使用統計
const Analytics = {
  trackEvent: (category, action, label) => {
    // Google Analytics等への送信
  },
  
  trackPerformance: (metric, value) => {
    // パフォーマンス指標の記録
  }
};
```

### 12.2 更新・デプロイ

#### 12.2.1 バージョニング戦略
```
Major.Minor.Patch (例: 1.2.3)

Major: 破壊的変更
Minor: 機能追加
Patch: バグ修正
```

#### 12.2.2 ロールバック計画
- 静的ファイルの即座な巻き戻し
- LocalStorageデータの互換性維持
- 段階的デプロイによるリスク軽減

---

## 13. まとめ

### 13.1 実装優先度

#### 13.1.1 MVP (Minimum Viable Product)
- [ ] 基本UI/UX
- [ ] 32レシピデータベース
- [ ] 気分別フィルタリング
- [ ] 重複回避機能
- [ ] 好み学習機能

#### 13.1.2 Phase 1拡張
- [ ] 家族設定機能
- [ ] レスポンシブ対応
- [ ] パフォーマンス最適化
- [ ] エラーハンドリング

#### 13.1.3 Phase 2拡張
- [ ] 検索機能
- [ ] SNSシェア
- [ ] PWA対応
- [ ] 収益化機能

### 13.2 成功指標

#### 13.2.1 技術指標
- ページロード時間: < 2秒
- 重複回避率: > 90%
- ブラウザ対応率: > 95%
- バグ発生率: < 1%

#### 13.2.2 ビジネス指標
- 継続利用率: > 60% (7日後)
- ユーザー満足度: > 4.0 / 5.0
- レシピ選択率: > 70%
- 学習効果実感: > 80%

---

**Document Version**: 1.0.0  
**Last Updated**: 2025-06-14  
**Author**: 悪魔の献立アプリ開発チーム