export interface InventoryAnalysis {
  summary: string;
  usedIngredients: string[];
  missingMacros: string;
}

export interface MealPlanItem {
  day: string;
  mealType: string;
  meal: string;
  prepTime: string;
  cost: string;
}

export interface ShoppingCategory {
  category: string;
  items: string[];
}

export interface Recipe {
  title: string;
  steps: string[];
  chefTips: string;
}

export interface SavedRecipe extends Recipe {
  savedAt: string;
}

export interface ShoppingHistoryItem {
  id: string;
  date: string;
  list: ShoppingCategory[]; 
  checkedItems: string[];
  weekLabel: string;
}

export interface NutritionalStats {
  averageDailyCalories: number;
  macroSplit: {
    protein: string;
    carbs: string;
    fats: string;
  };
  note: string;
}

export interface EcoChefResponse {
  analysis: InventoryAnalysis;
  nutritionalStats: NutritionalStats;
  plan: MealPlanItem[];
  shoppingList: ShoppingCategory[];
  recipes: Recipe[];
}

export interface GeneratePlanParams {
  ingredients: string;
  days: number;
  dietaryRestrictions?: string;
  language: string; // Added language support
}