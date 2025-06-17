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

// アプリケーションの状態管理
const AppState = {
    currentMood: null,
    selectedRecipe: null,
    currentCandidates: [],
    recipes: [],
    userPreferences: {
        recipeScores: {},
        ingredientPreference: {},
        moodHistory: [],
        categoryStats: {},
        lastUpdated: new Date().toISOString()
    },
    familySettings: {
        hasChildren: false,
        spicyOK: false,
        allergyFree: false
    },
    foodHistory: {}
};

// アプリ初期化
document.addEventListener('DOMContentLoaded', async function() {
    console.log('🔥 悪魔の献立アプリ起動中...');
    
    try {
        await initializeApp();
        console.log('✅ アプリ初期化完了');
        // デバッグ用: 初期化後のAppStateを表示
        console.log('DEBUG: AppState after initialization:', AppState);
    } catch (error) {
        console.error('❌ 初期化エラー:', error);
        showErrorMessage('アプリの初期化に失敗しました。ページを再読み込みしてください。');
    }
});

// 初期化処理
async function initializeApp() {
    try {
        // LocalStorageからデータを読み込み
        loadFromLocalStorage();
        
        // レシピデータの読み込み
        const response = await fetch('./data/recipes.json');
        const data = await response.json();
        AppState.recipes = data.ideas; // "ideas"配列をrecipesに設定
        
        // UIの初期化
        updateHistoryDisplay();
        updateLearningStatus();
        updateFamilyStatus();
        
    } catch (error) {
        console.error('初期化エラー:', error);
        showError('アプリケーションの初期化に失敗しました');
    }
}

// LocalStorage操作
function saveToLocalStorage() {
    localStorage.setItem('userPreferences', JSON.stringify(AppState.userPreferences));
    localStorage.setItem('familySettings', JSON.stringify(AppState.familySettings));
    localStorage.setItem('foodHistory', JSON.stringify(AppState.foodHistory));
}

function loadFromLocalStorage() {
    const userPreferences = localStorage.getItem('userPreferences');
    const familySettings = localStorage.getItem('familySettings');
    const foodHistory = localStorage.getItem('foodHistory');
    
    if (userPreferences) AppState.userPreferences = JSON.parse(userPreferences);
    if (familySettings) AppState.familySettings = JSON.parse(familySettings);
    if (foodHistory) AppState.foodHistory = JSON.parse(foodHistory);
}

// 気分選択処理
function selectMood(mood) {
    console.log(`DEBUG: selectMood called with mood: ${mood}`);
    AppState.currentMood = mood;
    
    // 気分ボタンの選択状態を更新
    updateMoodButtonSelection(mood);
    
    const candidates = getRecipeCandidates(mood);
    AppState.currentCandidates = candidates;
    console.log('DEBUG: Generated candidates:', candidates);
    displayRecipeCandidates(candidates);
}

// 気分ボタンの選択状態を更新
function updateMoodButtonSelection(selectedMood) {
    const moodButtons = document.querySelectorAll('.mood-btn');
    moodButtons.forEach(btn => {
        btn.classList.remove('selected');
        if (btn.onclick.toString().includes(`'${selectedMood}'`)) {
            btn.classList.add('selected');
        }
    });
}

// レシピ候補の取得
function getRecipeCandidates(mood) {
    console.log(`DEBUG: getRecipeCandidates called for mood: ${mood}`);
    let candidates = AppState.recipes.filter(recipe => recipe.category === mood);
    console.log('DEBUG: Initial candidates (filtered by mood):', candidates);
    
    // 家族設定によるフィルタリング
    candidates = filterByFamily(candidates);
    console.log('DEBUG: Candidates after family filter:', candidates);
    
    // 重複回避フィルタリング
    candidates = avoidFoodDuplication(candidates);
    console.log('DEBUG: Candidates after duplication avoidance:', candidates);
    
    // 好みによるソート
    candidates = sortByPreference(candidates);
    console.log('DEBUG: Candidates after preference sort:', candidates);
    
    // 上位3件を返す
    const finalCandidates = candidates.slice(0, 3);
    console.log('DEBUG: Final 3 candidates:', finalCandidates);
    return finalCandidates;
}

// 家族設定によるフィルタリング
function filterByFamily(recipes) {
    return recipes.filter(recipe => {
        if (AppState.familySettings.hasChildren && !recipe.childFriendly) {
            return false;
        }
        if (!AppState.familySettings.spicyOK && recipe.spicyLevel > 1) {
            return false;
        }
        if (AppState.familySettings.allergyFree && recipe.allergens.length > 0) {
            return false;
        }
        return true;
    });
}

// 食材重複回避
function avoidFoodDuplication(candidates) {
    const recentHistory = getRecentFoodHistory(3);
    if (recentHistory.length === 0) return candidates;
    
    const usedMainProteins = recentHistory.map(day => day.mainProtein);
    const yesterday = recentHistory[0];
    
    return candidates.filter(recipe => {
        if (usedMainProteins.includes(recipe.mainProtein)) {
            return false;
        }
        if (yesterday && yesterday.proteinType === recipe.proteinType) {
            return false;
        }
        return true;
    });
}

// 好みによるソート
function sortByPreference(recipes) {
    return recipes.sort((a, b) => {
        const scoreA = calculateRecipeScore(a);
        const scoreB = calculateRecipeScore(b);
        return scoreB - scoreA;
    });
}

// レシピスコアの計算
function calculateRecipeScore(recipe) {
    const recipeScore = AppState.userPreferences.recipeScores[recipe.id] || 0;
    const ingredientScore = calculateIngredientScore(recipe);
    return recipeScore * 0.7 + ingredientScore * 0.3;
}

// 食材スコアの計算
function calculateIngredientScore(recipe) {
    let totalScore = 0;
    recipe.ingredients.forEach(ingredient => {
        totalScore += AppState.userPreferences.ingredientPreference[ingredient] || 0;
    });
    return totalScore / recipe.ingredients.length;
}

// レシピ候補の表示
function displayRecipeCandidates(candidates) {
    const recipeList = document.getElementById('recipeList');
    recipeList.innerHTML = '';
    
    candidates.forEach(recipe => {
        const recipeCard = createRecipeCard(recipe);
        recipeList.appendChild(recipeCard);
    });
    
    document.getElementById('recipeContainer').classList.remove('hidden');
}

// レシピ詳細の表示
function showRecipeDetail(recipe) {
    const detailContainer = document.createElement('div');
    detailContainer.className = 'recipe-detail';
    detailContainer.innerHTML = `
        <div class="recipe-header">
            <h2>${recipe.name}</h2>
            <div class="recipe-meta">
                <span class="cook-time">⏱️ ${recipe.cookTime}分</span>
                <span class="difficulty">⭐ ${'⭐'.repeat(recipe.difficulty)}</span>
                ${recipe.spicyLevel > 0 ? `<span class="spicy-level">🌶️ ${'🌶️'.repeat(recipe.spicyLevel)}</span>` : ''}
            </div>
        </div>
        
        <div class="recipe-content">
            <div class="recipe-idea">
                <h3>📝 アイデア</h3>
                <p>${recipe.idea}</p>
            </div>
            
            <div class="recipe-ingredients">
                <h3>🥘 材料</h3>
                <ul>
                    ${recipe.ingredients.map(ingredient => `
                        <li>${ingredient}</li>
                    `).join('')}
                </ul>
            </div>
            
            ${recipe.steps && recipe.steps.length > 0 ? `
                <div class="recipe-steps">
                    <h3>👨‍🍳 手順</h3>
                    <ol>
                        ${recipe.steps.map(step => `
                            <li>${step}</li>
                        `).join('')}
                    </ol>
                </div>
            ` : ''}
            
            <div class="recipe-tips">
                <h3>💡 ポイント</h3>
                <p>${recipe.tips}</p>
            </div>

            ${recipe.allergens && recipe.allergens.length > 0 ? `
                <div class="recipe-allergens">
                    <h3>⚠️ アレルギー情報</h3>
                    <p>${recipe.allergens.join('、')}</p>
                </div>
            ` : ''}
            ${recipe.sourceUrl ? `
                <div class="recipe-source">
                    <a href="${recipe.sourceUrl}" target="_blank" rel="noopener noreferrer" class="source-button">調理手順はこちら</a>
                </div>
            ` : ''}
        </div>
        
        <div class="recipe-actions">
            <button class="secondary-btn" onclick="closeRecipeDetail()">
                🔙 戻る
            </button>
        </div>
    `;
    
    // モーダルとして表示
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.appendChild(detailContainer);
    document.body.appendChild(modal);
    
    // アニメーション効果
    setTimeout(() => modal.classList.add('show'), 10);
    
    // モーダル外クリックで閉じる
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeRecipeDetail();
        }
    });
}

// レシピ詳細を閉じる
function closeRecipeDetail() {
    const modal = document.querySelector('.modal');
    if (modal) {
        modal.classList.remove('show');
        setTimeout(() => modal.remove(), 300);
    }
}

// レシピカードの作成を更新
function createRecipeCard(recipe) {
    const card = document.createElement('div');
    card.className = 'recipe-card';
    card.innerHTML = `
        <h4>${recipe.name}</h4>
        <p>${recipe.idea}</p>
        <div class="recipe-meta">
            <span class="cook-time">⏱️ ${recipe.cookTime}分</span>
            <span class="difficulty">⭐ ${'⭐'.repeat(recipe.difficulty)}</span>
            ${recipe.spicyLevel > 0 ? `<span class="spicy-level">🌶️ ${'🌶️'.repeat(recipe.spicyLevel)}</span>` : ''}
        </div>
        <div class="recipe-actions">
            <button class="detail-btn" onclick="showRecipeDetail(${JSON.stringify(recipe).replace(/"/g, '&quot;')})">
                📖 詳細を見る
            </button>
        </div>
    `;
    card.onclick = () => selectRecipe(recipe);
    return card;
}

// レシピ選択
function selectRecipe(recipe) {
    AppState.selectedRecipe = recipe;
    updateRecipeSelection();
}

// レシピ選択の更新
function updateRecipeSelection() {
    const cards = document.querySelectorAll('.recipe-card');
    cards.forEach(card => {
        card.classList.remove('selected');
        if (card.querySelector('h4').textContent === AppState.selectedRecipe.name) {
            card.classList.add('selected');
        }
    });
    
    // 確定ボタンの有効化
    const confirmBtn = document.querySelector('.primary-btn');
    if (confirmBtn) {
        confirmBtn.disabled = false;
        confirmBtn.textContent = '🎯 この悪魔的献立に決定！';
    }
}

// 選択の確定
function confirmSelection() {
    if (!AppState.selectedRecipe) {
        showError('レシピを選択してください');
        return;
    }
    
    // 学習データの更新
    updateLearningData();
    
    // 履歴の更新
    updateFoodHistory();
    
    // 確定画面の表示
    showConfirmation();
    
    // データの保存
    saveToLocalStorage();
}

// 学習データの更新
function updateLearningData() {
    const recipe = AppState.selectedRecipe;
    
    // レシピスコアの更新
    AppState.userPreferences.recipeScores[recipe.id] = 
        (AppState.userPreferences.recipeScores[recipe.id] || 0) + 0.2;
    
    // 食材好み度の更新
    recipe.ingredients.forEach(ingredient => {
        AppState.userPreferences.ingredientPreference[ingredient] = 
            (AppState.userPreferences.ingredientPreference[ingredient] || 0) + 0.1;
    });
    
    // 気分履歴の更新
    AppState.userPreferences.moodHistory.unshift(AppState.currentMood);
    if (AppState.userPreferences.moodHistory.length > 10) {
        AppState.userPreferences.moodHistory.pop();
    }
    
    // カテゴリ統計の更新
    AppState.userPreferences.categoryStats[recipe.category] = 
        (AppState.userPreferences.categoryStats[recipe.category] || 0) + 1;
    
    AppState.userPreferences.lastUpdated = new Date().toISOString();
}

// 履歴の更新
function updateFoodHistory() {
    const today = new Date().toISOString().split('T')[0];
    AppState.foodHistory[today] = {
        mainProtein: AppState.selectedRecipe.mainProtein,
        proteinType: AppState.selectedRecipe.proteinType,
        vegetables: AppState.selectedRecipe.ingredients.filter(i => !i.includes('肉') && !i.includes('魚')),
        selectedRecipe: AppState.selectedRecipe.name,
        recipeId: AppState.selectedRecipe.id,
        timestamp: new Date().toISOString()
    };
}

// 確定画面の表示
function showConfirmation() {
    const container = document.getElementById('confirmContainer');
    const detail = document.getElementById('selectedRecipeDetail');
    
    detail.innerHTML = `
        <h4>${AppState.selectedRecipe.name}</h4>
        <p>${AppState.selectedRecipe.idea}</p>
        <h5>材料</h5>
        <ul>
            ${AppState.selectedRecipe.ingredients.map(i => `<li>${i}</li>`).join('')}
        </ul>
        <h5>手順</h5>
        <ol>
            ${AppState.selectedRecipe.steps.map(s => `<li>${s}</li>`).join('')}
        </ol>
        <p class="tips">${AppState.selectedRecipe.tips}</p>
    `;
    
    container.classList.remove('hidden');
    document.getElementById('recipeContainer').classList.add('hidden');
}

// 履歴表示の更新
function updateHistoryDisplay() {
    const historyDisplay = document.getElementById('historyDisplay');
    const recentHistory = getRecentFoodHistory(3);
    
    if (recentHistory.length === 0) {
        historyDisplay.textContent = '履歴はありません';
        return;
    }
    
    historyDisplay.innerHTML = recentHistory.map(day => `
        <div class="history-item">
            <span class="date">${formatDate(day.timestamp)}</span>
            <span class="recipe">${day.selectedRecipe}</span>
        </div>
    `).join('');
}

// 学習状況の更新
function updateLearningStatus() {
    const status = document.getElementById('learningStatus');
    const recipeCount = Object.keys(AppState.userPreferences.recipeScores).length;
    
    status.textContent = `🧠 学習済みレシピ: ${recipeCount}件`;
}

// 家族設定の更新
function updateFamilySettings() {
    AppState.familySettings = {
        hasChildren: document.getElementById('hasChildren').checked,
        spicyOK: document.getElementById('spicyOK').checked,
        allergyFree: document.getElementById('allergyFree').checked
    };
    updateFamilyStatus();
    saveToLocalStorage();
}

// 家族設定状態の更新
function updateFamilyStatus() {
    const status = document.getElementById('familyStatus');
    const settings = AppState.familySettings;
    
    let message = '現在の設定: ';
    if (settings.hasChildren) message += '👶 ';
    if (settings.spicyOK) message += '🌶️ ';
    if (settings.allergyFree) message += '🥛 ';
    
    status.textContent = message;
}

// ユーティリティ関数
function getRecentFoodHistory(days) {
    const history = [];
    const today = new Date();
    
    for (let i = 0; i < days; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        
        if (AppState.foodHistory[dateStr]) {
            history.push(AppState.foodHistory[dateStr]);
        }
    }
    
    return history;
}

function formatDate(timestamp) {
    return new Date(timestamp).toLocaleDateString('ja-JP', {
        month: 'short',
        day: 'numeric'
    });
}

function showError(message) {
    // エラーメッセージの表示処理
    console.error('ERROR:', message); // console.errorでより目立つように
    // TODO: UIでのエラー表示実装 - 今後UIに表示するよう修正予定
    const errorDisplay = document.getElementById('debugOutput'); // 一時的にデバッグエリアに表示
    if (errorDisplay) {
        errorDisplay.innerHTML = `<p style="color: red;">${message}</p>` + errorDisplay.innerHTML;
    }
}

// デバッグ機能
function showDebugInfo() {
    const debugOutput = document.getElementById('debugOutput');
    debugOutput.innerHTML = `
        <pre>${JSON.stringify(AppState, null, 2)}</pre>
    `;
}

function clearHistory() {
    AppState.foodHistory = {};
    saveToLocalStorage();
    updateHistoryDisplay();
}

function clearLearningData() {
    AppState.userPreferences = {
        recipeScores: {},
        ingredientPreference: {},
        moodHistory: [],
        categoryStats: {},
        lastUpdated: new Date().toISOString()
    };
    saveToLocalStorage();
    updateLearningStatus();
}

function addTestData() {
    // テストデータの追加処理
    // TODO: テストデータの実装
}

// リシャッフル機能
function reshuffleRecipes() {
    if (!AppState.currentMood) return;
    
    // 現在選択されているレシピをリセット
    AppState.selectedRecipe = null;
    
    // 新しい候補を取得
    const candidates = getRecipeCandidates(AppState.currentMood);
    displayRecipeCandidates(candidates);
}

// トップに戻る機能
function resetToMoodSelection() {
    AppState.currentMood = null;
    AppState.selectedRecipe = null;
    AppState.currentCandidates = [];
    
    // コンテナを隠す
    document.getElementById('recipeContainer').classList.add('hidden');
    document.getElementById('confirmContainer').classList.add('hidden');
    
    // 気分ボタンの選択状態をリセット
    const moodButtons = document.querySelectorAll('.mood-btn');
    moodButtons.forEach(btn => btn.classList.remove('selected'));
}

// アプリケーションの初期化
document.addEventListener('DOMContentLoaded', initializeApp);
    