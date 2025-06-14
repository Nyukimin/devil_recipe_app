/**
 * 悪魔の献立アプリ - メインJavaScript
 * りゅうじ風簡単レシピ提案システム
 * 
 * 機能:
 * - 食材重複回避システム
 * - 好み学習機能
 * - 家族設定対応
 * - レシピデータベース管理
 */

// グローバル変数
let recipes = [];
let selectedRecipe = null;
let currentCandidates = [];
let currentMood = null;

// アプリ初期化
document.addEventListener('DOMContentLoaded', async function() {
    console.log('🔥 悪魔の献立アプリ起動中...');
    
    try {
        await loadRecipeData();
        initializeApp();
        console.log('✅ アプリ初期化完了');
    } catch (error) {
        console.error('❌ 初期化エラー:', error);
        showErrorMessage('アプリの初期化に失敗しました。ページを再読み込みしてください。');
    }
});

// レシピデータ読み込み
async function loadRecipeData() {
    try {
        const response = await fetch('./data/recipes.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        recipes = data.recipes;
        console.log(`📚 レシピデータ読み込み完了: ${recipes.length}件`);
    } catch (error) {
        console.error('レシピデータ読み込みエラー:', error);
        // フォールバック: 基本レシピデータ
        recipes = getFallbackRecipes();
        console.log('⚠️ フォールバックレシピを使用');
    }
}

// フォールバックレシピ（最小限）
function getFallbackRecipes() {
    return [
        {
            id: 1, name: "豚バラもやし炒め", category: "疲れた", mainProtein: "豚バラ", proteinType: "豚",
            vegetables: ["もやし"], cookTime: 10, childFriendly: true, spicyLevel: 0, allergens: [],
            ingredients: ["豚バラ肉", "もやし", "醤油"], steps: ["炒める"], tips: "簡単"
        },
        {
            id: 2, name: "親子丼", category: "疲れた", mainProtein: "鶏肉", proteinType: "鶏",
            vegetables: ["玉ねぎ"], cookTime: 15, childFriendly: true, spicyLevel: 0, allergens: ["卵"],
            ingredients: ["鶏肉", "卵", "玉ねぎ"], steps: ["煮る"], tips: "定番"
        }
        // 他のフォールバックレシピも同様に追加可能
    ];
}

// アプリ初期化
function initializeApp() {
    updateHistoryDisplay();
    updateBalanceMessage();
    updateLearningStatus();
    loadFamilySettings();
    
    // イベントリスナー設定
    setupEventListeners
    